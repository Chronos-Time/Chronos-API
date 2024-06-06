import Business, { BusinessDocT, BusinessHoursT, businessSchema } from './index.model'
import { ErrT, err, handleSaveError } from '../../constants/general'
import { handleStartEnd, minute, postStartEndT, PostStartEndT, PostUnavailabilityT } from '../../constants/time'
import Address from '../Address/index.model'
import Unavailability from '../Unavailability.model';
import JobModule, { PostjobModuleT } from '../Job-modules/index.model';
import { DateTime } from 'luxon';
import { utcToLocal } from '../../constants/googleTime';


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

businessSchema.methods.isBookingAvailable = async function (
    startEnd: postStartEndT
): Promise<Boolean> {
    try {
        const business = this
        await business.populate('address')

        const [
            start,
            end
        ] = await handleStartEnd(startEnd)

        const data = await Business.findOne({
            _id: business.id,
            unavailability: {
                $elemMatch: {
                    $or: [
                        {
                            // Booking start is within an unavailability period
                            "start.jsDate": {
                                $lte: start.jsDate
                            },
                            "end.jsDate": {
                                $gte: start.jsDate
                            }
                        },
                        {
                            // Booking end is within an unavailability period
                            "start.jsDate": {
                                $lte: end.jsDate
                            },
                            "end.jsDate": {
                                $gte: end.jsDate
                            }
                        },
                        {
                            // Booking completely covers an unavailability period
                            "start.jsDate": {
                                $lte: start.jsDate
                            },
                            "end.jsDate": {
                                $gte: end.jsDate
                            }
                        },
                        {

                            "start.jsDate": {
                                $lte: end.jsDate
                            },
                            "end.jsDate": {
                                $gte: start.jsDate
                            }
                        }
                    ],
                    // $and: [
                    //     { "start.utc": { $lt: end.jsDate } },  // Booking starts before the unavailability ends
                    //     { "end.utc": { $gt: start.jsDate } }   // Booking ends after the unavailability starts
                    // ]
                }
            }
        })

        if (data !== null) {
            throw false
        }

        /**
         * Start in UTC
         */
        const startDTUTC = DateTime.fromISO(start.utc).toUTC()

        /**
         * End in UTC
         */
        const endDTUTC = DateTime.fromISO(end.utc).toUTC()

        const startBusinessDay = business.businessHours[startDTUTC.weekday % 7]
        const endBusinessDay = business.businessHours[endDTUTC.weekday % 7]

        if (startBusinessDay.isClosed || endBusinessDay.isClosed) {
            throw false
        }

        //just in case it hasn't been populated
        const businessAddress = await Address.findById(business.address._id)
            .catch(() => {
                throw err(500, 'unable to find validated business address')
            })

        const isWithinHours = async (
            /**
             * **MUST BE IN UTC
             */
            time: DateTime<true> | DateTime<false>,
            day: BusinessDocT['businessHours'][number]
        ) => {
            const localTime = await utcToLocal(
                time.toISO(),
                undefined,
                businessAddress.location.coordinates
            )

            const beginningOfDay = localTime
                .startOf('day')
                .plus({
                    minutes: day.start * 30
                })
                .toUnixInteger()

            const endOfDay = localTime
                .startOf('day')
                .plus({
                    minutes: day.end * 30
                })
                .toUnixInteger()

            const localTimeUnix = localTime.toUnixInteger()

            return beginningOfDay <= localTimeUnix && localTimeUnix <= endOfDay
        }

        const startWithinHours = await isWithinHours(startDTUTC, startBusinessDay)
        const endWithinHours = await isWithinHours(endDTUTC, endBusinessDay)

        if (!startWithinHours || !endWithinHours) {
            throw false
        }

        if (startBusinessDay.name !== endBusinessDay.name) {
            let currentDayIndex = startDTUTC.weekday

            while (business.businessHours[currentDayIndex % 7].name !== endBusinessDay.name) {
                let currentDay = business.businessHours[currentDayIndex % 7]
                let nextDay = business.businessHours[(currentDayIndex + 1) % 7]

                if (currentDay.end !== 48 && nextDay.start !== 0) {
                    throw false
                }

                currentDayIndex += 1
            }
        }

        const startDTUTCUnix = startDTUTC.toUnixInteger()
        const endDTUTCUnix = endDTUTC.toUnixInteger()

        let isSlotAvailable = false


        business.slots.forEach((slot, index) => {
            if (isSlotAvailable) {
                return
            }

            if (slot.bookings.length === 0) {
                isSlotAvailable = true
                return
            }

            let bookingIndex = 0
            let keepSearching = true

            while (!keepSearching || bookingIndex !== slot.bookings.length) {
                const book = slot.bookings[bookingIndex]

                if (book.end < startDTUTCUnix) {
                    keepSearching = false
                    const nextBooking = slot.bookings[bookingIndex + 1]

                    if (!nextBooking) {
                        isSlotAvailable = true
                    } else if (nextBooking.start > endDTUTCUnix) {
                        isSlotAvailable = true
                    }
                }

                bookingIndex += 1
            }
        })

        if (!isSlotAvailable) {
            throw false
        }

        return true
    }
    catch {
        return false
    }
}