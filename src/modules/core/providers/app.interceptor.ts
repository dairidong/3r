import {
    ClassSerializerContextOptions,
    ClassSerializerInterceptor,
    PlainLiteralObject,
    StreamableFile,
} from '@nestjs/common';
import { isArray, isNil, isObject } from 'lodash';

/**
 * 全局拦截器，用于序列化数据
 */
export class AppIntercepter extends ClassSerializerInterceptor {
    serialize(
        response: PlainLiteralObject | PlainLiteralObject[],
        options: ClassSerializerContextOptions,
    ): PlainLiteralObject | PlainLiteralObject[] {
        if ((!isObject(response) && !isArray(response)) || response instanceof StreamableFile) {
            return response;
        }

        // 如果响应数据是数组，则遍历每一项进行序列化
        if (isArray(response)) {
            return (response as PlainLiteralObject[]).map((item) => {
                !isObject(item) ? item : this.transformToPlain(item, options);
            });
        }

        // 如果是分页数据，则对 items 中的每一项进行序列化
        if ('meta' in response && 'items' in response) {
            const items = !isNil(response.items) && isArray(response.items) ? response.items : [];
            return {
                ...response,
                items: (items as PlainLiteralObject[]).map((item) => {
                    return !isObject(item) ? item : this.transformToPlain(item, options);
                }),
            };
        }

        // 如果响应是个对象则直接序列化
        return this.transformToPlain(response, options);
    }
}
