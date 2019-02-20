import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
  BaseEntity
} from 'typeorm';
import { Length, IsDate } from 'class-validator';
import { Post } from './post';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Length(4, 20)
  author: string;

  @Column()
  @Length(4, 200)
  text: string;

  @Column('date')
  @IsDate()
  createDate: Date;

  @Column()
  approvedComment: boolean;

  @ManyToOne(type => Post, post => post.comments, {
    nullable: false
  })
  @JoinTable()
  post: Post;

  static getApprovedPostComments (postId: number) {
    return this.createQueryBuilder('comment')
      .where('comment.post.id = :postId', { postId })
      .andWhere('comment.approvedComment = :approved', { approved: true })
      .innerJoinAndSelect('comment.post', 'post')
      .select(['comment', 'post.id'])
      .orderBy('comment.createDate', 'ASC')
      .getMany();
  }

  static getAllPostComments (postId: number) {
    return this.createQueryBuilder('comment')
      .where('comment.post.id = :postId', { postId })
      .innerJoinAndSelect('comment.post', 'post')
      .select(['comment', 'post.id'])
      .orderBy('comment.createDate', 'ASC')
      .getMany();
  }
}
