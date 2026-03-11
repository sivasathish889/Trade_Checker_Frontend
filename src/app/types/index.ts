export type ChecklistCategory = 'entry' | 'confirmation' | 'risk' | 'psychology';
export type TradeDirection = 'buy' | 'sell';
export type TradingSession = 'asian' | 'london' | 'newyork' | 'custom';

export interface ChecklistItem {
  id: string;
  text: string;
  isMandatory: boolean;
  category: ChecklistCategory;
  order: number;
}

export interface ChecklistResult {
  itemId: string;
  checked: boolean;
}

export interface Trade {
  id: string;
  date: string;
  pair: string;
  direction: TradeDirection;
  timeframe: string;
  session?: string;
  risk: number;
  lotSize: number;
  entryReason: string;
  notes: string;
  screenshot?: string;
  checklistResults: ChecklistResult[];
  score: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface AppSettings {
  customSessions: string[];
}