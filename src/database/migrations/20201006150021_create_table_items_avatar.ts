import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.dropTableIfExists('items-avatar').createTable('items-avatar', table => {
        table.increments('id').primary();
        table.string('avatar').notNullable();
        table.integer('item_id').notNullable().references('id').inTable('items').onDelete('CASCADE');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('items');
}