import { Injectable } from '@nestjs/common';
import {
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import merge from 'deepmerge';
import { isNil } from 'lodash';
import { DataSource, Not, ObjectType } from 'typeorm';

type Condition = {
    entity: ObjectType<any>;
    /**
     * 忽略字段名
     */
    ignore?: string;
    /**
     * 查询字段名
     */
    property?: string;
};

/**
 * 在更新时验证唯一性，通过 ignore 属性指定忽略字段
 */
@ValidatorConstraint({ name: 'dataUniqueExist', async: true })
@Injectable()
export class UniqueExistConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, validationArguments?: ValidationArguments) {
        const config: Omit<Condition, 'entity'> = {
            ignore: 'id',
            property: validationArguments.property,
        };

        const condition = ('entity' in validationArguments.constraints[0]
            ? merge(config, validationArguments.constraints[0])
            : {
                  ...config,
                  entity: validationArguments.constraints[0],
              }) as unknown as Required<Condition>;

        if (!condition.entity) return false;
        // 在传入的 dto 数据中获取需要忽略的字段值
        const ignoreValue = (validationArguments.object as any)[condition.ignore];
        // 如果字段不存在则验证失败
        if (ignoreValue === undefined) return false;
        // 通过 entity 获取 repository
        const repo = this.dataSource.getRepository(condition.entity);
        // 查询除了忽略字段外的数据是否对 queryProperty 的值唯一
        return isNil(
            await repo.findOne({
                where: {
                    [condition.property]: value,
                    [condition.ignore]: Not(ignoreValue),
                },
                withDeleted: true,
            }),
        );
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const { entity, property } = validationArguments.constraints[0];
        const queryProperty = property ?? validationArguments.property;
        if (!(validationArguments.object as any).getManager) {
            return 'getManager function can not be found';
        }
        if (!entity) {
            return "Model wasn't specified";
        }
        return `${queryProperty} of ${entity.name} must be unique`;
    }
}

/**
 * 更新数据时的唯一性验证
 * @param params
 * @param validationOptions
 */
export function IsUniqueExist(
    params: ObjectType<any> | Condition,
    validationOptions?: ValidationOptions,
) {
    return (Object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: Object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [params],
            validator: UniqueExistConstraint,
        });
    };
}
