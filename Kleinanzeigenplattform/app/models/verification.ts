import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Verification extends BaseModel {
  @column({ isPrimary: true })
  declare verification_id: number

  @column()
  declare verified: boolean

  @column()
  declare token: string

  @column()
  declare user_id: number
}
