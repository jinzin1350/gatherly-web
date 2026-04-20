import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Gatherly <onboarding@resend.dev>'

export async function sendEmail({
  to,
  subject,
  template,
}: {
  to: string
  subject: string
  template: ReactElement
}): Promise<void> {
  const html = await render(template)

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
}
