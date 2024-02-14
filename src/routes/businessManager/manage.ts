import { Router, Request } from 'express'
import Business, { BusinessHoursT } from '../../models/Business/index.model'
import { err, handleSaveError, validateKeys } from '../../constants/general'
import { AddressI } from '../../models/Address/index.model'
import { addAddress, coordinatesT } from '../../constants/location'
import { ISOT, PostStartEndT, PostTimeT, PostUnavailabilityT, validStartEnd } from '../../constants/time'

const manageRouter = Router()

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

manageRouter.get('', async (req: Request<{}, {}, {}>, res) => {
    try {
        res.status(200).send(req.business)
    } catch (e: any) {
        res.status(500).send(e)
    }
})

manageRouter.post('/update_basic', async (req: Request<{ businessId: string }, {}, UpdateBusinessI>, res) => {
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

manageRouter.post('/update_address', async (req: Request<{}, {}, UpdateBusinessI>, res) => {
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


manageRouter.post('/set_business_hours', async (req: Request<{}, {}, { hours: BusinessHoursT }>, res) => {
    try {
        const business = req.business
        const { hours } = req.body

        const updatedBusiness = await business.updateBusinessHours(hours)

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

manageRouter.post('/add_unvailability', async (req: Request<{}, {}, PostUnavailabilityT>, res) => {
    try {
        const business = req.business
        const {
            start,
            end,
            name,
            description,
            iana,
            geoLocation
        } = req.body

        const upadtedBusiness = await business.addUnavailablity({
            start,
            end,
            name,
            description,
            iana,
            geoLocation
        })
            .catch((e: any) => {
                throw e
            })

        res.send(upadtedBusiness)
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