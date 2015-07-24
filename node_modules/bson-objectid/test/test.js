
var should = require("should");
var ObjectID = require("../");


describe("ObjectIDs", function() {
  it("should construct with no arguments", function() {
    var o = new ObjectID();
    o.should.be.instanceof(ObjectID);
  });

  it("should have an `id` property", function() {
    var o = new ObjectID();
    o.should.have.property("id");
    o.id.should.have.length(12);
    ObjectID.isValid(o.id).should.not.be.ok;
  });

  it("should have a `str` property", function() {
    var o = new ObjectID();
    o.should.have.property("str");
    o.str.should.have.length(24);
    ObjectID.isValid(o.str).should.be.ok;
  });

  it("should construct with a `time` argument", function() {
    var time = 1414093117;
    var o = new ObjectID(time);
    o.should.be.instanceof(ObjectID);
    o.str.substr(0,8).should.eql("5449593d");
  });

  it("should construct with an `array` argument", function() {
    var array = [ 84, 73, 90, 217, 76, 147, 71, 33, 237, 231, 109, 144 ];
    var o = new ObjectID(array);
    o.should.be.instanceof(ObjectID);
    o.str.should.eql("54495ad94c934721ede76d90");
  });

  it("should construct with a `buffer` argument", function() {
    var buffer = new Buffer([ 84, 73, 90, 217, 76, 147, 71, 33, 237, 231, 109, 144 ]);
    var o = new ObjectID(buffer);
    o.should.be.instanceof(ObjectID);
    o.str.should.eql("54495ad94c934721ede76d90");
  });

  it("should construct with a `hexString` argument", function() {
    var hexString = "54495ad94c934721ede76d90";
    var o = new ObjectID(hexString);
    o.should.be.instanceof(ObjectID);
    o.str.should.eql(hexString);
  });

  it("should construct with a `idString` argument", function() {
    var idString = "TIZÙLG!íçm";
    var o = new ObjectID(idString);
    o.should.be.instanceof(ObjectID);
    o.id.should.eql(idString);
  });

  it("should construct with `ObjectID.createFromTime(time)` and should have 0's at the end", function() {
    var time = 1414093117;
    var o = ObjectID.createFromTime(time);
    o.should.be.instanceof(ObjectID);
    o.str.should.eql("5449593d0000000000000000");
  });

  it("should construct with `ObjectID.createFromHexString(hexString)`", function() {
    var hexString = "54495ad94c934721ede76d90";
    var o = ObjectID.createFromHexString(hexString);
    o.should.be.instanceof(ObjectID);
    o.str.should.eql(hexString);
  });

  it("should correctly retrieve timestamp", function() {
    var testDate = new Date();
    var object1 = new ObjectID();
    var seconds1 = Math.floor(testDate.getTime()/1000);
    var seconds2 = Math.floor(object1.getTimestamp().getTime()/1000);
    seconds1.should.eql(seconds2);
  });

  it("should validate valid hex strings", function() {
    ObjectID.isValid("54495ad94c934721ede76d90").should.be.ok;
    ObjectID.isValid("aaaaaaaaaaaaaaaaaaaaaaaa").should.be.ok;
    ObjectID.isValid("AAAAAAAAAAAAAAAAAAAAAAAA").should.be.ok;
    ObjectID.isValid("000000000000000000000000").should.be.ok;
  });

  it("should validate legit ObjectID objects", function() {
    var o = new ObjectID();
    ObjectID.isValid(o).should.be.ok;
  });

  it("should invalidate bad strings", function() {
    ObjectID.isValid().should.not.be.ok;
    ObjectID.isValid(null).should.not.be.ok;
    ObjectID.isValid({}).should.not.be.ok;
    ObjectID.isValid([]).should.not.be.ok;
    ObjectID.isValid(true).should.not.be.ok;
    ObjectID.isValid("invalid").should.not.be.ok;
    ObjectID.isValid("").should.not.be.ok;
    ObjectID.isValid("zzzzzzzzzzzzzzzzzzzzzzzz").should.not.be.ok;
    ObjectID.isValid("54495-ad94c934721ede76d9").should.not.be.ok;
  });

  it("should evaluate equality with .equals()", function() {
    var id1 = ObjectID();
    var id2 = ObjectID(id1.str);
    (id1.equals(id2)).should.be.true;
  });

  it("should evaluate equality with via deepEqual", function() {
    var id1 = ObjectID();
    var id2 = ObjectID(id1.str);
    id1.should.eql(id2);

    var id3 = ObjectID();
    id1.should.not.eql(id3, "id1 is not the same as id3");
  });

  it("should generate valid hex strings", function() {
    var h = ObjectID.generate();
    ObjectID.isValid(h).should.be.ok;
  });

  it("should convert to a hex string for JSON.stringify", function() {
    var hexString = "54495ad94c934721ede76d90";
    var o = {o:new ObjectID(hexString)};
    var strngd = JSON.stringify(o);
    strngd.should.eql('{"o":"54495ad94c934721ede76d90"}');
  });

  it("should convert to a hex string for ObjectID.toString()", function() {
    var hexString = "54495ad94c934721ede76d90";
    var o = new ObjectID(hexString);
    o.toString().should.eql("54495ad94c934721ede76d90");
  });

  it("should throw and error if constructing with an invalid string", function() {
    (function(){
      var o = new ObjectID("tttttttttttttttttttttttt");
    }).should.throw();
  });

});

