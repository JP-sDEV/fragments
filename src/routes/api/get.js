const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */

module.exports = (req, res) => {
    const data = { fragments: [] };

    res.status(200).json(createSuccessResponse(data));
};
