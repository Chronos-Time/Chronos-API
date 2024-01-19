import { Schema, InferSchemaType, model, Model } from 'mongoose'
import v from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

interface UserMethodsI {
    generateToken: () => {
        access_token: string
        refresh_token: string
    }
}

interface UserVirtualsI {
    fullName: string
}

interface UserI {
    email: string
    password: string
    firstName: string
    lastName: string
    google: {
        googleId: string
        accessToken: string
        refreshToken: string
    }
    picture: string
    auth: {
        jwt: string
        refreshToken: string
    }
}

type UserModelT = Model<UserI, {}, UserMethodsI & UserVirtualsI>


const userSchema = new Schema<UserI, UserModelT, UserMethodsI & UserVirtualsI>({
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

userSchema.methods.generateToken = function () {
    const user = this
    const access_token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '15m' })
    const refresh_token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' })

    return { access_token, refresh_token }
}

userSchema.pre('save', async function (next) { //must use ES5 function to use the "this" binding
    const user = this // "this" is in reverence to userSchema

    if (user.isModified('firstName')) {
        user.firstName = user.firstName.toLowerCase()
    }

    if (user.isModified('lastName')) {
        user.lastName = user.lastName.toLowerCase()
    }

    if (user.isModified('email')) {
        user.email = user.email.toLowerCase()
    }

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.virtual('fullName')
    .get(function (this: UserI) {
        return `${this.firstName} ${this.lastName}`
    })
    .set(function (this: UserI, value: string) {
        const [firstName, lastName] = value.split(' ')

        this.firstName = firstName
        this.lastName = lastName
    })

export type UserT = InferSchemaType<typeof userSchema>

const User = model('User', userSchema)

export default User