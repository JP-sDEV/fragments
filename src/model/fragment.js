// src/model/fragment.js

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const {
    readFragment,
    writeFragment,
    readFragmentData,
    writeFragmentData,
    listFragments,
    deleteFragment,
} = require('./data');
const logger = require('../logger');

class Fragment {
    constructor({ id, ownerId, created, updated, type, size = 0 }) {
        /*
            Required:
                - ownerId, 
                - type
        */

        if (!ownerId) {
            logger.warn('Fragment Error: Missing fragment ownerId');
            throw new Error('Missing fragment ownerId');
        }

        if (!type) {
            logger.warn('Fragment Error: Missing fragment type');
            throw new Error('Missing fragment type');
        } else {
            if (!Fragment.isSupportedType(type)) {
                logger.warn('Fragment Error: Invalid type');
                throw new Error('Invalid type');
            }
        }

        if (!(typeof size === 'number')) {
            logger.warn('Fragment Error: Size must be "Number" type');
            throw new Error('Size must be "Number" type');
        } else {
            if (size < 0) {
                logger.warn('Fragment Error: Size must be a non-negative "Number" type');
                throw new Error('Size must be a non-negative "Number" type');
            }
        }

        const now = new Date().toISOString();

        this.id = id ? id : randomUUID(); // secondary id, hashed email
        this.ownerId = ownerId; // primary id
        this.created = created ? created : now;
        this.updated = updated ? updated : now;
        this.type = type;
        this.size = size;
    }

    /**
     * Get all fragments (id or full) for the given user
     * @param {string} ownerId user's hashed email
     * @param {boolean} expand whether to expand ids to full fragments
     * @returns Promise<Array<Fragment>>
     */
    static async byUser(ownerId, expand = false) {
        let results = await listFragments(ownerId, expand);
        logger.info(`Fragment byUser: Fragment ${this.id} accessed`);
        return results;
    }

    /**
     * Gets a fragment metadata for the user by the given id.
     * @param {string} ownerId user's hashed email
     * @param {string} id fragment's id
     * @returns Promise<Fragment> // metadata
     */
    static async byId(ownerId, id) {
        logger.info(
            { ownerId: ownerId, id: id },
            'model/fragment.js: Attempting to get fragment metadata by id'
        );
        const result = await readFragment(ownerId, id);
        if (!result) {
            const message = `Fragment metadata(${id} by ${ownerId} cannot be found.`;
            logger.warn(message);
            throw new NotFoundError(message);
        }
        logger.info(`Fragment byId: Fragment metadata ${id} accessed`);
        return result;
    }

    /**
     * Get all fragments (id or full) for the given user
     * @param {string} ownerId user's hashed email
     * @param {boolean} expand whether to expand ids to full fragments
     * @returns Promise<Array<Fragment>>
     */
    static async dataById(ownerId, id) {
        const result = await readFragmentData(ownerId, id);
        if (!result) {
            const message = `Fragment Data (${id} by ${ownerId} cannot be found.`;
            logger.warn(message);
            throw new NotFoundError(message);
        }
        logger.info(`Fragment data byId: Fragment ${id} accessed`);
        return result;
    }

    /**
     * Delete the user's fragment data and metadata for the given id
     * @param {string} ownerId user's hashed email
     * @param {string} id fragment's id
     * @returns Promise<void>
     */
    static async delete(ownerId, id) {
        logger.info(
            {
                ownerId: ownerId,
                id: id,
            },
            'src/model/fragment.js: Attempting to delete fragment'
        );
        logger.info(`Fragment ${id} deleted`);
        return await deleteFragment(ownerId, id);
    }

    /**
     * Saves the current fragment to the database
     * @returns Promise<void>
     */
    async save() {
        // Update "updated" property
        this.updated = new Date().toISOString();
        const result = await writeFragment(this);
        logger.info(`Fragment ${this.id} saved`);
        return Promise.resolve(result);
    }

    /**
     * Gets the fragment's data from the database
     * @returns Promise<Buffer>
     */
    async getData() {
        const data = await readFragmentData(this.ownerId, this.id);
        logger.info(`Fragment ${this.id} data accessed`);
        return Promise.resolve(data);
    }

    /**
     * Set's the fragment's data in the database
     * @param {Buffer} data
     * @returns Promise<void>
     */
    async setData(data) {
        if (!(data instanceof Buffer)) {
            const message = "Data is not an instance of 'Buffer'.";
            logger.warn(message);
            throw new Error(message);
        }

        this.updated = new Date().toISOString();
        this.size = data.length;

        try {
            await writeFragmentData(this.ownerId, this.id, data);
            logger.info(`Fragment ${this.id} data has been set`);
        } catch (error) {
            logger.error({ error, fragmentId: this.id }, 'Failed to set fragment data');
            throw new Error('Failed to set fragment data');
        }
    }

    /**
     * Returns the mime type (e.g., without encoding) for the fragment's type:
     * "text/html; charset=utf-8" -> "text/html"
     * @returns {string} fragment's mime type (without encoding)
     */
    get mimeType() {
        const { type } = contentType.parse(this.type);
        return type;
    }

    /**
     * Returns true if this fragment is a text/* mime type
     * @returns {boolean} true if fragment's type is text/*
     */
    get isText() {
        let regex = /text\/.*/i;
        return regex.test(this.mimeType);
    }

    /**
     * Returns the formats into which this fragment type can be converted
     * @returns {Array<string>} list of supported mime types
     */
    get formats() {
        const conversions = {
            'text/plain': ['.txt'],
            'text/markdown': ['.md', '.html', '.txt'],
            'text/html': ['.html', '.txt'],
            'text/csv': ['.csv', '.txt', '.json'],
            'application/json': ['.json', '.yaml', '.yml', '.txt'],
            'application/yaml': ['.yaml', '.txt'],
            'image/png': ['.png', '.jpg', '.webp', '.gif', '.avif'],
            'image/jpeg': ['.png', '.jpg', '.webp', '.gif', '.avif'],
            'image/webp': ['.png', '.jpg', '.webp', '.gif', '.avif'],
            'image/avif': ['.png', '.jpg', '.webp', '.gif', '.avif'],
            'image/gif': ['.png', '.jpg', '.webp', '.gif', '.avif'],
        };

        // return ['text/plain'];
        return conversions[this.type];
    }

    /**
     * Returns true if we know how to work with this content type
     * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
     * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
     */
    static isSupportedType(value) {
        // let textRegex = /^text\/.*/i; // support for text/* types
        // let jsonRegex = /^application\/json$/i; // support for ONLY application/json
        // return textRegex.test(value) || jsonRegex.test(value);
        const supported = [
            'text/plain',
            'text/markdown',
            'text/html',
            'text/csv',
            'application/json',
            'application/yaml',
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/avif',
            'image/gif',
        ];

        return supported.includes(value);
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.status = 404;
    }
}

module.exports.Fragment = Fragment;
