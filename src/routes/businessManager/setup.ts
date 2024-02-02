import { Router, Request } from 'express'
import { auth } from '../../middleware/auth'
import Business from '../../models/Business/index.model'
import { err, handleSaveError, validateKeys } from '../../constants/general'
import BusinessAdmin from '../../models/BusinessAdmin/index.model';
import { addAddress } from '../../constants/location';

const SetupRouter = Router()
SetupRouter.use(auth)

interface PostBusinessI {
    name: string
    businessType: string
    businessEmail: string
    description: string
    picture?: string
    phone: string
    address?: {
        street_address_line_1: string
        street_address_line_2?: string
        city: string
        state: string
        zipcode: string
        country: string
    }
}

SetupRouter.post("/setup", async (req: Request<{}, {}, PostBusinessI>, res) => {
    try {
        const user = req.userData
        const {
            name,
            businessType,
            businessEmail,
            picture,
            description,
            address,

        } = req.body

        const isValidKeys = validateKeys(req.body, [
            'name',
            'businessType',
            'businessEmail',
            'description',
            'picture',
            'address',
            'phone'
        ])

        const validAddressKeys = validateKeys(address, [
            'street_address_line_1',
            'street_address_line_2',
            'city',
            'state',
            'country',
            'zipcode'
        ])

        if (!isValidKeys) {
            throw err(400, 'Invalid data provided')
        }

        if (!!address && !validAddressKeys) {
            throw err(400, 'Invalid adddress')
        }

        const foundbusiness = await Business.findOne({
            businessEmail
        })
        if (foundbusiness) {
            throw err(409, 'A business already uses this email')
        }

        const newAddress = await addAddress(address)
            .catch(() => {
                throw err(400, 'unable to save address')
            })

        const newBusiness = new Business({
            name,
            businessType,
            businessEmail,
            picture,
            description: description,
            address: newAddress._id
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
            console.log('error', e)
            res
                .status(e.status)
                .send(e.error || e)
        } else {
            res.status(500).send(e)
        }
    }
})

export default SetupRouter