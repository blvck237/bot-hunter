export interface VisitorInput {
  visitedAt: number;
  page: string;
}

export interface Visitor extends VisitorInput {
  _id: string;
  hash: string;
  createdAt: number;
}
