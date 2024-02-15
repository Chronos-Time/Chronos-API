import { TimeI } from '../models/time.model'
import { coordinatesT, validateGeo } from './location'
import luxon, { DateTime, Interval } from 'luxon'
import { UnavailabilityT } from '../models/Business/index.model';
import { err } from './general';
import { getTZGeo, googleTime } from './googleTime';
import { TimeZoneResponseData } from '@googlemaps/google-maps-services-js';

export const minute = 60
export const hour = minute * 60
export const day = 86400
export const week = day * 7

/**
 * ISO 8601
 */
export type ISOT = string

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

export const isISO = (input: string): boolean => {
    const isoDateRegExp = new RegExp(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/)

    return isoDateRegExp.test(input)
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

export const handleFromGoogleTime = (
    time: luxon.DateTime<true> | luxon.DateTime<false>,
    gt: TimeZoneResponseData
) => {
    return time.plus({
        seconds: gt.rawOffset + gt.dstOffset
    })
        .setZone(
            'UTC',
            { keepLocalTime: true }
        )
}

export const handleStartEnd = async (
    startEnd: PostStartEndT
): Promise<[
    TimeI,
    TimeI
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

    if (validateGeo(geoLocation)) {
        geo = geoLocation
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

    const startGT = await googleTime(
        geo,
        startDT.toUnixInteger()
    ).catch(e => {
        throw err(500, 'unable timezone data from google')
    })

    const endGT = await googleTime(
        geo,
        endDT.toUnixInteger()
    ).catch(e => {
        throw err(500, 'unable timezone data from google')
    })

    const startTime: TimeI = {
        local: start,
        utc: handleFromGoogleTime(startDT, startGT).toISO(),
        iana: startGT.timeZoneId,
        geoLocation: geo,
        lastUpdated: DateTime.now().toUTC().toUnixInteger()
    }

    const endTime: TimeI = {
        local: start,
        utc: handleFromGoogleTime(endDT, endGT).toISO(),
        iana: endGT.timeZoneId,
        geoLocation: geo,
        lastUpdated: DateTime.now().toUTC().toUnixInteger()
    }

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

    const localGT = await googleTime(
        geo,
        localDT.toUnixInteger()
    ).catch(e => {
        throw err(500, 'unable timezone data from google')
    })

    const localTime: TimeI = {
        local,
        utc: handleFromGoogleTime(localDT, localGT).toISO(),
        iana: localGT.timeZoneId,
        geoLocation: geo,
        lastUpdated: DateTime.now().toUTC().toUnixInteger()
    }

    return localTime
}