import { Entity, ManyToOne, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { Post } from './post';

@Entity()
export class Clap extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Post, post => post.claps, { nullable: false })
  post: Post;

  static getClapsCount (postId: number) {
    return this.createQueryBuilder('clap')
      .where('clap.post.id = :postId', { postId })
      .getCount();
  }
}
