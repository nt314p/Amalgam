const supertest = require('supertest');
const app = require('../app');
const request = supertest(app);

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.DB_URI;
const PORT = process.env.PORT || 4000;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log("Database is connected"))
    .catch(error => console.log("Cannot connect to database: " + error));

app.listen(PORT, console.log('Server is running on port:', PORT));

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