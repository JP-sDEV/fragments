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

async function getFragments(req, res) {
    logger.info({ req }, '/GET');
    try {
        let fragments;
        fragments = await Fragment.byUser(req.user, req.query.expand === '1');
        res.status(200).json(createSuccessResponse({ fragments: fragments }));
    } catch (error) {
        res.status(401).json(createErrorResponse(error.code || 500, error.code));
    }
}

// by id
async function getFragmentById(req, res) {
    logger.info({ req }, '/GET');
    try {
        // path.parse refer to: https://nodejs.org/api/path.html
        const { name, ext } = path.parse(req.params.id);

        let fragment;
        try {
            fragment = await Fragment.byId(req.user, name);
        } catch (error) {
            return res.status(404).json(createErrorResponse(404, error.message));
        }

        const bufferRawData = await fragment.getData();
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
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json(createErrorResponse(500, error.message));
    }
}

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
module.exports.getFragmentById = getFragmentById;
