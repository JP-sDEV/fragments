const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./auth');

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
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Routes
app.use('/', require('./routes'));

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
