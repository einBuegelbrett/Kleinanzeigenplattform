import vine from '@vinejs/vine'

export const profileValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().toLowerCase(),
    firstname: vine.string().trim().minLength(1).maxLength(50),
    lastname: vine.string().trim().minLength(1).maxLength(50),
    profile_picture: vine.file({
      size: '10mb',
      extnames: ['jpg', 'png', 'jpeg', 'gif']
    }).nullable()
  })
)

export const messageValidator = vine.compile(
  vine.object({
    message: vine.string().trim().minLength(1).maxLength(100)
  })
)

export const emailValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().toLowerCase().nullable()
  })
)
