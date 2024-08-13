const { parse } = require('csv-parse/sync'); // Synchronous CSV parser
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const { JSDOM } = require('jsdom');
const yaml = require('js-yaml'); // Make sure you include js-yaml
const logger = require('../logger');

// Function to convert plain text to CSV
function convertPlainTextToCSV(binaryData) {
    const text = binaryData.toString('utf-8');
    const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
    });
    return records.map((record) => Object.values(record).join(',')).join('\n');
}

// Function to convert Markdown to plain text
function convertMarkdownToPlainText(binaryData) {
    // Convert binary data to a string
    const markdown = binaryData.toString('utf-8');

    // Render Markdown to HTML
    const html = md.render(markdown).trim();

    // Create a JSDOM instance to parse the HTML
    const dom = new JSDOM(html);
    let textContent = dom.window.document.body.textContent || '';

    // Normalize newlines and spaces
    let plainText = textContent.trim().replace(/\s+/g, ' ');

    return plainText;
}

// Function to convert Markdown to HTML
function convertMarkdownToHTML(binaryData) {
    // Convert binary data to string
    const markdown = binaryData.toString('utf-8');

    // Convert Markdown to HTML
    const html = md.render(markdown).trim();

    logger.info({ markdown: markdown, html: html }, '/convertMarkdownToHTML:');

    return html;
}

// Function to convert JSON to CSV
function convertJSONToCSV(binaryData) {
    const json = JSON.parse(binaryData.toString('utf-8'));
    const records = Array.isArray(json) ? json : [json];
    return records.map((record) => Object.values(record).join(',')).join('\n');
}

// Function to convert YAML to JSON
function convertYAMLToJSON(binaryData) {
    const yamlData = binaryData.toString('utf-8');
    return JSON.stringify(yaml.load(yamlData), null, 2);
}

// Function to convert CSV to plain text
function convertCSVToPlainText(binaryData) {
    // Convert binary data to string
    const csvText = binaryData.toString('utf-8');

    // Parse CSV data
    const records = parse(csvText, {
        columns: false, // Set to true if your CSV has headers
        skip_empty_lines: true,
    });

    // Convert records to plain text
    const plainText = records.map((row) => row.join(' ')).join('\n');

    return plainText;
}

// Function to convert CSV binary data to JSON string
function convertCSVToJSON(binaryData) {
    // Convert binary data to a string
    const csvData = binaryData.toString('utf-8');

    try {
        // Parse CSV data into JSON records
        const records = parse(csvData, {
            columns: true, // Use the first row as column names
            skip_empty_lines: true,
        });

        // Convert JSON records to a string
        return JSON.stringify(records, null, 2);
    } catch (err) {
        logger.error({ error: err.message }, 'Error converting CSV to JSON');
        throw err; // Propagate the error
    }
}

// Main conversion function
function convertContentTypeToTargetFormat(contentType, extension, binaryData) {
    switch (contentType) {
        case 'text/plain':
            if (extension === '.csv') {
                return convertPlainTextToCSV(binaryData);
            }
            return binaryData.toString('utf-8'); // Assume plain text

        case 'text/markdown':
            logger.info('TRYING TO CONVERT FROM text/markdown');
            if (['.txt', '.html', '.md'].includes(extension)) {
                if (extension === '.html') {
                    return convertMarkdownToHTML(binaryData);
                }
                return convertMarkdownToPlainText(binaryData);
            }
            throw new Error('Unsupported extension for text/markdown');

        case 'text/html':
            if (extension === '.txt') {
                return new JSDOM(
                    binaryData.toString('utf-8')
                ).window.document.body.textContent.trim();
            }
            throw new Error('Unsupported extension for text/html');

        case 'text/csv':
            if (['.txt', '.json'].includes(extension)) {
                if (extension === '.json') {
                    return convertCSVToJSON(binaryData);
                } else if (extension === '.txt') {
                    return convertCSVToPlainText(binaryData);
                }
            }
            throw new Error('Unsupported extension for text/csv');

        case 'application/json':
            if (extension === '.csv') {
                return convertJSONToCSV(binaryData);
            }
            if (['.yaml', '.yml'].includes(extension)) {
                return convertYAMLToJSON(binaryData);
            }
            throw new Error('Unsupported extension for application/json');

        case 'application/yaml':
            if (extension === '.json') {
                return convertYAMLToJSON(binaryData);
            }
            throw new Error('Unsupported extension for application/yaml');

        case 'image/png':
        case 'image/jpeg':
        case 'image/webp':
        case 'image/avif':
        case 'image/gif':
            throw new Error('Image formats are not supported for conversion');

        default:
            throw new Error('Unsupported content type');
    }
}

module.exports = {
    convertContentTypeToTargetFormat,
};
