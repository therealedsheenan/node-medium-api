import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable
} from 'typeorm';
import { Length, IsDate } from 'class-validator';
import { Post } from './post';

@Entity()
export class Comment {
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
}
