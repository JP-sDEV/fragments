// tests/unit/put.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('PUT /v1/fragments', () => {
    let testFragment;

    beforeEach(async () => {
        const testText = 'hello, this a test fragment! :)';
        testFragment = await request(app)
            .post('/v1/fragments')
            .auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/plain')
            .send(testText);
    });

    describe('Request requires authentication', () => {
        test('unauthenticated requests are denied', async () => {
            const res = await request(app).put('/v1/fragments');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        test('incorrect credentials are rejected', async () => {
            const res = await request(app)
                .put('/v1/fragments')
                .auth('invalid@email.com', 'incorrect_password');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('Setting new data', () => {
        test('Set new Buffer data', async () => {
            await request(app)
                .put(`/v1/fragments/${testFragment.body.fragment.id}`)
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send('new data');

            const getBufferData = await request(app)
                .get(`/v1/fragments/${testFragment.body.fragment.id}`)
                .auth('user1@email.com', 'password1');

            const getMetaData = await request(app)
                .get(`/v1/fragments/${testFragment.body.fragment.id}/info`)
                .auth('user1@email.com', 'password1');

            const createdDate = new Date(getMetaData.body.fragment.created).getTime();
            const updatedDate = new Date(getMetaData.body.fragment.updated).getTime();

            expect(getBufferData.text).toEqual('new data');
            expect(updatedDate).toBeGreaterThan(createdDate);
        });

        test('Updated date is greater than created date', async () => {
            await request(app)
                .put(`/v1/fragments/${testFragment.body.fragment.id}`)
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send('new data');

            const getBufferData = await request(app)
                .get(`/v1/fragments/${testFragment.body.fragment.id}`)
                .auth('user1@email.com', 'password1');

            const getMetaData = await request(app)
                .get(`/v1/fragments/${testFragment.body.fragment.id}/info`)
                .auth('user1@email.com', 'password1');

            const createdDate = new Date(getMetaData.body.fragment.created).getTime();
            const updatedDate = new Date(getMetaData.body.fragment.updated).getTime();

            expect(getBufferData.text).toEqual('new data');
            expect(updatedDate).toBeGreaterThan(createdDate);
        });
    });
});
