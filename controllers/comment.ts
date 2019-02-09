import { Router, Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';
import { validate } from 'class-validator';

import { Comment } from '../entities/comment';
import { Post } from '../entities/post';

const router: Router = Router();

// Get all comments from a specific postID
router.get(
  '/post/:postId/comments/',
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const comments = await getPost(postId);

    if (!comments) {
      next();
    }

    res.json({ comments });
  }
);

// Get comment via :commentID
router.get(
  '/comment/:commentId',
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const commentRepo = getConnection().getRepository(Comment);

    const comment = await commentRepo
      .findOne(commentId, {})
      .catch((e: Error) => next(e));

    if (!comment) {
      next();
    }

    res.json({ comment });
  }
);

// Create new comment
router.post(
  '/post/:postId/comment/new',
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    // comments data
    const commentBody = req.body.comment;
    const commentRepo = getConnection().getRepository(Comment);

    // assign values
    const newComment = commentRepo.create({
      ...commentBody,
      approvedComment: false,
      createDate: new Date(),
      post: postId
    });

    // run comment validations
    const commentErrors = await validate(newComment);

    if (commentErrors.length > 0) {
      next(commentErrors);
    } else {
      await commentRepo.save(newComment).catch((e: Error) => next(e));

      // get post's comments
      const comments = await getPost(postId).catch((e: Error) => next(e));
      res.json({ comments });
    }
  }
);

// Update comment via :commentID
router.put(
  '/comment/:commentId',
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const commentRepo = getConnection().getRepository(Comment);
    const commentBody = req.body.comment;

    const comment = await commentRepo
      .update({ id: commentId }, { ...commentBody, updateDate: new Date() })
      .catch((e: Error) => next(e));

    if (!comment) {
      next();
    }

    res.json({ comment });
  }
);

// Delete comment via :commentID
router.delete(
  '/comment/:commentId',
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const commentRepo = getConnection().getRepository(Comment);
    await commentRepo.delete(commentId);
    const comments = await commentRepo.find({}).catch((e: Error) => next(e));

    if (!comments) {
      next();
    }

    res.json({ comments });
  }
);

// Utility function to get post
export const getPost = async (postId: number) => {
  const postRepo = getConnection().getRepository(Post);

  return postRepo
    .findOne(postId, {
      relations: ['comments'],
      order: { createDate: 'ASC' }
    })
    .catch((e: Error) => new Error('Cannot find.'));
};

export const commentsRoutes: Router = router;
