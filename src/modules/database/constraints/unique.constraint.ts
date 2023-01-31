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
import { DataSource, ObjectType } from 'typeorm';

type Condition = {
    entity: ObjectType<any>;
    /**
     * 如果没有指定字段则使用当前验证的属性作为查询一句
     */
    property?: string;
};

/**
 * 验证某个字段的唯一性
 */
@ValidatorConstraint({ name: 'dataUnique', async: true })
@Injectable()
export class UniqueConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, validationArguments?: ValidationArguments) {
        // 获取要验证的模型和字段
        const config: Omit<Condition, 'entity'> = {
            property: validationArguments.property,
        };
        const condition = ('entity' in validationArguments.constraints[0]
            ? merge(config, validationArguments.constraints[0])
            : {
                  ...config,
                  entity: validationArguments.constraints[0],
              }) as unknown as Required<Condition>;
        if (!condition.entity) return false;
        try {
            // 查询是否存在数据，如果已存在，则验证失败
            const repo = this.dataSource.getRepository(condition.entity);
            return isNil(
                await repo.findOne({ where: { [condition.property]: value }, withDeleted: true }),
            );
        } catch (err) {
            // 如果数据库操作异常则验证失败
            return false;
        }
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const { entity, property } = validationArguments.constraints[0];
        const queryProperty = property ?? validationArguments.property;
        if (!(validationArguments.object as any).getManager) {
            return 'getManager function can not be found!';
        }
        if (!entity) {
            return 'Model is not specified!';
        }
        return `${queryProperty} of ${entity.name} must been unique`;
    }
}

/**
 * 数据唯一性验证
 * @param params Entity 类或验证条件对象
 * @param validationOptions
 */
export function IsUnique(
    params: ObjectType<any> | Condition,
    validationOptions?: ValidationOptions,
) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [params],
            validator: UniqueConstraint,
        });
    };
}