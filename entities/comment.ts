import 'reflect-metadata';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Post } from "./post";

@Entity()
export class Comment {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @Column()
  text: string;

  @Column("date")
  createDate: string;

  @Column()
  approvedComment: boolean;

  @ManyToOne(type => Post, post => post.comments)
  post: Post;
}
