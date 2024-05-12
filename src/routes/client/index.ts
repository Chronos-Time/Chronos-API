import express from 'express'
import userRouter from './client'
import UserSetupRouter from './setup'

const clientRouter = express.Router()

clientRouter.use('', UserSetupRouter)
clientRouter.use('', userRouter)

export default clientRouter
