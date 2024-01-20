import { Router, Request } from "express"
import { auth } from '../../middleware/auth'
import Business from '../../models/Business/index.model'
import { err, handleSaveError } from '../../constants/general'


const SetUpRouter = Router()

interface PostBusinessI {
    name: string
    businessType: string
    businessEmail: string
    picture?: string
}

SetUpRouter.post("/setup", auth, async (req: Request<{}, {}, PostBusinessI>, res) => {
    try {
        const user = req.userData
        const {
            name,
            businessType,
            businessEmail,
            picture
        } = req.body

        const foundbusiness = await Business.findOne({
            businessEmail
        })
        if (foundbusiness) {
            throw err(400, 'A business already uses this email')
        }

        const newBusiness = new Business({
            name,
            businessType,
            businessEmail,
            picture,
            admins: [
                user._id
            ]
        })

        const business = await newBusiness.save()
            .catch(e => {
                throw handleSaveError(e)
            })


        res.send(business)
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

export default SetUpRouter