import { BusinessDocT, BusinessHoursT, BusinessI, businessSchema, UnavailabilityT } from './index.model';
import { err } from '../../constants/general'
import { ISOT, isStartTimeAfterNowWithTolerance, isUTC, PostUnavailabilityT, validStartEnd } from '../../constants/time'
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
            start,
            end,
            name,
            description,
            iana
        } = postUnavailability

        let businessAddress = null
        businessAddress = await Address.findById(business.address._id)
        const coordinates = businessAddress.location.coordinates || undefined

        const startDT = DateTime.fromISO(start.local)
        const endDT = DateTime.fromISO(end.local)

        if (iana) {
            const tzgeo = await getTZGeo(iana)
            console.log(tzgeo)
        }

        //make sure there's no duplicate names
        // if (name) {
        //     if (business.unavailability.filter(uav => uav.name === name).length) {
        //         throw err(400, `${name} already is exist as an unavailability`)
        //     }
        // }

        // if (!isStartTimeAfterNowWithTolerance(start.local)) {
        //     throw err(400, `Start time must be after now: ${start.local}`)
        // }

        // if (!validStartEnd(start, end).isValid) {
        //     throw err(400, `Invalid start or end time: ${start} - ${end}`)
        // }

        // const startTime: TimeI = {
        //     local: start,
        //     iana: startDT.toFormat('z'),
        //     utc: startDT.toUTC().toISO(),
        //     geoLocation: coordinates
        // }

        // const endTime: TimeI = {
        //     local: end,
        //     iana: endDT.toFormat('z'),
        //     utc: endDT.toUTC().toString(),
        //     geoLocation: coordinates
        // }

        // const unavailability: BusinessI['unavailability'][number] = {
        //     start: startTime,
        //     end: endTime,
        //     name,
        //     description
        // }

        // business.unavailability.push(unavailability)

        // await business.save()

        return business
    } catch (e: any) {
        throw e
    }
}