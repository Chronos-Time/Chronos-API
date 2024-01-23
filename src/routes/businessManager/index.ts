import { Router } from 'express'
import SetupRouter from './setup'
import manageRouter from './manage'


const BusinessManagerRouter = Router()

BusinessManagerRouter.use('', SetupRouter)
BusinessManagerRouter.use('', manageRouter)

export default BusinessManagerRouter