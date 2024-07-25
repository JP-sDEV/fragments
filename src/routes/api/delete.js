// src/routes/api/delete.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const path = require('path');
const logger = require('../../logger');

async function deleteFragment(req, res) {
    logger.info({ req }, '/DELETE');
    try {
        // path.parse refer to: https://nodejs.org/api/path.html
        const { name } = path.parse(req.params.id);
        let fragment;
        try {
            fragment = await Fragment.byId(req.user, name);
            await Fragment.delete(req.user, name);
        } catch (error) {
            return res.status(404).json(createErrorResponse(404, error.message));
        }

        // Set Content-Type header
        res.set({
            'Content-Length': fragment.size,
        });

        return res.status(200).send(createSuccessResponse());
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json(createErrorResponse(500, error.message));
    }
}

module.exports.deleteFragment = deleteFragment;
