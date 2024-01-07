import e from "express"

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
    if(error.name === 'ValidationError') {
        const keys = Object.keys(error.errors)
        const errObj: {[key: string]: string} = {}

        const message = keys.map((key) => {
            errObj[key] = error.errors[key].message

            return error.errors[key].message
        }).join(', ')


        return err(400, message, errObj)
    } else if(error.code === 11000) {
        const message = Object.keys(error.keyValue)
            .map((key) => {
                return `${key}, `
            }).join(', ') + '- already exists'

        return err(400, message, error)
    } else {
        return err(500, 'Internal server error', error)
    }
}