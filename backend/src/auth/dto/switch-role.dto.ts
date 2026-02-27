import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum SwitchableRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  PHARMACIST = 'PHARMACIST',
  LABORATORY_STAFF = 'LABORATORY_STAFF',
}

export class SwitchRoleDto {
  @ApiProperty({
    description: 'The role to switch to',
    enum: SwitchableRole,
    example: 'DOCTOR',
  })
  @IsNotEmpty()
  @IsEnum(SwitchableRole, {
    message: 'Role must be one of: DOCTOR, PATIENT, PHARMACIST, LABORATORY_STAFF',
  })
  role: SwitchableRole;
}
