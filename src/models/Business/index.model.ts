import { Schema, InferSchemaType, model, Model, Mongoose, Types, Document } from 'mongoose'
import v from 'validator'
import { UserT } from '../user/index.model'
import { AddressI } from '../Address/index.model'

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

export interface BusinessI extends BusinessMethodsI {
    name: string
    logo: string
    businessType: string
    businessEmail: string
    description: string
    picture?: string
    employees: Types.ObjectId[] | UserT[]
    admins: Types.ObjectId[] | UserT[]
    address: Types.ObjectId | AddressI
    phone: string
    website: string
    images: string[]
    /**
     * This is the new email that the user wants to change to. 
    */
    newEmail?: string
    socials: {
        facebook?: string
        instagram?: string
        twitter?: string
        youtube?: string
        linkedin?: string
    }
    businessHours: BusinessHoursT
    // EIN: string
    // jobModules: Types.ObjectId[] | JobModuleT[]
}

export interface BusinessMethodsI {
    updateBusinessHours: (hours: BusinessHoursT) => Promise<BusinessDocT>
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
}, {
    timestamps: true
})

businessSchema.pre('save', async function (next) {
    const business = this // "this" is in reverence to userSchema

    if (business.isModified('name')) {

    }

    if (business.isModified('businessEmail')) {
        business.businessEmail = business.businessEmail.toLowerCase()

        //Email validation...
    }

    next()
})

require('./methods')

export type BusinessT = InferSchemaType<typeof businessSchema>

const Business = model('Business', businessSchema)

export default Business