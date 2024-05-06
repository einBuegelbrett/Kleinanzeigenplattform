import vine from '@vinejs/vine'

export const searchbar = vine.compile(
  vine.object({
    search: vine.string().trim().maxLength(50).nullable(),
  })
)

export const submitItem = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(50),
    price: vine.number().min(0).max(9999999999.99).decimal(2).positive(),
    description: vine.string().trim().minLength(1).maxLength(250),
  })
)
