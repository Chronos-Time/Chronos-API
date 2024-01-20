import { Schema, InferSchemaType, model, Model, Mongoose, Types } from 'mongoose'
import v from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { capitalizeAllFirstLetters } from '../../constants/general'
import { UserT } from '../user/index.model'

export interface BusinessI {
    name: string
    businessType: string
    businessEmail: string
    picture?: string
    employees: Types.ObjectId[] | UserT[]
    admins: Types.ObjectId[] | UserT[]
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
    employees: {

    }
}, {
    timestamps: true
})

businessSchema.pre('save', async function (next) { //must use ES5 function to use the "this" binding
    const business = this // "this" is in reverence to userSchema

    if (business.isModified('name')) {
        business.name = capitalizeAllFirstLetters(business.name)
    }

    next()
})

export type BusinessT = InferSchemaType<typeof businessSchema>

const Business = model('Business', businessSchema)

export default Business