const supertest = require('supertest');
const app = require('../app');
const request = supertest(app);

const Account = require("../models/account");

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.DB_TESTING_URI;
const PORT = process.env.PORT || 4000;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log("Database is connected"))
    .catch(error => console.log("Cannot connect to database: " + error));

var server =
    app.listen(PORT, console.log('Server is running on port:', PORT));

async function createTestAccount() {
    let account = new Account({
        _id: new mongoose.Types.ObjectId(),
        username: "testaccount@88",
        name: "Test Account",
        hashedPassword: "$2b$12$m7flIjsGhcyV/SV12rcHe.W3tsCSPIkh1J5cCFN.N4JDvBzVO.wB6"
    });
    return await account.save();
}

describe('POST /checkUniqueUsername', () => {
    test('responds with a true result when username is unique', async (done) => {
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

    test('responds with a false result when username is not unique', async (done) => {
        try {
            await createTestAccount();

            const res = await request
                .post('/checkUniqueUsername')
                .send({ username: "testaccount@88" })
                .expect(200)
                .expect((res) => { res.body.result, false });

            await Account.deleteMany();
            done();
        } catch (err) {
            return done(err);
        }
    });
});

describe('Authorization', () => {
    test('login with incorrect username returns 401', async (done) => {
        try {
            await createTestAccount();

            const res = await request
                .post('/accounts/login/')
                .send({ username: "nottestaccount", password: "TESTpass123!" })
                .expect(401);

            await Account.deleteMany();
            done();
        } catch (err) {
            done(err);
        }
    });

    test('login with incorrect password returns 401', async (done) => {
        try {
            await createTestAccount();

            const res = await request
                .post('/accounts/login/')
                .send({ username: "testaccount@88", password: "notTESTpass123!" })
                .expect(401);

            await Account.deleteMany();
            done();
        } catch (err) {
            done(err);
        }
    });

    test('login with correct password succeeds and returns token and id', async (done) => {
        try {
            let id = (await createTestAccount())._id;

            const res = await request
                .post('/accounts/login/')
                .send({ username: "testaccount@88", password: "TESTpass123!" })
                .expect(200);

            expect(res.body).toHaveProperty("token")
            expect(res.body.id).toBe(id.toHexString());

            await Account.deleteMany();
            done();
        } catch (err) {
            done(err);
        }
    });

    test('protected route with missing token returns 400', async (done) => {
        try {
            let id = (await createTestAccount())._id;

            const res = await request
                .get(`/accounts/${id}/`)
                .send()
                .expect(400);

            await Account.deleteMany();
            done();
        } catch (err) {
            done(err);
        }
    });

    test('protected route with incorrect token returns 401', async (done) => {
        try {
            let id = (await createTestAccount())._id;

            const res = await request
                .get(`/accounts/${id}/`)
                .set('authorization', "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
                .send()
                .expect(401);

            await Account.deleteMany();
            done();
        } catch (err) {
            done(err);
        }
    });

    test('protected route with correct token succeeds', async (done) => {
        try {
            await createTestAccount();

            const loginRes = await request
                .post('/accounts/login/')
                .send({ username: "testaccount@88", password: "TESTpass123!" })

            let token = loginRes.body.token;
            let id = loginRes.body.id;

            const res = await request
                .get(`/accounts/${id}/`)
                .set('authorization', `Bearer ${token}`)
                .send()
                .expect(200);

            await Account.deleteMany();
            done();
        } catch (err) {
            done(err);
        }
    });
});

describe('Account routes', () => {
    test('created account returns correct data', async (done) => {
        try {
            const res = await request
                .post('/accounts/')
                .send({ username: "testaccount@88", name: "Mr. Test", password: "TESTpass123!" })
                .expect(201);

            expect(res.body).toHaveProperty('createdAccount');
            expect(res.body.createdAccount.username).toBe("testaccount@88");
            expect(res.body.createdAccount.name).toBe("Mr. Test");
            expect(res.body.createdAccount.hashedPassword).toBe(undefined);

            await Account.deleteMany();
            done();
        } catch (err) {
            return done(err);
        }
    });

    test('account get route returns correct data', async (done) => {
        try {
            await createTestAccount();

            const loginRes = await request
                .post('/accounts/login/')
                .send({ username: "testaccount@88", password: "TESTpass123!" })

            let token = loginRes.body.token;
            let id = loginRes.body.id;

            const res = await request
                .get(`/accounts/${id}/`)
                .set('authorization', `Bearer ${token}`)
                .send()
                .expect(200);

            expect(res.body).toHaveProperty("account");
            expect(res.body.account.username).toBe("testaccount@88");
            expect(res.body.account.name).toBe("Test Account");
            expect(res.body.account._id).toBe(id);

            await Account.deleteMany();
            done();
        } catch (err) {
            done(err);
        }
    })

    test('account is successfully deleted', async (done) => {
        try {
            await createTestAccount();

            const loginRes = await request
                .post('/accounts/login/')
                .send({ username: "testaccount@88", password: "TESTpass123!" })

            let token = loginRes.body.token;
            let id = loginRes.body.id;

            expect(await Account.findById(id)).toBeDefined();

            const res = await request
                .delete(`/accounts/${id}/`)
                .set('authorization', `Bearer ${token}`)
                .send()
                .expect(200);

            expect(await Account.findById(id)).toBeNull();

            await Account.deleteMany();
            done();
        } catch (err) {
            return done(err);
        }
    });
});

server.close();