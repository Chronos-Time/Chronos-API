import { Schema, InferSchemaType, model, Types, Model } from 'mongoose'
import { UserT } from '../user/index.model'
import { BusinessT } from '../Business/index.model'
import v from 'validator'
import { capitalizeAllFirstLetters } from '../../constants/general'

interface EmployeeI {
    user: Types.ObjectId | UserT
    employeeEmail: string
    attachedBusinesses: Types.ObjectId[] | BusinessT[]
    activelyEmployedTo: Types.ObjectId[] | BusinessT[]
    metaData: {
        [key: string]: any
    }
}

interface EmployeeMethodsI {

}

type EmployeeModelT = Model<EmployeeI, {}, EmployeeMethodsI>

const employeeSchema = new Schema<EmployeeI, EmployeeModelT, EmployeeMethodsI>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    employeeEmail: {
        type: String,
        required: true,
        validate: {
            validator: (value: string) => {
                return v.isEmail(value)
            },
            message: (props: any) => {
                return `${props.value} is not a valid email`
            }
        }
    },
    attachedBusinesses: [{
        type: Schema.Types.ObjectId,
        ref: 'Business',
        default: []
    }],
    activelyEmployedTo: [{
        type: Schema.Types.ObjectId,
        ref: 'Business',
        default: []
    }],
    metaData: {
        default: {},
        type: Object
    }
})

employeeSchema.pre('save', async function (next) {
    const employee = this

    next()
})

export type EmployeeT = InferSchemaType<typeof employeeSchema>

const Employee = model('Employee', employeeSchema)

export default Employee