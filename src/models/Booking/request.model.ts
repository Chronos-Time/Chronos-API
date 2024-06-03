import z from 'zod'
import { Types } from 'mongoose'
import User from '../user/index.model'
import Business from '../Business/index.model'
import { postStartEndZ } from '../../constants/time'
import { err } from '../../constants/general'


export const BookingRequestZ = z.object({
    business: z
        .string({
            required_error: 'Name must be provided'
        })
    ,
    client: z
        .string({
            required_error: 'Description must be provided'
        })
        .refine(async (value) => {
            return await isValidClient(value)
        }, {
            message: 'Client ID does not exist'
        })
    ,
    schedule: postStartEndZ,
    specialRequest: z.string().nullable(),
    providedAddress: z.string().nullable()
})
    .superRefine(async (data, ctx) => {
        const business = await Business.findById(data.business)

        if (!business) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Business was not found',
                fatal: true,
                path: ['business']
            })

            return z.NEVER
        }

        if (!await business.isBookingAvailable(data.schedule)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Booking requested is not available on this schedule',
                fatal: true,
                path: ['business', 'schedule']
            })
        }

        return z.NEVER
    })

export type BookingRequestT = z.infer<typeof BookingRequestZ>

const isValidClient = async (clientId: string): Promise<boolean> => {
    try {
        if (!Types.ObjectId.isValid(clientId)) return false

        const exists = await User.exists({ _id: clientId })
        return !!exists._id
    } catch {
        return false
    }
}

const isValidBusiness = async (businessId: string): Promise<boolean> => {
    try {
        if (!Types.ObjectId.isValid(businessId)) return false

        const exists = await Business.exists({ _id: businessId })
        return !!exists._id
    } catch {
        return false
    }
}

