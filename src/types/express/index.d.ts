import { IAuthUser } from "@components/auth/interfaces";

export {};

declare global {
  namespace Express {
    export interface Request {
      currentUser?: IAuthUser;
    }
  }
}
