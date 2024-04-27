import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare user_id: number

  @column()
  declare firstname: string

  @column()
  declare lastname: string

  @column()
  declare password: string

  @column()
  declare email: string

  @column()
  declare username: string

  @column()
  declare profile_picture: string

  @column()
  declare verified: boolean

  @column()
  declare token: string
}
