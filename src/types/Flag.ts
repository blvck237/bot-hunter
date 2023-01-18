export interface FlagInput {
  reason: string;
  value: string;
  ip: string;
}

export interface Flag extends FlagInput {
  _id: string;
  hash: string;
  createdAt: number;
  reason: FlagReason;
}

export enum FlagReason {
  SESION_TOO_LONG = 'SESION_TOO_LONG',
  SESSION_TOO_SHORT = 'SESSION_TOO_SHORT',
}
