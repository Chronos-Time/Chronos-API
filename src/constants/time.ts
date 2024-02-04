import { coordinatesT } from "./location"

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