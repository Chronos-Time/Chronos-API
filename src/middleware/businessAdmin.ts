import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { err, stringToId } from '../constants/general'
import BusinessAdmin, { BusinessAdminDocT } from '../models/BusinessAdmin/index.model'
import Business from '../models/Business/index.model'
import { businessPopulate, businessSelect } from '../routes/businessManager/constants'
import { BusinessDocT } from '../models/Business/index.model';
import JobModule, { JobModuleDocT } from '../models/Job-modules/index.model'
import { Types } from 'mongoose'

declare module "express-serve-static-core" {
    interface Request {
        businessAdmin: BusinessAdminDocT
        business: BusinessDocT
        jobModules: JobModuleDocT[]
        jobModule: JobModuleDocT
    }
}

type businessURLT = {
    businessId: string
    jobModuleId: string
}

export async function businessAdminAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const cookies = req.cookies
        if (!cookies['access_token']) throw err(401, 'No cookie found')

        const decoded = jwt.verify(cookies['access_token'], process.env.JWT_SECRET!) as { _id: string }
        if (!decoded._id) throw err(403, 'Token not found')

        const businessAdmin = await BusinessAdmin.findOne({ user: decoded._id })
            .populate('user')

        req.businessAdmin = businessAdmin

        next()
    } catch (err: any) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.status === 401) {
            res
                .clearCookie('access_token')
                .status(401)
                .send(err)
        } else if (err.isCustomErr) {
            if (err.status === 403) {
                res
                    .clearCookie('access_token')
                    .clearCookie('refresh_token')
                    .status(403)
                    .send(err)
            }
        } else {
            res.status(403).send(err)
        }
    }
}

export const getBusinessMid = async (req: Request<businessURLT, {}, {}>, res: Response, next: NextFunction) => {
    try {
        const businessId = req.params.businessId
        if (!businessId) throw err(400, 'No businessId found')

        if (!Types.ObjectId.isValid(businessId)) {
            throw err(400, 'Invalid business Id')
        }

        const business = await Business.findById({
            _id: businessId,
            admins: { $in: req.businessAdmin._id }
        }, businessSelect)
            .populate(businessPopulate)
        if (!business) throw err(404, 'Business not found')

        req.business = business

        business.updateBusinessHours

        next()
    } catch (err: any) {
        if (err.isCustomErr) {
            res.status(err.status).send(err)
        } else {
            res.status(500).send(err)
        }
    }
}

export const getJobModules = async (req: Request<businessURLT, { test: string }, {}>, res: Response, next: NextFunction) => {
    try {
        const param = req.query

        const jobModules = await JobModule.find({
            business: req.business._id
        })

        req.jobModules = jobModules

        next()
    } catch (err: any) {
        res.status(err.status).send(err)
    }
}

export const getJobModule = async (req: Request<businessURLT, {}, {}>, res: Response, next: NextFunction) => {
    try {
        const jobModule = await JobModule.findOne({
            _id: req.params.jobModuleId
        })

        if (jobModule === null) {
            throw err(400, 'Unable to find job module')
        }

        if (jobModule.business.toString() !== req.business.id) {
            throw err(403, 'Unable to access job module')
        }

        req.jobModule = jobModule

        next()
    } catch (err: any) {
        res.status(err.status).send(err)
    }
}