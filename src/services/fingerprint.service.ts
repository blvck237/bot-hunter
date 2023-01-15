import crypto from 'crypto';
import { FingerPrintsInput } from '@typings/Fingerprints';

class FingerPrintService {
  #userAgent: string;
  #screenResolution: string;
  #colorDepth: string;
  #timezone: string;
  #language: string;
  hash: string;

  constructor(props: FingerPrintsInput) {
    this.#screenResolution = `${props.screenWidth}x${props.screenHeight}`;
    this.#colorDepth = props.colorDepth.toString();
    this.#timezone = props.timezone;
    this.#language = props.language;
    this.#userAgent = props.userAgent;
  }

  async generateHash(): Promise<string> {
    const cryptoHash = crypto.createHash('sha256');
    cryptoHash.update(this.#userAgent);
    cryptoHash.update(this.#screenResolution);
    cryptoHash.update(this.#colorDepth);
    cryptoHash.update(this.#timezone);
    cryptoHash.update(this.#language);
    this.hash = cryptoHash.digest('hex');
    return this.hash;
  }

}

export default FingerPrintService;
