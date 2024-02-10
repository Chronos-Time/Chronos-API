import { Client } from '@googlemaps/google-maps-services-js'
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