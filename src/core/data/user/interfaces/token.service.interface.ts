import { TokenEntity } from '../entities/token.entity';
import { ETokenType } from '../entities/enum-token-type';

/**
 * Interface for TokenService
 *
 * This interface defines the contract for services that provide token data operations.
 */
export interface ITokenService {
  /**
   * Creates a new token
   *
   * @param entity The token entity to create
   * @returns The ID of the created token
   */
  create(entity: TokenEntity): Promise<number>;

  /**
   * Retrieves a token by ID
   *
   * @param id The ID of the token to retrieve
   * @returns The token entity or null if not found
   */
  read(id: number): Promise<TokenEntity | null>;

  /**
   * Retrieves a token by token string
   *
   * @param token The token string to search for
   * @returns The token entity or null if not found
   */
  readByToken(token: string): Promise<TokenEntity | null>;

  /**
   * Retrieves a token by token string with associated user
   *
   * @param token The token string to search for
   * @returns The token entity with user relation or null if not found
   */
  readByTokenWithUser(token: string): Promise<TokenEntity | null>;

  /**
   * Retrieves a token by token string and type
   *
   * @param token The token string to search for
   * @param tokenType The type of token to search for
   * @returns The token entity or null if not found
   */
  readByTokenAndType(
    token: string,
    tokenType: ETokenType,
  ): Promise<TokenEntity | null>;

  /**
   * Retrieves a valid token by token string and user ID
   *
   * @param token The token string to search for
   * @param userId The user ID to search for
   * @returns The token entity with user relation or null if not found or expired
   */
  readByTokenWithUserWhereUserIdIsUserIdIdAndTokenIsValid(
    token: string,
    userId: number,
  ): Promise<TokenEntity | null>;

  /**
   * Updates a token
   *
   * @param entity The token entity to update
   */
  update(entity: TokenEntity): Promise<void>;

  /**
   * Deletes a token
   *
   * @param id The ID of the token to delete
   */
  delete(id: number): Promise<void>;
}
