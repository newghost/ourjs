### 1. AST — Abstract Syntax Tree

If you don't know what is AST, first read [Wikipedia/Abstract syntax tree] (http://en.wikipedia.org/wiki/Abstract_syntax_tree).

#### 1.1. CSSP AST

This AST format is compatible with [CSSP] (https://github.com/css/cssp).

In general it looks like this:

    ['stylesheet',
      ['atrules', ..],
      ['s', ' '],
      ['comment', 'sample'],
      ['ruleset',
        ['selector', ..]],
        ['block', ..]]

#### 1.2. Known issues

*operator* / *unary* — rather artificial division, in addition *unary* is misnamed. Utilities working with AST may need to handle both types of nodes instead of one.

*raw* — currently *raw* contains unparsed `progid` IE. In the future it makes sense to parse that parts in full AST.

### 2. The structure of the node

Node is a JavaScript-array in the following way:

    ['token type', <- mandatory
     <contents>] <- optional
Content can be other nodes or CSS source.

In case `needInfo` was `true` when the style was parsed, the node includes info-object. Now it only contains the line number from which the token begins in style, but in the future there will be more information:

    [{ ln: ln }, <- info-object
     'token type', <- mandatory
     <content>] <- optional
If you do not know in which mode was the parsing, check the type of the first element in the first node.

### 3. Nodes

#### stylesheet

Style. The root node of AST.

Consists of *ruleset* (a set of rules with selectors), *atrules* (single-line at-rule), *atruleb* (block at-rule) and *atruler* (at-rule with *ruleset*). Also there are *s* (whitespace) and *comment* (comments).

    @import "x.png"; /*sample*/ x{p:v}

    ↓

    ['stylesheet',
      ['atrules',
        ['atkeyword',
          ['ident', 'import']],
        ['s', ' '],
        ['string', '"x.png"']],
      ['s', ' '],
      ['comment', 'sample'],
      ['s', ' '],
      ['ruleset',
        ['selector',
          ['simpleselector',
            ['ident', 'x']]],
        ['block',
          ['declaration',
            ['property',
              ['ident', 'p']],
            ['value',
              ['ident', 'v']]]]]]

#### comment

Comment.

    /* test */

    ↓

    ['comment', ' test ']

#### s

Whitespace: space, `\t`, `\n`, `\r`.

    /*a*/  /*b*/

    ↓

    ['comment', 'a'],
    ['s', '  '],
    ['comment', 'b']

#### string

String.

    'test'
    "test"

    ↓

    ['string', ''test'']
    ['string', '"test"']

#### ident

Identifiers or names.

In *atkeyword*:

    @import ..;

    ↓

    ['atkeyword',
      ['ident', 'import']]
In *clazz*:

    .abc

    ↓

    ['clazz',
      ['ident', 'abc']]
In *dimension*:

    10px

    ↓

    ['dimension',
      ['number', '10'],
      ['ident', 'px']]

#### number

Number.

    10
    12.34

    ↓

    ['number', '10']
    ['number', '12.34']

#### percentage

Number with percent sign.

    10%

    ↓

    ['percentage',
      ['number', '10']]

#### dimension

Number with dimension unit.

    10px

    ↓

    ['dimension',
      ['number', '10'],
      ['ident', 'px']]

#### shash

Hexadecimal number in *simpleselector*.

    .. #FFF .. { .. }

    ↓

    ['shash', 'FFF']

#### vhash

Hexadecimal number in *value*.

    .. { ..: #FFF }

    ↓

    ['vhash', 'FFF']

#### clazz

Class.

    .abc

    ↓

    ['clazz',
      ['ident', 'abc']]

#### namespace

Namespace sign in *simpleselector*.

    *|E { .. }

    ↓

    ['simpleselector',
      ['ident', '*'],
      ['namespace'],
      ['ident', 'E']]

#### combinator

Combinator: `+`, `>`, `~`.

    x+y { .. }

    ↓

    ['simpleselector',
      ['ident', 'x'],
      ['combinator', '+'],
      ['ident', 'y']]

#### operator

Operator: `/`, `,`, `:`, `=`.

    test(x,y)

    ↓

    ['funktion',
      ['ident', 'test'],
      ['functionBody',
        ['ident', 'x'],
        ['operator', ','],
        ['ident', 'y']]]

#### unary

Unary (or arithmetical) sign: `+`, `-`.

    nth-last-child(3n+0)

    ↓

    ['nthselector',
      ['ident', 'nth-last-child'],
      ['nth', '3n'],
      ['unary', '+'],
      ['nth', '0']]

#### uri

URI.

    @import url('/css/styles.css')

    ↓

    ['atrules',
      ['atkeyword', 
        ['ident', 'import']], 
      ['s', ' '], 
      ['uri', 
        ['string', ''/css/styles.css'']]]

#### braces

Braces.

    ()
    (1)

    ↓

    ['braces', '(', ')']
    ['braces', '(', ')',
      ['number', '1']]

#### attrselector

Attribute selector operator: `=`, `~=`, `^=`, `$=`, `*=`, `|=`.

    [a='b']

    ↓

    ['attrib',
      ['ident', 'a'],
      ['attrselector', '='],
      ['string', ''b'']]

#### attrib

Attribute selector.

    [a='b']

    ↓

    ['attrib',
      ['ident', 'a'],
      ['attrselector', '='],
      ['string', ''b'']]

#### nth

Numbers and identifiers in *nthselector*.

    :nth-child(2n+1)

    ↓

    ['nthselector', 
      ['ident', 'nth-child'], 
      ['nth', '2n'], 
      ['unary', '+'], 
      ['nth', '1']]

#### nthselector

`:nth-` pseudo-classes.

It consists of a pseudo-class *ident* and content.

    :nth-last-child(+3n-2)

    ↓

    ['nthselector',
      ['ident', 'nth-last-child'],
      ['unary', '+'],
      ['nth', '3n'],
      ['unary', '-'],
      ['nth', '2']]

#### pseudoc

Pseudo-class.

    test:visited

    ↓

    ['simpleselector', 
      ['ident', 'test'], 
      ['pseudoc', 
        ['ident', 'visited']]]

#### pseudoe

Pseudo-element.

    p::first-line

    ↓

    ['simpleselector', 
      ['ident', 'p'], 
      ['pseudoe', 
        ['ident', 'first-line']]]

#### delim

*simpleselector* delimiter in *selector*: `,`.

    x,y{ .. }

    ↓

    ['selector',
      ['simpleselector',
        ['ident', 'x']],
      ['delim'],
      ['simpleselector',
        ['ident', 'y']]]

#### simpleselector

Sets of selectors between a commas.

    x, y+z { .. }

    ↓

    ['selector',
      ['simpleselector',
        ['ident', 'x']],
      ['delim'],
      ['simpleselector',
        ['s', ' '],
        ['ident', 'y'],
        ['combinator', '+'],
        ['ident', 'z'],
        ['s', ' ']]]

#### selector

Node to store *simpleselector* groups.

    x, y, [a=b] { .. }

    ↓

    ['selector',
      ['simpleselector',
        ['ident', 'x']],
      ['delim'],
      ['simpleselector',
        ['s', ' '],
        ['ident', 'y']],
      ['delim'],
      ['simpleselector',
        ['s', ' '],
        ['attrib',
          ['ident', 'a'],
          ['attrselector', '='],
          ['ident', 'b']],
        ['s', ' ']]]

#### declaration, property, value

Node to store *property* / *value* pairs.

Consists of *property* (property name) and *value* (property value).

    color: red

    ↓

    ['declaration',
      ['property',
        ['ident', 'color']],
      ['value',
        ['s', ' '],
        ['ident', 'red']]]

#### block

Part of the style in the braces.

    { color: red }

    ↓

    ['block',
      ['s', ' '],
      ['declaration',
        ['property',
          ['ident', 'color']],
        ['value',
          ['s', ' '],
          ['ident', 'red'],
          ['s', ' ']]]]

#### decldelim

*declaration* delimiter in *block*: `;`.

    x {a: b; c: d}

    ↓

    ['block',
      ['declaration',
        ['property',
          ['ident', 'a']],
        ['value',
          ['s', ' '],
          ['ident', 'b']]],
      ['decldelim'],
      ['s', ' '],
      ['declaration',
        ['property',
          ['ident', 'c']],
        ['value',
          ['s', ' '],
          ['ident', 'd']]]]

#### filter, filterv, progid

Node to store IE `filter`.

Consists of *property* (property name), *filterv* (contents) и *progid* (`progid` itself).

    filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')

    ↓

    ['filter',
      ['property',
        ['ident', 'filter']],
      ['filterv',
        ['progid',
          ['raw', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')']]]]

#### raw

Unparsed parts of the style. Refers to a specific browser specific extensions, usually IE `filter`.

    progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')

    ↓

    ['progid',
      ['raw', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')']]]]

