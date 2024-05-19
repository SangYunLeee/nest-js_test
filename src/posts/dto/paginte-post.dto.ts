import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginatePostDto {
  @IsNumber()
  @IsOptional()
  where__id__more_than: number = 0;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  @IsNumber()
  @IsOptional()
  take: number = 3;
}
