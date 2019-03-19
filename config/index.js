require('dotenv').load();

const ENV = process.env.NODE_ENV || 'development';

module.exports = {
  env: ENV,
  isDevMode: ENV === 'development',
  app: {
    url: process.env.APP_URL,
    cfUrl: process.env.APP_CF_URL,
  },
  admin: {
    url: process.env.ADMIN_URL,
  },
  api: {
    port: process.env.PORT,
  },
  db: {
    host: process.env.DB_HOSTNAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.ENABLE_DB_SSL === 'true',
  },
  mailer: {
    contactEmail: process.env.MAIL_CONTACT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  },
};
