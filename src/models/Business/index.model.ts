import { Schema, InferSchemaType, model, Model, Mongoose, Types, Document, PopulatedDoc } from 'mongoose'
import v from 'validator'
import { UserT } from '../user/index.model'
import { AddressDocT } from '../Address/index.model'
import { PostStartEndT, PostUnavailabilityT, postStartEndT } from '../../constants/time'
import { TimeDocT } from '../time.model'
import { UnavailabilityDocT, UnavailabilitySchema } from '../Unavailability.model'
import JobModule, { JobModuleDocT, PostjobModuleT } from '../Job-modules/index.model';
import { BookingDocT } from '../Booking/index.model'

export type BusinessDocT = Document<unknown, any, BusinessI> & BusinessI

export type BusinessHoursT = [
    {
        name: 'Sunday'
        start: number
        end: number
        isClosed: boolean
    },
    {
        name: 'Monday'
        start: number
        end: number
        isClosed: boolean
    },
    {
        name: 'Tuesday'
        start: number
        end: number
        isClosed: boolean
    },
    {
        name: 'Wednesday'
        start: number
        end: number
        isClosed: boolean
    },
    {
        name: 'Thursday'
        start: number
        end: number
        isClosed: boolean
    },
    {
        name: 'Friday'
        start: number
        end: number
        isClosed: boolean
    },
    {
        name: 'Saturday'
        start: number
        end: number
        isClosed: boolean
    },
]

export type UnavailabilityT = {
    name?: string
    description?: string
    start: TimeDocT
    end: TimeDocT
}

export interface BusinessI extends BusinessMethodsI {
    name: string
    logo: string
    businessType: string
    businessEmail: string
    description: string
    picture?: string
    employees: Types.ObjectId[] | UserT[]
    admins: Types.ObjectId[] | UserT[]
    address: PopulatedDoc<Document<Types.ObjectId> & AddressDocT>
    phone: string
    website: string
    images: string[]
    /**
     * This is the new email that the user wants to change to. 
    */
    newEmail?: string
    slots: {
        slotName: string
        bookings: {
            booking: PopulatedDoc<Document<Types.ObjectId> & BookingDocT>
            /**
             * The UTC start time of a booking in unix
             */
            start: number
            /**
             * The UTC end time of a booking in unix
             */
            end: number
        }[]
        forJobmodules: PopulatedDoc<Document<Types.ObjectId> & JobModuleDocT>[]
    }[]
    socials: {
        facebook?: string
        instagram?: string
        twitter?: string
        youtube?: string
        linkedin?: string
    }
    businessHours: BusinessHoursT
    unavailability: UnavailabilityDocT[]
    // EIN: string
    // jobModules: Types.ObjectId[] | JobModuleT[]
}

export interface BusinessMethodsI {
    updateBusinessHours: (hours: BusinessHoursT) => Promise<BusinessDocT>

    addUnavailablity: (
        postUnavailability: PostUnavailabilityT
    ) => Promise<BusinessDocT>

    remUnavailability: (
        name: string
    ) => Promise<BusinessDocT>

    addJobModule: (
        postJobModule: PostjobModuleT
    ) => Promise<JobModuleDocT>

    isBookingAvailable: (
        startEnd: postStartEndT
    ) => Promise<Boolean>
}

interface BusinessVirtualsI {

}

type BusinessModelT = Model<BusinessI, {}, BusinessMethodsI & BusinessVirtualsI>


export const businessSchema = new Schema<BusinessI, BusinessModelT, BusinessMethodsI & BusinessVirtualsI>({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        validate: {
            validator: (value: string) => {
                return v.isURL(value)
            },
            message: (props: any) => {
                return `${props.value} is not a valid url`
            }
        }
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    images: [{
        type: String,
        validate: {
            validator: (value: string) => {
                return v.isURL(value)
            },
            message: (props: any) => {
                return `${props.value} is not a valid url`
            }
        }
    }],
    businessEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: (value: string) => {
                return v.isEmail(value)
            },
            message: (props: any) => {
                return `${props.value} is not a valid email`
            }
        }
    },
    businessType: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: false,
        trim: true
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        default: []
    }],
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'BusinessAdmin'
    }],
    phone: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
    },
    slots: [{
        bookings: [{
            booking: {
                type: Schema.Types.ObjectId,
                ref: 'Booking'
            },
            start: Number,
            end: Number,
        }],
        slotName: String,
        forJobmodules: [{
            type: Schema.Types.ObjectId,
            ref: 'Job_Module'
        }]
    }],
    socials: {
        facebook: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return v.isURL(value)
                },
                message: (props: any) => {
                    return `${props.value} is not a valid url`
                }
            }
        },
        instagram: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return v.isURL(value)
                },
                message: (props: any) => {
                    return `${props.value} is not a valid url for instagram`
                }
            }
        },
        twitter: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return v.isURL(value)
                },
                message: (props: any) => {
                    return `${props.value} is not a valid url for twitter`
                }
            }
        },
        youtube: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return v.isURL(value)
                },
                message: (props: any) => {
                    return `${props.value} is not a valid url for youtube`
                }
            }
        },
        linkedin: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return v.isURL(value)
                },
                message: (props: any) => {
                    return `${props.value} is not a valid url for linkedin`
                }
            }
        }
    },
    businessHours: [
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
    unavailability: [UnavailabilitySchema]
}, {
    timestamps: true
})

businessSchema.pre('save', async function (next) {
    this // "this" is in reverence to userSchema

    if (this.isModified('name')) {

    }

    if (this.isModified('businessEmail')) {
        this.businessEmail = this.businessEmail.toLowerCase()

        //Email validation...   
    }

    if (this.isModified('unavailability')) {
        //find duplicate name
    }

    if (this.slots.length === 0) {
        const jobModules = await JobModule.find({
            business: this.id
        }, {
            _id: 1
        })

        this.slots.push({
            slotName: 'Slot 1',
            forJobmodules: jobModules.map(jm => jm._id),
            bookings: []
        })
    }

    if (this.isModified('slots')) {
        this.slots = this.slots.map((slot, index) => {
            if (!slot.slotName) {
                slot.slotName = `Slot ${index}`
            }

            return slot
        })
    }

    next()
})

require('./methods')

export type BusinessT = InferSchemaType<typeof businessSchema>

const Business = model('Business', businessSchema)

export default Business