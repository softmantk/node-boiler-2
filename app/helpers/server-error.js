const _ = require('lodash');
const Sequelize = require('sequelize');
const E = require('./internal-error-codes');
const log = require('./logger');

class ApiError extends Error {
  constructor(customError) {
    super(customError.message);
    _.assign(this, customError);
  }

  get response() {
    return {
      message: this.message,
      code: this.code,
      error: this.error,
    };
  }

  static ApiErrorMiddleware(err, req, res, next) {
    log.info(`ApiErrorMiddleware ${err}`);
    if (err instanceof ApiError) {
      if (err.responseCode === 500) {
        return res.status(err.responseCode).json(err.response);
      }
    }
    if (err instanceof Sequelize.UniqueConstraintError) {
      return res
        .status(E.UNIQUE_CONSTRAINT_ERROR.responseCode)
        .send({
          code: E.UNIQUE_CONSTRAINT_ERROR.code,
          error: E.UNIQUE_CONSTRAINT_ERROR.error,
          message: E.UNIQUE_CONSTRAINT_ERROR.message,
        });
    }
    if (err instanceof Sequelize.ValidationError) {
      const validationErrors = err.errors.map(error => ({
        field: error.path,
        message: error.message,
      }));
      return res
        .status(E.VALIDATION_ERRORS.responseCode)
        .send({
          code: E.VALIDATION_ERRORS.code,
          error: E.VALIDATION_ERRORS.error,
          message: E.VALIDATION_ERRORS.message,
          fields: validationErrors,
        });
    }
    return next(err);
  }

  static UnknownErrorMiddleware(err, req, res, next) { // eslint-disable-line
    log.info(`UnknownErrorMiddleware ${err}`);
    res
      .status(E.INTERNAL_SERVER_ERROR.responseCode)
      .send({
        code: E.INTERNAL_SERVER_ERROR.code,
        error: E.INTERNAL_SERVER_ERROR.error,
        message: E.INTERNAL_SERVER_ERROR.message,
      });
  }

  static NotFoundMiddleware(req, res) {
    const err = new ApiError(E.NOT_FOUND);
    log.info(`NotFoundMiddleware ${err}`);
    res.status(err.responseCode).json(err.response);
  }
}

module.exports = { ApiError, E };
