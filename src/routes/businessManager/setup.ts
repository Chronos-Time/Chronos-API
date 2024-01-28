import { Router, Request } from 'express'
import { auth } from '../../middleware/auth'
import Business from '../../models/Business/index.model'
import { err, handleSaveError } from '../../constants/general'
import BusinessAdmin from '../../models/BusinessAdmin/index.model';

const SetupRouter = Router()
SetupRouter.use(auth)

interface PostBusinessI {
    name: string
    businessType: string
    businessEmail: string
    description: string
    picture?: string
}

SetupRouter.post("/setup", async (req: Request<{}, {}, PostBusinessI>, res) => {
    try {
        const user = req.userData
        const {
            name,
            businessType,
            businessEmail,
            picture,
            description
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
            description: description,
        })

        let businessAdmin = await BusinessAdmin.findOne({
            user: user._id
        })
        if (!businessAdmin) {
            businessAdmin = new BusinessAdmin({
                user: user._id
            })
        }

        newBusiness.admins.push(businessAdmin.id)

        const business = await newBusiness.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        await businessAdmin.addActiveBusiness(newBusiness._id)
            .catch(e => {
                Business.findByIdAndDelete(business._id)
                if (e.isCustomErr) {
                    throw err(e.status, e.message, e.error)
                }
                throw err(500, 'something went wrong', e)
            })

        res.send(business)
    } catch (e: any) {
        if (e.isCustomErr) {
            res
                .status(e.status)
                .send(e.error || e)
        } else {
            res.status(500).send(e)
        }
    }
})

export default SetupRouter