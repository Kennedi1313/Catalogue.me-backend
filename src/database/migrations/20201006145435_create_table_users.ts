import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.dropTableIfExists('users').createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('whatsapp').notNullable();
        table.string('email').notNullable();
        table.string('passwd').notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('users');
}