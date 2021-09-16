// Assignment Version Number: BEJ202102
const request = require('supertest');
const assert = require('assert');

describe('Get Endpoints', () => {
    let server;
    beforeEach(function () {
        // Remove any cached server import to ensure new instance is created
        delete require.cache[require.resolve('../index')];
        server = require('../index');
    });

    // Close the server after the test
    afterEach(function () {
        server.close();
    });

    it('responds to GET /:metric/median', async () => {
        const res = await request(server).get('/15486789797/median');
        assert(res.statusCode === 200);
        assert(typeof res.body === "object");
        assert(res.body.hasOwnProperty("median") === true);
    })
})
