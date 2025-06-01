import { ERole } from '../../../core/data/user/entities/enum-role';
import { MemberDto } from '../../members/dto/member.dto';
import { UserEntity } from '../../../core/data/user/entities/user.entity';

export class UserDto {
  id?: number;
  userName: string;
  password: string;
  role: ERole;
  inactivated: boolean;
  causeOfInactivation?: string;
  inactivationDate?: Date;
  member?: MemberDto;

  static fromEntity(user: UserEntity): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.userName = user.userName;
    dto.password = user.password;
    dto.role = user.role;
    dto.inactivated = user.inactivated;
    dto.causeOfInactivation = user.causeOfInactivation;
    dto.inactivationDate = user.inactivatedDate;
    if (user.member) {
      dto.member = MemberDto.fromEntity(user.member);
    }
    return dto;
  }
}
