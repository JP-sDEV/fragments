// src/model/data/index.js

const logger = require('../../logger');

if (process.NODE_ENV !== 'production') {
    logger.info('using in memory db');
    module.exports = require('./memory');
} else {
    // Amazon Service
    logger.info('using Amazon db');
}
