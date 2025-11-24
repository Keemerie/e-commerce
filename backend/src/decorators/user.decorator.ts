import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Optional } from '../custom';

export const User = createParamDecorator((data: Optional<string>, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  if (!data) return user;
  return user ? user[data] : undefined;
});
