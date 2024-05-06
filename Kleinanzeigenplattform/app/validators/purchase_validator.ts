import vine from '@vinejs/vine'

const regexDate = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;

export const creditCardValidator = vine.compile(
  vine.object({
    cardNumber: vine.string().trim().creditCard(),
    expirationDate: vine.string().trim().minLength(5).maxLength(5).regex(regexDate),
    cvv: vine.string().trim().minLength(3).maxLength(3),
    price: vine.number().min(0).max(9999999999.99).decimal(2).positive()
  })
)
