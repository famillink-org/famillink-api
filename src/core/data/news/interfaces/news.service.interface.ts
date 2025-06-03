import { NewsEntity } from '../entities/news.entity';

/**
 * Interface for NewsService
 *
 * This interface defines the contract for services that provide news data operations.
 * Currently, the NewsService doesn't have any methods, but this interface is created
 * for future extension and to maintain consistency with other services.
 */
export interface INewsService {
  /**
   * Creates a new news
   *
   * @param entity The news entity to create
   * @returns The ID of the created token
   */
  create(entity: NewsEntity): Promise<number>;
}
