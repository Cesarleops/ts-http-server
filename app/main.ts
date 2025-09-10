import * as net from "net";

//Returns a server object and attach the callback to be executed on a connection.

const OK_CODE = "HTTP/1.1 200 OK\r\n\r\n";
const ERROR_CODE = "HTTP/1.1 404 Not Found\r\n\r\n";
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });
  socket.on("connect", () => {
    console.log("rem");
  });
  socket.on("data", (data) => {
    const content = data.toString();
    const [status] = content.split("\r\n");
    const url = status.split(" ")[1];
    if (url === "/") {
      socket.write(OK_CODE);
    } else {
      socket.write(ERROR_CODE);
    }
  });
  console.log("content", socket.address());
});

//This will keep the server running until the connection is closed.
server.listen(4221, "localhost");
