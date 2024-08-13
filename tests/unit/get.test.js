// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
    describe('Request requires authentication', () => {
        test('unauthenticated requests are denied', () =>
            request(app).get('/v1/fragments').expect(401));

        test('incorrect credentials are denied', () =>
            request(app)
                .get('/v1/fragments')
                .auth('invalid@email.com', 'incorrect_password')
                .expect(401));

        test('authenticated users get a fragments array', async () => {
            const res = await request(app)
                .get('/v1/fragments')
                .auth('user1@email.com', 'password1');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(Array.isArray(res.body.fragments)).toBe(true);
        });

        test('unauthenticated requests are denied', () =>
            request(app).get('/v1/fragments').expect(401));
    });

    describe('Retrieving Fragment Data', () => {
        let testFragment;
        let jsonFragment;

        beforeEach(() => {
            testFragment = 'hello, this a test fragment! :)';
            jsonFragment = { name: 'Bob Smith', isAwesome: true };
        });

        test('empty fragments array if user did not create any fragments', async () => {
            const res = await request(app)
                .get('/v1/fragments')
                .auth('user1@email.com', 'password1');

            // Check if insertion is successful
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('fragments');
            expect(res.body.status).toBe('ok');

            // Check if returning correct response
            expect(Array.isArray(res.body.fragments)).toBe(true);
            expect(res.body.fragments.length).toBe(0);
        });

        describe('text/* fragments', () => {
            test('insert a text/plain fragment has a proper response', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain')
                    .send(testFragment);

                const res = await request(app)
                    .get('/v1/fragments')
                    .auth('user1@email.com', 'password1');

                // Check if insertion is successful
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('status');
                expect(res.body).toHaveProperty('fragments');
                expect(res.body.status).toBe('ok');

                // Check if returning correct response
                expect(Array.isArray(res.body.fragments)).toBe(true);
                expect(res.body.fragments.length).toBe(1);
            });

            test('getting text/plain Fragment metadata (i.e. expand Fragment)', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain')
                    .send(testFragment);

                const res = await request(app)
                    .get('/v1/fragments?expand=1')
                    .auth('user1@email.com', 'password1');

                // Check for proper success response object
                expect(res.statusCode).toBe(200);
                expect(res.body.status).toBe('ok');
                expect(res.body).toHaveProperty('fragments');

                // Check contents of fragments array
                expect(Array.isArray(res.body.fragments)).toBe(true);
                expect(res.body.fragments.length).not.toBe(0);

                // Check expanded contents
                expect(res.body.fragments[0]).toHaveProperty('id');
                expect(res.body.fragments[0]).toHaveProperty('created');
                expect(res.body.fragments[0]).toHaveProperty('updated');
                expect(res.body.fragments[0]).toHaveProperty('ownerId');
                expect(res.body.fragments[0]).toHaveProperty('type');
                expect(res.body.fragments[0]).toHaveProperty('size');

                expect(res.body.fragments[0].type).toEqual('text/plain');
            });

            test('getting text/plain is String type', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain; charset=utf-8')
                    .send(testFragment);

                const getRes = await request(app)
                    .get('/v1/fragments')
                    .auth('user1@email.com', 'password1');

                const fragmentId = getRes.body.fragments[0];

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}.txt`)
                    .auth('user1@email.com', 'password1');

                expect(getRes.statusCode).toBe(200);
                expect(typeof res.text).toEqual('string');
                expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
            });
        });

        describe('application/json fragments', () => {
            test('get known application/json Fragment without extension', async () => {
                // insert fragment
                const post = await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'application/json')
                    .send(jsonFragment);

                const postJSON = JSON.parse(post.text);

                const fragmentId = postJSON.fragment.id;

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}`)
                    .auth('user1@email.com', 'password1');

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual(jsonFragment);
                expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
            });
        });

        test('insert a fragment and retrieve its id', async () => {
            // insert fragment
            await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send(testFragment);

            const res = await request(app)
                .get('/v1/fragments?expand=1')
                .auth('user1@email.com', 'password1');

            // Check if insertion is successful
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status');
            expect(res.body.status).toBe('ok');

            // Check if fragment id in response
            expect(res.body).toHaveProperty('fragments');
            expect(Array.isArray(res.body.fragments)).toBe(true);
            expect(res.body.fragments.length).not.toBe(0);
            expect(res.body.fragments[0]).toHaveProperty('id');
        });

        test('Fragment size is updated to respective Buffer size', async () => {
            // insert fragment
            const testFragmentBuffer = Buffer.from(testFragment, 'utf-8');
            await request(app)
                .post('/v1/fragments')
                .auth('user1@email.com', 'password1')
                .set('Content-Type', 'text/plain')
                .send(testFragment);

            const res = await request(app)
                .get('/v1/fragments?expand=1')
                .auth('user1@email.com', 'password1');

            // Check for proper success response object
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body).toHaveProperty('fragments');

            // Check contents of fragments array
            expect(Array.isArray(res.body.fragments)).toBe(true);
            expect(res.body.fragments.length).not.toBe(0);

            // Check expanded contents
            expect(res.body.fragments[0]).toHaveProperty('size');
            expect(res.body.fragments[0].size).toEqual(Buffer.byteLength(testFragmentBuffer));
        });

        describe('Retrieving Fragment Data by id', () => {
            test('get known Fragment without extension', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain')
                    .send(testFragment);

                const getRes = await request(app)
                    .get('/v1/fragments')
                    .auth('user1@email.com', 'password1');

                const fragmentId = getRes.body.fragments[0];

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}`)
                    .auth('user1@email.com', 'password1');

                expect(getRes.statusCode).toBe(200);
                expect(res.text).toEqual(testFragment);
                expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
            });

            test('get known Fragment with extension', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain; charset=utf-8')
                    .send(testFragment);

                const getRes = await request(app)
                    .get('/v1/fragments')
                    .auth('user1@email.com', 'password1');

                const fragmentId = getRes.body.fragments[0];

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}.txt`)
                    .auth('user1@email.com', 'password1');

                expect(getRes.statusCode).toBe(200);
                expect(res.text).toEqual(testFragment);
                expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
            });

            test('get Fragment with unknown id', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain; charset=utf-8')
                    .send(testFragment);

                const fragmentId = 'fake-fragment';

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}`)
                    .auth('user1@email.com', 'password1');

                // Check expanded contents
                expect(res.statusCode).toBe(404);
            });

            test('get Fragment with unknown extension', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain; charset=utf-8')
                    .send(testFragment);

                const getRes = await request(app)
                    .get('/v1/fragments')
                    .auth('user1@email.com', 'password1');

                const fragmentId = getRes.body.fragments[0];

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}.png`)
                    .auth('user1@email.com', 'password1');

                // Check expanded contents
                expect(res.statusCode).toBe(415);
            });
        });

        describe('Response Formatting', () => {
            test('error response format', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain; charset=utf-8')
                    .send(testFragment);

                const getRes = await request(app)
                    .get('/v1/fragments')
                    .auth('user1@email.com', 'password1');

                const fragmentId = getRes.body.fragments[0];

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}.png`)
                    .auth('user1@email.com', 'password1');

                expect(res.body).toHaveProperty('error');
                expect(res.body.error).toHaveProperty('code');
                expect(res.body.error).toHaveProperty('message');
            });

            test('success response format', async () => {
                // insert fragment
                await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain; charset=utf-8')
                    .send(testFragment);

                const getRes = await request(app)
                    .get('/v1/fragments')
                    .auth('user1@email.com', 'password1');

                const fragmentId = getRes.body.fragments[0];

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}.txt`)
                    .auth('user1@email.com', 'password1');

                expect(res.status).toBe(200);
                expect(res.body).not.toHaveProperty('status'); // should not return success response object, just the fragment data
            });
        });

        describe('Metadata', () => {
            test('get fragment metadata', async () => {
                // insert fragment
                const post = await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'application/json')
                    .send(jsonFragment);

                expect(post.statusCode).toBe(201);

                const postJSON = JSON.parse(post.text);
                // console.log('PostJson: ', postJSON);
                const fragmentId = postJSON.fragment.id;

                const res = await request(app)
                    .get(`/v1/fragments/${fragmentId}/info`)
                    .auth('user1@email.com', 'password1');

                expect(res.statusCode).toBe(200);
                // expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
            });
        });
    });
});
