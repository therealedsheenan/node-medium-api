import { Router, Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';
import passport from 'passport';
import { validate } from 'class-validator';

import { User } from '../entities/user';

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

router.post(
  '/user/login',
  async (req: Request, res: Response, next: NextFunction) => {
    // passport strategy
    passport.authenticate('local', { session: false }, (
      err,
      user,
      info
    ) => {
      if (err) {
        return next(err);
      }

      if (user) {
        res.json({ user: User.toAuthJSON(user) });
      } else {
        res.status(422).json(info);
      }

    })(req, res, next);
  }
);

export const usersRoutes: Router = router;
