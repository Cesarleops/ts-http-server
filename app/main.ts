import * as net from "net";

//Returns a server object and attach the callback to be executed on a connection.

const OK_CODE = "HTTP/1.1 200 OK\r\n";
const ERROR_CODE = "HTTP/1.1 404 Not Found\r\n\r\n";

interface Headers {
  "User-Agent": string;
  host: string;
}
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on("data", (data) => {
    const content = data.toString();

    const [requestLine, headers, body] = parseRequest(content);

    const requestTarget = requestLine.split(" ")[1];

    const parsedHeaders = parseHeaders(headers);

    if (requestTarget === "/") {
      socket.write(OK_CODE + "\r\n");
      return;
    }

    if (requestTarget === "/user-agent") {
      const agentValue = parsedHeaders.get("User-Agent");

      if (!agentValue) {
        return;
      }

      const response = createResponse(agentValue);
      socket.write(response);
      return;
    }

    const urls = requestTarget.split("/");

    if (urls[1] === "echo") {
      const response = createResponse(urls[2]);
      socket.write(response);
    } else {
      socket.write(ERROR_CODE);
    }
  });
});

//This will keep the server running until the connection is closed.
server.listen(4221, "localhost");

function createResponse(data: string): string {
  const response = `${OK_CODE}Content-Type: text/plain\r\nContent-Length: ${data.length}\r\n\r\n${data}`;
  return response;
}

function parseRequest(request: string) {
  const headersStart = request.indexOf("\r\n");

  const headersEnd = request.lastIndexOf("\r\n\r\n");

  const requestLine = request.slice(0, request.indexOf("\r\n"));

  const headers = request.slice(headersStart + 2, headersEnd);

  const body = request.slice(headersEnd + 4);

  return [requestLine, headers, body];
}

function parseHeaders(headers: string): Map<keyof Headers, string> {
  const splittedHeaders = headers.split("\r\n");

  const kvHeaders = new Map();
  for (const sph of splittedHeaders) {
    const separatorIdx = sph.indexOf(":");
    const key = sph.slice(0, separatorIdx);
    const value = sph.slice(separatorIdx + 1);
    kvHeaders.set(key, value.trim());
  }

  return kvHeaders;
}
