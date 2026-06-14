import { mailer } from "./mailer"

const FROM = "noreply@renderical.com"

export function sendResetPasswordEmail({
  user,
  url,
}: {
  user: { name: string; email: string }
  url: string
}) {
  return mailer.sendMail({
    from: FROM,
    to: user.email,
    subject: "Reset your password",
    html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to reset your password</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p>`,
  })
}

export function sendChangeEmailVerification({
  user,
  newEmail,
  url,
}: {
  user: { name: string; email: string }
  newEmail: string
  url: string
}) {
  return mailer.sendMail({
    from: FROM,
    to: user.email,
    subject: "Change your email address",
    html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to change your email to ${newEmail}</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p>`,
  })
}

export function sendDeleteAccountVerification({
  user,
  url,
}: {
  user: { name: string; email: string }
  url: string
}) {
  return mailer.sendMail({
    from: FROM,
    to: user.email,
    subject: "Delete your account",
    html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to delete your account</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p>`,
  })
}

export function sendVerificationEmail({
  user,
  url,
}: {
  user: { name: string; email: string }
  url: string
}) {
  return mailer.sendMail({
    from: FROM,
    to: user.email,
    subject: "Verify your email address",
    html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to verify your email</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p>`,
  })
}

export function sendOtpEmail({
  user,
  otp,
}: {
  user: { name: string; email: string }
  otp: string
}) {
  return mailer.sendMail({
    from: FROM,
    to: user.email,
    subject: "Your verification code",
    html: `<p>Hi ${user.name},</p><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 3 minutes. Do not share it with anyone.</p>`,
  })
}
