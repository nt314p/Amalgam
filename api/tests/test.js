const supertest = require('supertest');
const request = supertest('http://localhost:4000');

describe('POST /checkUniqueUsername', () => {
    test('responds with a true result', async (done) => {
        try {
            const res = await request
                .post('/checkUniqueUsername')
                .send({ username: "A_unique_username" })
                .expect(200)
                .expect((res) => { res.body.result, true });
            done();
        } catch (err) {
            return done(err);
        }
    });
});

describe('Account creation and deletion', () => {
    console.log("Start?");
    test('account created', async (done) => {
        try {
            const res = await request
                .post('/accounts/')
                .send({ username: "testaccount", name: "Mr. Test", password: "TESTpass123!" })
                .expect(201)
            console.log("Middle?");
            done();
        } catch (err) {
            return done(err);
        }
    });
    console.log("End?");
});