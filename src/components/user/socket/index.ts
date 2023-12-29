import { Server, Socket } from "socket.io";

export class IOUser {
  static io: Server;

  constructor(io: Server) {
    IOUser.io = io;
  }

  public listen(): void {
    IOUser.io.on("connection", (socket: Socket) => {
      socket.on("block", (data) => {
        IOUser.io.emit("block", data);
      });
      socket.on("unblock", (data) => {
        IOUser.io.emit("unblock", data);
      });
    });
  }
}
