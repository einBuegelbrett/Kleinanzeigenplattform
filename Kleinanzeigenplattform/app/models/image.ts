import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Image extends BaseModel {
  @column({ isPrimary: true })
  declare image_id: number

  @column()
  declare path: string

  @column()
  declare item_id: number
}
