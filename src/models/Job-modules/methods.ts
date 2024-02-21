import { err, handleSaveError } from "../../constants/general"
import JMItem, { PostJMItemT, isChargeType } from "./Items"
import { JobModuleDocT, jobModuleSchema } from "./index.model"

jobModuleSchema.methods.createItem = async function (
    item: PostJMItemT
): Promise<JobModuleDocT> {
    try {
        const jobModule = this
        const {
            name,
            chargeType
        } = item

        if (jobModule.items.filter(jmItem => jmItem.name === name).length) {
            throw err(400, 'Job module item already exists with this name')
        }

        if (chargeType) {
            if (!isChargeType(chargeType)) {
                throw err(400, `Charge Type provided in item-${name} is invalid`)
            }
        }

        const newItem = new JMItem(item)

        jobModule.items.push(newItem)

        await jobModule.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        return jobModule
    } catch (e) {
        throw e
    }
}
jobModuleSchema.methods.remItem = async function (
    name: string
): Promise<JobModuleDocT> {
    try {
        const jobModule = this

        const updatedItems = [];

        for (const item of jobModule.items) {
            if (item.name.toLowerCase() !== name.toLowerCase()) {
                updatedItems.push(item);
            }
        }

        jobModule.items = updatedItems

        await jobModule.save()
            .catch(e => {
                throw handleSaveError(e)
            })

        return jobModule
    } catch (e) {
        throw e
    }
}