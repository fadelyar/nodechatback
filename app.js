const express = require('express')
const http = require('http')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))


http.createServer(app).listen(2000, () => {
	console.log('server is running on port 2000!')
})

