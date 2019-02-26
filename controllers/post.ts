import { Router, Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';
import { validate } from 'class-validator';

import { Post } from '../entities/post';
import { User } from '../entities/user';
import { auth } from '../middlewares/auth';

const router: Router = Router();

// Get all posts
const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  const posts = await Post.getAllPublishedPosts().catch((e: Error) => next(e));

  if (!posts) {
    next();
  }
  res.json({ posts });
};

// Get all draft posts
const getDraftPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUserId = req.currentUser.id;
  const posts = await Post.getAllDraftPosts(currentUserId).catch((e: Error) =>
    next(e)
  );

  if (!posts) {
    next();
  }
  res.json({ posts });
};

// Get post via :postID
const getPost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId;
  const currentUserId = req.currentUser && req.currentUser.id;
  const post = (await Post.getById(postId).catch((e: Error) =>
    next(e)
  )) as Post;

  if (!post) {
    next();
  }
  res.json({
    post: {
      ...post,
      isAuthor: currentUserId === post.author.id
    }
  });
};

// Create new post
const createPost = async (req: Request, res: Response, next: NextFunction) => {
  // comments data
  const postBody = req.body.post;
  const postRepo = getConnection().getRepository(Post);

  // get current logged in user
  const currentUser = await User.getById(req.currentUser.id).catch((e: Error) =>
    next(e)
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
};

// Update post via :postId
const updatePost = async (req: Request, res: Response, next: NextFunction) => {
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
};

// Delete post via :postID
const deletePost = async (req: Request, res: Response, next: NextFunction) => {
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
};

// posts routes declarations
router.get('/posts/', getAllPosts);
router.get('/posts/draft', auth.required, getDraftPosts);
router.get('/post/:postId', auth.optional, getPost);
router.post('/post/new', auth.required, createPost);
router.delete('/post/:postId', deletePost);
router.put('/post/:postId', auth.required, updatePost);

export const postsRoutes: Router = router;
