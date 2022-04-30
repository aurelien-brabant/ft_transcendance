import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/*
 * The password must contain one letter, one number, one special character,
 * and be between 8 and 30 characters long.
 * Special characters: @$!%#?&
 */
export function PasswordValidator(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'PasswordValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const regex = new RegExp('^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[@$!%#?&])[A-Za-z0-9@$!%#?&]{8,30}$');
          return regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'The password must contain at least one letter, one number, one special character (@$!%#?&) and be between 8 and 30 characters long.';
        }
      },
    });
  };
}
