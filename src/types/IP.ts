export interface BlacklistedIp {
  _id: string;
  ip: string;
  blacklist_date: string;
  host: string;
  country: string;
}

export interface BlacklistedIpInput {
  ip: string;
  host: string;
}
