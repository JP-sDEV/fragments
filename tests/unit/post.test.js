// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
    let testFragment;

    beforeEach(() => {
        testFragment = 'hello, this a test fragment! :)';
    });
    describe('Request requires authentication', () => {
        test('unauthenticated requests are denied', async () => {
            const res = await request(app).post('/v1/fragments');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        test('incorrect credentials are rejected', async () => {
            const res = await request(app)
                .post('/v1/fragments')
                .auth('invalid@email.com', 'incorrect_password');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        test('unauthorized users cannot create a plain text Fragment', async () => {
            const res = await request(app)
                .post('/v1/fragments')
                .auth('invalid@email.com', 'incorrect_password')
                .set('Content-Type', 'text/plain')
                .send(testFragment);

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('Fragment Creation', () => {
        test('authenticated users can create a plain text Fragment', async () => {
            const res = await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send(testFragment);

            // Check the status code
            expect(res.status).toBe(201);
        });

        test('unsupported type is rejected', async () => {
            const res = await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'application/msword'); // Unsupported content type

            expect(res.status).toBe(415); // 415 (Unsupported Media Type)
            expect(res.body).toHaveProperty('error');
        });

        test('text Fragment cannot exceed 5mb', async () => {
            const smallerString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';

            // Creating a string > 5mb
            let largerString = '';
            while (largerString.length < 5 * 1024 * 1024) {
                // 5mb in bytes
                largerString += smallerString;
            }
            const res = await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send(largerString);

            expect(res.status).toBe(413); // 413 (Content Too Lage)
        });

        test('Fragment updates size property when data is inserted', async () => {
            const testFragmentBuffer = Buffer.from(testFragment, 'utf-8');
            const res = await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send(testFragment);

            expect(res.status).toBe(201);
            expect(res.body.fragment.size).toEqual(Buffer.byteLength(testFragmentBuffer));
        });
    });

    describe('Response properties', () => {
        test('successful Fragment creation has all metadata properties', async () => {
            const res = await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send(testFragment);

            expect(res.status).toBe(201);
            expect(res.body.status).toBe('ok');
            expect(res.body.fragment).toHaveProperty('id');
            expect(res.body.fragment).toHaveProperty('ownerId');
            expect(res.body.fragment).toHaveProperty('created');
            expect(res.body.fragment).toHaveProperty('updated');
            expect(res.body.fragment).toHaveProperty('type');
            expect(res.body.fragment).toHaveProperty('size');
        });

        test('sets Location header after creating a Fragment', async () => {
            const res = await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send(testFragment);

            expect(res.status).toBe(201);
            expect(res.headers).toHaveProperty('location');
        });
    });
    describe('Success and Error Property Format', () => {
        test('successful format', async () => {
            const res = await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send(testFragment);

            expect(res.body).toHaveProperty('status');
            expect(res.body.status).toBe('ok');
        });

        test('error format', async () => {
            const res = await request(app)
                .post('/v1/fragments')
                .auth('invalid@email.com', 'incorrect_password');

            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toHaveProperty('code');
            expect(res.body.error).toHaveProperty('message');
        });
    });
});
