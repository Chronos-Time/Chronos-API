import { InferSchemaType, Model, Schema, model } from 'mongoose'
import { coordinatesT } from '../constants/location'
import v from 'validator'
import { isISO, isUTC, isValidTimeZone } from '../constants/time'
import { PointSchema } from './Address/point.model'
import { DateTime } from 'luxon'

export interface TimeI {
    utc: string
    iana: string
    local: string
    geoLocation: coordinatesT
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
    ]
})

TimeSchema.pre('save', async function (next) {
    const time = this
    let errs = []

    if (time.isModified('local')) {
        time.iana = DateTime.fromISO(time.local).toFormat('z')
    }

    if (time.isModified('iana')) {
        const localTz = DateTime.fromISO(time.local).toFormat('z')
        if (time.iana !== localTz) {
            errs.push('Timezone provided does not match local timezone stored')
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