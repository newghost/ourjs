BSON ObjectID
=============

This mdoule allows you to create and parse `ObjectID`s without a reference to the
[mongodb](https://github.com/mongodb/node-mongodb-native) or [bson](https://github.com/mongodb/js-bson)
modules.

The goal is to be 100% compatable with all [bson](https://github.com/mongodb/js-bson)'s
public API implementation (found here: https://github.com/mongodb/js-bson/blob/master/lib/bson/objectid.js).

## Install
    $ npm install bson-objectid

## Usage
```javascript
var ObjectID = require("bson-objectid");

console.log(ObjectID());
console.log(ObjectID("54495ad94c934721ede76d90"));
console.log(ObjectID(1414093117));//time
console.log(ObjectID([ 84, 73, 90, 217, 76, 147, 71, 33, 237, 231, 109, 144 ]));
console.log(ObjectID(new Buffer([ 84, 73, 90, 217, 76, 147, 71, 33, 237, 231, 109, 144 ])));
```

### ObjectID()<br>ObjectID(time)<br>ObjectID(hexString)<br>ObjectID(idString)<br>ObjectID(array)<br>ObjectID(buffer)
Creates a new immutable `ObjectID` instance based on the current system time.

Possible arguments:<br>
**time** Constructs the instance based on the specified time (in seconds).<br>
**hexString** Constructs the instance from a 24 character hex string.<br>
**idString** Constructs the instance from a 12 byte string.<br>
**array** Constructs the instance from an `Array` of 24 bytes.<br>
**buffer** Constructs the instance from a 24 byte `Buffer` instance.<br>

#### #id
**returns** the 12 byte id string.

#### #str
#### #toHexString()
**returns** the `ObjectID` represented as a 24 character hex string.

#### #equals(other)
**returns** true if the `ObjectID`s represent the same underlying value. Otherwise false.
#### #getTimestamp()
**returns** the generation `Date` (accurate up to the second) that this `ObjectID` was generated.

### ObjectID.createFromTime(time)
Creates an ObjectID from a time (in seconds) `Number`, with the rest of the `ObjectID` zeroed out. Used for comparisons or sorting the ObjectID.

### ObjectID.createFromHexString(hexString)
Creates an ObjectID from a 24 character hex string.

### ObjectID.isValid(hexString)<br>ObjectID.isValid(ObjectID)
Checks if a value is a valid `ObjectID` or 24 character hex string.
> THE NATIVE DOCUMENTATION ISN'T CLEAR ON THIS GUY!<br>
> See: http://mongodb.github.io/node-mongodb-native/api-bson-generated/objectid.html#objectid-isvalid

### ObjectID.generate()<br>ObjectID.generate(time)
You can use this to generate a 24 character hex string without instantiating a `ObjectID` instance.

This diverges from [bson](https://github.com/mongodb/js-bson)'s implementation which returns the 12 byte string.

**returns** a valid 24 character `ObjectID` hex string.

## Test
    mocha

or

    npm test

License
=======
Apache v2.0

See LICENSE file.

Special callout to [@feross](https://github.com/feross) for the [is-buffer](https://github.com/feross/is-buffer) code
used internally to avoid Buffer from being loaded in browserify environments.
