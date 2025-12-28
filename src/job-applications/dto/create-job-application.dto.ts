import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export enum ApplicationStatusDto {
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

export class CreateJobApplicationDto {
  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  link: string;

  @IsDateString()
  applicationDate: string;

  @IsEnum(ApplicationStatusDto)
  status: ApplicationStatusDto;
}
