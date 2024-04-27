import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'image'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('image_id').primary()
      table.string('path').notNullable()
      table.integer('item_id').notNullable().references('item_id').inTable('item').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
