import express from 'express'
import userRouter from './client'
import UserSetupRouter from './setup'
import BusinessesRouter from './Businesses/businesses'
import BusinessRouter from './Business/business'

const clientRouter = express.Router()

clientRouter.use('', UserSetupRouter)
clientRouter.use('', userRouter)
clientRouter.use('/businesses', BusinessesRouter)
clientRouter.use('/business', BusinessRouter)

export default clientRouter
