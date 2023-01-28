import {
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';

/**
 * 判断两个字段的值是否相等的验证规则
 */
@ValidatorConstraint({ name: 'isMatch' })
export class MatchConstraint implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        const [relatedProperty] = validationArguments.constraints;
        const relatedValue = (validationArguments.object as any)[relatedProperty];
        return value === relatedValue;
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const [relatedProperty] = validationArguments.constraints;
        return `${relatedProperty} and ${validationArguments.property} don't match.`;
    }
}

/**
 * 判断 DTO 中的两个属性是否相等
 * @param relatedProperty  用于对比的属性名称
 * @param validationOptions class-validator 库的选项
 */
export function IsMatch(relatedProperty: string, validationOptions?: ValidationOptions) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [relatedProperty],
            validator: MatchConstraint,
        });
    };
}
