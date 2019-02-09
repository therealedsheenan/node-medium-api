import jwt from 'express-jwt';

// getting Token or Bearer
const getTokenFromHeader = (req: any) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

export const secret = process.env.SECRET || 'secret';

// authentication middleware
export const auth = {
  required: jwt({
    secret: secret,
    userProperty: 'currentUser',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'currentUser',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};
