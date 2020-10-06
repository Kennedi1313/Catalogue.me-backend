import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.dropTableIfExists('shops').createTable('shops', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('whatsapp').notNullable();
        table.string('avatar').notNullable();
        table.string('bio').notNullable();
        
        table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('shops');
}