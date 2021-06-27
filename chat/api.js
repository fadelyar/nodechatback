const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const isGroupExist = async function (groupName) {
	const group = await prisma.group.findFirst({
		where: { name: groupName },
	});
	return group ? true : false;
};

const join = async function (roomName, userName) {
	if (await isGroupExist(roomName)) {
		await prisma.group.update({
			where: {
				name: roomName,
			},
			data: {
				users: {
					connect: {
						name: userName,
					},
				},
			},
		});
	} else {
		await prisma.group.create({
			data: {
				name: roomName,
				users: {
					connect: {
						name: userName,
					},
				},
			},
		});
	}
};

const leave = async function (roomName, userName) {
	await prisma.group.update({
		where: {
			name: roomName,
		},
		data: {
			users: {
				disconnect: {
					name: userName,
				},
			},
		},
	});
};

const getGroupContent = async function (roomName) {
	const group = await prisma.group.findMany({
		include: {
			users: true,
		},
	});
	return group;
};

const isLastUser = async function (roomName) {
	try {
		const group = await prisma.group.findFirst({
			where: {
				name: roomName,
			},
			include: {
				users: true,
			},
		});
		if (group.users.length === 0) {
			await prisma.group.delete({
				where: {
					name: roomName,
				},
			});
		}
	} catch (e) {
		return
	}

};

const createMessage = async function (content, type, groupName, userName) {
	const message = await prisma.message.create({
		data: {
			content: content,
			type: type,
			user: {
				connect: {
					name: userName,
				},
			},
			group: groupName ? {
				connect: {
					name: groupName,
				},
			} : null
		},
		include: {
			user: {
				select: {
					name: true,
				},
			},
		},
	});
	return message;
};

const createPrivateMessage = async function (content, userName, type='text') {
	const message = await prisma.message.create({
		data: {
			content: content,
			type: type,
			user: {
				connect: {
					name: userName,
				},
			},
		},
		include: {
			user: {
				select: {
					name: true,
				},
			},
		},
	});
	return message;
}

module.exports = {
	join,
	leave,
	getGroupContent,
	isLastUser,
	createMessage,
	createPrivateMessage
};
