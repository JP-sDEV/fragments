// tests/unit/delete.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
    let testFragment;

    beforeEach(() => {
        testFragment = 'hello, this a test fragment! :)';
    });
    describe('Request requires authentication', () => {
        test('unauthenticated requests are denied', async () => {
            const res = await request(app).delete('/v1/fragments');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        test('incorrect credentials are rejected', async () => {
            const res = await request(app)
                .delete('/v1/fragments')
                .auth('invalid@email.com', 'incorrect_password');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('Delete request', () => {
        describe('Fragment Deletion', () => {
            test('Delete a fragment', async () => {
                // Create fragment
                const create = await request(app)
                    .post('/v1/fragments')
                    .auth('user1@email.com', 'password1')
                    .set('Content-Type', 'text/plain')
                    .send(testFragment);

                // Check the status code
                expect(create.status).toBe(201);

                // Delete Fragment
                const res = await request(app)
                    .delete(`/v1/fragments/${create.body.fragment.id}`)
                    .auth('user1@email.com', 'password1');
                expect(res.status).toBe(200);
            });
        });

        test('Delete a fragment that does not exist', async () => {
            // Delete Fragment
            const res = await request(app)
                .delete(`/v1/fragments/does-not-exist`)
                .auth('user1@email.com', 'password1');
            expect(res.status).toBe(404);
        });
    });
});
