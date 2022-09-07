import QUnit from 'qunit';
import FitParser from 'fit-file-parser';

import { FITCourseFile } from './course.js';

QUnit.assert.close = function(number, expected) {
    const error = 0.00001;
    this.pushResult({
	result: number === expected || (number < expected + error && number > expected - error),
	actual: number,
	expected: expected
    });
}

QUnit.test('course helper class', async function(assert) {
    const now = new Date();
    now.setMilliseconds(0);
    const nowT = now.getTime();

    const myCourse = new FITCourseFile('foo', nowT, 120, [1,1], [10,10]);
    myCourse
	.point(nowT, [1,1] /* lat/log*/)
	.point(nowT, [1,2])
	.point(nowT, [1,3], 50, 100)
	.point(nowT, [1,4], 55, 150)
	.turn(nowT, [2,4], 'right', 'go right', 200)
	.point(nowT, [2,5], 50, 250)
	.turn(nowT, [2,4], 'left');

    const blob = myCourse.finalize(nowT);
    assert.equal(blob.size, 332);

    const parser = new FitParser.default({force: false});

    parser.parse(await blob.arrayBuffer(), function (error, data) {
	assert.step('parsed');
	if (error) {
	    assert.notOk(true, `Error Parsing Result: ${error}`);
	    return;
	}
	assert.deepEqual(data.file_ids[0].type, 'course');
	assert.deepEqual(data.course.name, 'foo');
	assert.equal(data.laps.length, 1);

	assert.equal(data.records.length, 5);
	let record = data.records[1];
	assert.close(record.position_lat, 2);
	assert.notOk('distance' in record);

	record = data.records[2];
	assert.equal(record.altitude, 50);
	assert.equal(record.distance, 100);

	assert.equal(data.events.length, 1);
	
	assert.equal(data.course_points.length, 2);
	record = data.course_points[0];
	assert.equal(record.type, 'right');
	assert.equal(record.name, 'go right');
	assert.equal(record.distance, 200);

	record = data.course_points[1];
	assert.equal(record.type, 'left');
	assert.notOk('distance' in record);
    });
    assert.verifySteps(['parsed']);
});
