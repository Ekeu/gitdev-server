import { Server } from "socket.io";

export class IONotification {
  static io: Server;

  constructor(io: Server) {
    IONotification.io = io;
  }
}
