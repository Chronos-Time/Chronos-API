import { BusinessDocT, BusinessHoursT, businessSchema } from './index.model'
import { err } from '../../constants/general'


businessSchema.methods.updateBusinessHours = async function (
    this: BusinessDocT,
    hours: BusinessHoursT
): Promise<BusinessDocT> {
    try {
        const business = this

        if (hours.length !== 7) {
            throw err(400, 'Business hours data is wrong')
        }

        business.businessHours = hours

        await business.save()
        return business
    } catch (e: any) {
        return e
    }
}