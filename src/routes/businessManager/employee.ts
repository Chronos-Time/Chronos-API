import { Router, Request } from 'express'
import { businessAdminAuth } from '../../middleware/businessAdmin'

const EmployeeRouter = Router()
EmployeeRouter.use('/business/:businessId', businessAdminAuth)

EmployeeRouter.post('/employee', (req: Request, res) => {

})

export default EmployeeRouter