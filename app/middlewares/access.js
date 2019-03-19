const CognitoExpress = require('cognito-express');
const config = require('../../config');
const db = require('../models');
const { ApiError, E } = require('../helpers/server-error');

const cognitoExpress = new CognitoExpress({
  region: config.cognito.region,
  cognitoUserPoolId: config.cognito.userPoolId,
  tokenUse: 'id',
  tokenExpiration: 3600000,
});
/*eslint-disable*/
module.exports = () => (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(403).send("No authorization header");
  if (!req.headers.authorization.includes("Bearer "))
    return res.status(401).send("ID token missing from header");
  const accessTokenFromClient = req.headers.authorization.replace("Bearer ", "");
  cognitoExpress.validate(accessTokenFromClient, async (err, response) => {
    if (err) return res.status(401).send(err);
    try {
      const user = await db.User.findOne({ where: { sub: response.sub } });
      req.user = user.get();
      req.user.role = response["cognito:groups"];
      next();
    } catch (error) {
      next(new ApiError(E.INTERNAL_SERVER_ERROR));
    }
  });
};
