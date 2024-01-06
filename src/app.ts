require('dotenv').config()
import express, { Application } from 'express'
import c from 'ansi-colors'
import mongoose from 'mongoose'
import path from 'path'
import cors from 'cors'

const PORT = process.env.PORT || 5001
const app: Application = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

if(process.env.NODE_ENV === 'production') {

}

if(process.env.ATLAS_URI) {
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

app.listen(PORT, () => {
  console.log('Server is running on port', c.green.inverse(PORT.toString()))
})
