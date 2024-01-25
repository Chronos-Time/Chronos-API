import express from 'express'
import userRouter from './client'
import UserSetupRouter from './setup'

const clientRouter = express.Router()

clientRouter.use('', userRouter)
clientRouter.use('', UserSetupRouter)

export default clientRouter
