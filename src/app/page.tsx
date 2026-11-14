'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Rocket,
  BookOpen,
  Compass,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import type {
  ModuleId,
  DashboardData,
  ProjectsData,
  LearningData,
  OutingsData,
} from '../lib/types';
import { assetPath } from '../lib/assetPath';
import WarRoomView from '../components/WarRoomView';
import ProjectsView from '../components/ProjectsView';
import LearningView from '../components/LearningView';
import TravelView from '../components/TravelView';

const MODULES: { id: ModuleId; label: string; icon: React.ElementType }[] = [
  { id: 'war-room', label: '個人戰情室', icon: Activity },
  { id: 'projects', label: '發想專案', icon: Rocket },
  { id: 'learning', label: '學習報告', icon: BookOpen },
  { id: 'travel', label: 'Michael 去哪玩', icon: Compass },
];

export default function HomePage() {
  const [activeModule, setActiveModule] = useState<ModuleId>('war-room');
  const [subSection, setSubSection] = useState<Record<ModuleId, string>>({
    'war-room': 'all',
    projects: 'supply-chain',
    learning: 'all',
    travel: 'beijing',
  });
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<ProjectsData | null>(null);
  const [learning, setLearning] = useState<LearningData | null>(null);
  const [outings, setOutings] = useState<OutingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    async function loadAll() {
      try {
        const [dRes, pRes, lRes, oRes] = await Promise.all([
          fetch(assetPath('/data/dashboard.json')),
          fetch(assetPath('/data/projects.json')),
          fetch(assetPath('/data/learning.json')),
          fetch(assetPath('/data/outings.json')),
        ]);
        const [d, p, l, o] = await Promise.all([
          dRes.json(),
          pRes.json(),
          lRes.json(),
          oRes.json(),
        ]);
        setDashboard(d);
        setProjects(p);
        setLearning(l);
        setOutings(o);
        if (o?.albums?.[0]?.id) {
          setSubSection((prev) => ({ ...prev, travel: o.albums[0].id }));
        }
      } catch (err) {
        console.error('載入靜態資料失敗:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const handleNavigate = (mod: ModuleId, sub?: string) => {
    setActiveModule(mod);
    if (sub) {
      setSubSection((prev) => ({ ...prev, [mod]: sub }));
    }
    setSidebarOpen(false);
  };

  const handleSubChange = (sub: string) => {
    setSubSection((prev) => ({ ...prev, [activeModule]: sub }));
    setSidebarOpen(false);
  };

  const sidebarItems = (() => {
    switch (activeModule) {
      case 'war-room':
        return [
          { id: 'all', label: '戰情總覽 (全部)' },
          { id: 'central-banks', label: '全球央行動態' },
          { id: 'markets', label: '匯率與大盤矩陣' },
          { id: 'ai-updates', label: 'AI 24 小時快訊' },
        ];
      case 'projects':
        return [
          { id: 'supply-chain', label: '7 層 AI 產業鏈互動圖' },
          { id: 'watchlist', label: 'Michael 自選股報價' },
          { id: 'devlogs', label: '遊戲與開發日誌' },
        ];
      case 'learning':
        return [
          { id: 'all', label: '全部學習筆記' },
          { id: '財經研析', label: '財經研析' },
          { id: '賽局理論', label: '賽局理論' },
          { id: 'AI 學習', label: 'AI 學習' },
          { id: 'pdfs', label: 'PDF 原始研報庫 (17)' },
        ];
      case 'travel':
        return (outings?.albums || []).map((a) => ({
          id: a.id,
          label: `${a.location} (${a.count})`,
        }));
    }
  })();

  const activeSub = subSection[activeModule];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-14 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="切換側邊欄"
              className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('war-room', 'all')}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                M
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  麥克在幹嘛
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Michael Action Center
                </div>
              </div>
            </button>
          </div>

          {/* Desktop & Tablet Top Module Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const active = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleNavigate(mod.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mod.label}
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-label="切換深色或淺色模式"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-sky-400 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Module Bar */}
      <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 flex gap-1.5 overflow-x-auto">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const active = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => handleNavigate(mod.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                active
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex relative">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen
              ? 'fixed inset-y-14 left-0 z-30 block w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 shadow-xl'
              : 'hidden'
          } lg:block lg:w-60 lg:shrink-0 lg:border-r lg:border-slate-200 lg:dark:border-slate-800/80 lg:p-4`}
        >
          <div className="sticky top-20 space-y-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2">
                {MODULES.find((m) => m.id === activeModule)?.label} · 子項目
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const active = activeSub === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSubChange(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-xl bg-slate-100/80 dark:bg-slate-900/80 p-3.5 border border-slate-200/70 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400">
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                靜態部署架構
              </div>
              <p className="leading-relaxed">
                資料由本機 Python 管線打包為靜態 JSON 與資源，透過 GitHub Pages 自動發布。
              </p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              正在載入戰情與研究資料...
            </div>
          ) : (
            <>
              {activeModule === 'war-room' &&
                dashboard &&
                learning &&
                projects && (
                  <WarRoomView
                    data={dashboard}
                    latestArticles={learning.articles}
                    latestLogs={projects.devLogs}
                    activeSubSection={activeSub}
                    isDark={isDark}
                    onNavigate={handleNavigate}
                  />
                )}
              {activeModule === 'projects' && projects && (
                <ProjectsView
                  data={projects}
                  activeSubSection={activeSub}
                  onSubChange={handleSubChange}
                  isDark={isDark}
                />
              )}
              {activeModule === 'learning' && learning && (
                <LearningView
                  data={learning}
                  activeSubSection={activeSub}
                  onSubChange={handleSubChange}
                />
              )}
              {activeModule === 'travel' && outings && (
                <TravelView
                  data={outings}
                  activeSubSection={activeSub}
                  onSubChange={handleSubChange}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
