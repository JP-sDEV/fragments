// src/routes.api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const path = require('path');
const logger = require('../../logger');
const markdownit = require('markdown-it');
const md = markdownit();

const supportedTypes = {
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.html': 'text/html',
};

// Fragment
async function getFragments(req, res) {
    logger.info('/GET: getFragments');
    try {
        let fragments = await Fragment.byUser(req.user, req.query.expand === '1');
        res.status(200).json(createSuccessResponse({ fragments: fragments }));
    } catch (error) {
        res.status(401).json(createErrorResponse(error.code || 500, error.code));
    }
}

async function getFragmentDataById(req, res) {
    logger.info({ ownerId: req.user, id: req.params.id }, '/GET: getFragmentDataById');
    try {
        // path.parse refer to: https://nodejs.org/api/path.html
        const { name, ext } = path.parse(req.params.id);

        let fragment;
        try {
            fragment = await Fragment.byId(req.user, name);
        } catch (error) {
            return res.status(404).json(createErrorResponse(404, error.message));
        }

        const bufferRawData = await Fragment.dataById(req.user, name);
        // Check if extension is supported
        if (!supportedTypes[ext] && ext) {
            return res
                .status(415)
                .json(createErrorResponse(415, `Fragment cannot be returned as ${ext}`));
        }

        // Convert data if necessary
        const data = supportedTypes[ext] ? await convert(ext, bufferRawData) : bufferRawData;

        // Set Content-Type header
        res.set({
            'Content-Type': supportedTypes[ext] || fragment.type, // no extension given, use fragment type
            'Content-Length': fragment.size,
        });

        return res.status(200).send(data);
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json(createErrorResponse(500, err.message));
    }
}

// Metadata
async function getFragment(req, res) {
    logger.info({ ownerId: req.user, id: req.params.id }, '/GET: getFragment');

    try {
        // path.parse refer to: https://nodejs.org/api/path.html
        const { name } = path.parse(req.params.id);

        let fragment;
        try {
            fragment = await Fragment.byId(req.user, name);
        } catch (err) {
            return res.status(err.status).json(createErrorResponse(err.status, err.message));
        }
        return res.status(200).send(createSuccessResponse({ fragment: fragment }));
    } catch (err) {
        console.error('Error:', err);
        const errorCode = err.status || 500;
        return res.status(errorCode).json(createErrorResponse(errorCode, err.message));
    }
}

// Helper
async function convert(type, buffer) {
    switch (type) {
        case '.txt':
            return buffer.toString('utf-8');

        case '.html':
            try {
                // Convert markdown fragment binary into string
                const markdownString = new TextDecoder().decode(buffer);
                // Convert string into .html
                const htmlContent = md.render(markdownString);

                return htmlContent;
            } catch (error) {
                console.error('Failed to parse into HTMl:', error);
                throw error;
            }
        default:
            return null;
    }
}

module.exports.getFragments = getFragments;
module.exports.getFragmentDataById = getFragmentDataById;
module.exports.getFragment = getFragment;
