import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Length, IsDate } from "class-validator";

import { User } from "./user";
import { Comment } from "./comment";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(6, 20)
  title: string;

  @Column()
  @Length(4, 200)
  text: string;

  @Column("date")
  @IsDate()
  createDate: string;

  @Column("date")
  @IsDate()
  updateDate: string;

  @Column("date")
  @IsDate()
  publishedDate: string;

  @OneToMany(type => Comment, comment => comment.post)
  comments: Comment[];

  @ManyToOne(type => User, author => author.posts)
  author: User;
}
