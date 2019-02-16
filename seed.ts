import 'reflect-metadata';
import { ConnectionOptions, createConnection } from 'typeorm';
import faker from 'faker';

import { Comment } from './entities/comment';
import { Post } from './entities/post';
import { User } from './entities/user';

const options: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'root',
  database: 'node-medium-api',
  entities: ['entities/**{.ts,.js}']
};

createConnection(options).then(async connection => {
  console.log('Seeding files...');
  // seeding comment
  const commentRepo = await connection.getRepository(Comment);
  const postRepo = connection.getRepository(Post);
  const userRepo = connection.getRepository(User);

  try {

    const passwordSaltHash = await User.getPasswordSaltHash(faker.internet.password());

    // seed user
    const newUser = await userRepo.create({
      email: faker.internet.email(),
      ...passwordSaltHash
    });

    const user = (await userRepo.save(newUser)) as User;

    // seed posts
    await Promise.all(
      [...Array(10)].map(async num => {
        const newPost = await postRepo.create({
          title: faker.random.words(4),
          text: faker.lorem.paragraph(),
          createDate: new Date(),
          author: user
        });

        await postRepo.save(newPost);
      })
    );

    const posts = (await postRepo.find()) as Post[];

    // creating comments
    await Promise.all(
      [...Array(10).keys()].map(async (num: number) => {
        const comment = await commentRepo.create();
        comment.author = faker.name.findName();
        comment.text = faker.lorem.paragraph();
        comment.approvedComment = false;
        comment.createDate = new Date();
        comment.post = posts[0];
        await commentRepo.save(comment);
      })
    );

    // kill connection
    console.log('Seeding successful...');
  } catch (e) {
    console.error(e);
  }

  await connection.close();
});
