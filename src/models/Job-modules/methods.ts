import { deepFind, err, handleSaveError } from "../../constants/general"
import JMItem, { JMItemDocT, JMItemI, PostJMItemT, isChargeType } from "./Items"
import { JobModuleDocT, answersT, jobModuleSchema } from "./index.model"

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

jobModuleSchema.methods.deepFind = function (
    this: JobModuleDocT,
    path: string[]
): JMItemI | undefined {
    try {
        const jobModule = this
        let current: JMItemI = undefined

        for (let i = 0; i < path.length; ++i) {
            if (i === 0) {
                current = jobModule.items.find(item => item.name === path[i])
            } else {
                current = current.items.find(item => item.name === path[i])
            }

            if (current === undefined) {
                throw undefined
            }
        }

        return current
    } catch (e) {
        return undefined
    }
}

jobModuleSchema.methods.deepFindAndUpdate = function (
    this: JobModuleDocT,
    path: string,
    data: JMItemI
): JobModuleDocT | undefined | any {
    try {
        const jobModule = this
        const keys = path.split('.')

        const flattendJM = jobModule.flatten()
        flattendJM[path] = data

        const result: JMItemI[] = [];

        for (const [key, value] of Object.entries(flattendJM)) {
            const path = key.split('.');
            let currentObj: JMItemI = {
                name: '', items: [],
                description: "",
                addedTime: 0,
                price: 0,
                isRequired: false,
                chargeType: "Subscription Only",
                questionType: "Number",
                minSelection: 0
            };

            for (let i = 0; i < path.length; i++) {
                const propName = path[i];
                let foundObj = currentObj.items.find(item => item.name === propName);
                if (!foundObj) {
                    foundObj = {
                        name: '', items: [],
                        description: "",
                        addedTime: 0,
                        price: 0,
                        isRequired: false,
                        chargeType: "Subscription Only",
                        questionType: "Number",
                        minSelection: 0
                    };
                    currentObj.items.push(foundObj);
                }
                currentObj = foundObj;
            }
            Object.assign(currentObj, value);
        }

        return result.concat(result[0].items)


        // function recursiveFindAndUpdate(
        //     currentObj: {
        //         items: JMItemI[]
        //         [key: string]: any,
        //     },
        //     remainingKeys: string[]
        // ) {
        //     if (remainingKeys.length === 0) {
        //         return false;
        //     }

        //     const key = remainingKeys[0];
        //     const nextKeys = remainingKeys.slice(1);

        //     if (Array.isArray(currentObj.items)) {
        //         for (let item of currentObj.items) {
        //             if (item.name === key) {
        //                 if (nextKeys.length === 0) {
        //                     // Found the target object, update its value
        //                     Object.assign(item, data);
        //                     return true;
        //                 } else {
        //                     // Continue to search deeper
        //                     if (recursiveFindAndUpdate(item, nextKeys)) {
        //                         return true;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     return false; // Path not found
        // }

        // recursiveFindAndUpdate(jobModule, keys)

        // jobModule.items = result

        return jobModule.deepFind(path.split('.'))
    } catch (e) {
        return undefined
    }
}

jobModuleSchema.methods.flatten = function (
    this: JobModuleDocT
): { [key: string]: JMItemDocT } {
    try {
        const jobModule = this
        // function flattenByName(obj: Thing): Flattened {
        const result: { [key: string]: JMItemDocT } = {};

        function recurse(
            currentObj: { [key: string]: any, items: JMItemI[] },
            currentPath: string
        ) {
            if (typeof currentObj !== 'object' || currentObj === null) {
                return;
            }

            if (currentObj.name) {
                const newPath = currentPath ? `${currentPath}.${currentObj.name}` : currentObj.name;

                const { name, items, ...rest } = currentObj._doc
                result[newPath] = rest;

                if (Array.isArray(items)) {
                    for (let item of items) {
                        recurse(item, newPath)
                    }
                }
            }
            // }

        }
        recurse(jobModule, '')
        return result
    } catch (e) {
        return undefined
    }
}



jobModuleSchema.methods.validRequest = function (
    this: JobModuleDocT,
    answers: answersT[]
): boolean {
    try {
        const jobModule = this

        answers.forEach(answer => {
            if (jobModule.deepFind(answer.path.split('.')) === undefined) {
                throw undefined
            }
        })

        return true
    } catch (e) {
        return false
    }
}