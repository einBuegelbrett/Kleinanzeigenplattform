import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('user_id').primary()
      table.string('firstname').notNullable()
      table.string('lastname').notNullable()
      table.string('password',).notNullable()
      table.string('email').notNullable().unique()
      table.string('username').notNullable().unique()
      table.string('profile_picture').notNullable().defaultTo('unknown.png')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
