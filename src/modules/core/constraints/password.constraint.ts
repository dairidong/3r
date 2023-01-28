import {
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';

type ModelType = 1 | 2 | 3 | 4 | 5;

/**
 * 密码验证规则
 */
@ValidatorConstraint({ name: 'isPassword', async: false })
export class IsPasswordConstraint implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        const validateModel: ModelType = validationArguments.constraints[0] ?? 1;
        switch (validateModel) {
            // 必须由小写字母和数字组成
            case 2:
                return /\d/.test(value) && /[a-z]/.test(value);
            // 必须由大写字母和数字组成
            case 3:
                return /\d/.test(value) && /[A-Z]/.test(value);
            // 必须由小写字母、大写字母和数字组成
            case 4:
                return /\d/.test(value) && /[a-z]/.test(value) && /[A-Z]/.test(value);
            // 必须由小写字母、大写字母、数字和特殊符号组成
            case 5:
                return (
                    /\d/.test(value) &&
                    /[a-z]/.test(value) &&
                    /[A-Z]/.test(value) &&
                    /[!@#$%^&]/.test(value)
                );
            // 必须由大写或小写字母和数字组成（默认）
            case 1:
            default:
                return /\d/.test(value) && /[a-zA-Z]/.test(value);
        }
    }
}

/**
 * 密码复杂度验证
 * @param model 验证模式
 * @param validationOptions
 */
export function IsPassword(model?: ModelType, validationOptions?: ValidationOptions) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [model],
            validator: IsPasswordConstraint,
        });
    };
}
