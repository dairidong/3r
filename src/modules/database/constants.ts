/**
 * @description 传入CustomRepository装饰器的metadata数据标识
 */
export const CUSTOM_REPOSITORY_METADATA = 'CUSTOM_REPOSITORY_METADATA';

/**
 * 软删除数据查询类型
 */
export enum SelectTrashMode {
    ALL = 'all',
    ONLY = 'only',
    NONE = 'none',
}
