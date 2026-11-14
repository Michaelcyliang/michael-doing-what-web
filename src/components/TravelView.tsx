'use client';

import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Calendar,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { OutingsData } from '../lib/types';
import { assetPath } from '../lib/assetPath';

interface TravelViewProps {
  data: OutingsData;
  activeSubSection: string;
  onSubChange: (sub: string) => void;
}

export default function TravelView({
  data,
  activeSubSection,
  onSubChange,
}: TravelViewProps) {
  const activeAlbum =
    data.albums.find((a) => a.id === activeSubSection) || data.albums[0];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setLightboxIndex(null);
  }, [activeAlbum?.id]);

  useEffect(() => {
    if (lightboxIndex === null || !activeAlbum) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % activeAlbum.photos.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + activeAlbum.photos.length) % activeAlbum.photos.length
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, activeAlbum]);

  if (!activeAlbum) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Michael 去哪玩 (Travel & Lifestyle)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            旅遊時間軸、相簿網格檢視與圖文輪播燈箱（同步自 Data_Pipeline/Outings）
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.albums.map((album) => {
            const active = album.id === activeAlbum.id;
            return (
              <button
                key={album.id}
                type="button"
                onClick={() => onSubChange(album.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {album.location} ({album.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Album Info Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium text-sky-600 dark:text-sky-400">
              <MapPin className="w-3.5 h-3.5" />
              {activeAlbum.region} · {activeAlbum.location}
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              {activeAlbum.date}
            </span>
            <span className="inline-flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" />
              {activeAlbum.count} 張照片
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {activeAlbum.summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {activeAlbum.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {activeAlbum.photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <img
              src={assetPath(photo.src)}
              alt={photo.caption}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-left">
              <div className="text-xs font-medium text-white truncate">
                {photo.caption}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Carousel */}
      {lightboxIndex !== null && activeAlbum.photos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="關閉輪播"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setLightboxIndex(
                (lightboxIndex - 1 + activeAlbum.photos.length) %
                  activeAlbum.photos.length
              )
            }
            aria-label="上一張"
            className="absolute left-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center">
            <img
              src={assetPath(activeAlbum.photos[lightboxIndex].src)}
              alt={activeAlbum.photos[lightboxIndex].caption}
              className="max-h-[78vh] w-auto rounded-lg object-contain shadow-2xl"
            />
            <div className="mt-3 text-center text-white">
              <div className="text-sm font-medium">
                {activeAlbum.photos[lightboxIndex].caption}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {lightboxIndex + 1} / {activeAlbum.photos.length} ·{' '}
                {activeAlbum.photos[lightboxIndex].filename}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setLightboxIndex((lightboxIndex + 1) % activeAlbum.photos.length)
            }
            aria-label="下一張"
            className="absolute right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
