import { Router } from 'express'
import SetupRouter from './setup'
import manageRouter from './manage'
import employeeRouter from './employee'
import JobModulesRouter from './jobmodules'
import JobModuleRouter from './jobModule'
import { businessAdminAuth, getBusinessMid, getJobModule, getJobModules } from '../../middleware/businessAdmin'


const BusinessManagerRouter = Router()

BusinessManagerRouter.use('', SetupRouter)
BusinessManagerRouter.use('', manageRouter)
BusinessManagerRouter.use('', employeeRouter)
BusinessManagerRouter.use('/business/:businessId/job_modules',
    getBusinessMid,
    getJobModules,
    JobModulesRouter
)

BusinessManagerRouter.use('/business/:businessId/job_module/:jobModuleId',
    businessAdminAuth,
    getBusinessMid,
    getJobModule,
    JobModuleRouter
)

export default BusinessManagerRouter