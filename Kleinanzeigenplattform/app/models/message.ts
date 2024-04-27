import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare message_id: number

  @column()
  declare sender_id: number

  @column()
  declare item_id: number

  @column()
  declare message: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime
}
