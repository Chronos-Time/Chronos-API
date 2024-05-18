import {
    Schema,
    InferSchemaType,
    model,
    Model,
    Document,
    Types,
    Date
} from 'mongoose'
import v from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { capitalizeAllFirstLetters, err, handleSaveError } from '../../constants/general';
import { DateTime } from 'luxon'
import { ISOT, hour, isISO } from '../../constants/time'

export type UserDocT = Document<unknown, any, UserI> & UserI

export interface PostUserI {
    email: string
    password: string
    firstName: string
    lastName: string
    google: {
        googleId: string
        accessToken: string
        refreshToken: string
    },
    dob?: string
    picture?: string
}
export interface UserI {
    email: string
    password: string
    firstName: string
    lastName: string
    google: {
        googleId: string
        accessToken: string
        refreshToken: string
    },
    dob: string
    picture: string
    auth: {
        jwt: string
        refreshToken: string
    }
}
interface UserMethodsI {
    generateToken: () => {
        access_token: string
        refresh_token: string
    }
    prettyPrint(): {
        [key: string]: any
    }
    updatedob(dateString: string): Promise<UserDocT>
}

interface UserVirtualsI {
    fullName: string
}

export type UserModelT = Model<UserI, {}, UserMethodsI & UserVirtualsI>


export const userSchema = new Schema<UserI, UserModelT, UserMethodsI & UserVirtualsI>({
    email: {
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
    password: {
        type: String,
        required: false,
        // trim: true,
        minlength: [8, 'password must be at least 8 characters long']
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    dob: {
        type: String,
        validate: {
            validator: (value: string) => {
                try {
                    if (isISO(value)) return false

                    const providedDT = DateTime.fromISO(value).toUnixInteger()
                    const nowWithTolerance = DateTime.now().toUnixInteger() + hour

                    return providedDT < nowWithTolerance
                } catch {
                    return false
                }
            },
            message: (props: any) => {
                return `${props.value} is not a valid ISO Date or you can not be born in the future`
            }
        }
    },
    google: {
        default: {},
        googleId: {
            type: String,
            required: false,
            trim: true
        },
        accessToken: {
            type: String,
            required: false,
            trim: true
        },
        refreshToken: {
            type: String,
            required: false,
            trim: true
        }
    },
    picture: {
        type: String,
        required: false,
        trim: true
    },
    auth: {
        jwt: {
            type: String,
            required: false,
            trim: true
        },
        refreshToken: {
            type: String,
            required: false,
            trim: true
        }
    }
}
    , {
        timestamps: true
    })

userSchema.methods.prettyPrint = function () {
    const user = this

    const userObject = user.toObject({ virtuals: true })

    userObject.firstName = capitalizeAllFirstLetters(userObject.firstName)
    userObject.lastName = capitalizeAllFirstLetters(userObject.lastName)

    delete userObject.password
    delete userObject.auth
    delete userObject.google

    return userObject
}

userSchema.methods.updatedob = async function (dateString: ISOT): Promise<UserDocT> {
    try {
        const user = this

        if (!isISO(dateString)) {
            throw err(
                400,
                'Invalid ISO string provided'
            )
        }

        const dobDT = DateTime.fromISO(dateString)

        user.dob = dobDT.plus({ days: 1 }).toISODate()
        await user.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        return user
    } catch (e) {
        throw e
    }
}

userSchema.pre('save', async function (next) { //must use ES5 function to use the "this" binding
    const user = this // "this" is in reverence to userSchema

    if (user.isModified('firstName') && user.firstName) {
        user.firstName = user.firstName.toLowerCase()
    }

    if (user.isModified('lastName') && user.lastName) {
        user.lastName = user.lastName.toLowerCase()
    }

    if (user.isModified('email') && user.email) {
        user.email = user.email.toLowerCase()
    }

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

require('./methods')

userSchema.virtual('fullName')
    .get(function (this: UserI) {
        return capitalizeAllFirstLetters(`${this.firstName} ${this.lastName}`)
    })
    .set(function (this: UserI, value: string) {
        const [firstName, lastName] = value.split(' ')

        this.firstName = firstName
        this.lastName = lastName
    })

export type UserT = InferSchemaType<typeof userSchema>

const User = model('User', userSchema)

export default User