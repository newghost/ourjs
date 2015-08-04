var FS = require('fs'),
    PATH = require('path'),
    G = require('..'),
    Benchmark = require('benchmark'),
    suite = module.exports = new Benchmark.Suite();

var css3pane = read('3pane.css');

suite
    .add('srcToCSSP(3pane.css)', function() {
        G.srcToCSSP(css3pane);
    })
    .on('cycle', function(data) {
        if (data.target.error) console.error(data.target.error.stack);
        console.log(String(data.target));
    });

function read(file) {
    return FS.readFileSync(PATH.resolve(__dirname, 'css', file), 'utf8');
}

if (module.id === module.main) {
    suite.run({ async: true });
}
