
module.exports = {
    client: "pg",
    connection: {
        database: "catalogueme",
        user: "postgres",
        password: "admin"
    },
    migrations: {
        tableName: "knex_migrations",
        directory: `${__dirname}/src/database/migrations`
    }
};