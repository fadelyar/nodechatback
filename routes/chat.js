const router = require('express').Router()
const {PrismaClient} = require("@prisma/client");


const prisma = new PrismaClient()

router.get('/getlast30messages/:room', async (req,
															res) => {
		try {
			const messages = await prisma.message.findMany({
				// take: 30,
				where: {
					group: {
						name: {
							equals: req.params.room
						}
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
			res.send(messages)
			// return res.send('wow')
		}catch (e) {
			res.send(e.message)
		}
	}
)

module.exports = router