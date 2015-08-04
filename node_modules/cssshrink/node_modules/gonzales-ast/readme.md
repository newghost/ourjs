This is library to help navigate CSS AST produced by the Gonzales CSS parser

## Installation

    $ npm install gonzales-ast

## Why

Gonzales eats CSS and spits AST. It also eats AST and spits CSS.

But it doesn't have an API for AST-to-AST manipulations.


## Tell me more

Additionally, this library makes the Gonzales' APIs a little more sensible (in the author's opinion).

E.g. the `srcToCSSP()` method is available as `parse()`.

Currently this library offers:
 - renamed APIs
 - a method `traverse()` to walk the AST and visit each node

## Renamed APIs

Simple usage:

    var gonzo = require('gonzales-ast');
    var ast = gonzo.parse('a {margin: 0}'); // formerly `srcToCSSP()`
    var css_string = gonzo.toCSS(ast); // formerly `csspToSrc()`
  
There's also `toTree()` (formerly `csspToTree()`) that shows a formatted view of the AST.

    gonzo.toTree(ast);
  
Returns the string:

    ['stylesheet', 
      ['ruleset', 
        ['selector', 
          ['simpleselector', 
            ['ident', 'a'], 
            ['s', ' ']]], 
        ['block', 
          ['declaration', 
            ['property', 
              ['ident', 'margin']], 
            ['value', 
              ['s', ' '], 
              ['number', '0']]]]]]


## AST visitors

When traversing the AST you can provide any number of "visitors" that take a node and look at it, and maybe do something with it.

Like:

    var newast = gonzo.traverse(ast, [
      visitor1,
      visitor2,
      {
        test: function(name, nodes) {
          return true;
        },
        process: function(node) {
          return node;
        }
      }
    ]);


Each visitor must provide a `process()` method which returns a node or `false` (which removes the node from the tree)

A visitor may provide an optional `test()` method which is a lightweight way to see whether or not the `process()` method should be called. `test()`methods return boolean.

See the `examples` directory for an examples of visitors that add, remove and change nodes.

## UI

To admire the AST that Gonzales produces, [check this out](http://ast.csspatterns.com).

## Other stuffs

 - https://github.com/css/gonzales - Gonzales itself
 - https://github.com/tonyganch/gonzales-pe - Fork of Gonzales that also supports preprocessors
 - https://github.com/csscomb/csscomb.js/ - Formatter on top of -pe. No AST-to-AST, only AST-to-string
 - https://github.com/ai/postcss/ - Another parser, source maps and more fun. Simpler AST.
 - https://github.com/visionmedia/rework - like above
