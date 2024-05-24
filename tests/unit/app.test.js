// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /unknown-page', () => {
    // If the page is not found, return 404
    test('page should not be found', () => request(app).get('/unknown-page').expect(404));
});
