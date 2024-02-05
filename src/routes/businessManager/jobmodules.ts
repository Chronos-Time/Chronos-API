import { Router, Request } from 'express'
import { businessAdminAuth, getBusinessMid, getJobModules } from '../../middleware/businessAdmin'
import { err, handleSaveError } from '../../constants/general'
import JobModule from '../../models/Job-modules'
import { minute } from '../../constants/time'
import { BusinessHoursT } from '../../models/Business/index.model'

const JobModulesRouter = Router()

JobModulesRouter.use(businessAdminAuth)
JobModulesRouter.use('/business/:businessId', getBusinessMid)
JobModulesRouter.use(getJobModules)

interface PostjobModuleI {
    name: string
    description: string
    serviceType: string
    tags: string[]
    duration: number
    prepTime: number
    customHours?: BusinessHoursT
}

JobModulesRouter.post('/create', async (req: Request<{}, {}, PostjobModuleI>, res) => {
    try {
        const {
            name,
            serviceType,
            tags,
            duration,
            description,
            prepTime,
            customHours
        } = req.body

        if (req.jobModules.length > 0) {
            if (req.jobModules.filter(j => j.name === name).length) {
                throw err(400, 'Job already exists')
            }
        }

        if (duration < minute * 1) {
            throw err(400, 'duration cannot be less than one minute')
        }

        const newJobModule = new JobModule({
            name,
            serviceType,
            business: req.business._id,
            tags,
            description,
            duration,
            prepTime,
            customHours: customHours || req.business.businessHours
        })

        const jobModule = await newJobModule.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        res.status(200).send(jobModule)
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

export default JobModulesRouter