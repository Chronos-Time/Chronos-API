import { Router } from "express"
import Passport from "../passport"
import c from "ansi-colors"
import passport from "../passport"
import { err, separateCookies } from "../constants/general"
import jwt, { JwtPayload } from "jsonwebtoken"
import User from "../models/user/index.model"
import cookieParser, { signedCookies } from "cookie-parser"

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

      req.cookies.access_token = authInfo.access_token
      req.cookies.refresh_token = authInfo.refresh_token

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
    const cookieString = req.headers.cookie
    if (!cookieString) throw err(401, 'No cookie found')

    const cookies = separateCookies(cookieString)

    const decoded: JwtPayload = jwt.verify(cookies.refresh_token, process.env.JWT_SECRET!) as { _id: string }

    const user = await User.findById(decoded._id)
    if (!user) throw err(403, 'User not found')

    const userToken = user.generateToken()

    res.send({ 'access_token': userToken.access_token })
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

export default authRouter