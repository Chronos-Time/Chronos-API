import { Router, Request } from "express"
import Passport from "../passport"
import c from "ansi-colors"
import passport from "../passport"
import { err, separateCookies } from "../constants/general"
import jwt, { JwtPayload } from "jsonwebtoken"
import User from "../models/user/index.model"
import v from 'validator'
import bcrypt from 'bcrypt'
import { auth } from "../middleware/auth"
import { sendEmail } from "../constants/email"

const authRouter = Router()

authRouter.get('/login', (req, res) => {
  res.send('Please login')
})

authRouter.get(
  '/login/google',
  Passport.authenticate('google')
)

authRouter.get(
  '/google/success',
  // passport.authenticate('google'),
  async (req, res) => {
    try {

      //@ts-ignore
      res.send(`Welcome ${req.user?.displayName} your email is ${req.user?.emails[0].value}`)
    } catch (error) {
      console.log(c.red('error: '), error)
      res.send(error)
    }
  }
)

authRouter.post('/login/user', async (req: Request<{}, {}, { email: string, password: string }>, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) throw err(400, 'Missing username or password')
    if (!v.isEmail(email)) throw err(400, 'Invalid email')

    const user = await User.findOne({ email })
    if (!user) throw err(400, 'User not found')

    const doesItMatch = await bcrypt.compare(password, user.password)
    if (!doesItMatch) throw err(400, 'Invalid credentials')

    sendEmail(
      'Emmanuel@gourmadelaundry.com',
      `Welcome back ${user.fullName}`,
      user.fullName,
      `Welcome back ${user.fullName}! We are glad to have you back!`
    )
      .then((response) => {
        console.log(c.green('email response: '), response)
      })
      .catch((error) => {
        console.log(c.red('email error: '), error)
      })

    const {
      access_token,
      refresh_token
    } = user.generateToken()

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 15
    })
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24
    })
      .send({
        'access_token': access_token,
      })
  } catch (e: any) {
    if (e.isCustomErr) {
      res.status(e.status).send(e)
    } else {
      res.status(400).send(e)
    }
  }
})

interface authInfoI {
  access_token: string
  refresh_token: string
  userId: string
  email: string
  picture: string
}

authRouter.get('/login/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    try {
      const authInfo = req.authInfo as authInfoI

      res
        .cookie('access_token', authInfo.access_token, {
          httpOnly: true,
          secure: true,
          maxAge: 1000 * 60 * 15
        })
        .cookie('refresh_token', authInfo.refresh_token, {
          httpOnly: true,
          secure: true,
          maxAge: 1000 * 60 * 60 * 24 * 7
        })
        .redirect(`${process.env.BUSINESS_WEBSITE}login`)

    } catch (e: any) {
      if (e.isCustomErr) {
        console.log(c.red('custom error: '), e)
        res.status(e.status).send(e)
      } else {
        res.send(e)
      }
    }
  });

authRouter.get('/google/failure', (req, res) => {
  console.log(c.red('failure'))

  res.send('Failed to authenticate..')
})

authRouter.get('/check', async (req, res) => {
  try {
    const cookieString = req.headers.cookie
    if (!cookieString) throw err(401, 'No cookie found')

    const cookies = separateCookies(cookieString)
    if (!cookies.access_token) throw err(401, 'No access token found')

    const decoded: JwtPayload = jwt.verify(cookies.access_token, process.env.JWT_SECRET!) as { _id: string }

    const user = await User.findById(decoded._id)
    if (!user) throw err(403, 'User not found')

    res.send({
      access_token: cookies.access_token
    })
  } catch (e: any) {
    if (e.isCustomErr) {
      res.status(e.status).send(e)
    } else if (e.name === 'TokenExpiredError') {
      res.status(401)
        .clearCookie('access_token')
        .clearCookie('refresh_token')
        .send(e)
    } else {
      res.status(403).send(e)
    }
  }
})

authRouter.get('/refresh_token', async (req, res) => {
  try {
    const { refresh_token } = req.cookies
    if (!refresh_token) throw err(401, 'Token not found')

    const decoded: JwtPayload = jwt.verify(refresh_token, process.env.JWT_SECRET!) as { _id: string }

    const user = await User.findById(decoded._id)
    if (!user) throw err(403, 'Invalid Credentials')

    const tokenData = user.generateToken()

    res.cookie('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 15
    })
    res.cookie('refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24
    })

    res.send({ 'access_token': tokenData.access_token })
  } catch (e: any) {
    if (e.isCustomErr) {
      res.status(e.status).send(e)
    } else if (e.name === 'TokenExpiredError') {
      res.status(401)
        .clearCookie('access_token')
        .clearCookie('refresh_token')
        .send(e)
    } else {
      res.status(403).send(e)
    }
  }
})

authRouter.get('/logout', auth, (req, res) => {

  res.clearCookie('access_token')
  res.clearCookie('refresh_token')
  res.send('Logged out')
})

export default authRouter