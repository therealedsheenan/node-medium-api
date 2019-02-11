import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post';

@Entity()
export class Clap {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Post, post => post.claps, { nullable: false })
  post: Post;
}
