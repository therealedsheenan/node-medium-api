'use strict';

import { Router, Request, Response, NextFunction } from 'express';

const router: Router = Router();

// Sample endpoint
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('Hello world!');
});

export const indexRoutes: Router = router;
