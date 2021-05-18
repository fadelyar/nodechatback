const express = require('express')
const http = require('http')
const app = express()
const userRouter = require('./routes/user')
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/user/',userRouter)

http.createServer(app).listen(2000, () => {
	console.log('server is running on port 2000!')
})

