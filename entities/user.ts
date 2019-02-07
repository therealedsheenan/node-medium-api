import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

import { Post } from "./post";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToMany(type => Post, post => post.author)
  posts: Post[];
}
