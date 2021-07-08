const supertest = require('supertest');
const app = require('../app');
const request = supertest(app);

const Account = require("../models/account");
const Notebook = require("../models/notebook");
const Note = require("../models/note");
const NoteContent = require("../models/noteContent");

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
require('dotenv').config();

const uri = process.env.DB_TESTING_URI;
const PORT = process.env.PORT || 4000;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database is connected");
    })
    .catch(error => console.log("Cannot connect to database: " + error));

var server = app.listen(PORT, console.log('Server is running on port:', PORT));

async function createTestAccount() {
    let account = new Account({
        _id: new ObjectId(),
        username: "testaccount@88",
        name: "Test Account",
        hashedPassword: "$2b$12$m7flIjsGhcyV/SV12rcHe.W3tsCSPIkh1J5cCFN.N4JDvBzVO.wB6"
    });
    return await account.save();
}

async function loginToTestAccount() {
    const loginRes = await request
        .post('/accounts/login/')
        .send({ username: "testaccount@88", password: "TESTpass123!" });

    return { id: loginRes.body.id, token: loginRes.body.token };
}

async function createTestNotebook(accountId, token) {
    const res = await request
        .post(`/accounts/${accountId}/notebooks/`)
        .set('authorization', `Bearer ${token}`)
        .send({ name: "Test notebook" });

    return res.body.notebook;
}

async function createTestNote(accountId, notebookId, token) {
    const res = await request
        .post(`/accounts/${accountId}/notebooks/${notebookId}/notes/`)
        .set('authorization', `Bearer ${token}`)
        .send({ title: "Test note", content: "Test content!", starred: true });

    return res.body.note;
}

async function cleanTestDatabase() {
    if (mongoose.connection.name != "testing") return; // haha that would be bad
    await Account.deleteMany();
    await Notebook.deleteMany();
    await Note.deleteMany();
    await NoteContent.deleteMany();
}

afterEach(cleanTestDatabase);

describe('POST /checkUniqueUsername', () => {
    test('responds with a true result when username is unique', async () => {
        const res = await request
            .post('/checkUniqueUsername')
            .send({ username: "A_unique_username" })
            .expect(200)
            .expect((res) => { res.body.result, true });
    });

    test('responds with a false result when username is not unique', async () => {
        await createTestAccount();

        const res = await request
            .post('/checkUniqueUsername')
            .send({ username: "testaccount@88" })
            .expect(200)
            .expect((res) => { res.body.result, false });
    });
});

