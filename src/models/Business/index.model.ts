import { Schema, InferSchemaType, model, Model, Mongoose, Types, Document } from 'mongoose'
import v from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { capitalizeAllFirstLetters } from '../../constants/general'
import { UserT } from '../user/index.model'

export type BusinessDocT = Document<unknown, any, BusinessI> & BusinessI

export interface BusinessI {
    name: string
    logo: string
    businessType: string
    businessEmail: string
    picture?: string
    employees: Types.ObjectId[] | UserT[]
    admins: Types.ObjectId[] | UserT[]
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
    // EIN: string
    // address: Types.ObjectId | AddressI
    // jobModules: Types.ObjectId[] | JobModuleT[]
}

interface BusinessMethodsI {
    generateToken: () => {
        access_token: string
        refresh_token: string
    }
    prettyPrint(): {
        [key: string]: any
    }
}

interface BusinessVirtualsI {

}

type BusinessModelT = Model<BusinessI, {}, BusinessMethodsI & BusinessVirtualsI>


const businessSchema = new Schema<BusinessI, BusinessModelT, BusinessMethodsI & BusinessVirtualsI>({
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
        ref: 'Employee'
    }],
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    }],
    phone: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
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
    }
}, {
    timestamps: true
})

businessSchema.pre('save', async function (next) { //must use ES5 function to use the "this" binding
    const business = this // "this" is in reverence to userSchema

    if (business.isModified('name')) {
        business.name = capitalizeAllFirstLetters(business.name)
    }

    if (business.isModified('businessEmail')) {
        business.businessEmail = business.businessEmail.toLowerCase()

        //Email validation...
    }

    next()
})

export type BusinessT = InferSchemaType<typeof businessSchema>

const Business = model('Business', businessSchema)

export default Business