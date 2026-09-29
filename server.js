// Custom server entry point for hosts (like cPanel/WHM's "Setup Node.js App"
// via Passenger) that need a plain Node.js file to start the app, rather than
// running `next start` directly. Passenger sets PORT and NODE_ENV itself.
require("dotenv/config");
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
// Passing hostname/port explicitly matters here: without it, Next's internal
// self-requests (proxy/middleware, server action redirects) fall back to
// guessing an address from the request's Host header — i.e. the public
// domain — instead of the local loopback. On hosts that don't allow a
// process to freely make outbound connections back to its own public URL
// (seen on Hostinger/Passenger shared hosting), that guess hangs until
// ETIMEDOUT, breaking anything that redirects through proxy.ts (admin/
// dashboard login included). Pinning hostname to loopback fixes it.
const hostname = "127.0.0.1";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`> Ready on ${hostname}:${port} (${dev ? "development" : "production"})`);
  });
});
