import { Router } from "express"
import passport from "../passport"

const authRouter = Router()

authRouter.get('/login', (req, res) => {
    res.send('Please login')
})

authRouter.get(
    '/login/google', 
    passport.authenticate('google', { failureRedirect: '/login' })
)

authRouter.get(
    '/login/google/success', 
    (req, res) => {
        console.log(req.params)
        res.send(req)
    }
)

authRouter.get('/google/failure', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/')
})

export default authRouter