import { InferSchemaType, Model, Schema, model, Document } from 'mongoose'
import { TimeDocT, TimeSchema } from './time.model';

export type UnavailabilityDocT = Document<unknown, any, UnavailabilityI> & UnavailabilityI

export interface UnavailabilityI {
    name?: string
    description?: string
    start: TimeDocT
    end: TimeDocT
}

interface UnavailabilityMethodsI {

}

type UnavailabilityModelT = Model<UnavailabilityI, {}, UnavailabilityMethodsI>

export const UnavailabilitySchema = new Schema<UnavailabilityI, UnavailabilityModelT, UnavailabilityMethodsI>({
    name: String,
    description: String,
    start: {
        type: TimeSchema,
        required: true
    },
    end: {
        type: TimeSchema,
        required: true
    }
})

UnavailabilitySchema.pre('save', async function (next) {

    next()
})

export type UnavailabilityT = InferSchemaType<typeof UnavailabilitySchema>

const Unavailability = model('Unavailability', UnavailabilitySchema)

export default Unavailability