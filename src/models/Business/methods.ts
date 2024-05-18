import { BusinessDocT, BusinessHoursT, businessSchema } from './index.model'
import { ErrT, err, handleSaveError } from '../../constants/general'
import { handleStartEnd, minute, PostUnavailabilityT } from '../../constants/time'
import Address from '../Address/index.model'
import Unavailability from '../Unavailability.model';
import JobModule, { PostjobModuleT } from '../Job-modules/index.model';


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

        await business.save().catch(e => {
            throw err(400, 'unable to save business hours', e)
        })
        return business
    } catch (e: any) {
        return e
    }
}

businessSchema.methods.addUnavailablity = async function (
    this: BusinessDocT,
    postUnavailability: PostUnavailabilityT
): Promise<BusinessDocT> {
    try {
        const business = this
        const {
            name,
            description,
            iana,
            geoLocation
        } = postUnavailability

        if (!iana && !geoLocation) {
            let businessAddress = null
            businessAddress = await Address.findById(business.address._id)
                .catch(e => {
                    throw err(
                        400,
                        'unable to timezone from business address',
                        e
                    )
                })
            const coordinates = businessAddress.location.coordinates || undefined

            postUnavailability.geoLocation = coordinates
        }

        const [startTime, endTime] = await handleStartEnd(postUnavailability)
            .catch((e: any) => {
                if (e.isCustomErr) {
                    throw e
                } else {
                    throw err(500, 'unable to handle start and end dates')
                }
            })

        const unavailability = new Unavailability({
            start: startTime,
            end: endTime,
            name: name || `${startTime.local}-${endTime.local}`,
            description
        })

        business.unavailability.push(unavailability)

        await business.save()
            .catch(e => handleSaveError(e))

        const jobModules = await JobModule.find({
            business: business._id
        })

        for (let jb of jobModules) {
            const foundUnav = jb.unavaiability
                .filter(unav => unav.name === unavailability.name)
                .length

            if (foundUnav === 0) {
                jb.unavaiability.push(unavailability)
                jb.save()
            }
        }

        return business
    } catch (e: any) {
        throw e
    }
}

businessSchema.methods.remUnavailability = async function (
    name: string
): Promise<BusinessDocT> {
    try {
        const business = this

        const originalLength = business.unavailability.length

        business.unavailability = business.unavailability.filter(uv => {
            return uv.name !== name
        })

        if (originalLength === business.unavailability.length) {
            return business
        }

        await business.save()
            .catch(e => handleSaveError(e))

        const jobModules = await JobModule.find({
            business: business._id
        })

        for (let jb of jobModules) {
            const jbunavaiabilities = jb.unavaiability.length
            jb.unavaiability = jb.unavaiability
                .filter(unav => unav.name !== name)

            if (jbunavaiabilities !== jb.unavaiability.length) {
                jb.save()
            }

        }

        return business
    } catch (e: any) {
        return e
    }
}

businessSchema.methods.addJobModule = async function (
    postJobModule: PostjobModuleT
) {
    try {
        const business = this
        const {
            name,
            serviceType,
            tags,
            description,
            duration,
            prepTime,
            customHours,
        } = postJobModule

        if (!name) {
            throw err(400, 'Job module must have a name must be provided')
        }

        if (typeof duration != 'number') {
            throw err(400, 'Duration must be provided as a Unix Integer')
        }

        const jobModules = await JobModule.find({
            business: business._id
        }, { name: 1 })

        if (jobModules.length > 0) {
            if (jobModules.filter(j => j.name === name).length) {
                throw err(400, 'Job already exists')
            }
        }

        if (duration < minute) {
            throw err(400, 'duration cannot be less than one minute')
        }

        const newJobModule = new JobModule({
            name,
            serviceType,
            business: business._id,
            tags,
            description,
            duration,
            prepTime,
            customHours: customHours || business.businessHours,
            unavaiability: business.unavailability
        })

        const jobModule = await newJobModule.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        return jobModule
    } catch (e: any) {
        return e
    }
}