import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Length, IsDate } from "class-validator";
import { Post } from "./post";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(4, 20)
  author: string;

  @Column()
  @Length(4, 200)
  text: string;

  @Column("date")
  @IsDate()
  createDate: string;

  @Column()
  approvedComment: boolean;

  @ManyToOne(type => Post, post => post.comments)
  post: Post;
}
