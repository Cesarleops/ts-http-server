import * as net from "net";

console.log("app running");
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });
  socket.write("HTTP/1.1 200 OK\r\n\r\n");
});

server.listen(4221, "localhost");
