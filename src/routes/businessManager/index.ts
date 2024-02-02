import { NextFunction, Router } from 'express'
import SetupRouter from './setup'
import manageRouter from './manage'
import employeeRouter from './employee'


const BusinessManagerRouter = Router()

BusinessManagerRouter.use('', SetupRouter)
BusinessManagerRouter.use('', manageRouter)
BusinessManagerRouter.use('', employeeRouter)

export default BusinessManagerRouter