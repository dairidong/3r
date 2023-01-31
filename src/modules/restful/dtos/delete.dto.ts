import { IsDefined, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';

/**
 * 批量删除验证
 */
@DtoValidation()
export class DeleteDto {
    @IsUUID(undefined, {
        each: true,
        message: 'ID 格式错误',
    })
    @IsDefined({
        each: true,
        message: 'ID 必须指定',
    })
    ids: string[] = [];
}
