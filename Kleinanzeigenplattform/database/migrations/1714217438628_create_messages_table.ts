import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('message_id').primary()
      table.integer('sender_id').notNullable().references('user_id').inTable('user').onDelete('CASCADE')
      table.integer('item_id').notNullable().references('item_id').inTable('item').onDelete('CASCADE')
      table.string('message').notNullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
