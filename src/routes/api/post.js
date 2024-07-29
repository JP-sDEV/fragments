// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');
require('dotenv').config();

module.exports = async (req, res) => {
    logger.info({ req }, '/POST');

    try {
        // Check if request body is a Buffer
        if (!Buffer.isBuffer(req.body)) {
            logger.warn(
                { reqBody: req.body, contentType: req.headers['content-type'] },
                'Unsupported Content Types'
            );
            return res.status(415).json(createErrorResponse(415, 'Unsupported Content Type'));
        }

        const { type } = contentType.parse(req.headers['content-type']);

        logger.info({ type }, 'Content type header parsed');

        // Create a new Fragment
        let newFragment = new Fragment({
            ownerId: req.user,
            type: type,
        });

        logger.info({ newFragment: newFragment }, 'Fragment Data created');

        // Save fragment meta data
        await newFragment.save();
        logger.info({ newFragmentId: newFragment.id }, 'Fragment ID after save');

        // Save fragment content
        await newFragment.setData(req.body);

        // Generate URL for the new fragment
        const location = new URL(`/v1/fragments/${newFragment.id}`, process.env.API_URL);

        // Set Location header in response
        res.setHeader('Location', location.toString());

        logger.info({ location: location.toString() }, 'Fragment Location set');
        logger.info({ resStatus: 201, newFragmentId: newFragment.id }, '/POST response success');
        res.status(201).json(createSuccessResponse({ fragment: newFragment }));
    } catch (err) {
        logger.error({ err, req, stack: err.stack }, '422: Cannot process request');
        res.status(422).json(createErrorResponse(422, 'Cannot process request'));
    }
};
