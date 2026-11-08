// Сервер-ретранслятор для WORLDSTATE. Запуск: npm i ws && node server.js
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
const rooms = new Map();
wss.on("connection", (ws, req) => {
  const room = (new URL(req.url, "http://x").searchParams.get("room") || "main").slice(0, 30);
  if (!rooms.has(room)) rooms.set(room, new Set());
  const peers = rooms.get(room);
  if (peers.size >= 50) return ws.close();
  peers.add(ws);
  ws.on("message", (d) => {
    if (d.length > 20000) return;                       // защита от мусора
    for (const p of peers) if (p !== ws && p.readyState === 1) p.send(d.toString());
  });
  ws.on("close", () => { peers.delete(ws); if (!peers.size) rooms.delete(room); });
});
console.log("WORLDSTATE server on port", process.env.PORT || 8080);
