import passport from 'passport';
import passportLocal from 'passport-local';

import { User } from '../entities/user';

export const localStrategy = () => {
  const LocalStrategy = passportLocal.Strategy;

  // login passport strategy
  return passport.use(
    new LocalStrategy(
      {
        usernameField: 'user[email]',
        passwordField: 'user[password]'
      },
      async (email: string, password: string, done: Function) => {
        await User.verifyEmail(email)
          .then(async (currentUser: User) => {
            const isValidPassword = await User.isValidPassword(
              currentUser,
              password
            );
            if (!isValidPassword) {
              return done(undefined, false, {
                errors: { message: 'Invalid password.' }
              });
            }
            return done(undefined, currentUser);
          })
          .catch(e =>
            done(undefined, false, {
              errors: { 'email or username': 'is invalid' }
            })
          );
      }
    )
  );
};
