import express, { Request, Response } from 'express'
import Business from '../../../models/Business/index.model'
import { err } from '../../../constants/general'

const BusinessRouter = express.Router()

BusinessRouter.get('/:businessId', async (req: Request<{ businessId: string }, {}, {}>, res: Response) => {
    try {
        const business = await Business.findById(req.params.businessId)
            .catch(e => {
                throw err(
                    400,
                    'unable to find business'
                )
            })

        res.status(200).send(business)
    } catch (e: any) {
        if (e.isCustomErr) {
            res
                .status(e.status)
                .send(e.error || e.message)
        }
    }
})

export default BusinessRouter