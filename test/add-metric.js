// Assignment Version Number: BEJ202102
const request = require('supertest');
const assert = require('assert');
const { median, addMetric, sum, getMetric, getInActiveMetricWindows } = require('../utils/functions');

describe('Post Endpoints', () => {
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

    it('responds to POST /:metric', async () => {
        const res = await request(server).post('/134879156468').send({ value: 1 });
        assert(res.statusCode === 200);
        assert(res.text === "OK");
    });
})

describe('least of median in even numbered list', () => {
    it('expect median to be 6', () => {
        let medians = [6, 7, 5, 8];
        let data = median(medians);
        assert(data === 6);
    });
});

describe('post metrics after every 100ms for 30s and get the median', function () {
    this.timeout(31000);

    // A sample of the values that will be sent to the server
    let sampleValues = [93,42,36,51,94,43,33,95,47,89,63,78,82,98,43,63,36,48,85,88,60,96,44,11,55,14,75,37,35,9,29,41,35,7,19,4,43,63,33,99,84,7,37,95,15,24,32,32,60,25,34,87,90,81,89,25,91,6,36,95,97,20,39,55,52,26,9,5,36,17,75,86,35,39,67,83,54,60,84,16,68,27,96,75,38,35,40,46,64,88,8,32,65,94,66,44,94,73,39,92,42,48,31,11,42,66,88,5,16,74,38,7,82,68,8,67,29,52,21,70,38,76,67,26,27,29,93,87,49,44,92,22,36,83,13,6,93,56,89,66,68,16,25,81,18,17,69,44,42,28,66,49,15,45,43,86,75,46,29,32,59,2,69,7,22,38,40,66,71,32,63,3,80,26,90,66,95,18,81,83,88,70,18,79,70,41,20,89,63,11,90,71,32,97,72,34,82,46,73,93,34,25,76,25,17,70,11,20,38,64,7,28,40,38,67,92,13,30,61,69,67,52,8,36,89,46,11,1,84,53,84,59,78,31,59,76,4,12,18,70,6,59,47,46,17,42,38,98,19,71,57,17,39,100,80,81,93,13,96,43,97,39,74,94,70,20,45,12,14,93,48,95,97,92,17,9,13,22,76,3,20,35,89,35,12,57,65,86,50,82,7,10,1,33,64,69,10,66,91];
    let metrics = [];
    // Keep track of the sample value to use
    let index = 0;
    
    let interval = setInterval(async () => {
        metrics = await addMetric(metrics, sampleValues[index], Date.now());
        ++index;
    }, 100);

    it('should ignore active window while retrieving metrics', function () {
        setTimeout(async () => {
            let metricWindows = await getInActiveMetricWindows(metrics);
            assert(metricWindows.length === 1);
        }, 15000)
    })

    // Run this test after 30s
    it(`should have 3 metrics`, function (done) {
        setTimeout(() => {
            clearInterval(interval);
            assert(metrics.length === 3);
            done();
        }, 30000)
    });

    // No need to setTimeout here. The previous test will hold the
    // queue and therefore this function runs after 30s
    it('should get the right median metric of 51', async function () {
        let medianMetric = await getMetric(metrics);
        assert(medianMetric === 51);
    })
});

describe('record one metric within one 10 second window', function() {
    this.timeout(11000);
    // A sample of the values that will be sent to the server
    let sampleValues = [49,82,58,12,90,81,45,60];
    let metrics = [];
    // Keep track of the sample value to use
    let index = 0;
    // Reference to the intervals in order to be able to clear them
    let firstInterval, secondInterval;

    let recordMetrics = async function() {
        metrics = await addMetric(metrics, sampleValues[index], Date.now());
        ++index;
    }

    it('should only have one metric window' , function (done) {
        // Start the first interval
        firstInterval = setInterval(recordMetrics, 1000);

        // Clear the first interval after 7s
        setTimeout(() => {
            clearInterval(firstInterval);
        }, 7000)

        // Start the second interval at 8.5s
        setTimeout(() => {
            secondInterval = setInterval(recordMetrics, 1000);
        }, 8500);        

        // Stop the second interval at 9.999s
        setTimeout(() => {
            clearInterval(secondInterval);
            assert(metrics.length === 1);
            // Call done to stop move to next test
            done();
        }, 9999);
    });

    // Run this test immediately after the previous one
    it('should have a median of 58', async function () {
        setTimeout(async () => {
            let medianMetric = await getMetric(metrics);
            assert(medianMetric === 58);
        }, 0);
    })
})

describe('record two metrics within two 10 second windows', function() {
    this.timeout(26000);
    // A sample of the values that will be sent to the server
    let sampleValues = [49,82,58,12,90,81,45,60,11, 39,17,35,41,8,3,48,27,9,49,48,6,45,31,14,20,11,39,14,13,14,37,41,38,31,30,23,44,39,31,36,29,13,29,8,13,19,29,21,44,31,27,48,47,45,45,22,19,3,8,30,37,19,48,27,25,2,27,20,40,25,30,7,48,48,25,11,22,17,28,50,44,32,3,45,3,48,35,11,38,28,1,14,15,40,19,41,45,7,39,14,39,36,26,16,7,43,22,17,16];
    let metrics = [];
    // Keep track of the sample value to use
    let index = 0;
    // Reference to the intervals in order to be able to clear them
    let firstInterval, secondInterval;

    let recordMetrics = async function() {
        metrics = await addMetric(metrics, sampleValues[index], Date.now());
        ++index;
    }

    it('should only have two metric windows' , function (done) {
        // Start the first interval
        firstInterval = setInterval(recordMetrics, 1000);

        // Clear the first interval after 9.5s
        setTimeout(() => {
            clearInterval(firstInterval);
        }, 9500)

        // Start the second interval at 15s
        setTimeout(() => {
            secondInterval = setInterval(recordMetrics, 100);
        }, 15000);

        // Stop the second interval at 24.999s
        setTimeout(() => {
            clearInterval(secondInterval);
            assert(metrics.length === 2);
            // Call done to stop move to next test
            done();
        }, 24999);
    });

    // Run this test at the 25s and get the median
    it('should have a median of 27', async function () {
        setTimeout(async () => {
            let medianMetric = await getMetric(metrics);
            assert(medianMetric === 27);
        }, 1000);
    })
})