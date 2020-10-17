import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.dropTableIfExists('items').createTable('items', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.decimal('price').notNullable();
        table.string('info').notNullable();
        table.string('category').notNullable();
        table.integer('ativo').notNullable();
        table.string('avatar');
        table.integer('shop_id').notNullable().references('id').inTable('shops').onDelete('CASCADE');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('items');
}