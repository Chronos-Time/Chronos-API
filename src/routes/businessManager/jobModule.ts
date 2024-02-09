import { Router, Request } from 'express'
import { businessAdminAuth, getBusinessMid, getJobModule, getJobModules } from '../../middleware/businessAdmin'
import { BusinessHoursT } from '../../models/Business/index.model'

const JobModuleRouter = Router()

interface PostjobModuleI {
    name: string
    description: string
    serviceType: string
    tags: string[]
    duration: number
    prepTime: number
    customHours?: BusinessHoursT
}

//url: /business/:businessId/job_module/:jobModuleId

JobModuleRouter.get('/', async (req: Request<{}, {}, PostjobModuleI>, res) => {
    try {
        res.status(200).send(req.jobModule)
    } catch (e: any) {
        if (e.isCustomErr) {
            res
                .status(e.status)
                .send(e.err || e)
        } else {
            res
                .status(500)
                .send(e)
        }
    }
})

export default JobModuleRouter