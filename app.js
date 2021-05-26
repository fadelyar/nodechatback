const express = require("express");
const app = express();
const server = require("http").createServer(app);
const userRouter = require("./routes/user");
const cors = require("cors");
const jwt = require("jsonwebtoken");
constredis = require("redis");
const fs = require('fs')
const redis = require("redis");
// 149.54.21.161/32

const {
   join,
   leave,
   getGroupContent,
   isLastUser,
   createMessage,
} = require("./chat/api");

const io = require("socket.io")(server, {
   cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["token"],
      credentials: true,
   },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

fs.readFile("creds.json", "utf-8", function (err, data) {
   if (err) throw err;
   creds = JSON.parse(data);
   client = redis.createClient(
      "redis://" +
      creds.user +
      ":" +
      creds.password +
      "@" +
      creds.host +
      ":" +
      creds.port
   );

   // Redis Client Ready
   client.once("ready", function () {
      // Flush Redis DB
      // client.flushdb();

      // Initialize Chatters
      client.get("chat_users", function (err, reply) {
         if (reply) {
            chatters = JSON.parse(reply);
         }
      });

      // Initialize Messages
      client.get("chat_app_messages", function (err, reply) {
         if (reply) {
            chat_messages = JSON.parse(reply);
         }
      });
   });
});

io.use((socket, next) => {
   const token = socket.handshake.auth.token;
   jwt.verify(token, process.env.PRIVATE_KEY, {}, (err, decoded) => {
      if (err) return next(new Error("there is an error with backend!"));
      socket.user = decoded.name;
      socket.id = socket.user;
      next();
   });
});

io.on("connection", async (socket) => {
   socket.join(socket.handshake.query.room);
   await join(socket.handshake.query.room, socket.user);
   io.emit("groupContent", await getGroupContent(socket.handshake.query.room));
   socket.on("sendMessage", async (message) => {
      const createdMessage = await createMessage(
         message,
         socket.handshake.query.room,
         socket.user
      );
      io.in(socket.handshake.query.room).emit("sendBack", createdMessage);
   });

   socket.on("disconnect", async () => {
      socket.leave(socket.handshake.query.room);
      await leave(socket.handshake.query.room, socket.user);
      await isLastUser(socket.handshake.query.room);
      io.emit(
         "groupContent",
         await getGroupContent(socket.handshake.query.room)
      );
   });
});

app.get("/", async (req, res) => {
   res.send("hello faisal adelyar");
});

app.use("/user", userRouter);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
   console.log("server is running on port 2000!");
});
