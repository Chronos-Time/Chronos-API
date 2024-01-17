require('dotenv').config()
import express, { Application } from 'express'
import c from 'ansi-colors'
import mongoose from 'mongoose'
import path from 'path'
import cors from 'cors'
import morgan from 'morgan'
import passport from './passport'
import session from 'express-session'
import cookieSession from 'cookie-session'


const PORT = process.env.PORT || 5001
const app: Application = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors(
    {
        origin: ['http://localhost:3000'],
        credentials: true,
        // methods: "GET, POST, PUT, DELETE, OPTIONS",
        // origin: 'http://localhost:3000',
    }
))
app.use(morgan('dev'))
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 10
    }
}))

// app.use(cookieSession({
//     name: 'google-auth-session',
//     keys: ['key1', 'key2'],
//     maxAge: 1000 * 60 * 60,
//     // secure: true,
//     // httpOnly: true,
//     // domain: 'example.com',
//     // path: 'foo/bar',
//     // sameSite: 'lax',
// }))

app.use(passport.initialize())
app.use(passport.session())

if (process.env.NODE_ENV === 'production') {

}

if (process.env.ATLAS_URI) {
    mongoose.connect(process.env.ATLAS_URI)
        .catch((error) => {
            console.log(c.red("Database connection failed"))
            console.log(error)
        })
    const connection = mongoose.connection
    connection.once('open', () => {
        console.log(c.green('Database connection established successfully'))
    })

    mongoose.set('strictQuery', true)
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/home.html'))
})

import Routes from './routes'

app.use('/auth', Routes.authRouter)
app.use('/client', Routes.clientRouter)

app.listen(PORT, () => {
    console.log('Server is running on port', c.green.inverse(PORT.toString()))
})