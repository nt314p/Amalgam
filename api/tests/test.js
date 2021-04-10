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

describe('POST /checkUniqueUsername', () => {
    test('responds with a true result when unique', async (done) => {
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

    test('responds with a false result when not', async (done) => {
        try {
            let account = new Account({
                _id: new mongoose.Types.ObjectId(),
                username: "registered-username123",
                name: "Registered",
                hashedPassword: "hash"
            });

            await account.save();

            const res = await request
                .post('/checkUniqueUsername')
                .send({ username: "registered-username123" })
                .expect(200)
                .expect((res) => { res.body.result, false });

            await Account.deleteMany();
            done();
        } catch (err) {
            return done(err);
        }
    });
});

describe('Account routes', () => {
    //console.log("Start?");
    test('created account returns correct data', async (done) => {
        try {
            const res = await request
                .post('/accounts/')
                .send({ username: "testaccount", name: "Mr. Test", password: "TESTpass123!" })
                .expect(201);

            expect(res.body).toHaveProperty('createdAccount');
            expect(res.body.createdAccount.username).toBe("testaccount");
            expect(res.body.createdAccount.name).toBe("Mr. Test");          
            expect(res.body.createdAccount.hashedPassword).toBe(undefined);

            await Account.deleteMany();
            done();
        } catch (err) {
            return done(err);
        }
    });

    test('account is successfully deleted', async (done) => {
        try {
            let id = new mongoose.Types.ObjectId();
            let account = new Account({
                _id: id,
                username: "delete me",
                name: "Deletus Prime",
                hashedPassword: "hash"
            });
            await account.save();

            //const res = 
        } catch (err) {
            return done(err);
        }
    });
    //console.log("End?");
});

server.close();