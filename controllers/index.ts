'use strict';

import { Router, Request, Response, NextFunction } from 'express';
// import { getConnection } from 'typeorm';
// import { User } from '../entities/user';


const router: Router = Router();

// Sample endpoint
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  // const userRepo = getConnection().getRepository(User);
  // console.log(userRepo);
  res.send('Hello world!');
});

export const indexRoutes: Router = router;
