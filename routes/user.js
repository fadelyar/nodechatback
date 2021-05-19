const router = require('express').Router()
const {PrismaClient} = require('@prisma/client')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

// login user
router.post('/login', async (req,
									  res) => {
	const data = req.body
	try {
		const user = await prisma.user.findFirst({
			where: {
				name: data.name
			}
		})
		if (!user) return res.status(400).send({message: 'user does not exist!'})
		const password = await bcrypt.compare(data.password, user.password)
		if (!password) return res.status(400).send({'message': 'incorrect password!'})
		jwt.sign(user, process.env.PRIVATE_KEY, {}, (err, token) => {
			if (err) return res.status(400).send({message: err.message})
			res.send({...user, token})
		})
	} catch (e) {
		res.send({message: e.message})
	}
})

// register user
router.post('/register', async (req,
										  res) => {
	const data = req.body
	const user = await prisma.user.findFirst({
		where: {
			name: data.name
		}
	})
	if (user) return res.status(400).send({message: 'user name already exist!'})
	const salt = await bcrypt.genSalt(10)
	const hashPassword = await bcrypt.hash(data.password, salt)
	const newUser = await prisma.user.create({
		data: {
			name: data.name,
			isSuperUser: data.isSuperUser || false,
			password: hashPassword
		}
	})
	jwt.sign(newUser, process.env.PRIVATE_KEY, {}, (err, token) => {
		if (err) return res.status(400).send({message: err.message})
		res.send({...newUser, token})
	})
})

module.exports = router