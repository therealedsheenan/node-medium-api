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
import { usersRoutes } from './controllers/user';
import { clapsRoutes } from './controllers/clap';
import { localStrategy } from './services/passport';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

createConnection().then(async connection => {
  const app = express();

  const isProduction = process.env.NODE_ENV === 'production';

  // middleware
  app.use(cors({ credentials: true, origin: true }));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  // passport strategy
  localStrategy();

  // routes
  app.use(indexRoutes);
  app.use(postsRoutes);
  app.use(commentsRoutes);
  app.use(usersRoutes);
  app.use(clapsRoutes);

  // error handlers
  app.use((req: Request, res: Response, next: NextFunction) => {
    const err: any = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // development error handler
  if (!isProduction) {
    app.use((errors: any, req: Request, res: Response, next: NextFunction) => {
      res.status(errors.status || 500);
      res.json({ errors });
    });
  }

  // production error handler
  app.use((errors: any, req: Request, res: Response, next: NextFunction) => {
    res.status(errors.status || 500);
    res.json({
      errors: {
        message: errors.message,
        error: {}
      }
    });
  });

  // port
  const port = process.env.PORT || '3000';

  // server
  const server = http.createServer(app);

  server.listen(port);
  server.on('error', (e: object) => console.error(e));

  server.on('listening', () => {
    console.log(
      '  App is running at http://localhost:%d in %s mode',
      port,
      isProduction ? 'production' : 'development'
    );
    console.log('  Press CTRL-C to stop\n');
  });

});
