import { Router, Request, Response, NextFunction } from 'express';
// import { getConnection } from 'typeorm';
import { validate } from 'class-validator';

import { User } from '../entities/user';

const router: Router = Router();

router.post(
  '/user/new',
  async (req: Request, res: Response, next: NextFunction) => {
    // user data
    const userBody = req.body.user;

    const passwordSaltHash = await User.getPasswordSaltHash(userBody.password);

    const newUser = new User();
    newUser.email = userBody.email;
    newUser.password = userBody.password;
    newUser.hash = passwordSaltHash.hash;
    newUser.salt = passwordSaltHash.salt;

    const newUserErrors = await validate(newUser);

    if (newUserErrors.length > 0) {
      next(newUserErrors);
    } else {
      const user = await newUser.save();

      // return user email and token
      res.json({ user: User.toAuthJSON(user) });
    }
  }
);

export const usersRoutes: Router = router;
