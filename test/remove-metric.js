// Assignment Version Number: BEJ202102
const request = require('supertest');
const assert = require('assert');
const { addMetric, deleteMetrics, getMetric } = require('../utils/functions');

describe('Delete Endpoints', function () {
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

    it('respond to DELETE /:metric', async function () {
        const res = await request(server).delete('/154687971');
        assert(res.statusCode === 200);
        assert(res.text === "OK");
    })
})

describe('deletes metrics leaving the currently active one only', function () {
    this.timeout(16000);

    // A sample of the values that will be sent to the server
    let sampleValues = [49,82,58,12,90,81,45,60,11, 39,17,35,41,8,3];
    let metrics = [];
    // Keep track of the sample value to use
    let index = 0;

    // Reference to the intervals in order to be able to clear them
    let interval = setInterval(async function() {
        metrics = await addMetric(metrics, sampleValues[index], Date.now());
        ++index;
    }, 1000);

    it('should delete all metrics apart from ones in the active window', function() {
        setTimeout(async () => {
            clearInterval(interval);
            // Check whether there are two metric windows
            metrics = await deleteMetrics(metrics);
            assert(metrics.length === 1);
        }, 15000)
    });
});