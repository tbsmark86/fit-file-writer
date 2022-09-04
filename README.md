
Generate .FIT files in the Browser/Node.
Currently intented for Course-Files but could be extended to other types if desired.

## API

... TODO ... !

### "Low" level API

```
    import { FITEncoder } from './encoder.js';
    // or include dist/fit-file-writer.js and just use the global object


    const encoder = new FITEncoder();
    // start file
    encoder.writeFileId({ type: 'course', time_created: now.getTime() });

    encoder.writeCourse({ name: 'My Course' });
    // FIT files may contain multiple laps
    // see src/mesg.js for possible values
    encoder.writeLap({ ... });
    encoder.writeRecord({ ... });
    ...

    // get result
    const result = encode.blob;
```

### data types

* pass timestamps as normal Javascript milliseconds stamps
* they will be converted to FIT-style stamps (in seconds)
* Note: the FIT epoch starts at 1989-12-31T00:00 underflows will result in 
  values > year 2058 when reading

* pass normal lat/long values FIT uses semicircles so some rounding errors may 
  occur

* distance is in meters

## License

Licensed under the [MIT License (MIT)](LICENSE)

## Credits

Extracted as a lib from the fit-route project by Nick Hollway:
https://gitlab.com/nwholloway/fit-route/-/tree/8467d5baf7d8955f0e931074972796824d582ce2
