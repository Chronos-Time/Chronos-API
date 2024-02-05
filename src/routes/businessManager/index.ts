import { Router } from 'express'
import SetupRouter from './setup'
import manageRouter from './manage'
import employeeRouter from './employee'
import JobModuleRouter from './jobmodules'


const BusinessManagerRouter = Router()

BusinessManagerRouter.use('', SetupRouter)
BusinessManagerRouter.use('', manageRouter)
BusinessManagerRouter.use('', employeeRouter)
BusinessManagerRouter.use('/business/:businessId/job_modules', JobModuleRouter)

export default BusinessManagerRouter