import { UserEntity } from '../entities/user.entity';
import { PaginationParamsDto } from '../../../dto/pagination-params.dto';

/**
 * Interface for UserService
 *
 * This interface defines the contract for services that provide user data operations.
 */
export interface IUserService {
  /**
   * Creates a new user
   *
   * @param entity The user entity to create
   * @returns The ID of the created user
   */
  create(entity: UserEntity): Promise<number>;

  /**
   * Retrieves all users
   *
   * @returns Array of all user entities
   */
  readAll(): Promise<UserEntity[]>;

  /**
   * Retrieves a user by ID
   *
   * @param id The ID of the user to retrieve
   * @returns The user entity or null if not found
   */
  read(id: number): Promise<UserEntity | null>;

  /**
   * Updates a user
   *
   * @param entity The user entity to update
   */
  update(entity: UserEntity | null): Promise<void>;

  /**
   * Deletes a user
   *
   * @param id The ID of the user to delete
   */
  delete(id: number): Promise<void>;

  /**
   * Finds a user by username and password
   *
   * @param userName The username to search for
   * @param password The password to verify
   * @returns The user entity or null if not found or password doesn't match
   */
  findByUserNameAndPassword(
    userName: string,
    password: string,
  ): Promise<UserEntity | null>;

  /**
   * Finds a user by username
   *
   * @param userName The username to search for
   * @returns The user entity or null if not found
   */
  findByUserName(userName: string): Promise<UserEntity | null>;

  /**
   * Finds users with pagination
   *
   * @param paginationParams The pagination parameters
   * @returns Object containing the items and total count
   */
  findPaginated(
    paginationParams: PaginationParamsDto,
  ): Promise<{ items: UserEntity[]; total: number }>;
}
