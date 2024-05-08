const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Author and version from package.json
const { author, version } = require('../package.json');

const logger = require('./logger');
const pino = require('pino-http')({
    logger,
});

const app = express();

// Middleware
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

/**
 * @route GET /
 * @description Check if server is running without error(s)
 * @access Public
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.get('/', (req, res) => {
    // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching
    // Can store cache - has to be revalidated at each request
    res.setHeader('Cache-Control', 'no-cache');

    res.status(200).json({
        status: 'ok',
        author,
        githubUrl: 'https://github.com/JP-sDEV/fragments',
        version,
    });
});

/**
 * Middleware for requesting unknown resource
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        error: {
            message: 'not found',
            code: 404,
        },
    });
});

/**
 * Middleware for Server Errors
 * @param {object} err - Express error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
app.use((err, req, res) => {
    // If no error response given, use generic "500" error code
    const status = err.status || 500;
    const message = err.message || 'unable to process request';

    // If this is a server error, log something so we can see what's going on
    if (status > 499) {
        logger.error({ err }, `Error processing request`);
    }

    res.status(status).json({
        status: 'error',
        error: {
            message,
            code: status,
        },
    });
});

module.exports = app;
