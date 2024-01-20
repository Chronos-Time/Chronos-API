import mailChimp from '@mailchimp/mailchimp_transactional'
import { text } from 'express'
import c from 'ansi-colors'

const mct = mailChimp(process.env.MAILCHIMP_API_KEY!)
const hostEmail = process.env.HOST_EMAIL!

export const sendEmail = async (
    to: string,
    subject: string,
    name?: string,
    text?: string
) => {
    const response = await mct.messages.send({
        message: {
            from_email: hostEmail,
            to: [
                {
                    email: to,
                    name
                }
            ],
            subject,
            text
        }
    })

    return response
}

export default mct