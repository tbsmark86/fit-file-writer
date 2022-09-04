import QUnit from 'qunit';
// Assert binary result is hard ... we simply parse the result
// again and validate that :)
import FitParser from 'fit-file-parser';

import { FITEncoder } from './encoder.js';

QUnit.assert.close = function(number, expected) {
    const error = 0.00001;
    this.pushResult({
	result: number === expected || (number < expected + error && number > expected - error),
	actual: number,
	expected: expected
    });
}

QUnit.test('simple course', async function(assert) {
    const now = new Date();
    now.setMilliseconds(0);
    const future = new Date();
    future.setTime(now.getTime()+10*1000);

    const encoder = new FITEncoder();
    const points = [
	[1,2], [3,4]
    ];

    encoder.writeFileId({ type: 'course', time_created: now.getTime() });
    encoder.writeCourse({ name: 'My Course' });
    encoder.writeLap({
	timestamp: now.getTime(),
	total_timer_time: 60,
	start_time: now.getTime(),
	start_position_lat: points[0][0],
	start_position_long: points[0][1],
	end_position_lat: points[1][0],
	end_position_long: points[1][1],
    });
    // warum hat der erste record im ergebnis mehr werte?
    encoder.writeRecord({
	timestamp: now.getTime(),
	position_lat: points[0][0],
	position_long: points[0][1],
    });
    encoder.writeRecord({
	timestamp: future,
	position_lat: points[1][0],
	position_long: points[1][1],
    });
    encoder.writeEvent({
	timestamp: future,
	event: 'timer',
	event_type: 'stop_disable_all',
	event_group: 0,
    });

    const parser = new FitParser.default({force: false});
    const blob = encoder.blob;

    assert.equal(blob.size, 177);

    parser.parse(await blob.arrayBuffer(), function (error, data) {
	assert.step('parsed');
	if (error) {
	    assert.notOk(true, `Error Parsing Result: ${error}`);
	    return;
	}
	assert.deepEqual(data.file_ids,
	    [{ type: 'course', time_created: now }]
	);
	assert.deepEqual(data.course.name, 'My Course');

	assert.equal(data.laps.length, 1);
	const lap = data.laps[0];
	assert.equal(String(lap.timestamp), String(now));
	assert.equal(String(lap.start_time), String(now));
	assert.equal(lap.total_timer_time, 60);
	assert.close(lap.start_position_lat, points[0][0]);
	assert.close(lap.start_position_long, points[0][1]);
	assert.close(lap.end_position_lat, points[1][0]);
	assert.close(lap.end_position_long, points[1][1]);

	assert.equal(data.records.length, 2);
	let record = data.records[0];
	assert.equal(String(record.timestamp), String(now));
	assert.close(record.position_lat, points[0][0]);
	assert.close(record.position_long, points[0][1]);
	// Note: fit-file-parser also returns
	//  elapsed_time: 0, timer_time: 0
	// that's a bonus feature of the lib and NOT part of the FIT-file

	record = data.records[1];
	assert.equal(String(record.timestamp), String(future));
	assert.close(record.position_lat, points[1][0]);
	assert.close(record.position_long, points[1][1]);

	assert.deepEqual(data.events, [{
	    timestamp: future,
	    event: 'timer',
	    event_type: 'stop_disable_all',
	    event_group: 0
	}]);
    });
    assert.verifySteps(['parsed']);
});
