declare namespace Express {
  export interface Request {
    currentUser: {
      id: number;
    };
  }
}
