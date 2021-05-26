const router = require('express').Router()
const {PrismaClient} = require("@prisma/client");


const prisma = new PrismaClient()

router.get('/getlast30messages/:room', async (req,
															res) => {
		const messages = await prisma.messages.findMany({
			take: 30,
			where: {
				group: {
					name: req.params.room
				}
			},
			select: {
				content: true,
				dateCreated: true,
				user: {
					select: {
						name: true
					}
				}
			},
			orderBy: {
				dateCreated: 'asc',
			}
		})
		return res.send(messages)
	}
)

module.exports = router