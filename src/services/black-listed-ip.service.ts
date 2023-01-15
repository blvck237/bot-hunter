import { BlacklistedIp, BlacklistedIpInput } from '@typings/IP';

class BlackListedIpService {
  constructor() {}

  async checkIfBlacklisted(ip: string): Promise<boolean> {}

  async addIpToBlacklist(ip: string, host: string): Promise<BlacklistedIp> {}
}

export default BlackListedIpService;
