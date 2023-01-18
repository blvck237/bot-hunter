import { ActivityRepository } from '@repositories/activity.repository';
import { Activity, ActivityInput } from '@typings/Activity';

export interface ActivityServiceProps {
  activityRepository: ActivityRepository;
  hash: string;
  ip: string;
}

/**
 * Activity Service is responsible for registering and retrieving browsing activities
 */
class ActivityService {
  #hash: string;
  #activityRepository: ActivityRepository;
  #ip: string;

  constructor(props: ActivityServiceProps) {
    const { hash, activityRepository, ip } = props;
    this.#hash = hash;
    this.#activityRepository = activityRepository;
    this.#ip = ip;
  }

  async registerActivity(input: ActivityInput): Promise<Activity> {
    const activity = await this.#activityRepository.create({
      hash: this.#hash,
      ip: this.#ip,
      createdAt: Date.now(),
      ...input
    });
    return activity;
  }

  async getLatestActivity(): Promise<Activity[]> {
    const activity = await this.#activityRepository.getMany({
      $or: [{ hash: this.#hash }, { ip: this.#ip }],
      createdAt: {
        // 1 minute
        $gt: Date.now() - 60000
      }
    });
    return activity;
  }
}

export default ActivityService;
