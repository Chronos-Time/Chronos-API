import { coordinatesT } from './location'
import luxon, { DateTime } from 'luxon'

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

export const isUTC = (input: string) => {
    const dt = DateTime.fromISO(input, { setZone: true })
    return dt.offset === 0;
}

export const isISO = (input: string) => {
    const isoDateRegExp = new RegExp(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/)

    return isoDateRegExp.test(input)
}

export const isValidTimeZone = (tz: string) => {
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
) => {
    if (!isISO(start) || !isISO(end)) return false

}