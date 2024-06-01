import Time, { TimeDocT, TimeI } from '../models/time.model'
import { coordinatesT, coordinatesZ, validateGeo } from './location'
import luxon, { DateTime, Interval } from 'luxon'
import { UnavailabilityT } from '../models/Business/index.model';
import { err } from './general';
import { getTZGeo, googleTime } from './googleTime';
import { TimeZoneResponseData } from '@googlemaps/google-maps-services-js';
import z from 'zod'

export const minute = 60
export const hour = minute * 60
export const day = 86400
export const week = day * 7

/**
 * ISO 8601
 */
export type ISOT = string

export const ISOZ = z
    .string()
    .refine((value) => {
        return isISO(value)
    }, {
        message: 'String must be ISO8601'
    })

/**
 * This is for when time is ever being sent to the api
 */
export type PostTimeT = {
    local: ISOT
    geoLocation: coordinatesT
    iana: string
}

export type PostStartEndT = {
    /**
     * Start time in the local iana or geoLocation provided
     */
    start: ISOT
    /**
     * End time in the local iana or geoLocation provided
     */
    end: ISOT
    /**
     * Timezone
     */
    iana: string
    /**
     * geo location of the local time provided
     * 
     * ex. [number, number]
     */
    geoLocation: coordinatesT
}

export const postStartEndZ = z.strictObject({
    start: ISOZ,
    end: ISOZ,
    geoLocation: coordinatesZ.optional(),
    iana: z.string().optional()
})
    .refine(data => {
        return data.geoLocation !== undefined && data.iana !== undefined, {
            message: "Either geoLocation or iana must be defined",
            path: ["geoLocation", "iana"]
        }
    })

export type postStartEndT = z.infer<typeof postStartEndZ>

export type PostUnavailabilityT = PostStartEndT & {
    /**
     * Name of unavailability
     */
    name: string
    /**
     * description of unavailability
     */
    description: string
}

export const isUTC = (input: string): boolean => {
    try {
        const dt = DateTime.fromISO(input, { setZone: true })
        return dt.offset === 0;
    } catch {
        return false
    }
}

/**
 * Checking to see if this is a valid ISO 8601 string
 * 
 * @param input - string
 * @returns Boolean
 */
export const isISO = (input: string): boolean => {
    return DateTime.fromISO(input).isValid
}

export const isValidTimeZone = (tz: string): boolean => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz })
        return true
    }
    catch (ex) {
        return false
    }
}

export const validStartEnd = (
    start: ISOT,
    end: ISOT
): {
    isValid: boolean,
    seconds: number
} => {
    try {
        if (!isISO(start) || !isISO(end)) {
            throw new Error('Invalid ISO string')
        }

        const startTime = DateTime.fromISO(start)
        const endTime = DateTime.fromISO(end)

        const i = Interval.fromDateTimes(startTime, endTime)
        const seconds = i.length('seconds')

        //just testing the return value
        return {
            isValid: seconds > 0,
            seconds
        }
    } catch {
        return {
            isValid: false,
            seconds: 0
        }
    }
}

export const durationString = (seconds: number): string => {
    seconds = Math.floor(seconds)
    if (seconds < 0) {
        throw new Error('Duration must be a non-negative number')
    }

    const years = Math.floor(seconds / (86400 * 365))
    const months = Math.floor((seconds % (86400 * 365)) / (86400 * 30))
    const days = Math.floor((seconds % (86400 * 30)) / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    const yearsString = years > 0 ? `${years} year${years !== 1 ? 's' : ''}` : ''
    const monthsString = months > 0 ? `${months} month${months !== 1 ? 's' : ''}` : ''
    const daysString = days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : ''
    const hoursString = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : ''
    const minutesString = minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : ''

    const parts = [yearsString, monthsString, daysString, hoursString, minutesString].filter(Boolean)

    return parts.join(' ')
}

export const durationStringShort = (seconds: number): string => {
    seconds = Math.floor(seconds)
    if (seconds < 0) {
        throw new Error('Duration must be a non-negative number')
    }

    const years = Math.floor(seconds / 60 / 60 / 24 / 30 / 12)
    const months = Math.floor((seconds / 60 / 60 / 24 / 30) % 12)
    const weeks = Math.floor((seconds / 60 / 60 / 24) % 4.34524)
    const days = Math.floor((seconds / 60 / 60 / 24) % 7)
    const hours = Math.floor((seconds / 60 / 60) % 24)
    const minutes = Math.floor((seconds / 60) % 60)

    if (years > 0) {
        return `${years} year${years !== 1 ? 's' : ''}`
    }

    if (months > 0) {
        return `${months} month${months !== 1 ? 's' : ''}`
    }

    if (weeks > 0) {
        return `${weeks} week${weeks !== 1 ? 's' : ''}`
    }

    if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''}`
    }

    if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`
    }

    if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
}

/**
 * The function checks if the provided start time is after the current time with a tolerance of one
 * hour.
 * @param {string} startTime - A string representing the start time in ISO format (e.g.
 * "2022-01-01T10:00:00Z").
 * @returns a boolean value.
 */
