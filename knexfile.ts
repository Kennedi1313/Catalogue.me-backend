
module.exports = {
    client: "pg",
    connection:
    {
        type: "postgres",
        user: "wzfrnynfmqhxdk",
        password: "66370d3eabf7369a31ab838b0df0fbe98d53c69717be90767a2d40f7df100fd2",
        database: "dfni1lddohhipq",
        port: 5432,
        host: "ec2-54-157-78-113.compute-1.amazonaws.com",
        ssl: true,
        extra: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    }
        || 
    {
        database: "catalogueme",
        user: "postgres",
        password: "admin"
    },
    migrations: {
        tableName: "knex_migrations",
        directory: `${__dirname}/src/database/migrations`
    }
};