describe('Authorization', () => {
    test('login with incorrect username returns 401', async () => {
        await createTestAccount();

        const res = await request
            .post('/accounts/login/')
            .send({ username: "nottestaccount", password: "TESTpass123!" })
            .expect(401);
    });

    test('login with incorrect password returns 401', async () => {
        await createTestAccount();

        const res = await request
            .post('/accounts/login/')
            .send({ username: "testaccount@88", password: "notTESTpass123!" })
            .expect(401);
    });

    test('login with correct password succeeds and returns token and id', async () => {
        let id = (await createTestAccount())._id;

        const res = await request
            .post('/accounts/login/')
            .send({ username: "testaccount@88", password: "TESTpass123!" })
            .expect(200);

        expect(res.body).toHaveProperty("token")
        expect(res.body.id).toBe(id.toHexString());
    });

    test('protected route with missing token returns 400', async () => {
        let id = (await createTestAccount())._id;

        const res = await request
            .get(`/accounts/${id}/`)
            .send()
            .expect(400);
    });

    test('protected route with incorrect token returns 401', async () => {
        let id = (await createTestAccount())._id;

        const res = await request
            .get(`/accounts/${id}/`)
            .set('authorization', "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
            .send()
            .expect(401);
    });

    test('protected route with correct token succeeds', async () => {
        await createTestAccount();

        let { token, id } = await loginToTestAccount();

        const res = await request
            .get(`/accounts/${id}/`)
            .set('authorization', `Bearer ${token}`)
            .send()
            .expect(200);
    });
});

describe('Account route validations', () => {
    test('creating account with empty username returns 422', async () => {
        const res = await request
            .post('/accounts')
            .send({ name: "Mr. Test", password: "TESTpass123!" })
            .expect(422);
    });
    test('creating account with empty name returns 422', async () => {
        const res = await request
            .post('/accounts')
            .send({ username: "testaccount@88", password: "TESTpass123!" })
            .expect(422);
    });
    test('creating account with empty password returns 422', async () => {
        const res = await request
            .post('/accounts')
            .send({ username: "testaccount@88", name: "Mr. Test" })
            .expect(422);
    });
    test('creating account with unsufficient password returns 422', async () => {
        let res = await request // length
            .post('/accounts')
            .send({ username: "testaccount@88", name: "Mr. Test", password: "Aa1!" })
            .expect(422);
        expect(res.body.error.validationErrors).toHaveLength(1);

        res = await request // lowercase
            .post('/accounts')
            .send({ username: "testaccount@88", name: "Mr. Test", password: "AA34567!" })
            .expect(422);
        expect(res.body.error.validationErrors).toHaveLength(1);

        res = await request // uppercase
            .post('/accounts')
            .send({ username: "testaccount@88", name: "Mr. Test", password: "aa34567!" })
            .expect(422);
        expect(res.body.error.validationErrors).toHaveLength(1);

        res = await request // number
            .post('/accounts')
            .send({ username: "testaccount@88", name: "Mr. Test", password: "abcdefg!" })
            .expect(422);
        expect(res.body.error.validationErrors).toHaveLength(1);

        res = await request // symbol
            .post('/accounts')
            .send({ username: "testaccount@88", name: "Mr. Test", password: "Aa345678" })
            .expect(422);
        expect(res.body.error.validationErrors).toHaveLength(1);
    });
});

describe('Account routes', () => {
    test('created account returns correct data', async (done) => {
        const res = await request
            .post('/accounts/')
            .send({ username: "testaccount@88", name: "Mr. Test", password: "TESTpass123!" })
            .expect(201);

        expect(res.body).toHaveProperty('createdAccount');
        expect(res.body.createdAccount.username).toBe("testaccount@88");
        expect(res.body.createdAccount.name).toBe("Mr. Test");
        expect(res.body.createdAccount.hashedPassword).toBe(undefined);

        done();
    });

    test('account get route returns correct data', async (done) => {
        await createTestAccount();

        let { token, id } = await loginToTestAccount();

        const res = await request
            .get(`/accounts/${id}/`)
            .set('authorization', `Bearer ${token}`)
            .send()
            .expect(200);

        expect(res.body).toHaveProperty("account");
        expect(res.body.account.username).toBe("testaccount@88");
        expect(res.body.account.name).toBe("Test Account");
        expect(res.body.account._id).toBe(id);

        done();
    })

    test('account is successfully deleted', async (done) => {
        await createTestAccount();

        let { token, id } = await loginToTestAccount();

        expect(await Account.findById(id)).toBeDefined();

        const res = await request
            .delete(`/accounts/${id}/`)
            .set('authorization', `Bearer ${token}`)
            .send()
            .expect(200);

        expect(await Account.findById(id)).toBeNull();

        done();
    });
});

describe('Notebook routes', () => {
    test('created notebook returns correct data', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();

        const res = await request
            .post(`/accounts/${id}/notebooks/`)
            .set('authorization', `Bearer ${token}`)
            .send({ name: "Test notebook" })
            .expect(201);

        expect(res.body).toHaveProperty("notebook");
        expect(res.body.notebook.name).toBe("Test notebook");
        expect(res.body.notebook.owner).toBe(id);
        expect(res.body.notebook).toHaveProperty("_id");
        done();
    });

    test('notebook get route returns correct data', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);

        const res = await request
            .get(`/accounts/${id}/notebooks/${notebook._id}`)
            .set('authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty("notebook");
        expect(res.body.notebook.name).toBe("Test notebook");
        expect(res.body.notebook.owner).toBe(id);
        expect(res.body.notebook._id).toBe(notebook._id);
        done();
    });

    test('notebook get all route returns correct data no notebooks', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();

        let res = await request
            .get(`/accounts/${id}/notebooks/`)
            .set('authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty("notebooks");
        expect(res.body.notebooks).toHaveLength(0);

        done();
    })

    test('notebook get all route returns correct data with notebooks', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();

        const notebookA = (await request
            .post(`/accounts/${id}/notebooks/`)
            .set('authorization', `Bearer ${token}`)
            .send({ name: "Notebook A" }))
            .body.notebook;

        const notebookB = (await request
            .post(`/accounts/${id}/notebooks/`)
            .set('authorization', `Bearer ${token}`)
            .send({ name: "Notebook B" }))
            .body.notebook;

        const res = await request
            .get(`/accounts/${id}/notebooks/`)
            .set('authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty("notebooks");
        expect(res.body.notebooks).toHaveLength(2);
        expect(res.body.notebooks).toContainEqual(notebookA);
        expect(res.body.notebooks).toContainEqual(notebookB);

        done();
    })

    // delete notebook test
    test('notebook is successfully deleted', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();

        let notebook = await createTestNotebook(id, token);
        let notebookId = notebook._id;

        expect(await Notebook.findById(notebookId)).toBeDefined();

        const res = await request
            .delete(`/accounts/${id}/notebooks/${notebookId}`)
            .set('authorization', `Bearer ${token}`)
            .send()
            .expect(200);

        expect(await Notebook.findById(notebookId)).toBeNull();

        done();
    });
});

