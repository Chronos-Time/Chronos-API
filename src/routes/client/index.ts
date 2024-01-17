import express from 'express'
import userRouter from './client'

const clientRouter = express.Router()

clientRouter.use('', userRouter)

export default clientRouter
