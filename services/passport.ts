import passport from 'passport';
import passportLocal from 'passport-local';

import { User } from '../entities/user';

const LocalStrategy = passportLocal.Strategy;

// login passport strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]'
    },
    (email: string, password: string, done: Function) => {
      User.verifyEmail(email)
        .then((currentUser: User) => {
          if (!User.isValidPassword(currentUser, password)) {
            return done(undefined, false, {
              errors: { password: 'is invalid' }
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
