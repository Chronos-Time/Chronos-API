import { Schema, InferSchemaType, model, Model, Mongoose, Types, Document } from 'mongoose'
import v from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { capitalizeAllFirstLetters } from '../../constants/general'
import { UserT } from '../user/index.model'
import { AddressI } from '../Address/index.model'

export type BusinessDocT = Document<unknown, any, BusinessI> & BusinessI

export type BusinessHoursT = [
    {
        name: 'Sunday',
        hour: {
            type: Number,
            start: {
                default: 18
            },
            end: {
                default: 34
            }
        }
    },
    {
        name: 'Monday',
        hour: {
            type: Number,
            start: {
                default: 18
            },
            end: {
                default: 34
            }
        }
    },
    {
        name: 'Tuesday',
        hour: {
            type: Number,
            start: {
                default: 18
            },
            end: {
                default: 34
            }
        }
    },
    {
        name: 'Wednesday',
        hour: {
            type: Number,
            start: {
                default: 18
            },
            end: {
                default: 34
            }
        }
    },
    {
        name: 'Thursday',
        hour: {
            type: Number,
            start: {
                default: 18
            },
            end: {
                default: 34
            }
        }
    },
    {
        name: 'Friday',
        hour: {
            type: Number,
            start: {
                default: 18
            },
            end: {
                default: 34
            }
        }
    },
    {
        name: 'Saturday',
        hour: {
            type: Number,
            start: {
                default: 18
            },
            end: {
                default: 34
            }
        }
    },
]

export interface BusinessI {
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
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Monday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Tuesday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Wednesday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Thursday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Friday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Saturday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
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