#### funktion, functionBody

Function.

Consists of *ident* (function name) and *functionBody* (function body).

    color: rgb(255,0,0)

    ↓

    ['declaration',
      ['property',
        ['ident', 'color']],
      ['value',
        ['s', ' '],
        ['funktion',
          ['ident', 'rgb'],
          ['functionBody',
            ['number', '255'],
            ['operator', ','],
            ['number', '0'],
            ['operator', ','],
            ['number', '0']]]]]

#### functionExpression

Node to store `expression`.

    left:expression(document.body.offsetWidth+1)

    ↓

    ['declaration',
      ['property',
        ['ident', 'left']],
      ['value',
        ['functionExpression', 'document.body.offsetWidth+1']]]

#### important

`!important` keyword.

    a: b !important

    ↓

    ['declaration',
      ['property',
        ['ident', 'a']],
      ['value',
        ['s', ' '],
        ['ident', 'b'],
        ['s', ' '],
        ['important']]]

#### ruleset

A set of rules with selectors.

Consists of *selector* (selector) and *block* (a set of rules).

    x, y {p:v}

    ↓

    ['ruleset',
      ['selector',
        ['simpleselector',
          ['ident', 'x']],
        ['delim'],
        ['simpleselector',
          ['s', ' '],
          ['ident', 'y'],
          ['s', ' ']]],
      ['block',
        ['declaration',
          ['property',
            ['ident', 'p']],
          ['value',
            ['ident', 'v']]]]]

