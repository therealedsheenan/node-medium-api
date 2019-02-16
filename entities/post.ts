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
import { Clap } from './clap';

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
  updateDate: Date;

  @Column('date', { default: undefined, nullable: true })
  publishedDate: Date | undefined;

  @OneToMany(type => Comment, comment => comment.post, {
    cascade: true
  })
  comments: Comment[];

  @OneToMany(type => Clap, clap => clap.post, {
    cascade: true
  })
  claps: Clap[];

  @ManyToOne(type => User, author => author.posts, { nullable: false })
  author: User;

  static getById (id: string | number) {
    return this.createQueryBuilder('post')
      .where('post.id = :id', { id })
      .innerJoinAndSelect('post.author', 'author')
      .innerJoinAndSelect('author.userProfile', 'userProfile')
      .select([
        'post',
        'author.id',
        'author.email',
        'userProfile'
      ])
      .getOne();
  }

  /*
  * Change published date condition according to condition params
  * Post draft and published posts only
  */
  static getAllCondition (condition: string) {
    return this.createQueryBuilder('post')
      .where(`post.publishedDate ${condition}`)
      .orderBy('post.updateDate', 'ASC')
      .getMany();
  }
}
