const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: ["http://localhost:4400", "http://localhost:4300"]
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on("change", (args) => {
        console.log("Delegate Change from Client A to Client B")
        socket.broadcast.emit("receive-change", args);
    });
    socket.on("position-change", (args) => {
        console.log("Delegate Position Change from Client A to Client B")
        socket.broadcast.emit("receive-position-change", args);
    });

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});