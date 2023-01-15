export interface Evaluation extends EvaluationInput {
  _id: string;
  createdAt: number;
}

export interface EvaluationInput {
  ip: string;
  score: number;
  hash: string;
  fingerPrintScore: number;
  jsExecutionScore: number;
  protocolScore: number;
  trafficScore: number;
  eventsScore: number;
  activityScore: number;
  userAgentScore: number;
}
