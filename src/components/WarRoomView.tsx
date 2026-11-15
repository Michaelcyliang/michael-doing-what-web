'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight,
  BookOpen,
  Rocket,
  Globe2,
  Sparkles,
} from 'lucide-react';
import type {
  DashboardData,
  LearningArticle,
  DevLog,
  ModuleId,
} from '../lib/types';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface WarRoomViewProps {
  data: DashboardData;
  latestArticles: LearningArticle[];
  latestLogs: DevLog[];
  activeSubSection: string;
  isDark: boolean;
  onNavigate: (module: ModuleId, sub?: string) => void;
}

export default function WarRoomView({
  data,
  latestArticles,
  latestLogs,
  activeSubSection,
  isDark,
  onNavigate,
}: WarRoomViewProps) {
  const [expandedBanks, setExpandedBanks] = useState<Record<string, boolean>>({
    FED: true,
    CBC: true,
  });
  const [expandedAi, setExpandedAi] = useState<Record<string, boolean>>({
    OpenAI: true,
    NVIDIA: true,
  });

  const toggleBank = (code: string) => {
    setExpandedBanks((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleAi = (company: string) => {
    setExpandedAi((prev) => ({ ...prev, [company]: !prev[company] }));
  };

  const showSection = (id: string) =>
    activeSubSection === 'all' || activeSubSection === id;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-sky-600 dark:text-sky-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{data.edition}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            個人戰情室 (War Room Dashboard)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            每日晨間宏觀經濟摘要、全球股市矩陣與美中前沿 AI 技術動態
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <div className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            更新時間：{data.updatedAt}
          </div>
          {data.verification && (
            <div className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium">
              ✓ 數據確認：{data.verification.passed}/{data.verification.totalChecked} 筆通過檢核（{data.verification.pipeline}）
            </div>
          )}
        </div>
      </div>

      {/* 1. 全球央行動態 */}
      {showSection('central-banks') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Landmark className="w-4 h-4 text-sky-500" />
              全球央行動態追蹤
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              點擊卡片可展開 / 收合明細
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.centralBanks.map((bank) => {
              const isOpen = !!expandedBanks[bank.code];
              return (
                <div
                  key={bank.code}
                  onClick={() => toggleBank(bank.code)}
                  className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 hover:border-sky-400/60 dark:hover:border-sky-500/50 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                          {bank.code}
                        </span>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {bank.name}
                        </h3>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {bank.rate}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {bank.stance}
                        </span>
                        {bank.verified && bank.sourceUrl && (
                          <>
                            <span className="text-slate-400">•</span>
                            <a
                              href={bank.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              ✓ {bank.source || 'MacroMicro'} ({bank.asOfDate || '最新'})
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="展開或收合"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                      <p>{bank.summary}</p>
                      <p className="text-sky-700 dark:text-sky-300 font-medium">
                        市場影響：{bank.impact}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. 匯率與 9 大全球大盤 */}
      {showSection('markets') && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Globe2 className="w-4 h-4 text-emerald-500" />
            關鍵匯率與 9 大全球股市矩陣
          </h2>

          {/* FX Cards with Mini ECharts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.fx.map((fx) => {
              const lineColor = fx.direction === 'up' ? '#ef4444' : '#10b981';
              const chartOption = {
                grid: { left: 4, right: 4, top: 6, bottom: 4 },
                xAxis: {
                  type: 'category',
                  show: false,
                  data: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', '今日'],
                },
                yAxis: {
                  type: 'value',
                  show: false,
                  min: (val: { min: number }) => val.min * 0.998,
                  max: (val: { max: number }) => val.max * 1.002,
                },
                tooltip: {
                  trigger: 'axis',
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 11 },
                },
                series: [
                  {
                    type: 'line',
                    data: fx.history,
                    smooth: true,
                    symbol: 'none',
                    lineStyle: { width: 2, color: lineColor },
                    areaStyle: {
                      color:
                        fx.direction === 'up'
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'rgba(16, 185, 129, 0.12)',
                    },
                  },
                ],
              };

              return (
                <div
                  key={fx.pair}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {fx.label} ({fx.pair})
                    </div>
                    <div className="mt-1 flex items-baseline gap-2.5">
                      <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                        {fx.rate}
                      </span>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          fx.direction === 'up'
                            ? 'text-rose-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {fx.change}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {fx.note}
                    </p>
                  </div>
                  <div className="w-28 h-14 shrink-0">
                    <ReactECharts
                      option={chartOption}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 9 Indices Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.indices.map((idx) => (
              <div
                key={idx.name}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-4 py-3 flex items-center justify-between shadow-sm"
              >
                <div>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {idx.region}
                  </span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {idx.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {idx.value}
                  </div>
                  <div
                    className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold mt-0.5 ${
                      idx.up ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {idx.up ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {idx.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Market Analysis Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {data.marketAnalysis.map((m) => (
              <div
                key={m.market}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4"
              >
                <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {m.market}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {m.tone}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {m.summary}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. AI 24 小時快訊 */}
      {showSection('ai-updates') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Cpu className="w-4 h-4 text-violet-500" />
              AI 24 小時資訊更新（美中前沿五大巨頭）
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              點擊展開技術細節
            </span>
          </div>
          <div className="space-y-2.5">
            {data.aiUpdates.map((item) => {
              const open = !!expandedAi[item.company];
              return (
                <div
                  key={item.company}
                  onClick={() => toggleAi(item.company)}
                  className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 hover:border-violet-400/60 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                        {item.company}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.tag}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">{item.time}</span>
                      {open ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                  {open && (
                    <p className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. 跨模塊最新動態聚合 */}
      {activeSubSection === 'all' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <BookOpen className="w-4 h-4 text-amber-500" />
                最新學習報告
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('learning', 'all')}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                前往知識庫 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {latestArticles.slice(0, 2).map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => onNavigate('learning', art.category)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{art.category}</span>
                    <span>{art.date}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                    {art.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Rocket className="w-4 h-4 text-emerald-500" />
                發想專案與開發動態
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('projects', 'supply-chain')}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                查看 7 層產業鏈 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {latestLogs.slice(0, 2).map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => onNavigate('projects', 'devlogs')}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{log.category}</span>
                    <span>{log.status}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                    {log.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
