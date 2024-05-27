import { isInteger } from 'lodash'
import { Schema, InferSchemaType, model, Types, Model, Document } from 'mongoose'

export type JMItemDocT = Document<unknown, any, JMItemI> & JMItemI

export type questionTypesT = 'Single Select' |
    'Multi Select' |
    'Conditional' |
    'Number' |
    'Written Response'

export type PostJMItemT = {
    name: string
    description: string
    addedTime?: number
    price?: number
    chargeType?: JMItemI['chargeType']
    isRequired?: boolean
    items: PostJMItemT[]
}

export const chargeTypes: JMItemI['chargeType'][] = [
    'Price If No Subscription',
    'Price Only',
    'Subscription Only'
]

export const isChargeType = (input: JMItemI['chargeType']) => {
    return chargeTypes.includes(input)
}


/**
 * Job Module Item
 * 
 * **This is not complete:
 * *needs Price need to be with stripe
 * *More options need to be integrated optionally for the user to input
 * 
 * A Job Module Item is what
 * can be added to Job Modules
 * when a client make requests
 * 
 */
export interface JMItemI {
    /**
     * Name of the Job Module Item
     */
    name: string
    /**
     * Description of the Job Module Item
     */
    description: string
    /**
     * Additional time to the Job Module in Unix Integer
     */
    addedTime: number
    /**
     * This price will be added to the job Module prices
     * 
     * Prices are integers starting from one cent
     * $10.99 = 1099
     */
    price: number
    /**
     * Are the items here required
     */
    isRequired: boolean

    chargeType: 'Subscription Only' |
    'Price Only' |
    'Price If No Subscription'

    questionType: questionTypesT

    /**
     * If Question type is Multi Select
     */
    minSelection: number

    items: JMItemI[]
}

interface JMItemMethodsI {

}

type JMItemModelT = Model<JMItemI, {}, JMItemMethodsI>

export const JMItemSchema = new Schema<JMItemI, JMItemModelT, JMItemMethodsI>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        default: 0,
        validate: {
            validator: (value: number) => {
                return isInteger(value)
            },
            message: (props: any) => {
                return `${props.value} is not an interger`
            }
        }
    },
    addedTime: {
        type: Number,
        default: 0
    },
    chargeType: {
        type: String,
        required: true,
        enum: [
            'Subscription Only',
            'Price Only',
            'Price If No Subscription'
        ],
        default: 'Price Only'
    },
    questionType: {
        type: String,
        enum: [
            'Single Select',
            'Multi Select',
            'Conditional',
            'Number'
        ],
        default: 'Single Select'
    },
    minSelection: {
        type: Number,
        default: null
    }
})

JMItemSchema.add({
    items: [JMItemSchema]
})


JMItemSchema.pre('save', async function (next) {
    const item = this

    next()
})

export type JMItemT = InferSchemaType<typeof JMItemSchema>

const JMItem = model('Job_Module_Item', JMItemSchema)

export default JMItem