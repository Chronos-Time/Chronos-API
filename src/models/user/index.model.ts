import { Schema, InferSchemaType, model } from 'mongoose'
import v from 'validator'

const userSchema = new Schema({
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
        required: true,
        trim: true,
        minlength: [3, 'password must be at least 3 characters long']
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
    }
})

export type UserT = InferSchemaType<typeof userSchema>

const User = model('User', userSchema)

export default User