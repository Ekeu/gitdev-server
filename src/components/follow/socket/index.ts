import { Server, Socket } from "socket.io";

export class IOFollow {
  static io: Server;

  constructor(io: Server) {
    IOFollow.io = io;
  }

  public listen(): void {
    IOFollow.io.on("connection", (socket: Socket) => {
      socket.on("unfollow", (data) => {
        IOFollow.io.emit("unfollow", data);
      });
    });
  }
}
