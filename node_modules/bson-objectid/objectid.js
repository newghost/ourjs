
var MACHINE_ID = parseInt(Math.random() * 0xFFFFFF, 10);
var index = ObjectID.index = parseInt(Math.random() * 0xFFFFFF, 10);
var pid = typeof process === 'undefined' ? Math.floor(Math.random() * 100000) : process.pid % 0xFFFF;

/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 */
var isBuffer = function (obj) {
  return !!(
  obj != null &&
  obj.constructor &&
  typeof obj.constructor.isBuffer === 'function' &&
  obj.constructor.isBuffer(obj)
  )
};

/**
 * Create a new immutable ObjectID instance
 *
 * @class Represents the BSON ObjectID type
 * @param {String|Number} arg Can be a 24 byte hex string, 12 byte binary string or a Number.
 * @return {Object} instance of ObjectID.
 */
function ObjectID(arg) {
  if(!(this instanceof ObjectID)) return new ObjectID(arg);
  if(arg && ((arg instanceof ObjectID) || arg._bsontype==="ObjectID"))
    return arg;

  var buf;

  if(isBuffer(arg) || (Array.isArray(arg) && arg.length===12)) {
    buf = Array.prototype.slice.call(arg);
  }
  else if(typeof arg === "string") {
    if(arg.length!==12 && !ObjectID.isValid(arg))
      throw new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");

    buf = buffer(arg);
  }
  else if(/number|undefined/.test(typeof arg)) {
    buf = buffer(generate(arg));
  }

  Object.defineProperty(this, "id", {
    enumerable: true,
    get: function() { return String.fromCharCode.apply(this, buf); }
  });
  Object.defineProperty(this, "str", {
    get: function() { return buf.map(hex.bind(this, 2)).join(''); }
  });
}
module.exports = ObjectID;
ObjectID.generate = generate;

/**
 * Creates an ObjectID from a second based number, with the rest of the ObjectID zeroed out. Used for comparisons or sorting the ObjectID.
 *
 * @param {Number} time an integer number representing a number of seconds.
 * @return {ObjectID} return the created ObjectID
 * @api public
 */
ObjectID.createFromTime = function(time){
  time = parseInt(time, 10) % 0xFFFFFFFF;
  return new ObjectID(hex(8,time)+"0000000000000000");
};

/**
 * Creates an ObjectID from a hex string representation of an ObjectID.
 *
 * @param {String} hexString create a ObjectID from a passed in 24 byte hexstring.
 * @return {ObjectID} return the created ObjectID
 * @api public
 */
ObjectID.createFromHexString = function(hexString) {
  if(!ObjectID.isValid(hexString))
    throw new Error("Invalid ObjectID hex string");

  return new ObjectID(hexString);
};

/**
 * Checks if a value is a valid bson ObjectId
 *
 * @param {String} objectid Can be a 24 byte hex string or an instance of ObjectID.
 * @return {Boolean} return true if the value is a valid bson ObjectID, return false otherwise.
 * @api public
 *
 * THE NATIVE DOCUMENTATION ISN'T CLEAR ON THIS GUY!
 * http://mongodb.github.io/node-mongodb-native/api-bson-generated/objectid.html#objectid-isvalid
 */
ObjectID.isValid = function(objectid) {
  if(!objectid) return false;

  //call .toString() to get the hex if we're
  // working with an instance of ObjectID
  return /^[0-9A-F]{24}$/i.test(objectid.toString());
};

ObjectID.prototype = {
  _bsontype: 'ObjectID',

  /**
   * Return the ObjectID id as a 24 byte hex string representation
   *
   * @return {String} return the 24 byte hex string representation.
   * @api public
   */
  toHexString: function() {
    return this.str;
  },

  /**
   * Compares the equality of this ObjectID with `otherID`.
   *
   * @param {Object} other ObjectID instance to compare against.
   * @return {Boolean} the result of comparing two ObjectID's
   * @api public
   */
  equals: function (other){
    return !!other && this.str === other.toString();
  },

  /**
   * Returns the generation date (accurate up to the second) that this ID was generated.
   *
   * @return {Date} the generation date
   * @api public
   */
  getTimestamp: function(){
    return new Date(parseInt(this.str.substr(0,8), 16) * 1000);
  }
};

function next() {
  return index = (index+1) % 0xFFFFFF;
}

function generate(time) {
  if (typeof time !== 'number')
    time = Date.now()/1000;

  //keep it in the ring!
  time = parseInt(time, 10) % 0xFFFFFFFF;

  //FFFFFFFF FFFFFF FFFF FFFFFF
  return hex(8,time) + hex(6,MACHINE_ID) + hex(4,pid) + hex(6,next());
}

function hex(length, n) {
  n = n.toString(16);
  return (n.length===length)? n : "00000000".substring(n.length, length) + n;
}

function buffer(str) {
  var i=0,out=[];

  if(str.length===24)
    for(;i<24; out.push(parseInt(str[i]+str[i+1], 16)),i+=2);

  else if(str.length===12)
    for(;i<12; out.push(str.charCodeAt(i)),i++);

  return out;
}

/**
 * Converts to a string representation of this Id.
 *
 * @return {String} return the 24 byte hex string representation.
 * @api private
 */
ObjectID.prototype.inspect = function() { return "ObjectID("+this+")" };
ObjectID.prototype.toJSON = ObjectID.prototype.toHexString;
ObjectID.prototype.toString = ObjectID.prototype.toHexString;

