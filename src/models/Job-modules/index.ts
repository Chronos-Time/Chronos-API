import { Schema, InferSchemaType, model, Types, Model } from 'mongoose'
import { TimeI } from '../../constants/time'

interface JobModuleI {
    name: string
    business: Types.ObjectId
    /**
     * main job type ex 'Personal Fitness Trainer', 'Hair Stylist'
     * 
     */
    serviceType: string
    /**
     * metaData that is used to find this job module
     * ex. car washing, cars, car detailing, etc.
     */
    tags: string[]
    /**
     * In unix Time
     */
    duration: number
    prepTime: number
    description: string
    /**
     * This will be taken from the business schema
     */
    unavaiability: {
        /**
         * In UTC
         */
        start: TimeI
        /**
         * In UTC
         */
        end: TimeI
    }[]
    /**
     * defaults to the Businesses working hours
     * but can be updated by data
     */
    customHours: [
        {
            name: {
                type: String,
                default: 'Sunday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Monday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Tuesday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Wednesday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Thursday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Friday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: {
                type: String,
                default: 'Saturday'
            },
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        }
    ]

    //day 2:
    /*
    discounts: {
        name: string
        distanceOut: number
    }[]

    */
}

interface JobModuleMethodsI {

}

type JobModuleModelT = Model<JobModuleI, {}, JobModuleMethodsI>

const jobModuleSchema = new Schema<JobModuleI, JobModuleModelT, JobModuleMethodsI>({
    name: {
        type: String,
        required: true,
    },
    business: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    prepTime: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    customHours: [
        {
            name: 'Sunday',
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: 'Monday',
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: 'Tuesday',
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: 'Wednesday',
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: 'Thursday',
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: 'Friday',
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
        {
            name: 'Saturday',
            hour: {
                type: Number,
                start: {
                    default: 18
                },
                end: {
                    default: 34
                }
            }
        },
    ],
    unavaiability: [{
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        }
    }]
})

jobModuleSchema.pre('save', async function (next) {
    const jobModule = this

    next()
})

export type JobModuleT = InferSchemaType<typeof jobModuleSchema>

const JobModule = model('Job_Module', jobModuleSchema)

export default JobModule