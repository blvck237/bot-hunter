import { SESSION_LONG, SESSION_SHORT } from '@constants/analytics';
import FlagRepository from '@repositories/flag.repository';
import { FlagInput, FlagReason, Flag } from '@typings/Flag';

interface FlagServiceProps {
  hash: string;
  ip: string;
  flagRepository: FlagRepository;
}
/**
 * Flag Service is responsible for flagging clients that are suspicious
 */
class FlagService {
  #hash: string;
  #ip: string;
  #flagRepository: FlagRepository;
  constructor(props: FlagServiceProps) {
    this.#hash = props.hash;
    this.#flagRepository = props.flagRepository;
    this.#ip = props.ip;
  }

  /**
   * Creates a flag for a user based on the flagData. This data can later be used to evaluate the user's behavior
   * @param flagData
   * @returns
   */
  async flagUser(flagData: FlagInput): Promise<void> {
    let reason: FlagReason;
    // Bounce rate
    if (flagData.reason === 'session' && Number(flagData.value) >= SESSION_LONG) {
      reason = FlagReason.SESION_TOO_LONG;
    }
    if (flagData.reason === 'session' && Number(flagData.value) <= SESSION_SHORT) {
      reason = FlagReason.SESSION_TOO_SHORT;
    }

    if (!reason) {
      console.log('No reason to flag', flagData.reason);
      return;
    }

    const flag = {
      hash: this.#hash,
      ip: flagData.ip,
      createdAt: Date.now(),
      value: flagData.value,
      reason: reason
    };
    this.#flagRepository.create(flag);
  }

  getAllFlags(): Promise<Flag[]> {
    return this.#flagRepository.getMany({
      hash: this.#hash,
      ip: this.#ip
    });
  }
}

export default FlagService;
