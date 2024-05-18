import { Schema, InferSchemaType, model, Model, Mongoose, Types, Document, PopulatedDoc } from 'mongoose'

export type JobDetailItemDocT = Document<unknown, any, JobDetailItemI> & JobDetailItemI


export interface JobDetailItemI {
    name: string
    description: string
    items: JobDetailItemI
    clientResponse: string
}

type JobDetailItemModal = Model<JobDetailItemI, {}, {}>

export const JobDetailItemSchema = new Schema<JobDetailItemI, JobDetailItemModal, {}>({
    name: {
        type: String,
        required: true
    },
    description: String
})

JobDetailItemSchema.add({
    items: [JobDetailItemSchema]
})

const JobDetailItem = model('Job_Detail_Item', JobDetailItemSchema)

export default JobDetailItem