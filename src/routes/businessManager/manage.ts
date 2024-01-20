import { Router, Request } from 'express'
import { auth } from '../../middleware/auth'
import Business from '../../models/Business/index.model'
import { err } from '../../constants/general'

const manageRouter = Router()

manageRouter.get("/list", auth, async (req: Request, res) => {
    try {
        const user = req.userData

        const businesses = await Business.find({
            admins: { $in: user._id }
        })
        if (businesses === null) {
            throw err(500, 'something went wrong')
        }


        res.send(businesses)
    } catch (e: any) {
        if (e.isCustomErr) {
            res
                .status(e.status)
                .send(e.error || e)
        } else {
            res.send(e)
        }
    }
})

export default manageRouter