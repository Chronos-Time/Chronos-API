import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js'
import { coordinatesT, validateGeo } from './location'
import { googleTimeToLocal, isISO, isUTC, isValidTimeZone } from './time'
import { err } from './general'
import { DateTime } from 'luxon'

const client = new Client({

})

export const googleTime = async (
    location: [number, number],
    unixTime: number
) => {

    const response = await client.timezone({
        params: {
            location,
            timestamp: unixTime,
            key: process.env.GOOGLE_MAP_KEY!
        }
    })

    return response.data
}

export const getTZGeo = async (iana: string): Promise<coordinatesT> => {
    try {
        const data = await client.findPlaceFromText({
            params: {
                input: `timezone - ${iana}`,
                inputtype: PlaceInputType.textQuery,
                fields: ['geometry/location'],
                key: process.env.GOOGLE_MAP_KEY!
            },
        })

        const { lat, lng } = data.data.candidates[0].geometry.location

        return [lat, lng]
    } catch (e) {
        return null
    }
}

export const utcToLocal = async (
    utc: string,
    iana?: string,
    geoLocation?: coordinatesT
) => {
    let geo: coordinatesT

    if (!isUTC(utc)) {
        throw err(400, 'invalid utc 8601 string')
    }

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

    const utcDT = DateTime.fromISO(utc).toUTC()

    const gtData = await googleTime(
        geo,
        utcDT.toUnixInteger()
    ).catch(e => {
        throw err(500, 'unable timezone data from google')
    })

    return googleTimeToLocal(utcDT, gtData)
}