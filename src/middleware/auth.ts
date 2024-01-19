import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { err, separateCookies } from '../constants/general'
import User from '../models/user/index.model'

export async function auth(req: Request, res: Response, next: NextFunction) {
    try {
        const cookies = req.cookies
        if (!cookies['access_token']) throw err(401, 'No cookie found')

        const decoded = jwt.verify(cookies['access_token'], process.env.JWT_SECRET!) as { _id: string }
        if (!decoded._id) throw err(403, 'Token not found')

        const user = await User.findById(decoded._id)
        if (!user) throw err(403, 'User not found')

        req.user = user

        next()
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
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