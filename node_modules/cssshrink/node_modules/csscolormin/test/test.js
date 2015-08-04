var min = require('../index.js').min;
var assert = require('assert');

assert.equal(min("white"), "#fff");
assert.equal(min("black"), "#000");
assert.equal(min("fuchsia"), "#f0f");
assert.equal(min("red"), "red");
assert.equal(min("#333333"), "#333");
assert.equal(min("rgb(10, 30, 25)"), "#0a1e19");
assert.equal(min("rgba(10, 30, 25, 1)"), "#0a1e19");
assert.equal(min("rgba(10, 30, 25, 0.1)"), "rgba(10,30,25,.1)");
assert.equal(min("rgba(255, 0, 0, 0)"), "rgba(255,0,0,0)");
assert.equal(min("hsl(120, 50%, 60%)"), "#6c6");
assert.equal(min("blue"), "blue");
assert.equal(min("goldenrod"), "#daa520");
assert.equal(min([255, 0,   0, 1]), "red");
assert.equal(min([0, 0, 0, 0]), "transparent");
assert.equal(min([255, 127, 0]), "#ff7f00");
assert.equal(min({r: 0, g: 0, b: 255, a: 0.5}), "rgba(0,0,255,.5)");

console.log('all good!');
