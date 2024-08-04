// src/model/data/index.js

module.exports =
    process.env.API_URL === 'http://localhost:8080' ? require('./memory') : require('./aws');
