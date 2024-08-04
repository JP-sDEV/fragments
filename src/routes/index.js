// src/routes/index.js

const express = require('express');
const { hostname } = require('os');

// Author and version from package.json
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('../response.js');

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * @route GET /
 * @description Check if server is running without error(s)
 * @access Public
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
router.get('/', (req, res) => {
    // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching
    // Can store cache - has to be revalidated at each request
    const data = {
        author,
        githubUrl: 'https://github.com/JP-sDEV/fragments',
        version,
        hostname: hostname(),
    };

    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).json(createSuccessResponse(data));
});

module.exports = router;
