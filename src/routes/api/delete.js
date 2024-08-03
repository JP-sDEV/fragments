// src/routes/api/delete.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

async function deleteFragment(req, res) {
    logger.info('api/delete.js /DELETE request received');
    try {
        const id = req.params.id;
        logger.info({ 'req.params': req.params }, '/DELETE: Parameters received');

        let fragment;
        try {
            logger.info('/DELETE: Attempting to retrieve fragment');
            fragment = await Fragment.byId(req.user, id);
            logger.info({ fragment: fragment }, '/DELETE: Fragment to delete');

            await Fragment.delete(fragment.ownerId, fragment.id);

            logger.info(`/DELETE: Fragment with ID ${id} deleted successfully`);
        } catch (err) {
            const errorCode = err.status || 500;
            logger.error(
                `api/delete.js /DELETE failed to delete fragment (${errorCode}): ${err.message}`
            );
            return res.status(errorCode).json(createErrorResponse(errorCode, err.message));
        }

        // Set Content-Length header
        if (fragment && fragment.size) {
            res.set('Content-Length', fragment.size);
        }

        return res.status(200).send(createSuccessResponse());
    } catch (err) {
        const errorCode = err.status || 500;
        logger.error(`api/delete.js /DELETE failed (${errorCode}): ${err.message}`);
        return res.status(errorCode).json(createErrorResponse(errorCode, err.message));
    }
}

module.exports.deleteFragment = deleteFragment;
