import express, { Request, Response } from 'express'
import User from '../../models/user/index.model'
import { err, handleSaveError, validateKeys } from '../../constants/general'
import c from 'ansi-colors'
import { auth } from '../../middleware/auth'
import bcrypt from 'bcrypt'
import v from 'validator'

const userRouter = express.Router()
userRouter.use(auth)

userRouter.get('/', (req: Request, res: Response) => {
    res.send('Hello from client')
})

userRouter.get('/information', (req: Request, res: Response) => {
    const { userData } = req

    //@ts-ignore
    res.status(200).send(userData.prettyPrint())
})

userRouter.post('/changePassword', async (req: Request, res: Response) => {
    try {
        const { userData } = req
        const { oldPassword, newPassword } = req.body

        if (!v.isStrongPassword(newPassword)) throw err(400, 'Password is not strong enough')

        const user = await User.findById(userData._id)
        if (!user) throw err(404, 'User not found')

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) throw err(400, 'Incorrect password')

        user.password = newPassword
        await user.save()

        res.status(200).send({
            message: 'Password changed successfully'
        })
    } catch (e: any) {
        res.status(e.status || 500).send({
            message: e.message
        })
    }
})

interface UpdateBasicInfoI {
    firstName: string
    lastName: string
}

userRouter.put('/updateBasicInfo', async (req: Request, res: Response) => {
    try {
        const d = req.body

        const validKeys = ['firstName', 'lastName', 'dob']
        const isValid = validateKeys(d, validKeys)
        if (!isValid) throw err(400, 'Invalid keys')

        Object.keys(d).forEach(key => d[key] || delete d[key])

        const user = await User.findByIdAndUpdate(req.userData._id, {
            ...d
        }, {
            new: true
        })
            .catch((error) => {
                throw handleSaveError(error)
            })

        res.status(200).send(user.prettyPrint())
    } catch (e: any) {
        res
            .status(e.status || 500)
            .send({ message: e.message })
    }
})

userRouter.put('/updatedob', async (req: Request<{}, {}, { dob: string }>, res: Response) => {
    try {
        const dob = req.body.dob

        const user = await User.findById(req.userData._id)
            .catch(e => {
                throw err(
                    500,
                    'unable to find user',
                    e
                )
            })

        await user.updatedob(dob)

        res.status(200).send(user.prettyPrint())
    } catch (e: any) {
        if (e.isCustomErr) {
            res
                .status(e.status)
                .send(e.error || e.message)
        }
    }
})

export default userRouter