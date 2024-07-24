// src/model/data/index.js

module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');
