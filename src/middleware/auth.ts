import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { err, separateCookies } from '../constants/general'
import User, { UserDocT } from '../models/user/index.model'
import BusinessAdmin, { BusinessAdminDocT } from '../models/BusinessAdmin/index.model'

declare module "express-serve-static-core" {
    interface Request {
        userData: UserDocT
    }
}

export async function auth(req: Request, res: Response, next: NextFunction) {
    try {
        const bearer = req.headers.authorization
        const cookies = req.cookies

        const theAccessToken = bearer?.split(' ')[1] || cookies['access_token']
        if (!theAccessToken) throw err(401, 'No cookie found')

        const decoded = jwt.verify(theAccessToken, process.env.JWT_SECRET!) as { _id: string }
        if (!decoded._id) throw err(403, 'Token not found')

        const user = await User.findById(decoded._id)
        if (!user) throw err(403, 'User not found')

        req.userData = user

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