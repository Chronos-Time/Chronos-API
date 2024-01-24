import { IdI } from '../../constants/general';
import Business from '../Business/index.model';
import {
    Schema,
    model,
    Document,
    Model,
    Types
} from 'mongoose'

export type BusinessAdminDocT = Document<unknown, any, BusinessAdminI> & BusinessAdminI

interface BusinessAdminI {
    user: Types.ObjectId
    businesses: Types.ObjectId[]
    activeBusinesses: Types.ObjectId[]
    metaData: {
        [key: string]: any
    }
    //Tax info
}

interface BusinessAdminMethodsI {
    addBusiness: (businessId: IdI) => Promise<BusinessAdminDocT>
    addActiveBusiness: (businessId: IdI) => Promise<BusinessAdminDocT>
    removeActiveBusiness: (businessId: IdI) => Promise<BusinessAdminDocT>
}

type BusinessAdminModelT = Model<BusinessAdminI, {}, BusinessAdminMethodsI>

export const businessAdminSchema = new Schema<BusinessAdminI, BusinessAdminModelT, BusinessAdminMethodsI>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    businesses: [{
        type: Schema.Types.ObjectId,
        ref: 'Business',
        default: []
    }],
    activeBusinesses: [{
        type: Schema.Types.ObjectId,
        ref: 'Business',
        default: []
    }],
    metaData: {
        default: {},
        type: Object
    }
}, {
    timestamps: true
})

require('./methods')

const BusinessAdmin = model<BusinessAdminI, BusinessAdminModelT>('BusinessAdmin', businessAdminSchema)

export default BusinessAdmin