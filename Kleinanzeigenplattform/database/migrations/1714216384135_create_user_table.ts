import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('user_id').primary()
      table.string('firstname').notNullable()
      table.string('lastname').notNullable()
      table.string('password',).notNullable()
      table.string('email').notNullable().unique()
      table.string('username').notNullable().unique()
      table.string('profile_picture').nullable().defaultTo('unknown.png')
      table.boolean('verified').nullable().defaultTo(false)
      table.string('token').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
