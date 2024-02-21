import { Router } from 'express'
import SetupRouter from './setup'
import manageRouter from './manage'
import employeeRouter from './employee'
import JobModulesRouter from './jobmodules/jobmodules'
import JobModuleRouter from './jobmodules/jobModule'
import { businessAdminAuth, getBusinessMid, getJobModule, getJobModules } from '../../middleware/businessAdmin'


const BusinessManagerRouter = Router()

BusinessManagerRouter.use('', SetupRouter)

BusinessManagerRouter.use('/business/:businessId',
    businessAdminAuth,
    getBusinessMid,
    manageRouter
)

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