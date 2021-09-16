/**
 * Finds sum of the elements in an array 
 * @param arr array for which to get the sum
 * @returns the sum of elements in the array
 */
function sum (arr = []) {
    let sum = 0;
    arr.forEach(el => sum += el);
    return sum;
}

/**
 * Given an array gets the median. If the length of given array is even, 
 * returns the least of the two elements in the middle
 * @param arr the array from which to get the median
 * @returns median of the input array
 */
function median(arr = []) {
    // Sort in ascending order
    let sorted = arr.sort((a, b) => a - b);
    // If the list has even number of items, get least of 2
    if(sorted.length % 2 === 0) {
        let half = sorted.length / 2;
        let firstMedian = sorted[half];
        let secondMedian = sorted[half - 1];
        if(firstMedian < secondMedian) return firstMedian;
        return secondMedian;
    }
    // If the list has odd number of items, get the middle one
    return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Given an array pushes the value into it depending on the time metric was sent
 * @param metrics an array of metrics
 * @param value value to be pushed into metrics array
 * @param metricMilliseconds the time in milliseconds that the metric value was sent
 * @returns a promise that reasolve to a list of updated metrics
 */
function addMetric(metrics = [], value, metricMilliseconds) {
    return new Promise((resolve, reject) => {
        if(metrics.length) {
            // Get the last metric  window that was added
            let lastMetric = metrics[metrics.length - 1];
            const { startTime } = lastMetric;
            // If the difference between the last metric window and the current metric is
            // within 10000 ms i.e. 10 seconds, add the current metric to that window. Else
            // create a new window and push into the metrics array
            if(metricMilliseconds - startTime <= 10000) {
                metrics[metrics.length - 1]["metrics"].push(value);
            } else {
                metrics.push({ startTime: metricMilliseconds, metrics: [value] });
            }
        } else {
            metrics.push({ startTime: metricMilliseconds, metrics: [value] });
        }
        return resolve(metrics);
    })
}

/**
 * 
 * @param metrics array of metric from which to get the active window
 * @returns a promise resolving to an array averages of the inactive metrics
 */
function getInActiveMetricWindows(metrics) {
    return new Promise((resolve, reject) => {
        let now = Date.now();
        let averages = [];
        metrics.forEach(metricWindow => {
            // If the difference between the current time and the metric
            // window is less than 10 seconds then calculate it's average
            if(now - metricWindow.startTime >= 10000) {
                let average = getAverage(metricWindow.metrics);
                // Round off the average before pushing into average array
                averages.push(Math.round(average));
            }
        });
        resolve(averages);
    })
}

/**
 * Given an array pushes the value into it depending on the time metric was sent
 * @param metrics an array of metrics
 * @returns promise resolving to median of average of metrics
 */
function getMetric(metrics) {
    return new Promise(async (resolve, reject) => {
        let averages = await getInActiveMetricWindows(metrics);
        if(averages.length) {
            resolve(median(averages));
        } else {
            resolve(null);
        }
    });
}

/**
 * Given an array of metrics, deletes the ones that are not active
 * @param metrics an array of metrics
 * @returns a promise resolving to the updated metrics
 */
function deleteMetrics(metrics) {
    return new Promise((resolve, reject) => {
        // Get the last window and if it still active, leave it in the array
        // else, clear the whole array
        if(metrics.length) {
            let lastMetric = metrics[metrics.length - 1];
            const now = Date.now();
            if(now - lastMetric.startTime <= 10000) {
                metrics = [lastMetric];
            } else {
                metrics = [];
            }
        }
        return resolve(metrics);
    })
}

/**
 * Given an array returns its average
 * @param arr array for which to find the average
 * @returns average
 */
function getAverage(arr) {
    return sum(arr) / arr.length;
}

module.exports = {
    sum,
    median,
    addMetric,
    getMetric,
    deleteMetrics,
    getAverage,
    getInActiveMetricWindows
}