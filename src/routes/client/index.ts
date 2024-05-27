import express from 'express'
import userRouter from './client'
import UserSetupRouter from './setup'
import BusinessesRouter from './Businesses/businesses'
import BusinessRouter from './Business/business'
import { auth } from '../../middleware/auth'
import BookingRouter from './Business/booking'
import { getBusinessForClientMid } from '../../middleware/client'

const clientRouter = express.Router()

clientRouter.use('', UserSetupRouter)
clientRouter.use('', userRouter)
clientRouter.use('/businesses', BusinessesRouter)
clientRouter.use('/business',
    BusinessRouter,
    getBusinessForClientMid
)
clientRouter.use('/business/:businessId/booking',
    getBusinessForClientMid,
    BookingRouter,
    auth
)

export default clientRouter
