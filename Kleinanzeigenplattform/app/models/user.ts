import { BaseModel, column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import {withAuthFinder} from "@adonisjs/auth";
import hash from '@adonisjs/core/services/hash'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
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