export const isStartTimeAfterNowWithTolerance = (startTime: string): boolean => {
    // Parse the start time provided
    const startDateTimeUnix = DateTime.fromISO(startTime).toUnixInteger()

    // Get the current time
    const currentDateTimeUnix = DateTime.now().toUnixInteger()

    //subtracting an hour to be sure that that the request had time to happen
    return startDateTimeUnix > currentDateTimeUnix - hour
}

export const isStartEndIntersect = (
    times: {
        start: TimeI
        end: TimeI
        [key: string]: any
    }[]
): boolean => {
    const sortedTimes = times.slice().sort((a, b) => {
        return timeToUnix(a.start) - timeToUnix(b.start)
    });

    const seenEndTimes = new Set<number>();

    for (const { start, end } of sortedTimes) {
        const startUnix = DateTime.fromISO(start.utc).toSeconds()
        const endUnix = DateTime.fromISO(end.utc).toSeconds()

        if (seenEndTimes.has(startUnix) || seenEndTimes.has(endUnix)) {
            return true // Found an intersection
        }

        for (let time of seenEndTimes) {
            if (time >= startUnix && time <= endUnix) {
                return true // Found an intersection
            }
        }

        seenEndTimes.add(endUnix)
    }

    return false // No intersection found
}

export const timeToUnix = (time: TimeI) => {
    return DateTime.fromISO(time.utc).toUnixInteger()
}

/**
 * Takes provided luxon datetime and google's timezone data
 * to return a luxon datetime that is set to UTC
 * 
 * @param time 
 * @param gt 
 * @returns Luxon DateTime instance that's already set UTC
 */
export const googleTimeToLocal = (
    time: luxon.DateTime<true> | luxon.DateTime<false>,
    gt: TimeZoneResponseData
) => {
    return time.plus({
        seconds: gt.rawOffset + gt.dstOffset
    })
        .setZone(
            gt.timeZoneId,
            { keepLocalTime: true }
        )
}

export const handleStartEnd = async (
    startEnd: PostStartEndT | postStartEndT
): Promise<[
    TimeDocT,
    TimeDocT
]> => {
    const {
        start,
        end,
        iana,
        geoLocation
    } = startEnd

    if (!isStartTimeAfterNowWithTolerance(start)) {
        throw err(400, 'Start and Endtime not valid')
    }

    if (!validStartEnd(start, end).isValid) {
        throw err(400, 'Start and End time not valid')
    }

    let geo: coordinatesT

    //@ts-ignore
    if (validateGeo(geoLocation)) {
        geo = geoLocation as [number, number]
    } else if (isValidTimeZone(iana)) {
        geo = await getTZGeo(iana)
            .catch(() => {
                throw err(500, 'unable iana from google')
            })
    } else {
        throw err(400, 'Valid timezone was not provided')
    }

    const startDT = DateTime.fromISO(start)
    const endDT = DateTime.fromISO(end)

    //I know this is redundant but the normal wasn't working
    const startUTC = DateTime.fromISO(startDT.toUTC().toISO())
    const endUTC = DateTime.fromISO(endDT.toUTC().toISO())

    const startGTData = await googleTime(
        geo,
        startUTC.toUnixInteger()
    ).catch(e => {
        throw err(500, 'unable timezone data from google')
    })

    const endGTData = await googleTime(
        geo,
        endUTC.toUnixInteger()
    ).catch(e => {
        throw err(500, 'unable timezone data from google')
    })

    const startTime = new Time({
        local: googleTimeToLocal(startDT, startGTData).toISO(),
        utc: startUTC.toISO(),
        iana: startGTData.timeZoneId,
        geoLocation: geo,
        lastUpdated: DateTime.now().toUTC().toUnixInteger(),
        jsDate: startDT.toUTC().toISO()
    })

    const endTime = new Time({
        local: googleTimeToLocal(endDT, endGTData).toISO(),
        utc: endUTC.toISO(),
        iana: endGTData.timeZoneId,
        geoLocation: geo,
        lastUpdated: DateTime.now().toUTC().toUnixInteger(),
        jsDate: endDT.toUTC().toJSDate()
    })

    return [
        startTime,
        endTime
    ]
}

export const handleTime = async (
    postTime: PostTimeT
) => {
    const {
        local,
        iana,
        geoLocation
    } = postTime

    if (!validateGeo(geoLocation) && !isValidTimeZone(iana)) {
        throw err(400, 'Valid timezone was not provided')
    }

    if (!isValidTimeZone(iana)) {
        throw err(400, 'invalid timezone')
    }

    if (!isISO(local)) {
        throw err(400, 'local time provided was not ISO 8601')
    }

    let geo: coordinatesT

    if (geoLocation.length === 2) {
        geo = geoLocation
    } else {
        geo = await getTZGeo(iana)
            .catch(e => {
                throw err(500, 'unable iana from google')
            })
    }

    const localDT = DateTime.fromISO(local)

    /**
     * Time from google
     */
    const localGT = await googleTime(
        geo,
        localDT.toUnixInteger()
    ).catch(e => {
        throw err(500, 'unable timezone data from google')
    })

    const localTime: TimeI = {
        local,
        utc: localDT.toUTC().toISO(),
        iana: localGT.timeZoneId,
        geoLocation: geo,
        lastUpdated: DateTime.now().toUTC().toUnixInteger(),
        jsDate: localDT.toUTC().toJSDate()
    }

    return localTime
}