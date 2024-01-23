import { Types } from 'mongoose'
import Business from '../Business/index.model';
import { BusinessAdminDocT, businessAdminSchema } from './index.model'
import { IdI, err, handleSaveError, idToString } from '../../constants/general'

businessAdminSchema.methods.addBusiness = async function (
    this: BusinessAdminDocT,
    businessId: IdI
): Promise<BusinessAdminDocT> {
    try {
        const businessAdmin = this

        const business = await Business.findById(businessId)
        if (!business) {
            throw err(400, 'Business not found')
        }

        businessAdmin.depopulate('businesses')

        if (idToString(businessAdmin.businesses).includes(businessId.toString())) {
            return businessAdmin
        }

        businessAdmin.businesses.push(business._id)

        await businessAdmin.save()
        return businessAdmin
    } catch (e: any) {
        return e
    }
}

businessAdminSchema.methods.addActiveBusiness = async function (
    this: BusinessAdminDocT,
    businessId: IdI
): Promise<BusinessAdminDocT> {
    try {
        const businessAdmin = this

        const business = await Business.findById(businessId)
        if (!business) {
            throw err(400, 'Business not found')
        }

        businessAdmin.depopulate(['businesses', 'activeBusinesses'])

        const businesses = idToString(businessAdmin.businesses)
        const activeBusinesses = idToString(businessAdmin.activeBusinesses)

        if (activeBusinesses.includes(businessId.toString())) {
            return businessAdmin
        }

        if (!idToString(businesses).includes(businessId.toString())) {
            businessAdmin.businesses.push(business._id)
        }

        businessAdmin.activeBusinesses.push(business._id)

        await businessAdmin.save()
            .catch(e => {
                throw handleSaveError(e)
            })
        return businessAdmin
    } catch (e: any) {
        return e
    }
}

businessAdminSchema.methods.removeActiveBusiness = async function (
    this: BusinessAdminDocT,
    businessId: IdI
): Promise<BusinessAdminDocT> {
    try {
        const businessAdmin = this

        const business = await Business.findById(businessId)
        if (!business) {
            throw err(400, 'Business not found')
        }

        businessAdmin.depopulate(['businesses', 'activeBusinesses'])

        const activeBusinesses = idToString(businessAdmin.activeBusinesses)

        if (!activeBusinesses.includes(businessId.toString())) {
            return businessAdmin
        }

        const index = activeBusinesses.indexOf(businessId.toString())
        businessAdmin.activeBusinesses.splice(index, 1)

        await businessAdmin.save()
        return businessAdmin
    } catch (e: any) {
        return e
    }
}

