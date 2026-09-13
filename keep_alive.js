const http = require("http");

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
}).listen(3000);

setInterval(() => {
  http.get("http://localhost:3000", () => {}).on("error", () => {});
}, 240000);