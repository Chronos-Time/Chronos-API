import { InferSchemaType, Model, Schema, model, Document } from 'mongoose'
import { coordinatesT } from '../constants/location'
import { handleTime, isValidTimeZone } from '../constants/time'
import { BusinessI } from './Business/index.model'
import { DateTime } from 'luxon'

export type TimeDocT = Document<unknown, any, TimeI> & TimeI

export interface TimeI {
    utc: string
    iana: string
    local: string
    rawOffset?: number
    geoLocation: coordinatesT
    lastUpdated: number
    /**
     * Js Date in UTC
     */
    jsDate: Date
}

interface TimeMethodsI {

}

type TimeModelT = Model<TimeI, {}, TimeMethodsI>

export const TimeSchema = new Schema<TimeI, TimeModelT, TimeMethodsI>({
    utc: {
        type: String,
        // validate: {
        //     validator: (value: string) => {
        //         return isUTC(value)
        //     },
        //     message: (props: any) => {
        //         return `${props.value} is not a valid UTC timestamp`
        //     }
        // }
    },
    local: {
        type: String,
        // validate: {
        //     validator: (value: string) => {
        //         return isISO(value)
        //     },
        //     message: (props: any) => {
        //         return `${props.value} is not a ISO string`
        //     }
        // }
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
        type: Number
    },
    jsDate: {
        type: Date
    }
})

TimeSchema.pre('save', async function (next) {
    const time = this
    let errs = []

    if (!time.iana && !time.geoLocation) {
        errs.push('Timezone or geoLocation must be provided to store time')
    }

    if (!time.local && !time.utc) {
        errs.push('Local time or UTC time must be provided')
    }

    if (
        time.isModified([
            'geoLocation',
            'local',
            'iana',
            'utc',
        ])
    ) {
        await handleTime({
            local: time.local,
            iana: time.iana,
            geoLocation: time.geoLocation
        })
            .then(updatedTime => {
                time.local = updatedTime.local
                time.utc = updatedTime.utc
                time.iana = updatedTime.iana
                time.geoLocation = updatedTime.geoLocation
                time.lastUpdated = updatedTime.lastUpdated
                time.jsDate = DateTime
                    .fromISO(updatedTime.utc)
                    .toJSDate()
            })
            .catch(e => {
                errs.push('unable to update time that was modified')
            })
    }

    if (errs.length > 0) {
        next(new Error(errs.join(",")))
    }

    next()
})

export type TimezoneT = InferSchemaType<typeof TimeSchema>

const Time = model('Time', TimeSchema)

export default Time