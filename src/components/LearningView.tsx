'use client';

import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  FileText,
  ExternalLink,
  ListTree,
  Clock,
  Tag,
} from 'lucide-react';
import type { LearningData } from '../lib/types';
import { assetPath } from '../lib/assetPath';

interface LearningViewProps {
  data: LearningData;
  activeSubSection: string;
  onSubChange: (sub: string) => void;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function LearningView({
  data,
  activeSubSection,
  onSubChange,
}: LearningViewProps) {
  const filteredArticles = useMemo(() => {
    if (
      !activeSubSection ||
      activeSubSection === 'all' ||
      activeSubSection === 'pdfs'
    ) {
      return data.articles;
    }
    return data.articles.filter((a) => a.category === activeSubSection);
  }, [data.articles, activeSubSection]);

  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    data.articles[0]?.id || ''
  );

  const activeArticle =
    filteredArticles.find((a) => a.id === selectedArticleId) ||
    filteredArticles[0] ||
    data.articles[0];

  const toc = useMemo(() => {
    if (!activeArticle) return [];
    const lines = activeArticle.content.split('\n');
    const items: { level: number; text: string; id: string }[] = [];
    for (const line of lines) {
      const m = line.match(/^(#{2,3})\s+(.+)$/);
      if (m) {
        const text = m[2].trim();
        items.push({
          level: m[1].length,
          text,
          id: slugifyHeading(text),
        });
      }
    }
    return items;
  }, [activeArticle]);

  const categories = ['all', '財經研析', '賽局理論', 'AI 學習', 'pdfs'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            學習報告 (Learning Reports)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            靜態知識庫：Markdown 深度研析筆記與 Data_Pipeline 原始 PDF 歸檔
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const active = (activeSubSection || 'all') === cat;
            const label =
              cat === 'all'
                ? '全部筆記'
                : cat === 'pdfs'
                ? 'PDF 原始檔庫 (17)'
                : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSubChange(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PDF Repository View */}
      {activeSubSection === 'pdfs' ? (
        <div className="space-y-5">
          {data.pdfGroups.map((group) => (
            <div
              key={group.slug}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-500" />
                  {group.topic}
                </h2>
                <span className="text-xs text-slate-400">
                  共 {group.items.length} 份報告
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {group.items.map((pdf) => (
                  <a
                    key={pdf.id}
                    href={assetPath(pdf.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-sky-400 dark:hover:border-sky-500 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        {pdf.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        PDF · {pdf.sizeMB} MB
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Article List */}
          <div className="xl:col-span-3 space-y-2.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              精選 Markdown 報告
            </div>
            {filteredArticles.map((art) => {
              const selected = activeArticle?.id === art.id;
              return (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      {art.category}
                    </span>
                    <span className="font-mono">{art.date}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                    {art.title}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{art.readTime}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Markdown Content Reader */}
          {activeArticle && (
            <div className="xl:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                  {activeArticle.category}
                </span>
                {activeArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              <article className="space-y-4 text-slate-700 dark:text-slate-200 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => {
                      const text = String(children);
                      return (
                        <h2
                          id={slugifyHeading(text)}
                          className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 scroll-mt-20"
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => {
                      const text = String(children);
                      return (
                        <h3
                          id={slugifyHeading(text)}
                          className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2 scroll-mt-20"
                        >
                          {children}
                        </h3>
                      );
                    },
                    p: ({ children }) => (
                      <p className="text-sm leading-7">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 space-y-1.5 text-sm">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                        {children}
                      </ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-sky-500 pl-4 py-1 my-3 bg-sky-50/50 dark:bg-sky-950/30 rounded-r text-xs text-slate-600 dark:text-slate-300">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-xs text-left">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        {children}
                      </td>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {activeArticle.content}
                </ReactMarkdown>
              </article>
            </div>
          )}

          {/* Table of Contents & Related PDFs */}
          <div className="xl:col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-sm sticky top-20">
              <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-900 dark:text-white mb-3">
                <ListTree className="w-4 h-4 text-sky-500" />
                文章目錄導航 (TOC)
              </div>
              <nav className="space-y-1.5">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-xs hover:text-sky-600 dark:hover:text-sky-400 transition-colors ${
                      item.level === 3 ? 'pl-3 text-slate-500' : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onSubChange('pdfs')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                  瀏覽全部 17 份 PDF 原始報告
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
