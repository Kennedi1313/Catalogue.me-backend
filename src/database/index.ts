import { SSM } from 'aws-sdk';
import knex from 'knex'

const db = knex({
    client: "pg",
    connection: 
        {
            user: "wzfrnynfmqhxdk",
            password: "66370d3eabf7369a31ab838b0df0fbe98d53c69717be90767a2d40f7df100fd2",
            database: "dfni1lddohhipq",
            port: 5432,
            host: "ec2-54-157-78-113.compute-1.amazonaws.com",
            ssl: true
        } 
});

export default db;