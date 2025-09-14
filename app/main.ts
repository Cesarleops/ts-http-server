import * as net from "net";
import * as fs from "fs";
//Returns a server object and attach the callback to be executed on a connection.

const OK_CODE = "HTTP/1.1 200 OK\r\n";
const ERROR_CODE = "HTTP/1.1 404 Not Found\r\n\r\n";

interface Headers {
  "user-agent": string;
  host: string;
}

const args = process.argv;
console.log("args", args);
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on("data", (data) => {
    const content = data.toString();

    const [requestLine, headers, body] = parseRequest(content);

    const [method, requestTarget] = parseRequestLine(requestLine);

    const parsedHeaders = parseHeaders(headers);

    if (requestTarget === "/") {
      socket.write(OK_CODE + "\r\n");
      return;
    }

    if (requestTarget === "/user-agent") {
      const agentValue = parsedHeaders.get("user-agent");

      if (!agentValue) {
        return;
      }

      const response = createResponse(
        agentValue,
        agentValue.length,
        "text/plain",
      );
      socket.write(response);
      return;
    }

    if (requestTarget.startsWith("/files")) {
      const fileName = requestTarget.slice(requestTarget.lastIndexOf("/") + 1);
      console.log("mthod", method);
      if (method === "GET") {
        try {
          const read = fs.readFileSync(`${args[3]}/${fileName}`);

          const data = read.toString();

          const response = createResponse(
            data,
            data.length,
            "application/octet-stream",
          );

          socket.write(response);
        } catch (e) {
          socket.write(ERROR_CODE);
        }
      }

      if (method === "POST") {
        console.log("posting", body, fileName);
        try {
          fs.writeFileSync(`${args[3]}/${fileName}`, body);
          socket.write("HTTP/1.1 201 Created\r\n\r\n");
        } catch (e) {
          console.log("err", e);
          socket.write(ERROR_CODE);
        }
      }
    }
    const urls = requestTarget.split("/");

    if (urls[1] === "echo") {
      const response = createResponse(urls[2], urls[2].length, "text/plain");
      socket.write(response);
    } else {
      socket.write(ERROR_CODE);
    }
  });
});

//This will keep the server running until the connection is closed.
server.listen(4221, "localhost");

function createResponse(
  data: string,
  size: number,
  contentType: string,
): string {
  const response = `${OK_CODE}Content-Type: ${contentType}\r\nContent-Length: ${size}\r\n\r\n${data}`;
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
    //By Standard, the Headers are case insensitive.
    const key = sph.slice(0, separatorIdx).toLowerCase();
    const value = sph.slice(separatorIdx + 1);
    kvHeaders.set(key, value.trim());
  }

  return kvHeaders;
}

function parseRequestLine(requestLine: string) {
  return requestLine.split(" ");
}
