const express = require("express");
const app = express();
const server = require("http").createServer(app);
const userRouter = require("./routes/user");
const cors = require("cors");
const io = require('socket.io')(server, {
   cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ["token"],
      credentials: true
   }
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user/", userRouter);

const PORT = process.env.PORT || 500;

server.listen(PORT, () => {
   console.log("server is running on port 2000!");
});
