import mailChimp from '@mailchimp/mailchimp_transactional'
import { text } from 'express'
import c from 'ansi-colors'

const mct = mailChimp(process.env.MAILCHIMP_API_KEY!)
const hostEmail = process.env.HOST_EMAIL!

/**
 * Sends an email using the Mailchimp Transactional API.
 *
 * @param to The email address of the recipient.
 * @param subject The subject line of the email.
 * @param name The name of the recipient (optional).
 * @param text The body of the email (optional).
 * @returns The response from the Mailchimp API.
 */
export const sendEmail = async (
    to: string,
    subject: string,
    name?: string,
    text?: string
) => {
    // Create the email message object.
    const message = {
        from_email: hostEmail, // Replace with your Mailchimp-registered sender email address.
        to: [
            {
                email: to,
                name
            }
        ],
        subject,
        text
    }

    // Send the email using the Mailchimp Transactional API.
    const response = await mct.messages.send({
        message
    })

    // Return the response from the Mailchimp API.
    return response
}


export default mct