import { DocumentEntity } from '../entities/document.entity';

/**
 * Interface for DocumentService
 *
 * This interface defines the contract for services that provide document data operations.
 * Currently, the DocumentService doesn't have any methods, but this interface is created
 * for future extension and to maintain consistency with other services.
 */
export interface IDocumentService {
  /**
   * Creates a new document
   *
   * @param entity The document entity to create
   * @returns The ID of the created token
   */
  create(entity: DocumentEntity): Promise<number>;
}
