import { Router, Request, Response, NextFunction } from 'express';
import { getConnection, getRepository } from 'typeorm';
import { validate } from 'class-validator';

import { Comment } from '../entities/comment';
import { Post } from '../entities/post';
import { User } from '../entities/user';

const router: Router = Router();

// Get all posts
router.get(
  '/posts/',
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await getRepository(Post)
      .find()
      .catch((e: Error) => next(e));
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
    const postRepo = getConnection().getRepository(Post);
    const post = await postRepo
      .findOne(postId, {})
      .catch((e: Error) => next(e));
    if (!post) {
      next();
    }
    res.json({ post });
  }
);

// Create new post
router.post(
  '/post/new',
  async (req: Request, res: Response, next: NextFunction) => {
    // comments data
    const postBody = req.body.post;
    const postRepo = getConnection().getRepository(Post);

    // TODO: change next lines to actual logged in user
    const users = (await getRepository(User).find()) as User[];

    // assign values
    const newPost = postRepo.create({
      ...postBody,
      createDate: new Date(),
      updateDate: new Date(),
      user: users[0] // TODO: change next lines to actual logged in user
    });

    // run post validations
    const postErrors = await validate(newPost);

    if (!postErrors) {
      const post = await postRepo.save(newPost);
      res.json({ post: post });
    } else {
      next(postErrors);
    }
  }
);

// Update post via :postId
router.put(
  '/post/:postId',
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const postRepo = getConnection().getRepository(Comment);
    const postBody = req.body.post;

    const post = await postRepo
      .update({ id: postId }, postBody)
      .catch((e: Error) => next(e));

    return res.json({ post });
  }
);

// Delete comment via :commentID
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
