import jwt from 'jsonwebtoken'
import { userSchema } from './index.model'

userSchema.methods.generateToken = function () {
    const user = this
    const access_token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '15m' })
    const refresh_token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' })

    return { access_token, refresh_token }
}