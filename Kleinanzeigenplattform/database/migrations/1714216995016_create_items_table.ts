import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('item_id').primary()
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.string('price').notNullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.integer('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
