"use strict";

import { Router, Request, Response, NextFunction } from "express";
import { getConnection } from "typeorm";
import { validate } from "class-validator";

import { Comment } from "../entities/comment";
import { Post } from "../entities/post";

const router: Router = Router();

// Get all posts
router.get(
  "/posts/",
  async (req: Request, res: Response, next: NextFunction) => {
    const postRepo = getConnection().getRepository(Post);
    const post = await postRepo.find({ relations: ["comments"] });
    return res.json({ post });
  }
);

// Get post via :postID
router.get(
  "/post/:postId",
  (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const postRepo = getConnection().getRepository(Post);
    const post = postRepo.findOne(postId, {});
    return res.json({ post });
  }
);

// Create new post
router.post(
  "/post/new",
  async (req: Request, res: Response, next: NextFunction) => {
    // comments data
    const postBody = req.body.post;
    const postRepo = getConnection().getRepository(Post);

    // assign values
    // @ts-ignore
    const newPost = new Post({
      ...postBody,
      createDate: Date.now()
    }) as Post;

    // run post validations
    const postErrors = await validate(newPost);

    if (postErrors.length > 0) {
      throw new Error("Posts: Validation failed.");
    } else {
      const post = (await postRepo.save(newPost)) as Post;

      return res.json({ post: post });
    }
  }
);

// Update post via :postId
router.put(
  "/post/:postId",
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const postRepo = getConnection().getRepository(Comment);
    const postBody = req.body.post;

    const post = await postRepo.update({ id: postId }, postBody);

    return res.json({ post });
  }
);

// Delete comment via :commentID
router.delete(
  "/post/:postId",
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const postRepo = getConnection().getRepository(Post);
    await postRepo.delete(postId);
    const posts = await postRepo.find({});

    return res.json({ posts });
  }
);

export const postsRoutes: Router = router;
