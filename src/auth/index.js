// src/auth/index.js

const logger = require('../logger');

// Prefer Amazon Cognito
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
    module.exports = require('./cognito');
    logger.info('src/auth/index.js: using COGNITO');
}
// Also allow for an .htpasswd file to be used, but not in production
else if (process.env.HTPASSWD_FILE && process.NODE_ENV !== 'production') {
    module.exports = require('./basic-auth');
    logger.info('src/auth/index.js: using BASIC-AUTH');
}
// In all other cases, we need to stop now and fix our config
else {
    const message = 'missing env vars: no authorization configuration found';
    logger.warn(message);
    throw new Error(message);
}
