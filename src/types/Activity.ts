import { AnalyticEventsSummary } from './Analytics';

export interface Activity extends AnalyticEventsSummary {
  _id: string;
  ip: string;
  createdAt: number;
  hash: string;
}

export interface ActivityInput extends AnalyticEventsSummary {}
