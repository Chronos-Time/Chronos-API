import express, { Request, Response } from 'express'
import Business from '../../../models/Business/index.model'

const BusinessesRouter = express.Router()

BusinessesRouter.get('/', async (req: Request, res: Response) => {
    try {
        const businesses = await Business.find({})

        res.status(200).send(businesses)
    } catch (e: any) {
        res.status(500).send('unable to retrieve data')
    }
})

export default BusinessesRouter