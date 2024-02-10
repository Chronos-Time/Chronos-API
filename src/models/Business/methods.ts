import { BusinessDocT, BusinessHoursT, businessSchema } from './index.model'
import { err } from '../../constants/general'
import { ISOT, isStartTimeAfterNowWithTolerance, isUTC, validStartEnd } from '../../constants/time'
import Time, { TimeI } from '../time.model'
import { DateTime } from 'luxon'
import Address, { AddressDocT, AddressI } from '../Address/index.model';
import { coordinatesT } from '../../constants/location';
import { googleTime } from '../../constants/googleTime'
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
    start: ISOT,
    end: ISOT,
    name?: string,
    description?: string
): Promise<BusinessDocT> {
    try {
        const business = this

        let businessAddress = null
        businessAddress = await Address.findById(business.address._id)
        const coordinates = businessAddress.location.coordinates || undefined

        //make sure there's no duplicate names
        if (name) {
            if (business.unavailability.filter(uav => uav.name === name).length) {
                throw err(400, `${name} already is exist as an unavailability`)
            }
        }

        if (!isStartTimeAfterNowWithTolerance(start)) {
            throw err(400, `Start time must be after now: ${start}`)
        }

        if (!validStartEnd(start, end).isValid) {
            throw err(400, `Invalid start or end time: ${start} - ${end}`)
        }

        let googletz: null | TimeZoneResponseData = null

        if (coordinates) {
            googletz = await googleTime(
                businessAddress.location.coordinates,
                DateTime.fromISO(start).toUnixInteger()
            ).catch(() => null)
        }

        const startDT = DateTime.fromISO(start)
        const endDT = DateTime.fromISO(end)

        const startUTC = startDT.setZone('utc').toString()
        const endUTC = endDT.setZone('utc').toString()


        const startTime: TimeI = {
            local: start,
            iana: googletz ? googletz.timeZoneId : startDT.toFormat('z'),

            utc: googletz ?
                startDT.setZone('utc').plus({ seconds: googletz.rawOffset }).toString()
                : startDT.setZone('utc').toISO().toString(),

            geoLocation: coordinates
        }

        const endTime: TimeI = {
            local: end,
            iana: googletz ? googletz.timeZoneId : startDT.toFormat('z'),

            utc: googletz ?
                endDT.plus({ seconds: googletz.rawOffset }).toString()
                : endDT.setZone('utc').toISO().toString(),
            geoLocation: coordinates
        }

        return business
    } catch (e: any) {
        throw e
    }
}