import vine from '@vinejs/vine'

const regexPrice = /^(?!0{1,11}(,0{2})?$)\d{1,10}(?:[.,]\d{1,2})?$/

export const searchbar = vine.compile(
  vine.object({
    search: vine.string().trim().maxLength(50),
  })
)

export const submitItem = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(50),
    price: vine.string().trim().minLength(0).maxLength(13).regex(regexPrice),
    description: vine.string().trim().minLength(1).maxLength(250),
  })
)
