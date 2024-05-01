import vine from '@vinejs/vine'

const regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,16}$/

export const signInValidator = vine.compile(
  vine.object({
    firstname: vine.string().trim().minLength(1).maxLength(50),
    lastname: vine.string().trim().minLength(1).maxLength(50),
    password: vine.string().trim().minLength(8).maxLength(16).regex(regexPassword),
    repeat_password: vine.string().trim().minLength(8).maxLength(16).regex(regexPassword),
    email: vine.string().trim().email().toLowerCase(),
    username: vine.string().trim().minLength(1).maxLength(15),
  })
)

export const logInValidator = vine.compile(
  vine.object({
    email: vine.string().trim().minLength(1).email().toLowerCase(),
    password: vine.string().trim().minLength(1),
  })
)
