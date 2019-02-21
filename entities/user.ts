import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  BaseEntity,
  BeforeInsert,
  AfterInsert,
  Unique
} from 'typeorm';
import { IsEmail, Length } from 'class-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { Post } from './post';
import { UserProfile } from './userProfile';
import { secret } from '../middlewares/auth';

const queryString = 'user';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsEmail()
  email: string;

  // password won't be saved in the database
  @Column({ default: undefined, nullable: true })
  @Length(6, 16)
  password: string;

  // password hash
  @Column()
  hash: string;

  // password salt
  @Column()
  salt: string;

  @OneToMany(type => Post, post => post.author)
  posts: Post[];

  @OneToOne(type => UserProfile, {
    cascade: true
  })
  @JoinColumn()
  userProfile: UserProfile;

  /*
   * Don't store the real password to the database
   * All password should be blank and authentication of password
   * should only be based on the user's salt and hash values
   */
  @BeforeInsert()
  clearPassword () {
    this.password = '';
  }

  /*
   * After the creation of User, call createUserLink()
   * from UserProfile to save relationship
   */
  @AfterInsert()
  createUserProfile () {
    UserProfile.initUserProfile(this);
  }

  // This function saves one-to-one relationship of User and UserProfile
  static async linkUserProfile (userProfile: UserProfile) {
    const user = (await this.getById(userProfile.user.id)) as User;
    await this.getRepository().update(user.id, {
      userProfile
    });
  }

  static getById (id: string | number) {
    return this.createQueryBuilder(queryString)
      .where('user.id = :id', { id })
      .innerJoinAndSelect('user.userProfile', 'userProfile')
      .select(['user.id', 'user.email', 'userProfile'])
      .getOne();
  }

  /*
   * For authentication functions
   */
  static verifyEmail (email: string) {
    return this.createQueryBuilder(queryString)
      .where('user.email = :email', { email })
      .getOne();
  }

  static getPasswordSaltHash (password: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
      .toString('hex');

    return { salt, hash };
  }

  static async isValidPassword (user: User, password: string) {
    const hash = crypto
      .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
      .toString('hex');
    return user.hash === hash;
  }

  static generateToken (user: User) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign(
      {
        id: user.id,
        username: user.email,
        exp: exp.getTime() / 1000
      },
      secret
    );
  }

  static toAuthJSON (user: User) {
    return {
      id: user.id,
      email: user.email,
      token: this.generateToken(user)
    };
  }
}
