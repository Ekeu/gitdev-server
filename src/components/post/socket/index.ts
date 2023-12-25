import { Server, Socket } from "socket.io";

export class IOPost {
  static io: Server;

  constructor(io: Server) {
    IOPost.io = io;
  }

  public listen(): void {
    IOPost.io.on("connection", (socket: Socket) => {
      socket.on("reaction", (data) => {
        IOPost.io.emit("reaction", data);
      });
      socket.on("comment", (data) => {
        IOPost.io.emit("comment", data);
      });
    });
  }
}
