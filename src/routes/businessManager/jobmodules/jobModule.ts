import { Router, Request } from 'express'
import { businessAdminAuth, getBusinessMid, getJobModule, getJobModules } from '../../../middleware/businessAdmin'
import { BusinessHoursT } from '../../../models/Business/index.model'
import JMItem, { JMItemT, PostJMItemT } from '../../../models/Job-modules/Items'
import { err, handleSaveError } from '../../../constants/general'

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

JobModuleRouter.get('/', async (req: Request<{}, {}, {}>, res) => {
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

JobModuleRouter.post('/item', async (req: Request<{}, {}, PostJMItemT>, res) => {
    try {
        const {
            name,
            addedTime,
            price,
            chargeType,
            description,
            isRequired,
            items
        } = req.body

        const updatedJM = await req.jobModule.createItem({
            name,
            addedTime,
            price,
            chargeType,
            description,
            isRequired,
            items
        })

        res.status(200).send(updatedJM)
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

JobModuleRouter.get('/item/:item_name', async (req: Request<{ item_name: string }, {}, {}>, res) => {
    try {
        const jmItem = await req.jobModule.items.find(jm => jm.name === req.params.item_name)

        if (!jmItem) {
            throw err(400, 'Unable to find job module item')
        }

        res.status(200).send(jmItem)
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

JobModuleRouter.put('/item/:item_name', async (req: Request<{ item_name: string }, {}, { item: JMItemT }>, res) => {
    try {
        const jmItemIndex = await req.jobModule.items.findIndex(jm => jm.name === req.params.item_name)
        if (jmItemIndex === -1) {
            throw err(400, `Unable to find Job Module Item: ${req.params.item_name}`)
        }

        req.jobModule.items[jmItemIndex] = new JMItem(req.body.item)

        await req.jobModule.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        res.status(200).send(req.jobModule.items[jmItemIndex])
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


JobModuleRouter.delete('/item/:item_name', async (req: Request<{ item_name: string }, {}, {}>, res) => {
    try {
        const updatedJM = await req.jobModule.remItem(req.params.item_name)

        res.status(200).send(updatedJM)
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