const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const config = require('../config');
const log = require('./helpers/logger');
const { ApiError } = require('./helpers/server-error');
const API = require('./controllers/index');

const PORT = config.api.port || 1337;

const app = express();

const whitelist = [config.app.url, config.admin.url, config.app.cfUrl];
app.use(cors({
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(morgan('dev', { stream: log.stream }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

API.init(app);

app.use(ApiError.ApiErrorMiddleware);
app.use(ApiError.UnknownErrorMiddleware);
app.use(ApiError.NotFoundMiddleware);

function startServer() {
  process.title = 'nodejs'
  app.listen(PORT, () => log.info(`Server listening on port ${PORT}`));
}

module.exports = {
  startServer,
  app,
};
