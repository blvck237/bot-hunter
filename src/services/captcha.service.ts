import bcrypt from 'bcrypt';
import CaptchaRepository from '@repositories/captcha.repository';
import { Captcha } from '@typings/Captcha';
import { ALL_CAPTCHA_CHARS } from '@constants/common';
import { BadRequestException } from '@core/exceptions';
import { INVALID_CAPTCHA } from '@constants/errors';

interface CaptchaServiceProps {
  hash: string;
  ip: string;
  captchaRepository: CaptchaRepository;
}
/**
 * Captcha Service is responsible for captchaging clients that are suspicious
 */
class CaptchaService {
  #hash: string;
  #ip: string;
  #captchaRepository: CaptchaRepository;
  constructor(props: CaptchaServiceProps) {
    this.#hash = props.hash;
    this.#captchaRepository = props.captchaRepository;
    this.#ip = props.ip;
  }

  /**
   * Creates a captcha for a user
   * @param captchaData
   * @returns
   */
  async createCaptcha(): Promise<string> {
    // create a random string based on ALL_CAPTCHA_CHARS without duplicates
    const captchaLength = 6;
    let captchaString = '';
    for (let i = 0; i < captchaLength; i++) {
      const randomIndex = Math.floor(Math.random() * ALL_CAPTCHA_CHARS.length);
      captchaString += ALL_CAPTCHA_CHARS[randomIndex];
    }
    // create a hash of the captcha string
    const captchaHash = bcrypt.hashSync(captchaString, 12);
    // save captcha to db by upserting
    await this.#captchaRepository.updateOrCreate(
      {
        hash: this.#hash,
        ip: this.#ip
      },
      {
        $set: { hash: this.#hash, ip: this.#ip, createdAt: Date.now(), resolutionDuration: null, resolved: false, captcha: captchaHash, retries: 0 }
      }
    );

    return captchaString;
  }

  /**
   * Resolves a captcha for a user. Throws an error if the captcha is invalid
   * @param captchaData
   * @returns
   * @throws BadRequestException
   **/
  async resolveCaptcha(captchaString: string): Promise<number> {
    const captcha = await this.#captchaRepository.getOne({
      hash: this.#hash,
      ip: this.#ip
    });

    if (!captcha) {
      return;
    }

    // Compare the captcha string with the hash
    const isCaptchaValid = bcrypt.compareSync(captchaString, captcha.captcha);
    const resolutionDuration = Date.now() - captcha.createdAt;
    if (!isCaptchaValid) {
      await this.#updateCaptcha(captcha, false);
      throw new BadRequestException(INVALID_CAPTCHA);
    }
    // Update the captcha in the db
    await this.#updateCaptcha(captcha, true);
    console.log('captcha resolved in', resolutionDuration);
    return resolutionDuration;
  }

  #updateCaptcha(captcha: Captcha, resolved: boolean): Promise<Captcha> {
    const resolutionDuration = Date.now() - captcha.createdAt;
    const query = {
      hash: this.#hash,
      ip: this.#ip
    };
    const update = {
      $set: { resolved, resolutionDuration, retries: { $inc: resolved ? 1 : 0 } }
    };
    return this.#captchaRepository.updateOne(query, update);
  }
}

export default CaptchaService;
