import { Router, Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';
import passport from 'passport';
import { validate } from 'class-validator';

import { User } from '../entities/user';
import { auth } from '../middlewares/auth';
import { UserProfile } from '../entities/userProfile';
import { RequestCustom } from '../index';

const router: Router = Router();

const createUser = async (req: Request, res: Response, next: NextFunction) => {
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
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  // passport strategy
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (user) {
      res.json({ user: User.toAuthJSON(user) });
    } else {
      res.status(422).json(info);
    }
  })(req, res, next);
};

const getUserProfile = async (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  const currentUserId = req.currentUser && req.currentUser.id;
  const currentUserProfile = await User.getById(currentUserId).catch(
    (e: Error) => next(e)
  );

  if (currentUserId) {
    res.json({ user: currentUserProfile });
  } else {
    next();
  }
};

const updateUserProfile = async (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  const userProfileBody = req.body && req.body.userProfile;
  const currentUserId = req.currentUser && req.currentUser.id;

  // get user profile based from the currentUserId
  const currentUserProfile = (await User.getById(currentUserId).catch(
    (e: Error) => next(e)
  )) as User;

  const userProfileRepo = getConnection().getRepository(UserProfile);

  /*
   * Update userProfile using the currentUserProfile ID
   * and return the updated user with userProfile object
   */
  await userProfileRepo
    .update({ id: currentUserProfile.userProfile.id }, userProfileBody)
    .then(async () => {
      const updatedUserProfile = (await User.getById(currentUserId).catch(
        (e: Error) => next(e)
      )) as User;

      if (updatedUserProfile) {
        res.json({ user: updatedUserProfile });
      } else {
        next();
      }
    })
    .catch((e: Error) => next(e));
};

// user routes declarations
router.post('/user/new', createUser);
router.post('/user/login', loginUser);
router.get('/user/profile', auth.required, getUserProfile);
router.put('/user/profile', auth.required, updateUserProfile);

export const usersRoutes: Router = router;
