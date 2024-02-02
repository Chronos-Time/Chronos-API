import { model } from 'mongoose'


export const userSelect = {
    _id: 1,
    firstName: 1,
    lastName: 1,
    email: 1,
    phone: 1
}

export const businessSelect = {
    newEmail: 0
}

export const businessPopulate = [
    {
        path: 'admins',
        model: 'BusinessAdmin',
        select: {
            businesses: 0,
            activeBusinesses: 0
        },
        populate: {
            path: 'user',
            select: userSelect
        }
    },
    {
        path: 'employees',
        model: 'Employee',
        select: {
            attachedBusinesses: 0,
            activelyEmployedTo: 0
        },
        populate: {
            path: 'user',
            select: userSelect
        }
    },
    {
        path: 'address',
        model: 'Address',
    }
]