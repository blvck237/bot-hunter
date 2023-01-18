export interface Captcha {
  _id: string;
  captcha: string;
  createdAt: number;
  ip: string;
  hash: string;
  resolved: boolean;
  retries: number;
  resolutionDuration: number;
}
