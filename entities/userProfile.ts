import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  BaseEntity,
  AfterInsert
} from 'typeorm';
import { Length } from 'class-validator';

import { User } from './user';

@Entity()
export class UserProfile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: undefined, nullable: true })
  @Length(4, 20)
  firstName: string;

  @Column({ default: undefined, nullable: true })
  @Length(4, 20)
  lastName: string;

  @OneToOne(type => User, {
    cascade: true,
    nullable: false
  })
  @JoinColumn()
  user: User;

  /*
  * After the creation of UserProfile, call linkUserProfile()
  * from User to save relationship
  */
  @AfterInsert()
  createUserLink () {
    User.linkUserProfile(this);
  }

  static initUserProfile (user: User) {
    const initProfile = new UserProfile();
    initProfile.user = user;
    this.save(initProfile);
  }
}
