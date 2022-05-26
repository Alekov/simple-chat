const express = require('express')
const http = require('http')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')
app.set('views', './views')

const session = require('express-session')
app.use(
    session({
        secret: 'sessionsecret',
        resave: true,
        saveUninitialized: true,
    })
)

const passport = require('passport')
app.use(passport.initialize())
app.use(passport.session())
require('./util/passport')(passport)

require('./routes/index')(app, passport)

const server = http.createServer(app)

const WebSocket = require('ws')
const wss = new WebSocket.Server({ server })

const { clients } = require('./util/clients')

wss.on('connection', (connection) => {
    connection.send('Welcome to the simple chat')

    connection.on('message', (data) => {
        const parsedData = JSON.parse(data)

        if (parsedData.isInitialConnection) {
            clients.set(parsedData.user.nickname, { nickname: parsedData.user.nickname, connection })
        } else {
            wss.clients.forEach((client) => {
                if (client !== connection && client.readyState === WebSocket.OPEN) {
                    client.send(`${parsedData.user.nickname}: ${parsedData.message}`)
                }
            })
        }
    })
})

server.listen(3000, () => {
    console.log(`Server is running on port 3000`)
})
