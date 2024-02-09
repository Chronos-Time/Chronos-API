import { InferSchemaType, Model, Schema, model } from 'mongoose'
import { coordinatesT } from '../constants/location'
import v from 'validator'
import { isISO, isUTC, isValidTimeZone } from '../constants/time'
import { PointSchema } from './Address/point.model'

export interface TimeI {
    utc: string
    timezone: string
    local: string
    geoLocation: coordinatesT
}

interface TimeMethodsI {

}

type TimeModelT = Model<TimeI, {}, TimeMethodsI>

const TimeSchema = new Schema<TimeI, TimeModelT, TimeMethodsI>({
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
    timezone: {
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

export type TimezoneT = InferSchemaType<typeof TimeSchema>

const Time = model('time', TimeSchema)

export default Time