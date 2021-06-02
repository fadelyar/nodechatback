const express = require("express");
const app = express();
const server = require("http").createServer(app);
const userRouter = require("./routes/user");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const chatRouter = require("./routes/chat");

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
app.use(express.urlencoded({extended: true}));

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
	socket.on("privateMessage", async (data) => {
		const createdMessage = await createMessage(
			data.message,
			socket.handshake.query.room,
			socket.user
		);

		io.to(data.receiver).emit(
			'sendBackPrivateMessage',
			{message: createdMessage, receiver: data.receiver}
		)
		io.to(data.sender).emit(
			'sendBackPrivateMessage',
			{message: createdMessage, receiver: data.receiver}
		)
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
app.use("/chat", chatRouter);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
	console.log("server is running on port 2000!");
});
