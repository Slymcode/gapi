require('dotenv').config()


module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    pool: {
      max: 3,
      min: 1,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        // Ref.: https://github.com/brianc/node-postgres/issues/2009
        rejectUnauthorized: false,
      },
      keepAlive: true,        
    },      
    ssl: true,
    define: {
      timestamps: false,
    },
  },
}