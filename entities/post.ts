import 'reflect-metadata';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';

import { User } from './user';
import { Comment } from './comment';

@Entity()
export class Post {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column("date")
  createDate: string;

  @Column("date")
  updateDate: string;

  @Column("date")
  publishedDate: string;

  @OneToMany(type => Comment, comment => comment.post)
  comments: Comment[];

  @ManyToOne(type => User, author => author.posts)
  author: User;
}
