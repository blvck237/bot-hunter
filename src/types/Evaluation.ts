export interface Evaluation extends EvaluationInput {
  _id: string;
  createdAt: number;
}

export interface EvaluationInput {
  ip: string;
  score: number;
  hash: string;
  fingerPrintScore: number;
  headersScore: number;
  trafficScore: number;
  eventsScore: number;
  activityScore: number;
  captchaScore: number;
}
