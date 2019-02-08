import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express, { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import logger from 'morgan';
import * as path from 'path';
import cors from 'cors';
import { indexRoutes } from './controllers';
import { commentsRoutes } from './controllers/comment';
import { postsRoutes } from './controllers/post';
import http from 'http';
import errorhandler from 'api-error-handler';

createConnection().then(async connection => {
  const app = express();

  // middleware
  app.use(cors({ credentials: true, origin: true }));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  // routes
  app.use('/', indexRoutes);
  app.use(postsRoutes);
  app.use(commentsRoutes);

  // error handlers
  app.use((req: Request, res: Response, next: NextFunction) => {
    const err: any = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // send json error handler
  app.use(errorhandler());

  // port
  const port = process.env.PORT || '3000';

  // server
  const server = http.createServer(app);

  server.listen(port);
  server.on('error', (e: object) => console.error(e));
  server.on('listen', content => console.log(content));
});
