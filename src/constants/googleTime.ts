import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js'
import { coordinatesT } from './location'

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