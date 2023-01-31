import { IsDefined, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';

/**
 * 批量恢复验证
 */
@DtoValidation()
export class RestoreDto {
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