describe('Note routes', () => {
    test('created note returns correct data', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);

        const res = await request
            .post(`/accounts/${id}/notebooks/${notebook._id}/notes/`)
            .set('authorization', `Bearer ${token}`)
            .send({ title: "Test note", content: "Test content!", starred: true })
            .expect(201);

        let note = res.body.note;

        expect(res.body).toHaveProperty("note");
        expect(note.title).toBe("Test note");
        expect(note.starred).toBe(true);
        expect(note.owner).toBe(id);
        expect(note.notebook).toBe(notebook._id);
        expect(note).toHaveProperty("_id");

        done();
    });

    test('created note is added to notebook', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);

        const res = await request
            .post(`/accounts/${id}/notebooks/${notebook._id}/notes/`)
            .set('authorization', `Bearer ${token}`)
            .send({ title: "Test note", content: "Test content!", starred: true })
            .expect(201);

        expect(res.body.note.notebook).toBe(notebook._id);

        let updatedNotebook = await Notebook.findById(notebook._id);

        expect(updatedNotebook.notes).toHaveLength(1);
        expect(updatedNotebook.notes).toContainEqual(new ObjectId(res.body.note._id));
        done();
    });

    test('note get route with content not populated returns correct data', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);
        let testNote = await createTestNote(id, notebook._id, token);

        const res = await request
            .get(`/accounts/${id}/notebooks/${notebook._id}/notes/${testNote._id}`)
            .set('authorization', `Bearer ${token}`)
            .send({ populate: false })
            .expect(200);

        let note = res.body.note;

        expect(res.body).toHaveProperty("note");
        expect(note.title).toBe("Test note");
        expect(note.starred).toBe(true);
        expect(note.owner).toBe(id);
        expect(note.notebook).toBe(notebook._id);
        expect(note._id).toBe(testNote._id);

        done();
    });

    test('note get route with content populated returns correct data', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);
        let testNote = await createTestNote(id, notebook._id, token);

        const res = await request
            .get(`/accounts/${id}/notebooks/${notebook._id}/notes/${testNote._id}`)
            .set('authorization', `Bearer ${token}`)
            .send({ populate: true })
            .expect(200);

        let note = res.body.note;

        console.log(note);

        expect(res.body).toHaveProperty("note");
        expect(note.title).toBe("Test note");
        expect(note.starred).toBe(true);
        expect(note.owner).toBe(id);
        expect(note.notebook).toBe(notebook._id);
        expect(note).toHaveProperty("content");
        expect(note.content).toBe("Test content!");
        expect(note._id).toBe(testNote._id);

        done();
    });

    test('note is successfully updated', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);
        let testNote = await createTestNote(id, notebook._id, token);

        let noteContentId = (await Note.findById(testNote._id)).content;
        let originalNoteContent = (await NoteContent.findById(noteContentId)).content;
        expect(originalNoteContent).toBe("Test content!");
        expect(testNote.title).toBe("Test note");
        expect(testNote.tags).toHaveLength(0);
        expect(testNote.starred).toBe(true);
        let previousEditDate = testNote.edited;

        const res = await request
            .put(`/accounts/${id}/notebooks/${notebook._id}/notes/${testNote._id}`)
            .set('authorization', `Bearer ${token}`)
            .send({ title: "This 123 is a new title", content: "This is new content?!", tags: ["test", "todo"], starred: false })
            .expect(200);

        expect(res.body).toHaveProperty("note");

        let note = await Note.findById(res.body.note._id);

        expect(note.title).toBe("This 123 is a new title");
        expect((await NoteContent.findById(note.content)).content).toBe("This is new content?!");
        expect(note.tags.toObject()).toStrictEqual(["test", "todo"]);
        expect(note.starred).toBe(false);
        expect(note.edited.toISOString()).not.toBe(previousEditDate);

        done();
    });

    test('note is successfully deleted', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);
        let testNote = await createTestNote(id, notebook._id, token);

        expect(await Note.findById(testNote._id)).toBeDefined();

        const res = await request
            .delete(`/accounts/${id}/notebooks/${notebook._id}/notes/${testNote._id}`)
            .set('authorization', `Bearer ${token}`)
            .send()
            .expect(200);

        expect(await Note.findById(testNote._id)).toBeNull();
        done();
    });

    test('note is removed from notebook when deleted', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);
        let testNote = await createTestNote(id, notebook._id, token);

        expect((await Notebook.findById(notebook._id)).notes).toContainEqual(new ObjectId(testNote._id));

        const res = await request
            .delete(`/accounts/${id}/notebooks/${notebook._id}/notes/${testNote._id}`)
            .set('authorization', `Bearer ${token}`)
            .send()
            .expect(200);

        expect((await Notebook.findById(notebook._id)).notes).not.toContainEqual(new ObjectId(testNote._id));
        done();
    });

    test('note is successfully moved when given proper target notebook', async (done) => {
        await createTestAccount();
        let { token, id } = await loginToTestAccount();
        let notebook = await createTestNotebook(id, token);
        let testNote = await createTestNote(id, notebook._id, token);

        let targetNotebook = (await request
            .post(`/accounts/${id}/notebooks/`)
            .set('authorization', `Bearer ${token}`)
            .send({ name: "Target notebook" })).body.notebook;

        let originalNotebook = await Notebook.findById(notebook._id);

        // check that note's notebook is original notebook
        expect(testNote.notebook).toBe(originalNotebook._id.toString());
        // check that original notebook contains note
        expect(originalNotebook.notes).toContainEqual(new ObjectId(testNote._id));
        // check that target notebook does not note
        expect(targetNotebook.notes).not.toContainEqual(testNote._id);

        // move
        const res = await request
            .post(`/accounts/${id}/notebooks/${notebook._id}/notes/${testNote._id}/move`)
            .set('authorization', `Bearer ${token}`)
            .send({ targetNotebookId: targetNotebook._id })
            .expect(200);

        let movedNote = await Note.findById(testNote._id);
        let movedTargetNotebook = await Notebook.findById(targetNotebook._id);
        let movedOriginalNotebook = await Notebook.findById(notebook._id);

        // check that note's notebook is target notebook
        expect(movedNote.notebook.toString()).toBe(movedTargetNotebook._id.toString());
        // check that target notebook contains note
        expect(movedTargetNotebook.notes).toContainEqual(movedNote._id);
        // check that original notebook does not contain note
        expect(movedOriginalNotebook.notes).not.toContainEqual(movedNote._id);

        done();
    });

    test('note is not moved and returns 403 when target notebook is not owned', async (done) => {



        done();
    });
});

server.close();