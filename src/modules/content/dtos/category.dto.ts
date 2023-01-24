import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { toNumber } from 'lodash';

import { DtoValidation } from '@/modules/core/decorators';
import { PaginateOptions } from '@/modules/database/types';

/**
 * 分类分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryCategoryDto implements PaginateOptions {
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 10;
}

/**
 * 新增分类验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateCategoryDto {
    @MaxLength(25, {
        always: true,
        message: '分类名称长度不得超过 $constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '分类名称不得为空' })
    @IsOptional({ groups: ['update'] })
    name!: string;

    @IsUUID(undefined, { always: true, message: '父分类 ID 格式不正确' })
    @ValidateIf((value) => value.parent !== null && value.parent)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value === 'null' ? null : value))
    parent?: string;

    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于 0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;
}

/**
 * 更新分类验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsUUID(undefined, { groups: ['update'], message: '分类 ID 格式错误' })
    @IsDefined({ groups: ['update'], message: '分类 ID 必须指定' })
    id!: string;
}
