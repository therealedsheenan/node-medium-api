import 'reflect-metadata';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Post {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column()
  createDate: string;

  @Column()
  updateDate: string;

  @Column()
  publishedDate: string;

  @Column()
  author: string;

}
