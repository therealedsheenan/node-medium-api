import { Router, Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';
import { validate } from 'class-validator';

import { Comment } from '../entities/comment';

import { auth } from '../middlewares/auth';
import { Post } from '../entities/post';
import { RequestCustom } from '../index';

const router: Router = Router();

/*
 * Get all comments from a specific postID
 * can pass ?approved=true|false
 */
const getPostComments = async (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  const postId = parseInt(req.params.postId, 10);
  const post = (await Post.getById(postId).catch((e: Error) =>
    next(e)
  )) as Post;

  // current user
  const currentUserId = req.currentUser && req.currentUser.id;
  let comments;

  /*
   * return all of the comments regardless it's comment status
   * if the current user is the owner of the post
   * Otherwise, return the approved comments only
   */
  if (currentUserId === post.author.id) {
    comments = await Comment.getAllPostComments(postId).catch((e: Error) =>
      next(e)
    );
  } else {
    comments = await Comment.getApprovedPostComments(postId).catch((e: Error) =>
      next(e)
    );
  }

  if (!comments) {
    next();
  }

  res.json({ comments });
};

// Get comment via :commentID
const getComment = async (req: Request, res: Response, next: NextFunction) => {
  const commentId = req.params.commentId;
  const commentRepo = getConnection().getRepository(Comment);

  const comment = await commentRepo
    .findOne(commentId, {})
    .catch((e: Error) => next(e));

  if (!comment) {
    next();
  }

  res.json({ comment });
};

// Create new comment
const newComment = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId, 10);
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

    // get unapproved comments
    const comments = await Comment.getApprovedPostComments(postId).catch(
      (e: Error) => next(e)
    );
    res.json({ comments });
  }
};

// Update comment via :commentID
const approveComment = async (req: any, res: Response, next: NextFunction) => {
  const commentId = req.params.commentId;
  const commentApprove = req.body.comment && req.body.comment.approvedComment;
  const commentRepo = getConnection().getRepository(Comment);
  const currentUser = req.currentUser;

  // validated ownership
  await commentRepo
    .findOne(commentId, {
      relations: ['post', 'post.author']
    })
    .then(async (comment: Comment) => {
      // allow user to edit comment if the user is the owner
      if (comment.post.author.id === currentUser.id) {
        await commentRepo
          .update({ id: commentId }, { approvedComment: commentApprove })
          .then(async () => {
            res.json({
              post: await commentRepo
                .findOne(commentId)
                .catch((e: Error) => next(e))
            });
          })
          .catch((e: Error) => next(e));
      }
    })
    .catch((e: Error) => next(e));
};

// Delete comment via :commentID
const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId;
  const commentRepo = getConnection().getRepository(Comment);
  await commentRepo.delete(commentId);
  const comments = await commentRepo.find({}).catch((e: Error) => next(e));

  if (!comments) {
    next();
  }

  res.json({ comments });
};

// Comments routes declarations
router.get('/post/:postId/comments/', auth.optional, getPostComments);
router.delete('/comment/:commentId', deleteComment);
router.put('/comment/:commentId/approve', auth.required, approveComment);
router.post('/post/:postId/comment/new', newComment);
router.get('/comment/:commentId', getComment);

export const commentsRoutes: Router = router;
