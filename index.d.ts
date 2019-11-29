import { Request } from 'express';

export interface RequestCustom extends Request {
  currentUser?: any;
}