#### atkeyword

at-rule identifier.

    @font-face ..

    ↓

    ['atkeyword',
      ['ident', 'font-face']]

#### atrules

Singleline at-rule.

Consists of *atkeyword* (at-rule identifier) and the rule.

    @import url('/css/styles.css')

    ↓

    ['atrules',
      ['atkeyword', 
        ['ident', 'import']], 
      ['s', ' '], 
      ['uri', 
        ['string', ''/css/styles.css'']]]

#### atruleb

Block at-rule.

Consists of *atkeyword* (at-rule identifier), rule and block.

    @test x y {p:v}

    ↓

    ['atruleb',
      ['atkeyword',
        ['ident', 'test']],
      ['s', ' '],
      ['ident', 'x'],
      ['s', ' '],
      ['ident', 'y'],
      ['s', ' '],
      ['block',
        ['declaration',
          ['property',
            ['ident', 'p']],
          ['value',
            ['ident', 'v']]]]]

#### atruler, atrulerq, atrulers

At-rule with *ruleset*.

Consists of *atkeyword* (at-rule identifier), *atrulerq* (rule) and *atrulers* (style).

    @media x y {s{p:v}}

    ↓

    ['atruler',
      ['atkeyword',
        ['ident', 'media']],
      ['atrulerq',
        ['s', ' '],
        ['ident', 'x'],
        ['s', ' '],
        ['ident', 'y'],
        ['s', ' ']],
      ['atrulers',
        ['ruleset',
          ['selector',
            ['simpleselector',
              ['ident', 's']]],
          ['block',
            ['declaration',
              ['property',
                ['ident', 'p']],
              ['value',
                ['ident', 'v']]]]]]]

#### unknown

Node to store invalid (or unknown) parts of the style, that parser can extract and continue on.

    // invalid

    ↓

    ['stylesheet',
      ['unknown', '// invalid']]