import { Router, Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';

import { Clap } from '../entities/clap';

const router: Router = Router();

// Get claps count of a post
const getClaps = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId, 10);
  const claps = await Clap.getClapsCount(postId).catch((e: Error) => next(e));

  if (!claps) {
    // return 0 if claps there's no claps existing on a post
    res.json({ claps: 0 });
  } else {
    res.json({ claps });
  }
};

// Create clap to post
const createClap = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId, 10) as any;
  const newClap = await Clap.create({ post: postId });
  const clapRepo = getConnection().getRepository(Clap);

  // save clap and return all claps the post
  clapRepo
    .save(newClap)
    .then(async (clap: Clap) => {
      const claps = await Clap.getClapsCount(postId).catch((e: Error) =>
        next(e)
      );

      if (!claps) {
        next();
      }

      res.json({ claps });
    })
    .catch((e: Error) => next(e));
};

// Claps routes declarations
router.get('/post/:postId/claps', getClaps);
router.post('/post/:postId/clap', createClap);

export const clapsRoutes: Router = router;
