import express, { Request, Response } from 'express'
import Business from '../../../models/Business/index.model'
import { err } from '../../../constants/general'
import { BookingRequestT, BookingRequestZ } from '../../../models/Booking/request.model'
import { postStartEndT } from '../../../constants/time';

const BookingRouter = express.Router()

BookingRouter.post('/', async (req: Request<{}, {}, BookingRequestT>, res: Response) => {
    try {
        const rawBookingRequest = req.body

        const pass = await BookingRequestZ.parseAsync({
            business: rawBookingRequest.business,
            client: req.userData.id,
            schedule: rawBookingRequest.schedule,
            specialRequest: rawBookingRequest.specialRequest || null,
            providedAddress: rawBookingRequest.providedAddress || null
        })

        const isBookingAvailable = await req.business.isBookingAvailable(rawBookingRequest.schedule)

        res.status(200).send(isBookingAvailable)
    } catch (e: any) {
        if (e.isCustomErr) {
            res
                .status(e.status)
                .send(e.error || e.message)
        } else {
            res.status(500).send(e)
        }
    }
})

export default BookingRouter