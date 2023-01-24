import { ArgumentMetadata, Injectable, Paramtype, ValidationPipe } from '@nestjs/common';

import merge from 'deepmerge';

import { isObject, omit } from 'lodash';

import { DTO_VALIDATION_OPTIONS } from '../constants';

@Injectable()
export class AppPipe extends ValidationPipe {
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        const { metatype, type } = metadata;
        // 获取要验证的 dto 类
        const dto = metatype as any;
        // 获取 dto 类的装饰器元数据中的自定义验证选项
        const options = Reflect.getMetadata(DTO_VALIDATION_OPTIONS, dto) || {};
        // 把当前已设置的选项解构到备份对象
        const originOptions = { ...this.validatorOptions };
        // 把当前已设置的 class-transform 选项解构到备份对象
        const originTransform = { ...this.transformOptions };
        // 把自定义的 class-transform 和 type 选项结构出来
        const { transformOptions, type: optionsType, ...customOptions } = options;
        // 根据 DTO 类上设置的 type 来设置当前的 DTO 请求类型，默认为 body
        const requestType: Paramtype = optionsType ?? 'body';
        // 如果被验证的 DTO 设置的请求类型与被验证的数据的请求类型不是同一种类型，则跳过此管道
        if (requestType !== type) return value;

        // 合并当前 transform 选项和自定义选项
        if (transformOptions) {
            this.transformOptions = merge(this.transformOptions, transformOptions ?? {}, {
                arrayMerge: (_d, s, _o) => s,
            });
        }
        // 合并当前验证选项和自定义选项
        this.validatorOptions = merge(this.validatorOptions, customOptions ?? {}, {
            arrayMerge: (_d, s, _o) => s,
        });
        const toValidate = isObject(value)
            ? Object.fromEntries(
                  Object.entries(value as Record<string, any>).map(([key, v]) => {
                      if (!isObject(v) || !('mimetype' in v)) return [key, v];
                      return [key, omit(v, ['fields'])];
                  }),
              )
            : value;
        // 序列化并验证 dto 对象
        const result = await super.transform(toValidate, metadata);
        // 重置验证选项
        this.validatorOptions = originOptions;
        // 重置 transform 选项
        this.transformOptions = originTransform;
        return result;
    }
}
