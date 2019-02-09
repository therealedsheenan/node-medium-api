import { Router, Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';
import { validate } from 'class-validator';

import { Post } from '../entities/post';
import { User } from '../entities/user';
import { auth } from '../middlewares/auth';

const router: Router = Router();

// Get all posts
router.get(
  '/posts/',
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await Post.getAll().catch((e: Error) => next(e));

    if (!posts) {
      next();
    }
    res.json({ posts });
  }
);

// Get post via :postID
router.get(
  '/post/:postId',
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const post = await Post.getById(postId).catch((e: Error) => next(e));

    if (!post) {
      next();
    }
    res.json({ post });
  }
);

// Create new post
router.post(
  '/post/new',
  auth.required,
  async (req: any, res: Response, next: NextFunction) => {
    // comments data
    const postBody = req.body.post;
    const postRepo = getConnection().getRepository(Post);

    // get current logged in user
    const currentUser = await User.findById(req.currentUser.id).catch(
      (e: Error) => next(e)
    );

    if (!currentUser) {
      next('Something went wrong.');
    }

    // assign values
    const newPost = postRepo.create({
      ...postBody,
      createDate: new Date(),
      updateDate: new Date(),
      author: currentUser
    } as Object);

    // run post validations
    const postErrors = await validate(newPost);

    if (postErrors.length > 0) {
      next(postErrors);
    } else {
      const post = await postRepo.save(newPost);
      res.json({ post });
    }
  }
);

// Update post via :postId
router.put(
  '/post/:postId',
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const postBody = req.body.post;
    const postRepo = getConnection().getRepository(Post);

    // update post and return updated entity
    await postRepo
      .update({ id: postId }, { ...postBody, updateDate: new Date() })
      .then(async () =>
        res.json({
          post: await postRepo.findOne(postId).catch((e: Error) => next(e))
        })
      )
      .catch((e: Error) => next(e));
  }
);

// Delete post via :postID
router.delete(
  '/post/:postId',
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const postRepo = getConnection().getRepository(Post);

    // nullify publish date
    await postRepo
      .update({ id: postId }, { publishedDate: undefined })
      .catch((e: Error) => next(e));

    const posts = await postRepo.find({}).catch((e: Error) => next(e));

    if (!posts) {
      next();
    }

    res.json({ posts });
  }
);

export const postsRoutes: Router = router;
