import VisitorRepository from '@repositories/visitor.repository';
import { VisitorInput, Visitor } from '@typings/Visitors';

interface VisitorServiceProps {
  hash: string;
  visitorRepository: VisitorRepository;
  ip: string;
}

/**
 *  Manages the protected client visitors
 */
class VisitorService {
  #hash: string;
  #visitorRepository: VisitorRepository;
  #ip: string;

  constructor(props: VisitorServiceProps) {
    this.#hash = props.hash;
    this.#visitorRepository = props.visitorRepository;
    this.#ip = props.ip;
  }

  async registerVisitor(visitorData: VisitorInput): Promise<void> {
    const visitor = {
      hash: this.#hash,
      ip: this.#ip,
      createdAt: Date.now(),
      visitedAt: visitorData.visitedAt,
      page: visitorData.page
    };
    this.#visitorRepository.create(visitor);
  }

  async getTodayVisitByIp(): Promise<Visitor[]> {
    const visitors = await this.#visitorRepository.getMany({
      ip: this.#ip,
      createdAt: {
        // Today's ts
        $gt: new Date().setHours(0, 0, 0, 0)
      }
    });
    return visitors;
  }

  async getTodayVisits(): Promise<Visitor[]> {
    const visitors = await this.#visitorRepository.getMany({
      createdAt: {
        // Today's ts
        $gt: new Date().setHours(0, 0, 0, 0)
      }
    });
    return visitors;
  }
}

export default VisitorService;
