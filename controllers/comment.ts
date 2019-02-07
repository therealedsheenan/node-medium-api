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
    const postRepo = getConnection().getRepository(Post);
    const comments = await postRepo.findOne(postId, {
      relations: ['comments']
    });
    return res.json({ comments });
  }
);

// Get comment via :commentID
router.get(
  '/comments/:commentId',
  (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const commentRepo = getConnection().getRepository(Comment);
    const comment = commentRepo.findOne(commentId, {});
    return res.json({ comment });
  }
);

// Create new comment
router.post(
  '/post/:postId/comments/new',
  async (req: Request, res: Response, next: NextFunction) => {
    // comments data
    const commentBody = req.body.comment;
    const commentRepo = getConnection().getRepository(Comment);

    // assign values
    // @ts-ignore
    const newComment = new Comment({
      ...commentBody,
      approvedComment: false,
      createDate: Date.now()
    }) as Comment;

    // run comment validations
    const commentErrors = await validate(newComment);

    if (commentErrors.length > 0) {
      throw new Error('Comments: Validation failed.');
    } else {
      const comment = (await commentRepo.save(newComment)) as Comment;
      // post data
      const postId = req.body.postId;
      const postRepo = getConnection().getRepository(Post);
      const post = (await postRepo.findOne(postId, {})) as Post;
      post.comments.push(comment);

      return res.json({ post: await postRepo.save(post) });
    }
  }
);

// Update comment via :commentID
router.put(
  '/comments/:commentId',
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const commentRepo = getConnection().getRepository(Comment);
    const commentBody = req.body.comment;

    const comment = await commentRepo.update({ id: commentId }, commentBody);

    return res.json({ comment });
  }
);

// Delete comment via :commentID
router.delete(
  '/comments/:commentId',
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const commentRepo = getConnection().getRepository(Comment);
    await commentRepo.delete(commentId);
    const comments = await commentRepo.find({});

    return res.json({ comments });
  }
);

export const commentsRoutes: Router = router;
