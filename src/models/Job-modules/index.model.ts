import { Schema, InferSchemaType, model, Types, Model, Document } from 'mongoose'
import Business, { BusinessHoursT } from '../Business/index.model'
import { err } from '../../constants/general'
import { TimeI } from '../Time.model'
import { UnavailabilityDocT, UnavailabilitySchema } from '../Unavailability.model'
import Unavailability from '../Unavailability.model';
import { PostUnavailabilityT } from '../../constants/time'
import { JMItemDocT, JMItemSchema, PostJMItemT } from './Items'

export type JobModuleDocT = Document<unknown, any, JobModuleI> & JobModuleI

export type PostjobModuleT = {
    name: string
    description: string
    serviceType: string
    tags: string[]
    duration: number
    prepTime: number
    customHours?: JobModuleI['customHours']
    unavailability?: PostUnavailabilityT[]
    provideAddress?: boolean
    specialRequest?: boolean
}


/**
 * Job Modules is basically a paid time slot
 * for customers
 */
interface JobModuleI extends JobModuleMethodsI {
    name: string
    description: string
    business: Types.ObjectId
    /**
     * main job type ex 'Personal Fitness Trainer', 'Hair Stylist', 'Barber'
     * 
     */
    serviceType: string
    /**
     * metaData that is used to find this job module
     * ex. car washing, cars, car detailing, etc.
     */
    tags: string[]
    /**
     * In unix Time
     */
    duration: number
    /**
     * The time it takes to before starting this job
     * *This will not be seen by the client
     * 
     * In Unix Integer
     */
    prepTime: number
    /**
     * This will be taken from the business schema
     */
    unavaiability: UnavailabilityDocT[]
    /**
     * defaults to the Businesses working hours
     * but can be updated by data
     */
    customHours: BusinessHoursT
    items: JMItemDocT[],

    /**
     * Requires the client to provide an
     * address for this job module
     */
    provideAddress: boolean
    /**
     * Allow the client to provide extra information 
     * or ask for specail requests
     */
    specialRequest: boolean


    //day 2:
    /*
    discounts: {
        name: string
        distanceOut: number
    }[]

    */
}

interface JobModuleMethodsI {
    /**
     * This create an item that the user will be able to select
     * **validation needs to edit the recursion
     * 
     * @param item PostJMItemT
     * @returns JobModuleDocT
     */
    createItem: (
        item: PostJMItemT
    ) => Promise<JobModuleDocT>

    /**
     * Remove Item from this jobModule
     * 
     * @param name String
     * @returns JobModuleDocT
     */
    remItem: (
        name: string
    ) => Promise<JobModuleDocT>
}

type JobModuleModelT = Model<JobModuleI, {}, JobModuleMethodsI>

export const jobModuleSchema = new Schema<JobModuleI, JobModuleModelT, JobModuleMethodsI>({
    /**
     * The name of the job module that people will see
     */
    name: {
        type: String,
        required: true,
    },
    business: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    prepTime: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    provideAddress: {
        type: Boolean,
        default: false
    },
    specialRequest: {
        type: Boolean,
        default: true
    },
    customHours: [
        {
            name: {
                type: String,
                default: 'Sunday'
            },
            start: {
                type: Number,
                default: 18
            },
            end: {
                type: Number,
                default: 34
            },
            isClosed: {
                type: Boolean,
                default: false
            }
        },
        {
            name: {
                type: String,
                default: 'Monday'
            },
            start: {
                type: Number,
                default: 18
            },
            end: {
                type: Number,
                default: 34
            },
            isClosed: {
                type: Boolean,
                default: false
            }
        },
        {
            name: {
                type: String,
                default: 'Tuesday'
            },
            start: {
                type: Number,
                default: 18
            },
            end: {
                type: Number,
                default: 34
            },
            isClosed: {
                type: Boolean,
                default: false
            }
        },
        {
            name: {
                type: String,
                default: 'Wednesday'
            },
            start: {
                type: Number,
                default: 18
            },
            end: {
                type: Number,
                default: 34
            },
            isClosed: {
                type: Boolean,
                default: false
            }
        },
        {
            name: {
                type: String,
                default: 'Thursday'
            },
            start: {
                type: Number,
                default: 18
            },
            end: {
                type: Number,
                default: 34
            },
            isClosed: {
                type: Boolean,
                default: false
            }
        },
        {
            name: {
                type: String,
                default: 'Friday'
            },
            start: {
                type: Number,
                default: 18
            },
            end: {
                type: Number,
                default: 34
            },
            isClosed: {
                type: Boolean,
                default: false
            }
        },
        {
            name: {
                type: String,
                default: 'Saturday'
            },
            start: {
                type: Number,
                default: 18
            },
            end: {
                type: Number,
                default: 34
            },
            isClosed: {
                type: Boolean,
                default: false
            }
        }
    ],
    unavaiability: [UnavailabilitySchema],
    items: [JMItemSchema]
})

jobModuleSchema.pre('save', async function (next) {
    const jobModule = this

    if (!jobModule.customHours.length) {
        const { businessHours } = await Business.findById(
            jobModule.business._id || jobModule.business
            , { businessHours: 1 }
        )
            .catch(e => {
                throw err(400, 'This job module is not attached a business')
            })

        jobModule.customHours = businessHours.length === 7 ? businessHours : [
            {
                name: 'Sunday',
                start: 18,
                end: 34,
                isClosed: false
            },
            {
                name: 'Monday',
                start: 18,
                end: 34,
                isClosed: false
            },
            {
                name: 'Tuesday',
                start: 18,
                end: 34,
                isClosed: false
            },
            {
                name: 'Wednesday',
                start: 18,
                end: 34,
                isClosed: false
            },
            {
                name: 'Thursday',
                start: 18,
                end: 34,
                isClosed: false
            },
            {
                name: 'Friday',
                start: 18,
                end: 34,
                isClosed: false
            },
            {
                name: 'Saturday',
                start: 18,
                end: 34,
                isClosed: false
            },
        ]
    }

    next()
})

require('./methods')

export type JobModuleT = InferSchemaType<typeof jobModuleSchema>

const JobModule = model('Job_Module', jobModuleSchema)

export default JobModule