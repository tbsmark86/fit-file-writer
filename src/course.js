
import { FITEncoder } from './encoder.js';

/**
 * Helper to create a typical course file
 */
export class FITCourseFile {
    /**
     * Start process
     * name - try to keep < 16 bytes to avoid problems with some devices
     * start_time - Microseconds Timestamp
     * total_time_time - Duration in Seconds
     * start, end - lon/lat array
     * ascend, descend - meters (optional)
     */
    constructor(name, start_time, total_timer_time, start, end, ascend, descend) {
	this.encoder = new FITEncoder();
	const now = Date.now();

	this.encoder.writeFileId({ type: 'course', time_created: now });
	this.encoder.writeCourse({ name: name });
	this.encoder.writeLap({
	    timestamp: now,
	    start_time: start_time,
	    total_timer_time: total_timer_time,
	    start_position_long: start[0],
	    start_position_lat: start[1],
	    end_position_long: end[0],
	    end_position_lat: end[1],
	    total_ascent: ascend,
	    total_descent: descend
	});
	this.encoder.writeEvent({
	    timestamp: start_time,
	    event: 'timer',
	    event_type: 'start',
	    event_group: 0
	})
    }

    /**
     * Add the next point to file
     * time - Microseconds Timestamp
     * pos - lat/long array
     * altitude - meters
     * distance - total distance since start in meters
     *
     * altitude/distance can be undefined
     */
    point(time, pos, altitude, distance) {
	this.encoder.writeRecord({
	    timestamp: time,
	    position_long: pos[0],
	    position_lat: pos[1],
	    altitude: altitude,
	    distance: distance,
	});
	return this;
    }

    /**
     * Add the next turn instruction.
     * time - Microseconds Timestamp
     * pos - lat/long array
     * type - enum as string see src/types course_point
     * name - Description Text
     * distance - total distance since start in meters
     *
     * You can mix these with points or add the all at the end.
     */
    turn(time, pos, type, name, distance) {
        this.encoder.writeCoursePoint({
            timestamp: time,
            position_long: pos[0],
            position_lat: pos[1],
            type: type,
            name: name,
            distance: distance,
        });
	return this;
    }

    /** Close file and return as blob
     * time - Microseconds Timestamp of end
     */
    finalize(time) {
	this.encoder.writeEvent({
	    timestamp: time,
	    event: 'timer',
	    event_type: 'stop_disable_all',
	    event_group: 0,
	});
	return this.encoder.blob;
    }
}
