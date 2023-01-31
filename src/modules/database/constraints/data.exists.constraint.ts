import { Injectable } from '@nestjs/common';
import {
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { DataSource, ObjectType, Repository } from 'typeorm';

type Condition = {
    entity: ObjectType<any>;
    /**
     * 用于查询的对比字段，默认 id
     */
    map?: string;
};

/**
 * 查询某个字段的值是否在数据表中存在
 */
@ValidatorConstraint({ name: 'dataExist', async: true })
@Injectable()
export class DataExistsConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, validationArguments?: ValidationArguments) {
        let repo: Repository<any>;
        if (!value) return true;
        let map = 'id';
        // 通过传入的 entity 获取其 repository
        if ('entity' in validationArguments.constraints[0]) {
            map = validationArguments.constraints[0].map ?? 'id';
            repo = this.dataSource.getRepository(validationArguments.constraints[0].entity);
        } else {
            repo = this.dataSource.getRepository(validationArguments.constraints[0]);
        }
        // 验证记录是否存在
        const item = await repo.findOne({ where: { [map]: value } });
        return !!item;
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        if (!validationArguments.constraints[0]) {
            return 'Model is not specified.';
        }

        return `All instance of ${validationArguments.constraints[0].name} must be exists in database`;
    }
}

/**
 * 模型存在验证
 * @param entity
 * @param validationOptions
 */
function IsDataExist(
    entity: ObjectType<any>,
    validationOptions: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

/**
 * 模型存在验证
 * @param condition
 * @param validationOptions
 */
function IsDataExist(
    condition: Condition,
    validationOptions: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

/**
 * 模型存在验证
 * @param entity
 * @param validationOptions
 */
function IsDataExist(
    condition: ObjectType<any> | Condition,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [condition],
            validator: DataExistsConstraint,
        });
    };
}

export { IsDataExist };
