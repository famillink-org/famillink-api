import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CryptoService } from '../../../crypto/crypto.service';
import { PaginationParamsDto } from '../../../dto/pagination-params.dto';
import { IUserService } from '../interfaces/user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(entity: UserEntity): Promise<number> {
    entity.password = entity.password
      ? await this.cryptoService.hash(entity.password)
      : entity.password;
    return await this.userRepository.save(entity).then((res) => res.id);
  }

  async readAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async read(id: number): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy({ id }).then((res) => res);
  }

  async update(entity: UserEntity | null): Promise<void> {
    if (entity) {
      entity.password = entity.password
        ? await this.cryptoService.hash(entity.password)
        : entity.password;
      return await this.userRepository.save(entity).then(() => undefined);
    }
  }

  async delete(id: number): Promise<void> {
    return await this.userRepository.delete(id).then(() => undefined);
  }

  async findByUserNameAndPassword(
    userName: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ userName });
    if (user && (await this.cryptoService.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async findByUserName(userName: string): Promise<UserEntity | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.member', 'member')
      .where('user.userName = :userName', { userName: userName })
      .getOne();
  }

  async findPaginated(
    paginationParams: PaginationParamsDto,
  ): Promise<{ items: UserEntity[]; total: number }> {
    const { page, limit, sortBy, sortDirection, search } = paginationParams;

    // Calculer le décalage (offset) en fonction de la page et de la limite
    const skip = ((page ?? 1) - 1) * (limit ?? 0);

    // Créer l'objet de tri
    if (sortBy) {
      const order = {};
      order[sortBy] = sortDirection;
    }

    // Préparer la requête de base
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.member', 'member');

    // Ajouter la condition de recherche pour les champs non chiffrés si un terme de recherche est fourni
    if (search) {
      query = query.where(
        '(user.userName LIKE :search OR ' +
          'user.role LIKE :search OR ' +
          'user.causeOfInactivation LIKE :search OR ' +
          'user.inactivatedDate LIKE :search OR ' +
          'member.firstName LIKE :search OR ' +
          'member.lastName LIKE :search OR ' +
          'member.nickName LIKE :search OR ' +
          'member.birthDate LIKE :search OR ' +
          'member.deathDate LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Ajouter l'ordre, le décalage et la limite
    query = query
      .orderBy(`user.${sortBy}`, sortDirection)
      .skip(skip)
      .take(limit);

    // Exécuter la requête
    const [items, total] = await query.getManyAndCount();
    return { items: items, total };
  }
}
