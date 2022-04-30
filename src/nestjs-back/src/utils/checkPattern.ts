import { UnauthorizedException } from '@nestjs/common';

/*
 * Utils for pattern validation
 */

export const checkPasswordPattern = (password: string) => {

  /*
   * The password must contain one letter, one number, one special character,
   * and be between 8 and 30 characters long.
   * Special characters: @$!%#?&
   */
  const regex = new RegExp('^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[@$!%#?&])[A-Za-z0-9@$!%#?&]{8,30}$');

  if (!regex.test(password)) {
    throw new UnauthorizedException('The password must contain at least one letter, one number, one special character (@$!%#?&) and be between 8 and 30 characters long.');
  }
};
