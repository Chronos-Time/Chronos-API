import { InferSchemaType, Model, Schema, model } from 'mongoose'
import { coordinatesT, validateGeo } from '../constants/location'
import v from 'validator'
import { day, isISO, isUTC, isValidTimeZone } from '../constants/time'
import { PointSchema } from './Address/point.model'
import { DateTime } from 'luxon'
import { getTZGeo, googleTime } from '../constants/googleTime'
import { TimeZoneResponseData } from '@googlemaps/google-maps-services-js'
import geoTZ from 'geo-tz'
import { err } from '../constants/general'
import { IANAZone } from 'luxon'

export interface TimeI {
    utc: string
    iana: string
    local: string
    rawOffset?: number
    geoLocation: coordinatesT
    lastUpdated: number
}

interface TimeMethodsI {

}

type TimeModelT = Model<TimeI, {}, TimeMethodsI>

export const TimeSchema = new Schema<TimeI, TimeModelT, TimeMethodsI>({
    utc: {
        type: String,
        validate: {
            validator: (value: string) => {
                return isUTC(value)
            },
            message: (props: any) => {
                return `${props.value} is not a valid UTC timestamp`
            }
        }
    },
    local: {
        type: String,
        validate: {
            validator: (value: string) => {
                return isISO(value)
            },
            message: (props: any) => {
                return `${props.value} is not a ISO string`
            }
        }
    },
    iana: {
        type: String,
        validate: {
            validator: (value: string) => {
                return isValidTimeZone(value)
            },
            message: (props: any) => {
                return `${props.value} is not a valid timezone`
            }
        }
    },
    geoLocation: [
        {
            type: Number,
            required: true
        },
        {
            type: Number,
            required: true
        }
    ],
    rawOffset: {
        type: Number
    },
    lastUpdated: {
        type: Number,
        default: 0
    }
})

TimeSchema.pre('save', async function (next) {
    const time = this
    let errs = []

    if (!time.iana && !time.geoLocation) {
        errs.push(err(400, 'Timezone or geoLocation must be provided to store time'))
    }

    if (!time.local && !time.utc) {
        errs.push(err(400, 'Local time or UTC time must be provided'))
    }

    if (time.isModified('local')) {
        const localDT = DateTime.fromISO(time.local)
        if (time.geoLocation.length === 2) {
            const {
                timeZoneId,
                rawOffset,
                dstOffset
            } = await googleTime(
                time.geoLocation,
                localDT.toUnixInteger()
            ).catch(() => {
                throw errs.push(err(500, 'Failed saving data from google'))
            })

            time.utc = localDT
                .plus({ seconds: rawOffset + dstOffset })
                .setZone('UTC', { keepLocalTime: true })
                .toISO()


            time.iana = timeZoneId
        } else if (time.iana) {
            //Update: this needs to be handle different because
            //because all time should be handle by google timezone

            // const zone = IANAZone.create(time.iana)
            // const { lat, long } = zone.offset(0)

            // time.geoLocation = [zone.]
        }
    }

    if (time.isModified('geoLocation')) {
        let googletz: null | TimeZoneResponseData = null

        if (time.geoLocation.length === 2) {
            googletz = await googleTime(
                time.geoLocation,
                DateTime.fromISO(time.utc).toUnixInteger()
            ).catch(() => null)
        }
    }

    const checkUTCAfter = DateTime
        .now()
        .plus({ months: 1 })
        .toUnixInteger()

    if (!time.lastUpdated || time.lastUpdated < checkUTCAfter) {
        const localDT = DateTime.fromISO(time.local)

        let geo: coordinatesT = null

        if (time.geoLocation.length === 2) {
            geo = time.geoLocation
        } else {
            geo = await getTZGeo(time.iana)
                .catch(e => {
                    throw errs.push(err(400, 'Unable get geo coordinates of timezone'))
                    return null
                })
        }

        if (geo !== null || validateGeo(geo)) {
            const {
                timeZoneId,
                rawOffset,
                dstOffset
            } = await googleTime(
                geo,
                localDT.toUnixInteger()
            ).catch(() => {
                throw errs.push(err(500, 'Failed saving data from google'))
            })

            time.utc = localDT
                .plus({ seconds: rawOffset + dstOffset })
                .setZone('UTC', { keepLocalTime: true })
                .toISO()


            time.iana = timeZoneId
        }

    }


    if (errs.length > 0) {
        next(new Error(errs.join(",")))
    }

    next()
})

export type TimezoneT = InferSchemaType<typeof TimeSchema>

const Time = model('Time', TimeSchema)

export default Time