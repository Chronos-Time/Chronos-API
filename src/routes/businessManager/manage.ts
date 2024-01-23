import { Router, Request } from 'express'
import { auth } from '../../middleware/auth'
import Business from '../../models/Business/index.model'
import { err, handleSaveError } from '../../constants/general'
import BusinessAdmin from '../../models/BusinessAdmin/index.model';

const manageRouter = Router()

interface PostBusinessI {
    name: string
    businessType: string
    businessEmail: string
    picture?: string
}

manageRouter.post("/setup", auth, async (req: Request<{}, {}, PostBusinessI>, res) => {
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

        let businessAdmin = await BusinessAdmin.findOne({
            user: user._id
        })
        if (businessAdmin === null) {
            businessAdmin = new BusinessAdmin({
                user: user._id
            })
        }

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
            res.send(e)
        }
    }
})

manageRouter.get("/list", auth, async (req: Request, res) => {
    try {
        const user = req.userData

        const businesses = await Business.find({
            admins: { $in: user._id }
        })
        if (businesses === null) {
            throw err(500, 'something went wrong')
        }

        res.status(200).send(businesses)
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

interface UpdateBusinessI {
    name?: string
    description?: string
    phone?: string
    email?: string
    website?: string
    images?: string[]
    socials?: {
        facebook?: string
        instagram?: string
        twitter?: string
        youtube?: string
        linkedin?: string
    }
}

manageRouter.post("/update_basic/:businessId", auth, async (req: Request<{ businessId: string }, {}, UpdateBusinessI>, res) => {
    try {
        const user = req.userData
        const businessId = req.params.businessId
        const update = req.body

        const business = await Business.findOne({
            _id: businessId,
            admins: { $in: user._id }
        })
        if (business === null) {
            throw err(404, 'business not found')
        }

        const updatedBusiness = await Business.findOneAndUpdate({
            _id: businessId,
            admins: { $in: user._id }
        }, update, {
            new: true
        })
        if (updatedBusiness === null) {
            throw err(500, 'something went wrong')
        }
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