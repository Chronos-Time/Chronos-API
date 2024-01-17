import express, { Request, Response } from 'express'
import User from '../../models/user/index.model'
import { err, handleSaveError } from '../../constants/general'
import c from 'ansi-colors'
import { auth } from '../../middleware/auth'

const userRouter = express.Router()

userRouter.get('/', (req: Request, res: Response) => {

    res.send('Hello from client')
})

interface CreateUserI {
    email: string
    password: string
    firstName: string
    lastName: string
}

userRouter.post(
    '/signUp',
    async (req: Request<{}, {}, CreateUserI>, res: Response) => {
        try {
            const {
                email,
                password,
                firstName,
                lastName
            } = req.body

            const newClient = new User({
                email,
                password,
                firstName,
                lastName
            })

            await newClient.save()
                .catch((error) => {
                    throw handleSaveError(error)
                })

            res.status(200).send(newClient)
        } catch (e: any) {
            if (e.isCustomErr) {
                res.status(e.status).send(e)
            } else {
                res.status(500).send(err(500, c.red('Internal server error'), e))
            }
        }
    })

userRouter.get('/information', auth, (req: Request, res: Response) => {
    res.status(200).send(req.user)
})

export default userRouter