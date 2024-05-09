const stoppable = require('stoppable');

// Get logger instance
const logger = require('./logger');

// Get express app instance
const app = require('./app');

// Get port from the process' environment. Default to `8080`
const port = parseInt(process.env.PORT || '8080', 10);

// Start a server listening on this port
const server = stoppable(
    app.listen(port, () => {
        // Check if LOG_LEVEL is set to debug
        if (process.env.LOG_LEVEL === 'debug') {
            // Print all environment variables
            console.log('Environment Variables:');
            for (const [key, value] of Object.entries(process.env)) {
                console.log(`${key}: ${value}`);
            }
        }

        // Log a message that the server has started, and which port it's using.
        logger.info(`Server started on port ${port}`);
    })
);

// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
