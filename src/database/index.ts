import knex from 'knex'

const db = knex({
    client: "pg",
    connection: 
            process.env.DATABASE_URL_SSL || 
        {
            database: "catalogueme",
            user: "postgres",
            password: "admin"
        },
    migrations: {
        tableName: "knex_migrations",
        directory: `${__dirname}/src/database/migrations`
    }
});

export default db;