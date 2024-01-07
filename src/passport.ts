import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:5001/auth/login/google/success',
      scope: ['profile', 'email'],
      passReqToCallback: false
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile)
      return done(null, profile)
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user as Express.User)
})

export default passport