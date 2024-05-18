import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import c from 'ansi-colors'
import User from './models/user/index.model'
import { err, handleSaveError } from './constants/general'

const Passport = new passport.Passport()

console.log('This is a big updated!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
Passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID! || '111395781940-a1qa6knlseh74m4jgnuk9mc67ld59abi.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.THIS_API_URL! + '/auth/login/google/callback',
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
      // passReqToCallback: true,
      state: true,
      // accessType: 'offline'
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(c.cyan('Google Strategy'))
        console.log('cliendtID', c.cyan(process.env.GOOGLE_CLIENT_ID))
        console.log('client_secret', c.cyan(process.env.GOOGLE_CLIENT_SECRET))
        const googleId = profile.id
        const email = profile._json.email
        const picture = profile._json.picture

        const user = await User.findOne({ email })

        //if user doesn't exist, create a new user
        if (!user) {
          const newUser = new User({
            google: {
              googleId,
              accessToken,
              refreshToken
            },
            email,
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            picture
          })

          await newUser.save()
            .catch((error) => { throw handleSaveError(error) })
          return done(null, profile)
        }

        let update = false

        if (user.google?.googleId !== googleId && user.google) {
          user.google.googleId = googleId
          update = true
        }

        //if user exists, update accessToken if it is different
        if (user.google?.accessToken !== accessToken && user.google) {
          user.google.accessToken = accessToken
          update = true
        }

        if (!user.picture && user.google && picture) {
          user.picture = picture
          update = true
        }

        update && user.save()
          .catch((error) => { throw handleSaveError(error) })

        const userToken = user.generateToken()

        done(null, profile, { email, userId: user.id, ...userToken, picture })
      } catch (error: any) {
        return done(null, false, error)
      }
    }
  )
)

Passport.serializeUser((user, callback) => {


  callback(null, user as Express.User)
})

Passport.deserializeUser((user, done) => {
  done(null, user as Express.User)
})

export default Passport