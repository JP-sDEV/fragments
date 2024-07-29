// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');
require('dotenv').config();

module.exports = async (req, res) => {
    logger.info({ req }, '/POST');

    try {
        if (!Buffer.isBuffer(req.body)) {
            logger.warn({ req }, 'Unsupported Content Types');
            return res.status(415).json(createErrorResponse(415, 'Unsupported Content Type'));
        }

        console.log('API_URL: ', process.env.API_URL);

        // Create fragment if type is supported
        const fragmentData = req.body;
        const { type } = contentType.parse(req.headers['content-type']);

        logger.info({ type: type }, 'Content type header');

        let newFragment = new Fragment({
            ownerId: req.user,
            type: type,
        });

        logger.info({ newFragment: newFragment }, 'Fragment Data');

        // Save fragment meta data
        await newFragment.save();
        logger.info({ newFragmentId: newFragment.id }, 'Fragment ID after save');

        // Save fragment content
        await newFragment.setData(fragmentData);

        const location = new URL(`/v1/fragments/${newFragment.id}`, process.env.API_URL);
        logger.info({ location: location }, 'Fragment Location: ');
        res.setHeader('Location', location.toString());

        // const apiUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`; // ISSUE: process.env.API_URL is undefined
        // const location = new URL(`/v1/fragments/${newFragment.id}`, apiUrl);
        // res.setHeader('Location', location.toString());

        logger.info({ res }, '/POST response success');
        res.status(201).json(createSuccessResponse({ fragment: newFragment }));
    } catch (err) {
        logger.error({ err, req }, '422: Cannot process type');
        res.status(422).json(createErrorResponse(422, 'Cannot process request'));
    }
};
