//  src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { getFragments, getFragmentById } = require('./get');

// Middleware
// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
    express.raw({
        inflate: true,
        limit: '5mb',
        type: (req) => {
            // See if we can parse this content type. If we can, `req.body` will be
            // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
            // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
            const { type } = contentType.parse(req);
            if (!Fragment.isSupportedType(type)) {
                // log type if not supported
                logger.error(`${type} given is not supported`);
            }
            return Fragment.isSupportedType(type);
        },
    });

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', getFragments);
router.get('/fragments/:id', getFragmentById);

// Define fragments route
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
