// parser
var gonzo = require('gonzales-ast');

function uglyfyAST(ast) {
  return gonzo.traverse(ast, [
    require('./ugly/space-adjacent'),
    require('./ugly/space-functions'),
    require('./ugly/space-trim'),
    require('./ugly/space-single'),
    require('./ugly/space-delimiter'),
    require('./ugly/space-rulesets'),
    require('./ugly/space-attribs'),
    require('./ugly/space-important'),
    require('./ugly/space-mq'),
    require('./ugly/space-at-block'),
    require('./ugly/space-values'),
    require('./ugly/space-selectorops'),
    require('./ugly/ie-pseudo-fix'),
    require('./ugly/dedup-delimiters'),
    require('./ugly/last-delimiter')
  ]);
}

function uglyAST(ast) {
  ast = gonzo.traverse(ast, [
    require('./ugly/comments')
  ]);

  return uglyfyAST(ast);
}

function prettyAST(ast) {
  ast = uglyfyAST(ast);
  return gonzo.traverse(ast, [
    require('./pretty/tops'),
    require('./pretty/blocks'),
    require('./pretty/at'),
    require('./pretty/at-block'),
    require('./pretty/value'),
    require('./pretty/last-delimiter'),
    require('./pretty/selector'),
    require('./pretty/mq')
  ]);
}

exports.ugly = function ugly(css) {
  var ast = gonzo.parse(css);
  ast = uglyAST(ast);
  return gonzo.toCSS(ast);
};

exports.pretty = function pretty(css) {
  var ast = gonzo.parse(css);
  ast = prettyAST(ast);
  return gonzo.toCSS(ast);
};

exports.uglyAST = uglyAST;
exports.prettyAST = prettyAST;
exports.util = require('./util');
exports.visitors = {
  ugly: []
};

[
  'comments',
  'space-functions',
  'space-trim',
  'space-single',
  'space-delimiter',
  'space-rulesets',
  'space-attribs',
  'space-important',
  'space-mq',
  'space-at-block',
  'space-values',
  'space-selectorops',
  'ie-pseudo-fix',
  'dedup-delimiters',
  'last-delimiter'
].forEach(function(m) {
  exports.visitors.ugly[m] = require('./ugly/' + m);
})