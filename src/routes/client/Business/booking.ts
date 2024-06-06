import express, { Request, Response } from 'express'
import Business from '../../../models/Business/index.model'
import { err } from '../../../constants/general'
import { BookingRequestT, BookingRequestZ } from '../../../models/Booking/request.model'
import { postStartEndT } from '../../../constants/time';
import JobModule from '../../../models/Job-modules/index.model';

const BookingRouter = express.Router()

BookingRouter.post('/', async (req: Request<{}, {}, BookingRequestT>, res: Response) => {
    try {
        const rawBookingRequest = req.body

        const pass = await BookingRequestZ.parseAsync({
            business: rawBookingRequest.business,
            client: req.userData.id,
            schedule: rawBookingRequest.schedule,
            specialRequest: rawBookingRequest.specialRequest || null,
            providedAddress: rawBookingRequest.providedAddress || null,
            jobModule: rawBookingRequest.jobModule,
            answers: rawBookingRequest.answers
        })


        const data = await req.business.isBookingAvailable(rawBookingRequest.schedule)

        const jm = await JobModule.findById(rawBookingRequest.jobModule)



        res.status(200).send({
            pass,
            data,
            jm: jm.flatten()
        })
    } catch (e: any) {
        if (e.isCustomErr) {
            res
                .status(e.status)
                .send(e.error || e.message)
        } else if (e.name === 'ZodError') {
            res
                .status(400)
                .send(e)
        } else {
            res.status(500).send(e)
        }
    }
})

export default BookingRouter