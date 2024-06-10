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
} = require('./data/memory');
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
        logger.info(`Fragment ${this.id} accessed`);
        return results;
    }

    /**
     * Gets a fragment for the user by the given id.
     * @param {string} ownerId user's hashed email
     * @param {string} id fragment's id
     * @returns Promise<Fragment>
     */
    static async byId(ownerId, id) {
        const result = await readFragment(ownerId, id);
        if (!result) {
            const message = `Fragment(${id} by ${ownerId} cannot be found.`;
            logger.warn(message);
            throw new Error(message);
        }
        logger.info(`Fragment ${this.id} accessed`);
        return result;
    }

    /**
     * Delete the user's fragment data and metadata for the given id
     * @param {string} ownerId user's hashed email
     * @param {string} id fragment's id
     * @returns Promise<void>
     */
    static delete(ownerId, id) {
        logger.info(`Fragment ${this.id} deleted`);
        return deleteFragment(ownerId, id);
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
    getData() {
        const data = readFragmentData(this.ownerId, this.id);
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
            const message = "Data is not an instanceof 'Buffer'.";
            logger.warn(message);
            throw new Error(message);
        }

        this.updated = new Date().toISOString();
        this.size = data.length;
        const result = writeFragmentData(this.ownerId, this.id, data);
        logger.info(`Fragment ${this.id} data has been set`);
        return Promise.resolve(result);
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
        return ['text/plain'];
    }

    /**
     * Returns true if we know how to work with this content type
     * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
     * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
     */
    static isSupportedType(value) {
        let regex = /text\/.*/i;
        if (!regex.test(value)) {
            return false;
        }
        return true;
    }
}

module.exports.Fragment = Fragment;
