import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseModel } from './entity/base.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mapper.const';

@Injectable()
export class CommonService {
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideOptions: FindManyOptions<T>,
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideOptions);
    }
    return this.cusorPaginate(dto, repository, overrideOptions, path);
  }

  private async cusorPaginate<
    T extends BaseModel,
    PaginationDto extends BasePaginationDto,
  >(
    dto: PaginationDto,
    repository: Repository<T>,
    overrideOptions: FindManyOptions<T>,
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);
    const modifiedOptions = {
      ...findOptions,
      ...overrideOptions,
      relations: {
        ...findOptions.relations,
        ...overrideOptions.relations,
      },
      where: {
        ...findOptions.where,
        ...overrideOptions.where,
      },
      order: {
        ...findOptions.order,
        ...overrideOptions.order,
      },
      select: {
        ...findOptions.select,
        ...overrideOptions.select,
      },
    };

    const results = await repository.find(modifiedOptions);

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${process.env.BASE_URL}/${path}`);

    if (lastItem) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id__more_than') {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key: keyof PaginationDto = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    /**
     * Response
     *
     * data: Data[],
     * cursor: {
     *    after: 마지막 Data의 ID
     * },
     * count: 응답한 데이터의 갯수
     * next: 다음 요청을 할때 사용할 URL
     */
    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);
    const modifiedOptions = {
      ...findOptions,
      ...overrideOptions,
      relations: {
        ...findOptions.relations,
        ...overrideOptions.relations,
      },
      where: {
        ...findOptions.where,
        ...overrideOptions.where,
      },
      order: {
        ...findOptions.order,
        ...overrideOptions.order,
      },
    };
    const [data, count] = await repository.findAndCount(modifiedOptions);

    return {
      data,
      total: count,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseFindOptionsFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseFindOptionsFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseFindOptionsFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> | FindOptionsOrder<T> = {};
    /**
     * ['where', 'id', 'more_than']
     */
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이어야합니다 - 문제되는 키값 : ${key}`,
      );
    }

    if (split.length === 2) {
      // ['where', 'id']
      const [_, field] = split;
      options[field] = value;
    } else {
      // ['where', 'id', 'more_than']
      const [_, field, operator] = split;
      if (operator === 'i_like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }

    return options;
  }
}
