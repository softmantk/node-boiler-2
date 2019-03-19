const access = require('./access');
const role = require('./role');

module.exports = (action, resource) => {
  const middlewares = [];
  middlewares.push(access());
  middlewares.push(role(action, resource));
  return middlewares;
};
