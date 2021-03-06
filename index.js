// Assignment Version Number: BEJ202102
const express = require("express");
const morgan = require("morgan");
const { addMetric, getMetric, deleteMetrics } = require("./utils/functions");

// Create express app
const app = express();

// Register middlewares
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));
app.use(morgan('combined'));

// Array to hold the collected metrics objects. The objects will be
// of the format { startTime: Milliseconds, metrics: Array }
let metrics = [];

app.get('/', (req, res) => {
    res.send('OK');
})

// Add metric
app.post("/:metric", async (req, res) => {
    const { value } = req.body;
    const metricMilliseconds = Number(req.params.metric);
    metrics = await addMetric(metrics, value, metricMilliseconds);
    return res.send("OK");
});

// Get metric
app.get("/:metric/median", async (req, res) => {
    let median = await getMetric(metrics);
    return res.json({ median: median });
});

// Delete metric
app.delete("/:metric", async (req, res) => {
    metrics = await deleteMetrics(metrics);
    return res.send("OK");
});

// Running on port 0 means choose a random port. Useful because
// running test in parallel means 3000 might already be in use
// resulting in an error. Therefore select randomly
const port = process.env.NODE_ENV === "test" ? 0 : process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}`));

// Export the server for testing purposes
module.exports = server;