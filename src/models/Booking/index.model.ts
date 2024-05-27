import { Schema, InferSchemaType, model, Model, Mongoose, Types, Document, PopulatedDoc } from 'mongoose'
import v from 'validator'
import { UserDocT, UserT } from '../user/index.model'
import { AddressDocT } from '../Address/index.model'
import { PostUnavailabilityT } from '../../constants/time'
import { TimeDocT, TimeSchema } from '../time.model'
import { UnavailabilityDocT, UnavailabilitySchema } from '../Unavailability.model'
import { JobModuleDocT, PostjobModuleT } from '../Job-modules/index.model'
import { BusinessDocT } from '../Business/index.model'
import JobModule from '../Job-modules/index.model';
import { JobDetailItemI, JobDetailItemSchema } from './job_details.model'

export type BookingDocT = Document<unknown, any, BookingI> & BookingI

interface BookingI {
    business: PopulatedDoc<Document<Types.ObjectId> & BusinessDocT>
    client: PopulatedDoc<Document<Types.ObjectId> & UserDocT>
    location: PopulatedDoc<Document<Types.ObjectId> & AddressDocT>
    jobModule: PopulatedDoc<Document<Types.ObjectId> & JobModuleDocT>
    /**
     * Price calculated by the Job details
     */
    price: number
    /**
     * The start of the job, can be editted
     */
    start: TimeDocT
    /**
     * Calculated by the duration of the job details
     * can be editted
     */
    end: TimeDocT
    details: {
        jobName: string,
        description: string
        duration: number
        items: JobDetailItemI
        specialRequest: string
    }
}

interface BookingMethodsI {

}

interface BookingVirtualsI {

}

type BookingModalT = Model<BookingI, {}, BookingMethodsI & BookingVirtualsI>

const BookingSchema = new Schema<BookingI, BookingModalT, BookingMethodsI & BookingVirtualsI>({
    business: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
    },
    jobModule: {
        type: Schema.Types.ObjectId,
        ref: 'Job_Module'
    },
    start: {
        type: TimeSchema,
        required: true
    },
    end: {
        type: TimeSchema,
        required: true
    },
    details: {
        jobName: {
            type: String,
            required: true
        },
        description: String,
        duration: {
            type: Number
        },
        specialRequest: String,
        items: [JobDetailItemSchema]
    }
})

require('./methods')

export type BookingT = InferSchemaType<typeof BookingSchema>

const Booking = model('Business', BookingSchema)

export default Booking