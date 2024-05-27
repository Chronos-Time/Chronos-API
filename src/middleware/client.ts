import { NextFunction, Request, Response } from "express";
import Business, { BusinessDocT } from "../models/Business/index.model";
import { clientBusinessPopulate, clientBusinessSelect } from "../routes/client/constants";

declare module "express-serve-static-core" {
    interface Request {
        business: BusinessDocT
    }
}

type clientBusinessURLT = {
    businessId: string
}

export const getBusinessForClientMid = async (req: Request<clientBusinessURLT, {}, {}>, res: Response, next: NextFunction) => {
    try {
        const businessId = req.params.businessId

        const business = await Business.findById(
            businessId,
            clientBusinessSelect,
        ).populate(clientBusinessPopulate)

        req.business = business

        next()
    } catch (err: any) {
        res.status(err.status).send(err)
    }
}