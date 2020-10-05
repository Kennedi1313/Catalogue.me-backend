import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.dropTableIfExists('schedule').createTable('schedule', table => {
        table.increments('id').primary();
        
        table.integer('week_day').notNullable();
        table.integer('from').notNullable();
        table.integer('to').notNullable();
        
        table.integer('shop_id').notNullable().references('id').inTable('shops').onDelete('CASCADE');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('schedule');
}