var fs = require('fs'),
    srcToCSSP = require('./../../lib/gonzales.cssp.node.js').srcToCSSP,
    csspToSrc = require('./../../lib/cssp.translator.node.js').csspToSrc,
    d_dir = __dirname + '/data',
    d_list = fs.readdirSync(d_dir),
    okn = total = 0;

var funcs = {
    'p': function parse(src, match) {
            return treeToString(cleanInfo(srcToCSSP(src, match, true)));
         },
    'l': function translate(src, match) {
            return csspToSrc(srcToCSSP(src, match, true), true);
         }
};

d_list.forEach(function(rule_dir) {
    if (/^test/.test(rule_dir)) {
        var rule = rule_dir.substring(5),
            path = d_dir + '/' + rule_dir + '/',
            list = fs.readdirSync(path),
            ext,
            files = {},
            k, a, b, c, src, t, r;

        list.forEach(function(f) {
            var i = f.lastIndexOf('.');

            if (i !== -1) {
                ext = f.substring(i + 1);
                k = f.substring(0, i);
                if (!(k in files)) files[k] = {};
                files[k][ext] = 1;
            }
        });

        for (k in files) {
            if (files[k].css) {
                src = readFile(path + k + '.css').trim();
                t = '\'' + rule + '\' / \'' + k + '.';
                for (a in funcs) {
                    if (a in files[k]) {
                        total++;
                        r = (((b = funcs[a](src, rule)) == (c = readFile(path + k + '.' + a).trim())));
                        r && okn++;
                        if (!r) {
                            console.log('FAIL: ' + t + a);
                            console.log('======= expected');
                            console.log(c);
                            console.log('======= result');
                            console.log(b);
                        }
                    }
                }
            }
        }
    }
});

console.log('Total: ' + total + '. Ok: ' + okn + '. Fail: ' + (total - okn));

function readFile(path) {
    return fs.readFileSync(path).toString();
}

function treeToString(tree, level) {
    var spaces = dummySpaces(level),
        level = level ? level : 0,
        s = (level ? '\n' + spaces : '') + '[';

    tree.forEach(function(e) {
        s += (Array.isArray(e) ? treeToString(e, level + 1) : ('\'' + e.toString() + '\'')) + ', ';
    });

    return s.substr(0, s.length - 2) + ']';
}

function dummySpaces(num) {
    return '                                                  '.substr(0, num * 2);
}

function printTree(tree) {
    require('sys').print(treeToString(tree));
}

function cleanInfo(tree) {
    var r = [];
    tree = tree.slice(1);

    tree.forEach(function(e) {
        r.push(Array.isArray(e) ? cleanInfo(e) : e);
    });

    return r;
}
