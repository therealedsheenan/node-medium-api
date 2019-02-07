import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  BaseEntity
} from 'typeorm';
import { Length, IsDate } from 'class-validator';

import { User } from './user';
import { Comment } from './comment';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(6, 20)
  title: string;

  @Column()
  @Length(4, 200)
  text: string;

  @Column('date')
  @IsDate()
  createDate: Date;

  @Column('date', { default: undefined, nullable: true })
  @IsDate()
  updateDate: Date;

  @Column('date', { default: undefined, nullable: true })
  @IsDate()
  publishedDate: Date;

  @OneToMany(type => Comment, comment => comment.post, {
    cascade: true
  })
  comments: Comment[];

  @ManyToOne(type => User, author => author.posts, { nullable: false })
  author: User;

}
