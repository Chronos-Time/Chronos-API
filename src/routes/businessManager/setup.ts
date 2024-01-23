import { Router, Request } from "express"
import { auth } from '../../middleware/auth'
import Business from '../../models/Business/index.model'
import { err, handleSaveError } from '../../constants/general'


const SetUpRouter = Router()





export default SetUpRouter