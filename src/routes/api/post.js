// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');
require('dotenv').config();

module.exports = async (req, res) => {
    logger.info('/POST');

    try {
        // Check if request body is a Buffer
        if (!Buffer.isBuffer(req.body)) {
            logger.warn(
                { reqBody: req.body, contentType: req.headers['content-type'] },
                'Unsupported Content Types'
            );
            return res.status(415).json(createErrorResponse(415, 'Unsupported Content Type'));
        }

        if (!process.env.API_URL) {
            logger.info('API_URL environment variable is not set.');
            res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
            return;
        }

        const { type } = contentType.parse(req.headers['content-type']);

        logger.info({ type }, 'Content type header parsed');

        // Create a new Fragment
        let newFragment = new Fragment({
            ownerId: req.user,
            type: type,
        });

        logger.info({ newFragment: newFragment }, 'Fragment Data created');

        // Save fragment content
        await newFragment.setData(req.body);
        logger.info('Fragment Buffer Data saved');

        logger.info({ newFragmentId: newFragment.id }, 'Fragment ID after save');

        // Save fragment meta data
        await newFragment.save();
        logger.info('Fragment Metadata saved');

        // Generate URL for the new fragment
        const location = new URL(`/v1/fragments/${newFragment.id}`, process.env.API_URL);

        // Set Location header in response
        res.setHeader('Location', location.toString());

        // logger.info({ location: location.toString() }, 'Fragment Location set');
        logger.info({ resStatus: 201, newFragmentId: newFragment.id }, '/POST response success');
        res.status(201).json(createSuccessResponse({ fragment: newFragment }));
    } catch (err) {
        const errorCode = err.status || 500;
        logger.error({ status: errorCode }, `: ${err.message}`);
        res.status(errorCode).json(createErrorResponse(errorCode, err.message));
    }
};
