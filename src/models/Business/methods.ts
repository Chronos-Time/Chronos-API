import { BusinessDocT, BusinessHoursT, BusinessI, businessSchema, UnavailabilityT } from './index.model';
import { err } from '../../constants/general'
import { handleStartEnd, ISOT, isStartTimeAfterNowWithTolerance, isUTC, PostTimeT, PostUnavailabilityT, validStartEnd } from '../../constants/time'
import Time, { TimeI } from '../time.model'
import { DateTime } from 'luxon'
import Address, { AddressDocT, AddressI } from '../Address/index.model';
import { coordinatesT } from '../../constants/location';
import { getTZGeo, googleTime } from '../../constants/googleTime'
import { TimeZoneResponseData } from '@googlemaps/google-maps-services-js'


businessSchema.methods.updateBusinessHours = async function (
    this: BusinessDocT,
    hours: BusinessHoursT
): Promise<BusinessDocT> {
    try {
        const business = this

        if (hours.length !== 7) {
            throw err(400, 'Business hours data is wrong')
        }

        business.businessHours = hours

        await business.save().catch(e => {
            throw err(400, 'unable to save business hours', e)
        })
        return business
    } catch (e: any) {
        return e
    }
}

businessSchema.methods.addUnavailablity = async function (
    this: BusinessDocT,
    postUnavailability: PostUnavailabilityT
): Promise<BusinessDocT> {
    try {
        const business = this
        const {
            name,
            description,
            iana,
            geoLocation
        } = postUnavailability

        if (!iana && !geoLocation) {
            let businessAddress = null
            businessAddress = await Address.findById(business.address._id)
            const coordinates = businessAddress.location.coordinates || undefined

            postUnavailability.geoLocation = coordinates
        }

        const [startTime, endTime] = await handleStartEnd(postUnavailability)
            .catch((e: any) => {
                if (e.isCustomErr) {
                    throw e
                } else {
                    throw err(500, 'unable to handle start and end dates')
                }
            })

        const unavailability: BusinessI['unavailability'][number] = {
            start: startTime,
            end: endTime,
            name,
            description
        }

        business.unavailability.push(unavailability)

        await business.save()

        return business
    } catch (e: any) {
        throw e
    }
}