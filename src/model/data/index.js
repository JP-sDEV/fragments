// src/model/data/index.js

module.exports = process.env.AWS_ACCESS_KEY_ID === 'test' ? require('./aws') : require('./memory');
