import { Router, Request, Response } from 'express'
import { err, handleSaveError } from '../../constants/general'
import c from 'ansi-colors'
import v from 'validator'
import User from '../../models/user/index.model'

const UserSetupRouter = Router()

interface CreateUserI {
    email: string
    password: string
    firstName: string
    lastName: string
}

UserSetupRouter.post(
    '/signUp',
    async (req: Request<{}, {}, CreateUserI>, res: Response) => {
        try {
            const {
                email,
                firstName,
                lastName,
                password
            } = req.body

            if (!v.isEmail(email)) throw err(400, 'Invalid email')
            if (!v.isStrongPassword(req.body.password)) throw err(400, 'Password is not strong enough')
            if (!v.isAlpha(firstName)) throw err(400, 'First name must be alphabetic')
            if (!v.isAlpha(lastName)) throw err(400, 'Last name must be alphabetic')

            const newClient = new User({
                email,
                password,
                firstName,
                lastName
            })

            const user = await newClient.save()
                .catch((error) => {
                    throw handleSaveError(error)
                })

            const userToken = user.generateToken()
            res
                .status(200)
                .cookie('access_token', userToken.access_token, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 1000 * 60 * 15
                })
                .cookie('refresh_token', userToken.refresh_token, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 1000 * 60 * 60 * 24
                })
                .send({
                    access_token: userToken.access_token,
                })
        } catch (e: any) {
            if (e.isCustomErr) {
                res.status(e.status).send(e)
            } else {
                res.status(500).send(err(500, c.red('Internal server error'), e))
            }
        }
    })


export default UserSetupRouter