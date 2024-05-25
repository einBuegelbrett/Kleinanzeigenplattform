import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Item extends BaseModel {
  @column({ isPrimary: true })
  declare item_id: number

  @column()
  declare title: string

  @column()
  declare description: string

  // With the validator we have made sure that the price is in the correct format, so we can just save it as a string so that we keep the format with the 2 decimals
  @column()
  declare price: string

  @column()
  declare active: boolean

  @column()
  declare user_id: number
}
