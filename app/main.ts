import * as net from "net";

//Returns a server object and attach the callback to be executed on a connection.

const OK_CODE = "HTTP/1.1 200 OK\r\n";
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
    console.log("url", url);
    if (url === "/") {
      socket.write(OK_CODE + "\r\n");
      return;
    }
    const urls = url.split("/");
    console.log("urls", urls);
    if (urls[1] === "echo") {
      const response = createResponse(urls[2]);
      console.log(response);
      socket.write(response);
    } else {
      socket.write(ERROR_CODE);
    }
  });
});

//This will keep the server running until the connection is closed.
server.listen(4221, "localhost");

function createResponse(data: string): string {
  console.log("data", data);
  return (
    OK_CODE +
    "Content-Type: text/plain\r\n" +
    "Content-Length: " +
    data.length +
    "\r\n\r\n" +
    data
  );
}
