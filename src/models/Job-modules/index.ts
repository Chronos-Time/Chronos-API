import { Schema, InferSchemaType, model, Types, Model, Document } from 'mongoose'
import { TimeI } from '../../constants/time'
import Business, { BusinessHoursT } from '../Business/index.model'
import { err } from '../../constants/general'

export type JobModuleDocT = Document<unknown, any, JobModuleI> & JobModuleI

interface JobModuleI {
    name: string
    business: Types.ObjectId
    /**
     * main job type ex 'Personal Fitness Trainer', 'Hair Stylist'
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
    prepTime: number
    description: string
    /**
     * This will be taken from the business schema
     */
    unavaiability: {
        /**
         * In UTC
         */
        start: TimeI
        /**
         * In UTC
         */
        end: TimeI
    }[]
    /**
     * defaults to the Businesses working hours
     * but can be updated by data
     */
    customHours: BusinessHoursT

    //day 2:
    /*
    discounts: {
        name: string
        distanceOut: number
    }[]

    */
}

interface JobModuleMethodsI {

}

type JobModuleModelT = Model<JobModuleI, {}, JobModuleMethodsI>

const jobModuleSchema = new Schema<JobModuleI, JobModuleModelT, JobModuleMethodsI>({
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
    unavaiability: [{
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        }
    }]
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

export type JobModuleT = InferSchemaType<typeof jobModuleSchema>

const JobModule = model('Job_Module', jobModuleSchema)

export default JobModule