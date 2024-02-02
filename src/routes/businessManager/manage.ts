import { Router, Request } from 'express'
import { auth } from '../../middleware/auth'
import Business from '../../models/Business/index.model'
import { err, handleSaveError, validateKeys } from '../../constants/general'
import BusinessAdmin from '../../models/BusinessAdmin/index.model';
import { businessPopulate, businessSelect } from './constants';
import { model } from 'mongoose';
import path from 'path';
import c from 'ansi-colors';
import Employee from '../../models/Employee/index.model';
import { getBusinessMid, businessAdminAuth } from '../../middleware/businessAdmin';
import { AddressI } from '../../models/Address/index.model';
import { addAddress } from '../../constants/location';

const manageRouter = Router()
manageRouter.use(businessAdminAuth)
manageRouter.use('/business/:businessId', getBusinessMid)


manageRouter.get("/list", async (req: Request, res) => {
    try {
        const user = req.userData

        const admin = await BusinessAdmin.findOne({
            user: user._id
        })
        if (admin === null) {
            throw err(403, 'You are not a business admin')
        }

        const businesses = await Business.find({
            admins: { $in: admin._id }
        }, businessSelect)
            .populate(businessPopulate)
            .catch(e => {
                console.log(c.redBright('error: '), e)
                throw err(500, 'something went wrong', e)
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

manageRouter.get("/business/:businessId", async (req: Request<{}, {}, {}>, res) => {
    try {
        res.status(200).send(req.business)
    } catch (e: any) {
        res.status(500).send(e)
    }
})

manageRouter.post("/business/:businessId/update_basic", async (req: Request<{ businessId: string }, {}, UpdateBusinessI>, res) => {
    try {
        const business = req.business
        const update = req.body

        const allowedUpdates = ['name', 'description', 'phone', 'email', 'website', 'images', 'socials']

        if (!validateKeys(update, allowedUpdates)) {
            throw err(400, 'Invalid body')
        }

        Object.assign(business, update)
        const updatedBusiness = await business.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        res.status(200).send(updatedBusiness)
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

interface UpdateAddressI extends AddressI {
    placeId: undefined
    formatted: undefined
}

manageRouter.post("/business/:businessId/update_address", async (req: Request<{ businessId: string }, {}, UpdateBusinessI>, res) => {
    try {
        const business = req.business
        const update = req.body

        const allowedUpdates = [
            'street_address_line_1',
            'street_address_line_2',
            'city',
            'state',
            'zipcode',
            'country'
        ]

        if (!validateKeys(update, allowedUpdates)) {
            throw err(400, 'Invalid body')
        }

        const address = await addAddress(update as AddressI)
            .catch(e => {
                throw err(400, 'unable to add address')
            })

        business.address = address._id
        const updatedBusiness = await business.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        res.status(200).send(updatedBusiness)
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