// src/routes/api/put.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
require('dotenv').config();

module.exports = async (req, res) => {
    logger.info('api/put.js /PUT request received');
    try {
        if (!Buffer.isBuffer(req.body)) {
            logger.warn(
                { reqBody: req.body, contentType: req.headers['content-type'] },
                'Unsupported Content Types'
            );
            return res.status(415).json(createErrorResponse(415, 'Unsupported Content Type'));
        }

        const id = req.params.id;
        logger.info({ 'req.params': req.params }, '/PUT: Parameters received');

        let fragment;
        try {
            logger.info('/PUT: Attempting to retrieve fragment');
            logger.info(`api/put.js /PUT: req.user: ${req.user}`);
            logger.info(`api/put.js /PUT: fragment.id: ${id}`);

            fragment = await Fragment.byId(req.user, id);
            logger.info({ fragment: fragment }, '/PUT: Fragment to edit');
            await fragment.setData(req.body);
            await fragment.save();

            logger.info(`/PUT: Fragment with ID ${id} edited successfully`);
        } catch (err) {
            const errorCode = err.status || 500;
            logger.error(`api/put.js /PUT failed to edit fragment (${errorCode}): ${err.message}`);
            return res.status(errorCode).json(createErrorResponse(errorCode, err.message));
        }

        // Set Content-Length header
        if (fragment && fragment.size) {
            res.set('Content-Length', fragment.size);
        }

        return res.status(200).send(createSuccessResponse({ fragment: fragment }));
    } catch (err) {
        const errorCode = err.status || 500;
        logger.error(`api/delete.js /PUT failed (${errorCode}): ${err.message}`);
        return res.status(errorCode).json(createErrorResponse(errorCode, err.message));
    }
};
