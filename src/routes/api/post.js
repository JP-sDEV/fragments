// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');

module.exports = async (req, res) => {
    logger.info({ req }, '/POST');

    try {
        if (!Buffer.isBuffer(req.body)) {
            logger.warn({ req }, 'Unsupported Content Types');
            return res.status(415).json(createErrorResponse(415, 'Unsupported Content Type'));
        }

        const fragmentData = req.body;
        const { type } = contentType.parse(req.headers['content-type']);

        let newFragment = new Fragment({
            ownerId: req.user,
            type: type,
        });

        await newFragment.save();
        await newFragment.setData(fragmentData);

        const apiUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
        const location = new URL(`/v1/fragments/${newFragment.id}`, apiUrl);

        res.setHeader('Location', location.toString());

        logger.info({ res }, '/POST response success');
        res.status(201).json(createSuccessResponse({ fragment: newFragment }));
    } catch (err) {
        logger.warn({ req }, '422: Cannot proccess type');
        res.status(422).json(createErrorResponse(err));
    }
};
