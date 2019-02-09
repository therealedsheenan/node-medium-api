import { Router, Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';
// import { validate } from 'class-validator';

import { User } from '../entities/user';
import { validate } from 'class-validator';

const router: Router = Router();

router.post(
  '/user/new',
  async (req: Request, res: Response, next: NextFunction) => {
    // user data
    const userBody = req.body.user;
    const userRepo = getConnection().getRepository(User);

    const passwordSaltHash = await User.getPasswordSaltHash(userBody.password);

    const newUser = userRepo.create(Object.assign({
      ...userBody,
      ...passwordSaltHash
    }) as Object);

    const newUserErrors = await validate(newUser);

    if (newUserErrors.length > 0) {
      next(newUserErrors);
    } else {
      // typeorm catch error should be passed as an array for consistency
      const user = await userRepo.save(newUser).catch((e: Error) => next([e]));
      if (user) {
        res.json({ user: User.toAuthJSON(user) });
      }
    }
  }
);

export const usersRoutes: Router = router;
