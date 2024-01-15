import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import c from 'ansi-colors'
import User from './models/user/index.model'
import { err, handleSaveError } from './constants/general'

const Passport = new passport.Passport()

Passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:5001/auth/login/google/callback',
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
      // passReqToCallback: true,
      state: true,
      // accessType: 'offline'
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
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
        //if user exists, update googleId if they are different
        else if (user.google?.googleId !== googleId && user.google) {
          user.google.googleId = googleId
          user.save()
            .catch((error) => { throw handleSaveError(error) })
        }

        //if user exists, update accessToken if it is different
        if (user.google?.accessToken !== accessToken && user.google) {
          user.google.accessToken = accessToken
          user.save()
            .catch((error) => { throw handleSaveError(error) })
        }

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