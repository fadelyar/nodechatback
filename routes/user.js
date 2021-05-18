const router = require('express').Router()
const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient()

router.post('/createuser',
	async (req, res) => {
		try {
			const newUser = await prisma.user.create({
				data: {
					name: req.body.name,
					email: req.body.email,
					posts: {
						create: {
							title: 'Hello world'
						}
					}
				}
			})
			return res.send(newUser)
		}catch (e) {
			return res.send(e)
		}
	}
)

router.get('/getallusers', async (req, res) => {
	const users = await prisma.user.findMany()
	return res.send(users)
})

module.exports = router