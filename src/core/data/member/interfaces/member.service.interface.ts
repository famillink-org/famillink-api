import { MemberEntity } from '../entities/member.entity';
import { MembersRelationsEntity } from '../entities/member-relation.entity';
import { PaginationParamsDto } from '../../../dto/pagination-params.dto';
import { ERelationType } from '../entities/enum-relation-type';

/**
 * Interface for MemberService
 *
 * This interface defines the contract for services that provide member data operations.
 */
export interface IMemberService {
  /**
   * Creates a new member
   *
   * @param entity The member entity to create
   * @returns The ID of the created member
   */
  create(entity: MemberEntity): Promise<number>;

  /**
   * Retrieves a member by ID
   *
   * @param id The ID of the member to retrieve
   * @returns The member entity or null if not found
   */
  read(id: number): Promise<MemberEntity | null>;

  /**
   * Retrieves all members
   *
   * @returns Array of all member entities
   */
  readAll(): Promise<MemberEntity[]>;

  /**
   * Retrieves a member by code
   *
   * @param code The code of the member to retrieve
   * @returns The member entity
   * @throws NotFoundException if the member is not found
   */
  readByCode(code: string): Promise<MemberEntity>;

  /**
   * Retrieves a member by code if it exists
   *
   * @param code The code of the member to retrieve
   * @returns The member entity or null if not found
   */
  readByCodeIfExist(code: string): Promise<MemberEntity | null>;

  /**
   * Updates a member
   *
   * @param entity The member entity to update
   */
  update(entity: MemberEntity): Promise<void>;

  /**
   * Deletes a member
   *
   * @param id The ID of the member to delete
   */
  delete(id: number): Promise<void>;

  /**
   * Finds an existing relation between two members
   *
   * @param member1Id The ID of the first member
   * @param member2Id The ID of the second member
   * @param relationType The type of relation
   * @returns The relation entity or null if not found
   */
  findExistingRelation(
    member1Id: number,
    member2Id: number,
    relationType: ERelationType,
  ): Promise<MembersRelationsEntity | null>;

  /**
   * Saves a relation between members
   *
   * @param entity The relation entity to save
   * @returns The ID of the saved relation
   */
  saveRelation(entity: MembersRelationsEntity): Promise<number>;

  /**
   * Finds members with pagination
   *
   * @param paginationParams The pagination parameters
   * @returns Object containing the items and total count
   */
  findPaginated(
    paginationParams: PaginationParamsDto,
  ): Promise<{ items: MemberEntity[]; total: number }>;
}
