export type ModuleId = 'war-room' | 'projects' | 'learning' | 'travel';

export interface VerificationSummary {
  totalChecked: number;
  passed: number;
  warnings: string[];
  verifiedAt: string;
  pipeline: string;
}

export interface DataMeta {
  source?: string;
  sourceUrl?: string;
  asOfDate?: string;
  verified?: boolean;
}

export interface CentralBank extends DataMeta {
  code: string;
  name: string;
  rate: string;
  stance: string;
  summary: string;
  impact: string;
}

export interface FxRate extends DataMeta {
  pair: string;
  label: string;
  rate: string;
  change: string;
  direction: 'up' | 'down';
  note: string;
  history: number[];
}

export interface MarketIndex extends DataMeta {
  region: string;
  name: string;
  value: string;
  change: string;
  up: boolean;
}

export interface MarketAnalysis {
  market: string;
  tone: string;
  summary: string;
}

export interface AiUpdate {
  company: string;
  tag: string;
  time: string;
  title: string;
  detail: string;
  sourceUrl?: string;
}

export interface DailyScanReport {
  title: string;
  date: string;
  updatedAt: string;
  schedule: string;
  summary: string;
  content: string;
}

export interface DashboardData {
  updatedAt: string;
  edition: string;
  verification?: VerificationSummary;
  centralBanks: CentralBank[];
  fx: FxRate[];
  indices: MarketIndex[];
  marketAnalysis: MarketAnalysis[];
  aiUpdates: AiUpdate[];
  dailyScanReport?: DailyScanReport;
}

export interface SupplyChainNode {
  name: string;
  layer: string;
  keyMetric: string;
  description: string;
  stocks: string[];
  children?: SupplyChainNode[];
}

export interface WatchlistStock extends DataMeta {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  up: boolean;
  technical: string;
  chips: string;
  fundamental: string;
}

export interface DevLog {
  id: string;
  category: string;
  date: string;
  title: string;
  status: string;
  highlights: string[];
}

export interface ProjectsData {
  updatedAt: string;
  verification?: VerificationSummary;
  aiSupplyChain: SupplyChainNode;
  watchlist: WatchlistStock[];
  devLogs: DevLog[];
}

export interface LearningArticle {
  id: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  tags: string[];
  file: string;
  content: string;
}

export interface PdfItem {
  id: string;
  title: string;
  filename: string;
  fileType?: string;
  sizeMB: number;
  url: string;
}

export interface PdfGroup {
  topic: string;
  slug: string;
  items: PdfItem[];
}

export interface LearningData {
  updatedAt: string;
  articles: LearningArticle[];
  pdfGroups: PdfGroup[];
}

export interface OutingPhoto {
  id: string;
  filename: string;
  src: string;
  caption: string;
}

export interface OutingAlbum {
  id: string;
  location: string;
  region: string;
  date: string;
  summary: string;
  tags: string[];
  cover: string;
  count: number;
  photos: OutingPhoto[];
}

export interface OutingsData {
  updatedAt: string;
  albums: OutingAlbum[];
}
