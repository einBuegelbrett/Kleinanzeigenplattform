import { BaseSchema } from '@adonisjs/lucid/schema'
import {cuid} from "@adonisjs/core/helpers";

export default class extends BaseSchema {
  protected tableName = 'verifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('verification_id')
      table.boolean('verified').notNullable().defaultTo(false)
      table.uuid('token').notNullable().defaultTo(cuid())
      table.integer('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
