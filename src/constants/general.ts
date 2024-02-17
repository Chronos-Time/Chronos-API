import e from "express"
import { Types } from "mongoose"

export type IdI = Types.ObjectId | string

/**
 * The function `err` returns an object with a status code, message, and optional error, indicating a
 * custom error.
 * @param {number} status - The status parameter is a number that represents the HTTP status code of
 * the error. It indicates the type of error that occurred.
 * @param {string} message - The `message` parameter is a string that represents the error message. It
 * is a required parameter and should provide a clear and concise description of the error that
 * occurred.
 * @param {any} [error] - The `error` parameter is an optional parameter that can be used to pass any
 * additional error information or object. It can be of any type.
 * @returns an object with the following properties:
 * - status: a number representing the error status
 * - message: a string representing the error message
 * - error: an optional parameter representing additional error information
 * - isCustomErr: a boolean value set to true, indicating that this is a custom error object.
*/
export const err = (
    status: number,
    message: string,
    error?: any
) => {
    return {
        status,
        message,
        error,
        isCustomErr: true
    }
}

export type ErrT = {
    status: number
    message: string
    error: any
    isCustomeErr: boolean
}

/**
 * The function `handleSaveError` is a helper function that handles errors that occur when saving
 * data to the database. It returns an object with a status code, message, and optional error,
 * indicating a custom error.
 * @param {any} error - The `error` parameter is an object that represents the error that occurred.
 * @returns an object with the following properties:
 * - status: a number representing the error status
 * - message: a string representing the error message
 * - error: an optional parameter representing additional error information
 * - isCustomErr: a boolean value set to true, indicating that this is a custom error object.
*/
export const handleSaveError = (error: any) => {
    if (error.name === 'ValidationError') {
        const keys = Object.keys(error.errors)
        const errObj: { [key: string]: string } = {}

        const message = keys.map((key) => {
            errObj[key] = error.errors[key].message

            return error.errors[key].message
        }).join(', ')


        return err(400, message, errObj)
    } else if (error.code === 11000) {
        const message = Object.keys(error.keyValue)
            .map((key) => {
                return `${key}, `
            }).join(', ') + '- already exists'

        return err(409, message, error)
    } else {
        return err(500, 'Internal server error', error)
    }
}

/**
 * The function `separateCookies` takes a cookie string and returns an object with key-value pairs
 * representing the separate cookies.
 * @param {string} cookie - The `cookie` parameter is a string that represents a cookie.
 * @returns The function `separateCookies` returns an object with key-value pairs representing the
 * separate cookies.
 */
export const separateCookies = (cookie: string) => {
    return cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=')
        acc[key.trim()] = value
        return acc
    }, {} as { [key: string]: string })
}

/**
 * The function `capitalizeAllFirstLetters` takes a string and returns a new string where the first
 * @param {string} str - The parameter `str` is a string that represents the input sentence or phrase.
 * @returns {string} a new string where the first letter are capitalized
 */
export const capitalizeAllFirstLetters = (str: string) => {
    return str.split(' ').map((word) => {
        return word[0].toUpperCase() + word.slice(1)
    }).join(' ')
}

/**
 * It takes an array of IdI or a single IdI and returns an array of strings
 * @param {IdI | IdI[]} ids - IdI | IdI[]
 * @returns An array of strings.
*/
export const idToString = (ids: IdI | IdI[]): string[] => {
    if (!ids) return []
    if (!Array.isArray(ids)) return [ids.toString()]
    return ids.map(id => id.toString())
}

/**
 * It takes a string or an array of strings and returns an array of mongoose ObjectIds.
 * @param {string | string[]} ids - string | string[]
 * @returns An array of ObjectIds
*/
export const stringToId = (
    ids: string | string[] | Types.ObjectId | Types.ObjectId[]
): Types.ObjectId[] => {
    const returnString = (id: string | Types.ObjectId) => typeof id === 'string' ? id : id.toString()

    if (!Array.isArray(ids)) return [
        new Types.ObjectId(
            returnString(ids).length === 24 ? returnString(ids) : 24
        )
    ]
    return ids.map(id => new Types.ObjectId(
        returnString(id)
    ))
}

/**
 * The function `validateKeys` checks if all the keys in an object are included in a given array of
 * allowed keys.
 * @param obj - An object with string keys and any values.
 * @param {string[]} allowedKeys - The `allowedKeys` parameter is an array of strings that represents
 * the keys that are allowed in the `obj` parameter.
 * @returns The function `validateKeys` returns a boolean value if keys are valid.
 */
export const validateKeys = (obj: { [keys: string]: any }, allowedKeys: string[]) => {
    try {
        const keys = Object.keys(obj)
        if (keys.length === 0) throw 'invalid object'
        return keys.every(key => allowedKeys.includes(key))
    } catch {
        return false
    }
}
