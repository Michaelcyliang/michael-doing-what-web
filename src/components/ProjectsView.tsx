'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Network,
  TrendingUp,
  TrendingDown,
  LineChart,
  Gamepad2,
  Layers,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { ProjectsData, SupplyChainNode } from '../lib/types';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface ProjectsViewProps {
  data: ProjectsData;
  activeSubSection: string;
  onSubChange: (sub: string) => void;
  isDark: boolean;
}

export default function ProjectsView({
  data,
  activeSubSection,
  onSubChange,
  isDark,
}: ProjectsViewProps) {
  const [selectedNode, setSelectedNode] = useState<SupplyChainNode>(
    data.aiSupplyChain
  );
  const [selectedTicker, setSelectedTicker] = useState<string>(
    data.watchlist[0]?.ticker || '2330'
  );
  const [selectedLogId, setSelectedLogId] = useState<string>(
    data.devLogs[0]?.id || ''
  );

  const activeTab = activeSubSection || 'supply-chain';

  const treeOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        textStyle: {
          color: isDark ? '#f1f5f9' : '#0f172a',
          fontSize: 12,
        },
        formatter: (params: { data: SupplyChainNode }) => {
          const d = params.data;
          return `<div style="max-width:260px;white-space:normal;">
            <div style="font-weight:700;margin-bottom:4px;">${d.name}</div>
            <div style="font-size:11px;color:#38bdf8;margin-bottom:4px;">${d.keyMetric || ''}</div>
            <div style="font-size:11px;opacity:0.85;">點擊節點查看完整指標股與瓶頸解析</div>
          </div>`;
        },
      },
      series: [
        {
          type: 'tree',
          data: [data.aiSupplyChain],
          top: '4%',
          left: '10%',
          bottom: '4%',
          right: '22%',
          symbolSize: 11,
          initialTreeDepth: 2,
          expandAndCollapse: true,
          roam: true,
          itemStyle: {
            color: '#0ea5e9',
            borderColor: '#38bdf8',
          },
          lineStyle: {
            color: isDark ? '#334155' : '#cbd5e1',
            width: 1.5,
            curveness: 0.45,
          },
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 12,
            color: isDark ? '#e2e8f0' : '#1e293b',
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            padding: [3, 6],
            borderRadius: 4,
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left',
            },
          },
          emphasis: {
            focus: 'descendant',
          },
          animationDuration: 450,
          animationDurationUpdate: 600,
        },
      ],
    };
  }, [data.aiSupplyChain, isDark]);

  const onChartEvents = useMemo(
    () => ({
      click: (params: { data?: SupplyChainNode }) => {
        if (params.data) {
          setSelectedNode(params.data);
        }
      },
    }),
    []
  );

  const activeStock =
    data.watchlist.find((s) => s.ticker === selectedTicker) ||
    data.watchlist[0];

  const activeLog =
    data.devLogs.find((l) => l.id === selectedLogId) || data.devLogs[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            發想專案 (Ideation Projects)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            7 層 AI 產業鏈互動圖譜、Michael 自選股三面向推演與開發日誌
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'supply-chain', label: '7 層 AI 產業鏈', icon: Network },
            { id: 'watchlist', label: '自選股報價', icon: LineChart },
            { id: 'devlogs', label: '開發日誌', icon: Gamepad2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSubChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. 7 層 AI 產業鏈 ECharts 互動圖 */}
      {activeTab === 'supply-chain' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-sky-500" />
                《AI 產業鏈研究報告 v5》七層互動節點圖
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                點擊節點可展開 / 收合子層並檢視詳情（支援拖曳與縮放）
              </span>
            </div>
            <div className="h-[520px] w-full">
              <ReactECharts
                option={treeOption}
                onEvents={onChartEvents}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </div>

          <div className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                  {selectedNode.layer}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 節點詳情
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedNode.name}
              </h2>
              <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/60">
                <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                  核心數據與瓶頸
                </div>
                <div className="text-xs font-medium text-slate-800 dark:text-slate-100 mt-1 leading-relaxed">
                  {selectedNode.keyMetric}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedNode.description}
              </p>
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  台 / 美代表指標股
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.stocks.map((st) => (
                    <span
                      key={st}
                      className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              資料基準：2026-10-31｜來源：《AI 產業鏈研究報告_v5_Michael》
            </div>
          </div>
        </div>
      )}

      {/* 2. Michael 自選股報價與三卡片 */}
      {activeTab === 'watchlist' && activeStock && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-2">
            {data.watchlist.map((stock) => {
              const selected = stock.ticker === activeStock.ticker;
              return (
                <button
                  key={stock.ticker}
                  type="button"
                  onClick={() => setSelectedTicker(stock.ticker)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        {stock.ticker}
                      </span>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {stock.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {stock.sector}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {stock.price}
                    </div>
                    <div
                      className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold ${
                        stock.up ? 'text-rose-500' : 'text-emerald-500'
                      }`}
                    >
                      {stock.up ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stock.change}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                      {activeStock.sector}
                    </span>
                    {activeStock.verified && activeStock.sourceUrl && (
                      <a
                        href={activeStock.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:underline"
                      >
                        ✓ {activeStock.source} · {activeStock.asOfDate}
                      </a>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeStock.name} ({activeStock.ticker})
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    NT$ {activeStock.price}
                  </div>
                  <div
                    className={`text-xs font-mono font-semibold ${
                      activeStock.up ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {activeStock.change}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 mt-4">
                <div className="rounded-lg p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5">
                    技術面亮點
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activeStock.technical}
                  </p>
                </div>

                <div className="rounded-lg p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                    籌碼面動態
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activeStock.chips}
                  </p>
                </div>

                <div className="rounded-lg p-4 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/60">
                  <h3 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
                    AI 基本面評估
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activeStock.fundamental}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 遊戲與專案開發日誌 */}
      {activeTab === 'devlogs' && activeLog && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-2.5">
            {data.devLogs.map((log) => {
              const selected = log.id === activeLog.id;
              return (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      {log.category}
                    </span>
                    <span className="font-mono text-slate-400">{log.date}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {log.title}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold">
                    {activeLog.category}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {activeLog.date}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {activeLog.title}
                </h2>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {activeLog.status}
              </span>
            </div>

            <ul className="mt-5 space-y-3">
              {activeLog.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-1" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
