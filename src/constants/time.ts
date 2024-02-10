import { coordinatesT } from './location'
import luxon, { DateTime, Interval } from 'luxon'

export const minute = 60
export const hour = minute * 60
export const day = 86400
export const week = day * 7

export interface TimeI {
    utc: string
    timezone: string
    local: string
    geoLocation: coordinatesT
}

export type ISOT = string

export const isUTC = (input: string): boolean => {
    const dt = DateTime.fromISO(input, { setZone: true })
    return dt.offset === 0;
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
    start: string,
    end: string
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

export const isStartTimeAfterNowWithTolerance = (startTime: string): boolean => {
    // Parse the start time provided
    const startDateTimeUnix = DateTime.fromISO(startTime).toUnixInteger()

    // Get the current time
    const currentDateTimeUnix = DateTime.now().toUnixInteger()

    //subtracting an hour to be sure that that the request had time to happen
    return startDateTimeUnix > currentDateTimeUnix - hour
}
