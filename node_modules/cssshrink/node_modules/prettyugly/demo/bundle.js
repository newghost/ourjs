(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var gonzales = require('gonzales');
var traverse = require('./lib/traverse.js');
var utils = require('./lib/utils.js');

exports.parse = gonzales.srcToCSSP;
exports.toCSS = gonzales.csspToSrc;
exports.toTree = gonzales.csspToTree;
exports.traverse = traverse;
exports.same = utils.same;
},{"./lib/traverse.js":2,"./lib/utils.js":3,"gonzales":6}],2:[function(require,module,exports){
function tree(node, visitor) {
  if (!Array.isArray(node)) {
    return node;
  }

  if (visitor.test && visitor.test(node[0], node[1])) {
    node = visitor.process(node);
    if (!node) {
      return;
    }
  }

  var res = [node[0]];
  for (var i = 1; i < node.length; i++) {
    var n = tree(node[i], visitor);
    n && res.push(n);
  }
  return res;
}


module.exports = function traverse (ast, visitors) {
  visitors.forEach(function(visitor) {
    ast = tree(ast, visitor);
  });
  return ast;
};

},{}],3:[function(require,module,exports){
exports.same = function same (ast1, ast2) {
  return JSON.stringify(ast1) === JSON.stringify(ast2);
};

},{}],4:[function(require,module,exports){
// version: 1.0.0

function csspToSrc(tree, hasInfo) {

    var _m_simple = {
            'unary': 1, 'nth': 1, 'combinator': 1, 'ident': 1, 'number': 1, 's': 1,
            'string': 1, 'attrselector': 1, 'operator': 1, 'raw': 1, 'unknown': 1
        },
        _m_composite = {
            'simpleselector': 1, 'dimension': 1, 'selector': 1, 'property': 1, 'value': 1,
            'filterv': 1, 'progid': 1, 'ruleset': 1, 'atruleb': 1, 'atrulerq': 1, 'atrulers': 1,
            'stylesheet': 1
        },
        _m_primitive = {
            'cdo': 'cdo', 'cdc': 'cdc', 'decldelim': ';', 'namespace': '|', 'delim': ','
        };

    function _t(tree) {
        var t = tree[hasInfo? 1 : 0];
        if (t in _m_primitive) return _m_primitive[t];
        else if (t in _m_simple) return _simple(tree);
        else if (t in _m_composite) return _composite(tree);
        return _unique[t](tree);
    }

    function _composite(t, i) {
        var s = '';
        i = i === undefined ? (hasInfo? 2 : 1) : i;
        for (; i < t.length; i++) s += _t(t[i]);
        return s;
    }

    function _simple(t) {
        return t[hasInfo? 2 : 1];
    }

    var _unique = {
        percentage: function(t) {
            return _t(t[hasInfo? 2 : 1]) + '%';
        },
        comment: function (t) {
            return '/*' + t[hasInfo? 2 : 1] + '*/';
        },
        clazz: function(t) {
            return '.' + _t(t[hasInfo? 2 : 1]);
        },
        atkeyword: function(t) {
            return '@' + _t(t[hasInfo? 2 : 1]);
        },
        shash: function (t) {
            return '#' + t[hasInfo? 2 : 1];
        },
        vhash: function(t) {
            return '#' + t[hasInfo? 2 : 1];
        },
        attrib: function(t) {
            return '[' + _composite(t) + ']';
        },
        important: function(t) {
            return '!' + _composite(t) + 'important';
        },
        nthselector: function(t) {
            return ':' + _simple(t[hasInfo? 2 : 1]) + '(' + _composite(t, hasInfo? 3 : 2) + ')';
        },
        funktion: function(t) {
            return _simple(t[hasInfo? 2 : 1]) + '(' + _composite(t[hasInfo? 3: 2]) + ')';
        },
        declaration: function(t) {
            return _t(t[hasInfo? 2 : 1]) + ':' + _t(t[hasInfo? 3 : 2]);
        },
        filter: function(t) {
            return _t(t[hasInfo? 2 : 1]) + ':' + _t(t[hasInfo? 3 : 2]);
        },
        block: function(t) {
            return '{' + _composite(t) + '}';
        },
        braces: function(t) {
            return t[hasInfo? 2 : 1] + _composite(t, hasInfo? 4 : 3) + t[hasInfo? 3 : 2];
        },
        atrules: function(t) {
            return _composite(t) + ';';
        },
        atruler: function(t) {
            return _t(t[hasInfo? 2 : 1]) + _t(t[hasInfo? 3 : 2]) + '{' + _t(t[hasInfo? 4 : 3]) + '}';
        },
        pseudoe: function(t) {
            return '::' + _t(t[hasInfo? 2 : 1]);
        },
        pseudoc: function(t) {
            return ':' + _t(t[hasInfo? 2 : 1]);
        },
        uri: function(t) {
            return 'url(' + _composite(t) + ')';
        },
        functionExpression: function(t) {
            return 'expression(' + t[hasInfo? 2 : 1] + ')';
        }
    };

    return _t(tree);
}
exports.csspToSrc = csspToSrc;

},{}],5:[function(require,module,exports){
var srcToCSSP = (function() {
var TokenType = {
    StringSQ: 'StringSQ',
    StringDQ: 'StringDQ',
    CommentML: 'CommentML',
    CommentSL: 'CommentSL',

    Newline: 'Newline',
    Space: 'Space',
    Tab: 'Tab',

    ExclamationMark: 'ExclamationMark',         // !
    QuotationMark: 'QuotationMark',             // "
    NumberSign: 'NumberSign',                   // #
    DollarSign: 'DollarSign',                   // $
    PercentSign: 'PercentSign',                 // %
    Ampersand: 'Ampersand',                     // &
    Apostrophe: 'Apostrophe',                   // '
    LeftParenthesis: 'LeftParenthesis',         // (
    RightParenthesis: 'RightParenthesis',       // )
    Asterisk: 'Asterisk',                       // *
    PlusSign: 'PlusSign',                       // +
    Comma: 'Comma',                             // ,
    HyphenMinus: 'HyphenMinus',                 // -
    FullStop: 'FullStop',                       // .
    Solidus: 'Solidus',                         // /
    Colon: 'Colon',                             // :
    Semicolon: 'Semicolon',                     // ;
    LessThanSign: 'LessThanSign',               // <
    EqualsSign: 'EqualsSign',                   // =
    GreaterThanSign: 'GreaterThanSign',         // >
    QuestionMark: 'QuestionMark',               // ?
    CommercialAt: 'CommercialAt',               // @
    LeftSquareBracket: 'LeftSquareBracket',     // [
    ReverseSolidus: 'ReverseSolidus',           // \
    RightSquareBracket: 'RightSquareBracket',   // ]
    CircumflexAccent: 'CircumflexAccent',       // ^
    LowLine: 'LowLine',                         // _
    LeftCurlyBracket: 'LeftCurlyBracket',       // {
    VerticalLine: 'VerticalLine',               // |
    RightCurlyBracket: 'RightCurlyBracket',     // }
    Tilde: 'Tilde',                             // ~

    Identifier: 'Identifier',
    DecimalNumber: 'DecimalNumber'
};

var getTokens = (function() {

    var Punctuation,
        urlMode = false,
        blockMode = 0;

    Punctuation = {
        ' ': TokenType.Space,
        '\n': TokenType.Newline,
        '\r': TokenType.Newline,
        '\t': TokenType.Tab,
        '!': TokenType.ExclamationMark,
        '"': TokenType.QuotationMark,
        '#': TokenType.NumberSign,
        '$': TokenType.DollarSign,
        '%': TokenType.PercentSign,
        '&': TokenType.Ampersand,
        '\'': TokenType.Apostrophe,
        '(': TokenType.LeftParenthesis,
        ')': TokenType.RightParenthesis,
        '*': TokenType.Asterisk,
        '+': TokenType.PlusSign,
        ',': TokenType.Comma,
        '-': TokenType.HyphenMinus,
        '.': TokenType.FullStop,
        '/': TokenType.Solidus,
        ':': TokenType.Colon,
        ';': TokenType.Semicolon,
        '<': TokenType.LessThanSign,
        '=': TokenType.EqualsSign,
        '>': TokenType.GreaterThanSign,
        '?': TokenType.QuestionMark,
        '@': TokenType.CommercialAt,
        '[': TokenType.LeftSquareBracket,
    //        '\\': TokenType.ReverseSolidus,
        ']': TokenType.RightSquareBracket,
        '^': TokenType.CircumflexAccent,
        '_': TokenType.LowLine,
        '{': TokenType.LeftCurlyBracket,
        '|': TokenType.VerticalLine,
        '}': TokenType.RightCurlyBracket,
        '~': TokenType.Tilde
    };

    function isDecimalDigit(c) {
        return '0123456789'.indexOf(c) >= 0;
    }

    function throwError(message) {
        throw message;
    }

    var buffer = '',
        tokens = [],
        pos,
        tn = 0,
        ln = 1;

    function _getTokens(s) {
        if (!s) return [];

        tokens = [];

        var c, cn;

        for (pos = 0; pos < s.length; pos++) {
            c = s.charAt(pos);
            cn = s.charAt(pos + 1);

            if (c === '/' && cn === '*') {
                parseMLComment(s);
            } else if (!urlMode && c === '/' && cn === '/') {
                if (blockMode > 0) parseIdentifier(s); 
                else parseSLComment(s);
            } else if (c === '"' || c === "'") {
                parseString(s, c);
            } else if (c === ' ') {
                parseSpaces(s)
            } else if (c in Punctuation) {
                pushToken(Punctuation[c], c);
                if (c === '\n' || c === '\r') ln++;
                if (c === ')') urlMode = false;
                if (c === '{') blockMode++;
                if (c === '}') blockMode--;
            } else if (isDecimalDigit(c)) {
                parseDecimalNumber(s);
            } else {
                parseIdentifier(s);
            }
        }

        mark();

        return tokens;
    }

    function pushToken(type, value) {
        tokens.push({ tn: tn++, ln: ln, type: type, value: value });
    }

    function parseSpaces(s) {
        var start = pos;

        for (; pos < s.length; pos++) {
            if (s.charAt(pos) !== ' ') break;
        }

        pushToken(TokenType.Space, s.substring(start, pos));
        pos--;
    }

    function parseMLComment(s) {
        var start = pos;

        for (pos = pos + 2; pos < s.length; pos++) {
            if (s.charAt(pos) === '*') {
                if (s.charAt(pos + 1) === '/') {
                    pos++;
                    break;
                }
            }
        }

        pushToken(TokenType.CommentML, s.substring(start, pos + 1));
    }

    function parseSLComment(s) {
        var start = pos;

        for (pos = pos + 2; pos < s.length; pos++) {
            if (s.charAt(pos) === '\n' || s.charAt(pos) === '\r') {
                pos++;
                break;
            }
        }

        pushToken(TokenType.CommentSL, s.substring(start, pos));
        pos--;
    }

    function parseString(s, q) {
        var start = pos;

        for (pos = pos + 1; pos < s.length; pos++) {
            if (s.charAt(pos) === '\\') pos++;
            else if (s.charAt(pos) === q) break;
        }

        pushToken(q === '"' ? TokenType.StringDQ : TokenType.StringSQ, s.substring(start, pos + 1));
    }

    function parseDecimalNumber(s) {
        var start = pos;

        for (; pos < s.length; pos++) {
            if (!isDecimalDigit(s.charAt(pos))) break;
        }

        pushToken(TokenType.DecimalNumber, s.substring(start, pos));
        pos--;
    }

    function parseIdentifier(s) {
        var start = pos;

        while (s.charAt(pos) === '/') pos++;

        for (; pos < s.length; pos++) {
            if (s.charAt(pos) === '\\') pos++;
            else if (s.charAt(pos) in Punctuation) break;
        }

        var ident = s.substring(start, pos);

        urlMode = urlMode || ident === 'url';

        pushToken(TokenType.Identifier, ident);
        pos--;
    }

    // ====================================
    // second run
    // ====================================

    function mark() {
        var ps = [], // Parenthesis
            sbs = [], // SquareBracket
            cbs = [], // CurlyBracket
            t;

        for (var i = 0; i < tokens.length; i++) {
            t = tokens[i];
            switch(t.type) {
                case TokenType.LeftParenthesis:
                    ps.push(i);
                    break;
                case TokenType.RightParenthesis:
                    if (ps.length) {
                        t.left = ps.pop();
                        tokens[t.left].right = i;
                    }
                    break;
                case TokenType.LeftSquareBracket:
                    sbs.push(i);
                    break;
                case TokenType.RightSquareBracket:
                    if (sbs.length) {
                        t.left = sbs.pop();
                        tokens[t.left].right = i;
                    }
                    break;
                case TokenType.LeftCurlyBracket:
                    cbs.push(i);
                    break;
                case TokenType.RightCurlyBracket:
                    if (cbs.length) {
                        t.left = cbs.pop();
                        tokens[t.left].right = i;
                    }
                    break;
            }
        }
    }

    return function(s) {
        return _getTokens(s);
    };

}());
// version: 1.0.0

var getCSSPAST = (function() {

    var tokens,
        pos,
        failLN = 0,
        currentBlockLN = 0,
        needInfo = false;

    var CSSPNodeType,
        CSSLevel,
        CSSPRules;

    CSSPNodeType = {
        IdentType: 'ident',
        AtkeywordType: 'atkeyword',
        StringType: 'string',
        ShashType: 'shash',
        VhashType: 'vhash',
        NumberType: 'number',
        PercentageType: 'percentage',
        DimensionType: 'dimension',
        CdoType: 'cdo',
        CdcType: 'cdc',
        DecldelimType: 'decldelim',
        SType: 's',
        AttrselectorType: 'attrselector',
        AttribType: 'attrib',
        NthType: 'nth',
        NthselectorType: 'nthselector',
        NamespaceType: 'namespace',
        ClazzType: 'clazz',
        PseudoeType: 'pseudoe',
        PseudocType: 'pseudoc',
        DelimType: 'delim',
        StylesheetType: 'stylesheet',
        AtrulebType: 'atruleb',
        AtrulesType: 'atrules',
        AtrulerqType: 'atrulerq',
        AtrulersType: 'atrulers',
        AtrulerType: 'atruler',
        BlockType: 'block',
        RulesetType: 'ruleset',
        CombinatorType: 'combinator',
        SimpleselectorType: 'simpleselector',
        SelectorType: 'selector',
        DeclarationType: 'declaration',
        PropertyType: 'property',
        ImportantType: 'important',
        UnaryType: 'unary',
        OperatorType: 'operator',
        BracesType: 'braces',
        ValueType: 'value',
        ProgidType: 'progid',
        FiltervType: 'filterv',
        FilterType: 'filter',
        CommentType: 'comment',
        UriType: 'uri',
        RawType: 'raw',
        FunctionBodyType: 'functionBody',
        FunktionType: 'funktion',
        FunctionExpressionType: 'functionExpression',
        UnknownType: 'unknown'
    };

    CSSPRules = {
        'ident': function() { if (checkIdent(pos)) return getIdent() },
        'atkeyword': function() { if (checkAtkeyword(pos)) return getAtkeyword() },
        'string': function() { if (checkString(pos)) return getString() },
        'shash': function() { if (checkShash(pos)) return getShash() },
        'vhash': function() { if (checkVhash(pos)) return getVhash() },
        'number': function() { if (checkNumber(pos)) return getNumber() },
        'percentage': function() { if (checkPercentage(pos)) return getPercentage() },
        'dimension': function() { if (checkDimension(pos)) return getDimension() },
//        'cdo': function() { if (checkCDO()) return getCDO() },
//        'cdc': function() { if (checkCDC()) return getCDC() },
        'decldelim': function() { if (checkDecldelim(pos)) return getDecldelim() },
        's': function() { if (checkS(pos)) return getS() },
        'attrselector': function() { if (checkAttrselector(pos)) return getAttrselector() },
        'attrib': function() { if (checkAttrib(pos)) return getAttrib() },
        'nth': function() { if (checkNth(pos)) return getNth() },
        'nthselector': function() { if (checkNthselector(pos)) return getNthselector() },
        'namespace': function() { if (checkNamespace(pos)) return getNamespace() },
        'clazz': function() { if (checkClazz(pos)) return getClazz() },
        'pseudoe': function() { if (checkPseudoe(pos)) return getPseudoe() },
        'pseudoc': function() { if (checkPseudoc(pos)) return getPseudoc() },
        'delim': function() { if (checkDelim(pos)) return getDelim() },
        'stylesheet': function() { if (checkStylesheet(pos)) return getStylesheet() },
        'atruleb': function() { if (checkAtruleb(pos)) return getAtruleb() },
        'atrules': function() { if (checkAtrules(pos)) return getAtrules() },
        'atrulerq': function() { if (checkAtrulerq(pos)) return getAtrulerq() },
        'atrulers': function() { if (checkAtrulers(pos)) return getAtrulers() },
        'atruler': function() { if (checkAtruler(pos)) return getAtruler() },
        'block': function() { if (checkBlock(pos)) return getBlock() },
        'ruleset': function() { if (checkRuleset(pos)) return getRuleset() },
        'combinator': function() { if (checkCombinator(pos)) return getCombinator() },
        'simpleselector': function() { if (checkSimpleselector(pos)) return getSimpleSelector() },
        'selector': function() { if (checkSelector(pos)) return getSelector() },
        'declaration': function() { if (checkDeclaration(pos)) return getDeclaration() },
        'property': function() { if (checkProperty(pos)) return getProperty() },
        'important': function() { if (checkImportant(pos)) return getImportant() },
        'unary': function() { if (checkUnary(pos)) return getUnary() },
        'operator': function() { if (checkOperator(pos)) return getOperator() },
        'braces': function() { if (checkBraces(pos)) return getBraces() },
        'value': function() { if (checkValue(pos)) return getValue() },
        'progid': function() { if (checkProgid(pos)) return getProgid() },
        'filterv': function() { if (checkFilterv(pos)) return getFilterv() },
        'filter': function() { if (checkFilter(pos)) return getFilter() },
        'comment': function() { if (checkComment(pos)) return getComment() },
        'uri': function() { if (checkUri(pos)) return getUri() },
        'raw': function() { if (checkRaw(pos)) return getRaw() },
        'funktion': function() { if (checkFunktion(pos)) return getFunktion() },
        'functionExpression': function() { if (checkFunctionExpression(pos)) return getFunctionExpression() },
        'unknown': function() { if (checkUnknown(pos)) return getUnknown() }
    };

    function fail(token) {
        if (token && token.ln > failLN) failLN = token.ln;
    }

    function throwError() {
        throw new Error('Please check the validity of the CSS block starting from the line #' + currentBlockLN);
    }

    function _getAST(_tokens, rule, _needInfo) {
        tokens = _tokens;
        needInfo = _needInfo;
        pos = 0;

        markSC();

        return rule ? CSSPRules[rule]() : CSSPRules['stylesheet']();
    }

//any = braces | string | percentage | dimension | number | uri | functionExpression | funktion | ident | unary
    function checkAny(_i) {
        return checkBraces(_i) ||
               checkString(_i) ||
               checkPercentage(_i) ||
               checkDimension(_i) ||
               checkNumber(_i) ||
               checkUri(_i) ||
               checkFunctionExpression(_i) ||
               checkFunktion(_i) ||
               checkIdent(_i) ||
               checkUnary(_i);
    }

    function getAny() {
        if (checkBraces(pos)) return getBraces();
        else if (checkString(pos)) return getString();
        else if (checkPercentage(pos)) return getPercentage();
        else if (checkDimension(pos)) return getDimension();
        else if (checkNumber(pos)) return getNumber();
        else if (checkUri(pos)) return getUri();
        else if (checkFunctionExpression(pos)) return getFunctionExpression();
        else if (checkFunktion(pos)) return getFunktion();
        else if (checkIdent(pos)) return getIdent();
        else if (checkUnary(pos)) return getUnary();
    }

//atkeyword = '@' ident:x -> [#atkeyword, x]
    function checkAtkeyword(_i) {
        var l;

        if (tokens[_i++].type !== TokenType.CommercialAt) return fail(tokens[_i - 1]);

        if (l = checkIdent(_i)) return l + 1;

        return fail(tokens[_i]);
    }

    function getAtkeyword() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln }, CSSPNodeType.AtkeywordType, getIdent()]:
            [CSSPNodeType.AtkeywordType, getIdent()];
    }

//attrib = '[' sc*:s0 ident:x sc*:s1 attrselector:a sc*:s2 (ident | string):y sc*:s3 ']' -> this.concat([#attrib], s0, [x], s1, [a], s2, [y], s3)
//       | '[' sc*:s0 ident:x sc*:s1 ']' -> this.concat([#attrib], s0, [x], s1),
    function checkAttrib(_i) {
        if (tokens[_i].type !== TokenType.LeftSquareBracket) return fail(tokens[_i]);

        if (!tokens[_i].right) return fail(tokens[_i]);

        return tokens[_i].right - _i + 1;
    }

    function checkAttrib1(_i) {
        var start = _i;

        _i++;

        var l = checkSC(_i); // s0

        if (l) _i += l;

        if (l = checkIdent(_i)) _i += l; // x
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l; // s1

        if (l = checkAttrselector(_i)) _i += l; // a
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l; // s2

        if ((l = checkIdent(_i)) || (l = checkString(_i))) _i += l; // y
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l; // s3

        if (tokens[_i].type === TokenType.RightSquareBracket) return _i - start;

        return fail(tokens[_i]);
    }

    function getAttrib1() {
        var startPos = pos;

        pos++;

        var a = (needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.AttribType] : [CSSPNodeType.AttribType])
                .concat(getSC())
                .concat([getIdent()])
                .concat(getSC())
                .concat([getAttrselector()])
                .concat(getSC())
                .concat([checkString(pos)? getString() : getIdent()])
                .concat(getSC());

        pos++;

        return a;
    }

    function checkAttrib2(_i) {
        var start = _i;

        _i++;

        var l = checkSC(_i);

        if (l) _i += l;

        if (l = checkIdent(_i)) _i += l;

        if (l = checkSC(_i)) _i += l;

        if (tokens[_i].type === TokenType.RightSquareBracket) return _i - start;

        return fail(tokens[_i]);
    }

    function getAttrib2() {
        var startPos = pos;

        pos++;

        var a = (needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.AttribType] : [CSSPNodeType.AttribType])
                .concat(getSC())
                .concat([getIdent()])
                .concat(getSC());

        pos++;

        return a;
    }

    function getAttrib() {
        if (checkAttrib1(pos)) return getAttrib1(); 
        if (checkAttrib2(pos)) return getAttrib2(); 
    }

//attrselector = (seq('=') | seq('~=') | seq('^=') | seq('$=') | seq('*=') | seq('|=')):x -> [#attrselector, x]
    function checkAttrselector(_i) {
        if (tokens[_i].type === TokenType.EqualsSign) return 1;
        if (tokens[_i].type === TokenType.VerticalLine && (!tokens[_i + 1] || tokens[_i + 1].type !== TokenType.EqualsSign)) return 1;

        if (!tokens[_i + 1] || tokens[_i + 1].type !== TokenType.EqualsSign) return fail(tokens[_i]);

        switch(tokens[_i].type) {
            case TokenType.Tilde:
            case TokenType.CircumflexAccent:
            case TokenType.DollarSign:
            case TokenType.Asterisk:
            case TokenType.VerticalLine:
                return 2;
        }

        return fail(tokens[_i]);
    }

    function getAttrselector() {
        var startPos = pos,
            s = tokens[pos++].value;

        if (tokens[pos] && tokens[pos].type === TokenType.EqualsSign) s += tokens[pos++].value;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.AttrselectorType, s] :
                [CSSPNodeType.AttrselectorType, s];
    }

//atrule = atruler | atruleb | atrules
    function checkAtrule(_i) {
        var start = _i,
            l;

        if (tokens[start].atrule_l !== undefined) return tokens[start].atrule_l;

        if (l = checkAtruler(_i)) tokens[_i].atrule_type = 1;
        else if (l = checkAtruleb(_i)) tokens[_i].atrule_type = 2;
        else if (l = checkAtrules(_i)) tokens[_i].atrule_type = 3;
        else return fail(tokens[start]);

        tokens[start].atrule_l = l;

        return l;
    }

    function getAtrule() {
        switch (tokens[pos].atrule_type) {
            case 1: return getAtruler();
            case 2: return getAtruleb();
            case 3: return getAtrules();
        }
    }

//atruleb = atkeyword:ak tset*:ap block:b -> this.concat([#atruleb, ak], ap, [b])
    function checkAtruleb(_i) {
        var start = _i,
            l;

        if (l = checkAtkeyword(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkTsets(_i)) _i += l;

        if (l = checkBlock(_i)) _i += l;
        else return fail(tokens[_i]);

        return _i - start;
    }

    function getAtruleb() {
        return (needInfo?
                    [{ ln: tokens[pos].ln }, CSSPNodeType.AtrulebType, getAtkeyword()] :
                    [CSSPNodeType.AtrulebType, getAtkeyword()])
                        .concat(getTsets())
                        .concat([getBlock()]);
    }

//atruler = atkeyword:ak atrulerq:x '{' atrulers:y '}' -> [#atruler, ak, x, y]
    function checkAtruler(_i) {
        var start = _i,
            l;

        if (l = checkAtkeyword(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkAtrulerq(_i)) _i += l;

        if (_i < tokens.length && tokens[_i].type === TokenType.LeftCurlyBracket) _i++;
        else return fail(tokens[_i]);

        if (l = checkAtrulers(_i)) _i += l;

        if (_i < tokens.length && tokens[_i].type === TokenType.RightCurlyBracket) _i++;
        else return fail(tokens[_i]);

        return _i - start;
    }

    function getAtruler() {
        var atruler = needInfo?
                        [{ ln: tokens[pos].ln }, CSSPNodeType.AtrulerType, getAtkeyword(), getAtrulerq()] :
                        [CSSPNodeType.AtrulerType, getAtkeyword(), getAtrulerq()];

        pos++;

        atruler.push(getAtrulers());

        pos++;

        return atruler;
    }

//atrulerq = tset*:ap -> [#atrulerq].concat(ap)
    function checkAtrulerq(_i) {
        return checkTsets(_i);
    }

    function getAtrulerq() {
        return (needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.AtrulerqType] : [CSSPNodeType.AtrulerqType]).concat(getTsets());
    }

//atrulers = sc*:s0 ruleset*:r sc*:s1 -> this.concat([#atrulers], s0, r, s1)
    function checkAtrulers(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        while ((l = checkRuleset(_i)) || (l = checkAtrule(_i)) || (l = checkSC(_i))) {
            _i += l;
        }

        tokens[_i].atrulers_end = 1;

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    function getAtrulers() {
        var atrulers = (needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.AtrulersType] : [CSSPNodeType.AtrulersType]).concat(getSC()),
            x;

        while (!tokens[pos].atrulers_end) {
            if (checkSC(pos)) {
                atrulers = atrulers.concat(getSC());
            } else if (checkRuleset(pos)) {
                atrulers.push(getRuleset());
            } else {
                atrulers.push(getAtrule());
            }
        }

        return atrulers.concat(getSC());
    }

//atrules = atkeyword:ak tset*:ap ';' -> this.concat([#atrules, ak], ap)
    function checkAtrules(_i) {
        var start = _i,
            l;

        if (l = checkAtkeyword(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkTsets(_i)) _i += l;

        if (_i >= tokens.length) return _i - start;

        if (tokens[_i].type === TokenType.Semicolon) _i++;
        else return fail(tokens[_i]);

        return _i - start;
    }

    function getAtrules() {
        var atrules = (needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.AtrulesType, getAtkeyword()] : [CSSPNodeType.AtrulesType, getAtkeyword()]).concat(getTsets());

        pos++;

        return atrules;
    }

//block = '{' blockdecl*:x '}' -> this.concatContent([#block], x)
    function checkBlock(_i) {
        if (_i < tokens.length && tokens[_i].type === TokenType.LeftCurlyBracket) return tokens[_i].right - _i + 1;

        return fail(tokens[_i]);
    }

    function getBlock() {
        var block = needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.BlockType] : [CSSPNodeType.BlockType],
            end = tokens[pos].right;

        pos++;

        while (pos < end) {
            if (checkBlockdecl(pos)) block = block.concat(getBlockdecl());
            else throwError();
        }

        pos = end + 1;

        return block;
    }

//blockdecl = sc*:s0 (filter | declaration):x decldelim:y sc*:s1 -> this.concat(s0, [x], [y], s1)
//          | sc*:s0 (filter | declaration):x sc*:s1 -> this.concat(s0, [x], s1)
//          | sc*:s0 decldelim:x sc*:s1 -> this.concat(s0, [x], s1)
//          | sc+:s0 -> s0

    function checkBlockdecl(_i) {
        var l;

        if (l = _checkBlockdecl0(_i)) tokens[_i].bd_type = 1;
        else if (l = _checkBlockdecl1(_i)) tokens[_i].bd_type = 2;
        else if (l = _checkBlockdecl2(_i)) tokens[_i].bd_type = 3;
        else if (l = _checkBlockdecl3(_i)) tokens[_i].bd_type = 4;
        else return fail(tokens[_i]);

        return l;
    }

    function getBlockdecl() {
        switch (tokens[pos].bd_type) {
            case 1: return _getBlockdecl0();
            case 2: return _getBlockdecl1();
            case 3: return _getBlockdecl2();
            case 4: return _getBlockdecl3();
        }
    }

    //sc*:s0 (filter | declaration):x decldelim:y sc*:s1 -> this.concat(s0, [x], [y], s1)
    function _checkBlockdecl0(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        if (l = checkFilter(_i)) {
            tokens[_i].bd_filter = 1;
            _i += l;
        } else if (l = checkDeclaration(_i)) {
            tokens[_i].bd_decl = 1;
            _i += l;
        } else return fail(tokens[_i]);

        if (_i < tokens.length && (l = checkDecldelim(_i))) _i += l;
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    function _getBlockdecl0() {
        return getSC()
                .concat([tokens[pos].bd_filter? getFilter() : getDeclaration()])
                .concat([getDecldelim()])
                .concat(getSC());
    }

    //sc*:s0 (filter | declaration):x sc*:s1 -> this.concat(s0, [x], s1)
    function _checkBlockdecl1(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        if (l = checkFilter(_i)) {
            tokens[_i].bd_filter = 1;
            _i += l;
        } else if (l = checkDeclaration(_i)) {
            tokens[_i].bd_decl = 1;
            _i += l;
        } else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    function _getBlockdecl1() {
        return getSC()
                .concat([tokens[pos].bd_filter? getFilter() : getDeclaration()])
                .concat(getSC());
    }

    //sc*:s0 decldelim:x sc*:s1 -> this.concat(s0, [x], s1)
    function _checkBlockdecl2(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        if (l = checkDecldelim(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    function _getBlockdecl2() {
        return getSC()
                 .concat([getDecldelim()])
                 .concat(getSC());
    }

    //sc+:s0 -> s0
    function _checkBlockdecl3(_i) {
        return checkSC(_i);
    }

    function _getBlockdecl3() {
        return getSC();
    }

//braces = '(' tset*:x ')' -> this.concat([#braces, '(', ')'], x)
//       | '[' tset*:x ']' -> this.concat([#braces, '[', ']'], x)
    function checkBraces(_i) {
        if (_i >= tokens.length ||
            (tokens[_i].type !== TokenType.LeftParenthesis &&
             tokens[_i].type !== TokenType.LeftSquareBracket)
            ) return fail(tokens[_i]);

        return tokens[_i].right - _i + 1;
    }

    function getBraces() {
        var startPos = pos,
            left = pos,
            right = tokens[pos].right;

        pos++;

        var tsets = getTsets();

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.BracesType, tokens[left].value, tokens[right].value].concat(tsets) :
                [CSSPNodeType.BracesType, tokens[left].value, tokens[right].value].concat(tsets);
    }

    function checkCDC(_i) {}

    function checkCDO(_i) {}

    // node: Clazz
    function checkClazz(_i) {
        var l;

        if (tokens[_i].clazz_l) return tokens[_i].clazz_l;

        if (tokens[_i].type === TokenType.FullStop) {
            if (l = checkIdent(_i + 1)) {
                tokens[_i].clazz_l = l + 1;
                return l + 1;
            }
        }

        return fail(tokens[_i]);
    }

    function getClazz() {
        var startPos = pos;

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.ClazzType, getIdent()] :
                [CSSPNodeType.ClazzType, getIdent()];
    }

    // node: Combinator
    function checkCombinator(_i) {
        if (tokens[_i].type === TokenType.PlusSign ||
            tokens[_i].type === TokenType.GreaterThanSign ||
            tokens[_i].type === TokenType.Tilde) return 1;

        return fail(tokens[_i]);
    }

    function getCombinator() {
        return needInfo?
                [{ ln: tokens[pos].ln }, CSSPNodeType.CombinatorType, tokens[pos++].value] :
                [CSSPNodeType.CombinatorType, tokens[pos++].value];
    }

    // node: Comment
    function checkComment(_i) {
        if (tokens[_i].type === TokenType.CommentML) return 1;

        return fail(tokens[_i]);
    }

    function getComment() {
        var startPos = pos,
            s = tokens[pos].value.substring(2),
            l = s.length;

        if (s.charAt(l - 2) === '*' && s.charAt(l - 1) === '/') s = s.substring(0, l - 2);

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.CommentType, s] :
                [CSSPNodeType.CommentType, s];
    }

    // declaration = property:x ':' value:y -> [#declaration, x, y]
    function checkDeclaration(_i) {
        var start = _i,
            l;

        if (l = checkProperty(_i)) _i += l;
        else return fail(tokens[_i]);

        if (_i < tokens.length && tokens[_i].type === TokenType.Colon) _i++;
        else return fail(tokens[_i]);

        if (l = checkValue(_i)) _i += l;
        else return fail(tokens[_i]);

        return _i - start;
    }

    function getDeclaration() {
        var declaration = needInfo?
                [{ ln: tokens[pos].ln }, CSSPNodeType.DeclarationType, getProperty()] :
                [CSSPNodeType.DeclarationType, getProperty()];

        pos++;

        declaration.push(getValue());

        return declaration;
    }

    // node: Decldelim
    function checkDecldelim(_i) {
        if (_i < tokens.length && tokens[_i].type === TokenType.Semicolon) return 1;

        return fail(tokens[_i]);
    }

    function getDecldelim() {
        var startPos = pos;

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.DecldelimType] :
                [CSSPNodeType.DecldelimType];
    }

    // node: Delim
    function checkDelim(_i) {
        if (_i < tokens.length && tokens[_i].type === TokenType.Comma) return 1;

        if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

        return fail(tokens[_i]);
    }

    function getDelim() {
        var startPos = pos;

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.DelimType] :
                [CSSPNodeType.DelimType];
    }

    // node: Dimension
    function checkDimension(_i) {
        var ln = checkNumber(_i),
            li;

        if (!ln || (ln && _i + ln >= tokens.length)) return fail(tokens[_i]);

        if (li = checkNmName2(_i + ln)) return ln + li;

        return fail(tokens[_i]);
    }

    function getDimension() {
        var startPos = pos,
            n = getNumber(),
            dimension = needInfo ?
                [{ ln: tokens[pos].ln }, CSSPNodeType.IdentType, getNmName2()] :
                [CSSPNodeType.IdentType, getNmName2()];

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.DimensionType, n, dimension] :
                [CSSPNodeType.DimensionType, n, dimension];
    }

//filter = filterp:x ':' filterv:y -> [#filter, x, y]
    function checkFilter(_i) {
        var start = _i,
            l;

        if (l = checkFilterp(_i)) _i += l;
        else return fail(tokens[_i]);

        if (tokens[_i].type === TokenType.Colon) _i++;
        else return fail(tokens[_i]);

        if (l = checkFilterv(_i)) _i += l;
        else return fail(tokens[_i]);

        return _i - start;
    }

    function getFilter() {
        var filter = needInfo?
                [{ ln: tokens[pos].ln }, CSSPNodeType.FilterType, getFilterp()] :
                [CSSPNodeType.FilterType, getFilterp()];

        pos++;

        filter.push(getFilterv());

        return filter;
    }

//filterp = (seq('-filter') | seq('_filter') | seq('*filter') | seq('-ms-filter') | seq('filter')):t sc*:s0 -> this.concat([#property, [#ident, t]], s0)
    function checkFilterp(_i) {
        var start = _i,
            l,
            x;

        if (_i < tokens.length) {
            if (tokens[_i].value === 'filter') l = 1;
            else {
                x = joinValues2(_i, 2);

                if (x === '-filter' || x === '_filter' || x === '*filter') l = 2;
                else {
                    x = joinValues2(_i, 4);

                    if (x === '-ms-filter') l = 4;
                    else return fail(tokens[_i]);
                }
            }

            tokens[start].filterp_l = l;

            _i += l;

            if (checkSC(_i)) _i += l;

            return _i - start;
        }

        return fail(tokens[_i]);
    }

    function getFilterp() {
        var startPos = pos,
            x = joinValues2(pos, tokens[pos].filterp_l),
            ident = needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.IdentType, x] : [CSSPNodeType.IdentType, x];

        pos += tokens[pos].filterp_l;

        return (needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.PropertyType, ident] : [CSSPNodeType.PropertyType, ident])
                    .concat(getSC());

    }

//filterv = progid+:x -> [#filterv].concat(x)
    function checkFilterv(_i) {
        var start = _i,
            l;

        if (l = checkProgid(_i)) _i += l;
        else return fail(tokens[_i]);

        while (l = checkProgid(_i)) {
            _i += l;
        }

        tokens[start].last_progid = _i;

        if (_i < tokens.length && (l = checkSC(_i))) _i += l;

        if (_i < tokens.length && (l = checkImportant(_i))) _i += l;

        return _i - start;
    }

    function getFilterv() {
        var filterv = needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.FiltervType] : [CSSPNodeType.FiltervType],
            last_progid = tokens[pos].last_progid;

        while (pos < last_progid) {
            filterv.push(getProgid());
        }

        filterv = filterv.concat(checkSC(pos) ? getSC() : []);

        if (pos < tokens.length && checkImportant(pos)) filterv.push(getImportant());

        return filterv;
    }

//functionExpression = ``expression('' functionExpressionBody*:x ')' -> [#functionExpression, x.join('')],
    function checkFunctionExpression(_i) {
        var start = _i;

        if (!tokens[_i] || tokens[_i++].value !== 'expression') return fail(tokens[_i - 1]);

        if (!tokens[_i] || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i]);

        return tokens[_i].right - start + 1;
    }

    function getFunctionExpression() {
        var startPos = pos;

        pos++;

        var e = joinValues(pos + 1, tokens[pos].right - 1);

        pos = tokens[pos].right + 1;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.FunctionExpressionType, e] :
                [CSSPNodeType.FunctionExpressionType, e];
    }

//funktion = ident:x '(' functionBody:y ')' -> [#funktion, x, y]
    function checkFunktion(_i) {
        var start = _i,
            l = checkIdent(_i);

        if (!l) return fail(tokens[_i]);

        _i += l;

        if (_i >= tokens.length || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i - 1]);

        return tokens[_i].right - start + 1;
    }

    function getFunktion() {
        var startPos = pos,
            ident = getIdent();

        pos++;

        var body = ident[needInfo? 2 : 1] !== 'not'?
            getFunctionBody() :
            getNotFunctionBody(); // ok, here we have CSS3 initial draft: http://dev.w3.org/csswg/selectors3/#negation

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.FunktionType, ident, body] :
                [CSSPNodeType.FunktionType, ident, body];
    }

    function getFunctionBody() {
        var startPos = pos,
            body = [],
            x;

        while (tokens[pos].type !== TokenType.RightParenthesis) {
            if (checkTset(pos)) {
                x = getTset();
                if ((needInfo && typeof x[1] === 'string') || typeof x[0] === 'string') body.push(x);
                else body = body.concat(x);
            } else if (checkClazz(pos)) {
                body.push(getClazz());
            } else {
                throwError();
            }
        }

        pos++;

        return (needInfo?
                    [{ ln: tokens[startPos].ln }, CSSPNodeType.FunctionBodyType] :
                    [CSSPNodeType.FunctionBodyType]
                ).concat(body);
    }

    function getNotFunctionBody() {
        var startPos = pos,
            body = [],
            x;

        while (tokens[pos].type !== TokenType.RightParenthesis) {
            if (checkSimpleselector(pos)) {
                body.push(getSimpleSelector());
            } else {
                throwError();
            }
        }

        pos++;

        return (needInfo?
                    [{ ln: tokens[startPos].ln }, CSSPNodeType.FunctionBodyType] :
                    [CSSPNodeType.FunctionBodyType]
                ).concat(body);
    }

    // node: Ident
    function checkIdent(_i) {
        if (_i >= tokens.length) return fail(tokens[_i]);

        var start = _i,
            wasIdent = false;

        if (tokens[_i].type === TokenType.LowLine) return checkIdentLowLine(_i);

        // start char / word
        if (tokens[_i].type === TokenType.HyphenMinus ||
            tokens[_i].type === TokenType.Identifier ||
            tokens[_i].type === TokenType.DollarSign ||
            tokens[_i].type === TokenType.Asterisk) _i++;
        else return fail(tokens[_i]);

        wasIdent = tokens[_i - 1].type === TokenType.Identifier;

        for (; _i < tokens.length; _i++) {
            if (tokens[_i].type !== TokenType.HyphenMinus &&
                tokens[_i].type !== TokenType.LowLine) {
                    if (tokens[_i].type !== TokenType.Identifier &&
                        (tokens[_i].type !== TokenType.DecimalNumber || !wasIdent)
                        ) break;
                    else wasIdent = true;
            }   
        }

        if (!wasIdent && tokens[start].type !== TokenType.Asterisk) return fail(tokens[_i]);

        tokens[start].ident_last = _i - 1;

        return _i - start;
    }

    function checkIdentLowLine(_i) {
        var start = _i;

        _i++;

        for (; _i < tokens.length; _i++) {
            if (tokens[_i].type !== TokenType.HyphenMinus &&
                tokens[_i].type !== TokenType.DecimalNumber &&
                tokens[_i].type !== TokenType.LowLine &&
                tokens[_i].type !== TokenType.Identifier) break;
        }

        tokens[start].ident_last = _i - 1;

        return _i - start;
    }

    function getIdent() {
        var startPos = pos,
            s = joinValues(pos, tokens[pos].ident_last);

        pos = tokens[pos].ident_last + 1;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.IdentType, s] :
                [CSSPNodeType.IdentType, s];
    }

//important = '!' sc*:s0 seq('important') -> [#important].concat(s0)
    function checkImportant(_i) {
        var start = _i,
            l;

        if (tokens[_i++].type !== TokenType.ExclamationMark) return fail(tokens[_i - 1]);

        if (l = checkSC(_i)) _i += l;

        if (tokens[_i].value !== 'important') return fail(tokens[_i]);

        return _i - start + 1;
    }

    function getImportant() {
        var startPos = pos;

        pos++;

        var sc = getSC();

        pos++;

        return (needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.ImportantType] : [CSSPNodeType.ImportantType]).concat(sc);
    }

    // node: Namespace
    function checkNamespace(_i) {
        if (tokens[_i].type === TokenType.VerticalLine) return 1;

        return fail(tokens[_i]);
    }

    function getNamespace() {
        var startPos = pos;

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.NamespaceType] :
                [CSSPNodeType.NamespaceType];
    }

//nth = (digit | 'n')+:x -> [#nth, x.join('')]
//    | (seq('even') | seq('odd')):x -> [#nth, x]
    function checkNth(_i) {
        return checkNth1(_i) || checkNth2(_i);
    }

    function checkNth1(_i) {
        var start = _i;

        for (; _i < tokens.length; _i++) {
            if (tokens[_i].type !== TokenType.DecimalNumber && tokens[_i].value !== 'n') break;
        }

        if (_i !== start) {
            tokens[start].nth_last = _i - 1;
            return _i - start;
        }

        return fail(tokens[_i]);
    }

    function getNth() {
        var startPos = pos;

        if (tokens[pos].nth_last) {
            var n = needInfo?
                        [{ ln: tokens[startPos].ln }, CSSPNodeType.NthType, joinValues(pos, tokens[pos].nth_last)] :
                        [CSSPNodeType.NthType, joinValues(pos, tokens[pos].nth_last)];

            pos = tokens[pos].nth_last + 1;

            return n;
        }

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.NthType, tokens[pos++].value] :
                [CSSPNodeType.NthType, tokens[pos++].value];
    }

    function checkNth2(_i) {
        if (tokens[_i].value === 'even' || tokens[_i].value === 'odd') return 1;

        return fail(tokens[_i]);
    }

//nthf = ':' seq('nth-'):x (seq('child') | seq('last-child') | seq('of-type') | seq('last-of-type')):y -> (x + y)
    function checkNthf(_i) {
        var start = _i,
            l = 0;

        if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]); l++;

        if (tokens[_i++].value !== 'nth' || tokens[_i++].value !== '-') return fail(tokens[_i - 1]); l += 2;

        if ('child' === tokens[_i].value) {
            l += 1;
        } else if ('last-child' === tokens[_i].value +
                                    tokens[_i + 1].value +
                                    tokens[_i + 2].value) {
            l += 3;
        } else if ('of-type' === tokens[_i].value +
                                 tokens[_i + 1].value +
                                 tokens[_i + 2].value) {
            l += 3;
        } else if ('last-of-type' === tokens[_i].value +
                                      tokens[_i + 1].value +
                                      tokens[_i + 2].value +
                                      tokens[_i + 3].value +
                                      tokens[_i + 4].value) {
            l += 5;
        } else return fail(tokens[_i]);

        tokens[start + 1].nthf_last = start + l - 1;

        return l;
    }

    function getNthf() {
        pos++;

        var s = joinValues(pos, tokens[pos].nthf_last);

        pos = tokens[pos].nthf_last + 1;

        return s;
    }

//nthselector = nthf:x '(' (sc | unary | nth)*:y ')' -> [#nthselector, [#ident, x]].concat(y)
    function checkNthselector(_i) {
        var start = _i,
            l;

        if (l = checkNthf(_i)) _i += l;
        else return fail(tokens[_i]);

        if (tokens[_i].type !== TokenType.LeftParenthesis || !tokens[_i].right) return fail(tokens[_i]);

        l++;

        var rp = tokens[_i++].right;

        while (_i < rp) {
            if (l = checkSC(_i)) _i += l;
            else if (l = checkUnary(_i)) _i += l;
            else if (l = checkNth(_i)) _i += l;
            else return fail(tokens[_i]);
        }

        return rp - start + 1;
    }

    function getNthselector() {
        var startPos = pos,
            nthf = needInfo?
                    [{ ln: tokens[pos].ln }, CSSPNodeType.IdentType, getNthf()] :
                    [CSSPNodeType.IdentType, getNthf()],
            ns = needInfo?
                    [{ ln: tokens[pos].ln }, CSSPNodeType.NthselectorType, nthf] :
                    [CSSPNodeType.NthselectorType, nthf];

        pos++;

        while (tokens[pos].type !== TokenType.RightParenthesis) {
            if (checkSC(pos)) ns = ns.concat(getSC());
            else if (checkUnary(pos)) ns.push(getUnary());
            else if (checkNth(pos)) ns.push(getNth());
        }

        pos++;

        return ns;
    }

    // node: Number
    function checkNumber(_i) {
        if (_i < tokens.length && tokens[_i].number_l) return tokens[_i].number_l;

        if (_i < tokens.length && tokens[_i].type === TokenType.DecimalNumber &&
            (!tokens[_i + 1] ||
             (tokens[_i + 1] && tokens[_i + 1].type !== TokenType.FullStop))
        ) return (tokens[_i].number_l = 1, tokens[_i].number_l); // 10

        if (_i < tokens.length &&
             tokens[_i].type === TokenType.DecimalNumber &&
             tokens[_i + 1] && tokens[_i + 1].type === TokenType.FullStop &&
             (!tokens[_i + 2] || (tokens[_i + 2].type !== TokenType.DecimalNumber))
        ) return (tokens[_i].number_l = 2, tokens[_i].number_l); // 10.

        if (_i < tokens.length &&
            tokens[_i].type === TokenType.FullStop &&
            tokens[_i + 1].type === TokenType.DecimalNumber
        ) return (tokens[_i].number_l = 2, tokens[_i].number_l); // .10

        if (_i < tokens.length &&
            tokens[_i].type === TokenType.DecimalNumber &&
            tokens[_i + 1] && tokens[_i + 1].type === TokenType.FullStop &&
            tokens[_i + 2] && tokens[_i + 2].type === TokenType.DecimalNumber
        ) return (tokens[_i].number_l = 3, tokens[_i].number_l); // 10.10

        return fail(tokens[_i]);
    }

    function getNumber() {
        var s = '',
            startPos = pos,
            l = tokens[pos].number_l;

        for (var i = 0; i < l; i++) {
            s += tokens[pos + i].value;
        }

        pos += l;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.NumberType, s] :
                [CSSPNodeType.NumberType, s];
    }

    // node: Operator
    function checkOperator(_i) {
        if (_i < tokens.length &&
            (tokens[_i].type === TokenType.Solidus ||
            tokens[_i].type === TokenType.Comma ||
            tokens[_i].type === TokenType.Colon ||
            tokens[_i].type === TokenType.EqualsSign)) return 1;

        return fail(tokens[_i]);
    }

    function getOperator() {
        return needInfo?
                [{ ln: tokens[pos].ln }, CSSPNodeType.OperatorType, tokens[pos++].value] :
                [CSSPNodeType.OperatorType, tokens[pos++].value];
    }

    // node: Percentage
    function checkPercentage(_i) {
        var x = checkNumber(_i);

        if (!x || (x && _i + x >= tokens.length)) return fail(tokens[_i]);

        if (tokens[_i + x].type === TokenType.PercentSign) return x + 1;

        return fail(tokens[_i]);
    }

    function getPercentage() {
        var startPos = pos,
            n = getNumber();

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.PercentageType, n] :
                [CSSPNodeType.PercentageType, n];
    }

//progid = sc*:s0 seq('progid:DXImageTransform.Microsoft.'):x letter+:y '(' (m_string | m_comment | ~')' char)+:z ')' sc*:s1
//                -> this.concat([#progid], s0, [[#raw, x + y.join('') + '(' + z.join('') + ')']], s1),
    function checkProgid(_i) {
        var start = _i,
            l,
            x;

        if (l = checkSC(_i)) _i += l;

        if ((x = joinValues2(_i, 6)) === 'progid:DXImageTransform.Microsoft.') {
            _start = _i;
            _i += 6;
        } else return fail(tokens[_i - 1]);

        if (l = checkIdent(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;

        if (tokens[_i].type === TokenType.LeftParenthesis) {
            tokens[start].progid_end = tokens[_i].right;
            _i = tokens[_i].right + 1;
        } else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    function getProgid() {
        var startPos = pos,
            progid_end = tokens[pos].progid_end;

        return (needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.ProgidType] : [CSSPNodeType.ProgidType])
                .concat(getSC())
                .concat([_getProgid(progid_end)])
                .concat(getSC());
    }

    function _getProgid(progid_end) {
        var startPos = pos,
            x = joinValues(pos, progid_end);

        pos = progid_end + 1;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.RawType, x] :
                [CSSPNodeType.RawType, x];
    }

//property = ident:x sc*:s0 -> this.concat([#property, x], s0)
    function checkProperty(_i) {
        var start = _i,
            l;

        if (l = checkIdent(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;
        return _i - start;
    }

    function getProperty() {
        var startPos = pos;

        return (needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.PropertyType, getIdent()] :
                [CSSPNodeType.PropertyType, getIdent()])
            .concat(getSC());
    }

    function checkPseudo(_i) {
        return checkPseudoe(_i) ||
               checkPseudoc(_i);
    }

    function getPseudo() {
        if (checkPseudoe(pos)) return getPseudoe();
        if (checkPseudoc(pos)) return getPseudoc();
    }

    function checkPseudoe(_i) {
        var l;

        if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

        if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

        if (l = checkIdent(_i)) return l + 2;

        return fail(tokens[_i]);
    }

    function getPseudoe() {
        var startPos = pos;

        pos += 2;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.PseudoeType, getIdent()] :
                [CSSPNodeType.PseudoeType, getIdent()];
    }

//pseudoc = ':' (funktion | ident):x -> [#pseudoc, x]
    function checkPseudoc(_i) {
        var l;

        if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

        if ((l = checkFunktion(_i)) || (l = checkIdent(_i))) return l + 1;

        return fail(tokens[_i]);
    }

    function getPseudoc() {
        var startPos = pos;

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.PseudocType, checkFunktion(pos)? getFunktion() : getIdent()] :
                [CSSPNodeType.PseudocType, checkFunktion(pos)? getFunktion() : getIdent()];
    }

    //ruleset = selector*:x block:y -> this.concat([#ruleset], x, [y])
    function checkRuleset(_i) {
        var start = _i,
            l;

        if (tokens[start].ruleset_l !== undefined) return tokens[start].ruleset_l;

        while (l = checkSelector(_i)) {
            _i += l;
        }

        if (l = checkBlock(_i)) _i += l;
        else return fail(tokens[_i]);

        tokens[start].ruleset_l = _i - start;

        return _i - start;
    }

    function getRuleset() {
        var ruleset = needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.RulesetType] : [CSSPNodeType.RulesetType];

        while (!checkBlock(pos)) {
            ruleset.push(getSelector());
        }

        ruleset.push(getBlock());

        return ruleset;
    }

    // node: S
    function checkS(_i) {
        if (tokens[_i].ws) return tokens[_i].ws_last - _i + 1;

        return fail(tokens[_i]);
    }

    function getS() {
        var startPos = pos,
            s = joinValues(pos, tokens[pos].ws_last);

        pos = tokens[pos].ws_last + 1;

        return needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.SType, s] : [CSSPNodeType.SType, s];
    }

    function checkSC(_i) {
        var l,
            lsc = 0;

        while (_i < tokens.length) {
            if (!(l = checkS(_i)) && !(l = checkComment(_i))) break;
            _i += l;
            lsc += l;
        }

        if (lsc) return lsc;

        if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

        return fail(tokens[_i]);
    }

    function getSC() {
        var sc = [];

        while (pos < tokens.length) {
            if (checkS(pos)) sc.push(getS());
            else if (checkComment(pos)) sc.push(getComment());
            else break;
        }

        return sc;
    }

    //selector = (simpleselector | delim)+:x -> this.concat([#selector], x)
    function checkSelector(_i) {
        var start = _i,
            l;

        if (_i < tokens.length) {
            while (l = checkSimpleselector(_i) || checkDelim(_i)) {
                _i += l;
            }

            tokens[start].selector_end = _i - 1;

            return _i - start;
        }
    }

    function getSelector() {
        var selector = needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.SelectorType] : [CSSPNodeType.SelectorType],
            selector_end = tokens[pos].selector_end;

        while (pos <= selector_end) {
            selector.push(checkDelim(pos) ? getDelim() : getSimpleSelector());
        }

        return selector;
    }

    // node: Shash
    function checkShash(_i) {
        if (tokens[_i].type !== TokenType.NumberSign) return fail(tokens[_i]);

        var l = checkNmName(_i + 1);

        if (l) return l + 1;

        return fail(tokens[_i]);
    }

    function getShash() {
        var startPos = pos;

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.ShashType, getNmName()] :
                [CSSPNodeType.ShashType, getNmName()];
    }

//simpleselector = (nthselector | combinator | attrib | pseudo | clazz | shash | any | sc | namespace)+:x -> this.concatContent([#simpleselector], [x])
    function checkSimpleselector(_i) {
        var start = _i,
            l;

        while (_i < tokens.length) {
            if (l = _checkSimpleSelector(_i)) _i += l;
            else break;
        }

        if (_i - start) return _i - start;

        if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

        return fail(tokens[_i]);
    }

    function _checkSimpleSelector(_i) {
        return checkNthselector(_i) ||
               checkCombinator(_i) ||
               checkAttrib(_i) ||
               checkPseudo(_i) ||
               checkClazz(_i) ||
               checkShash(_i) ||
               checkAny(_i) ||
               checkSC(_i) ||
               checkNamespace(_i);
    }

    function getSimpleSelector() {
        var ss = needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.SimpleselectorType] : [CSSPNodeType.SimpleselectorType],
            t;

        while (pos < tokens.length && _checkSimpleSelector(pos)) {
            t = _getSimpleSelector();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') ss.push(t);
            else ss = ss.concat(t);
        }

        return ss;
    }

    function _getSimpleSelector() {
        if (checkNthselector(pos)) return getNthselector();
        else if (checkCombinator(pos)) return getCombinator();
        else if (checkAttrib(pos)) return getAttrib();
        else if (checkPseudo(pos)) return getPseudo();
        else if (checkClazz(pos)) return getClazz();
        else if (checkShash(pos)) return getShash();
        else if (checkAny(pos)) return getAny();
        else if (checkSC(pos)) return getSC();
        else if (checkNamespace(pos)) return getNamespace();
    }

    // node: String
    function checkString(_i) {
        if (_i < tokens.length &&
            (tokens[_i].type === TokenType.StringSQ || tokens[_i].type === TokenType.StringDQ)
        ) return 1;

        return fail(tokens[_i]);
    }

    function getString() {
        var startPos = pos;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.StringType, tokens[pos++].value] :
                [CSSPNodeType.StringType, tokens[pos++].value];
    }

    //stylesheet = (cdo | cdc | sc | statement)*:x -> this.concat([#stylesheet], x)
    function checkStylesheet(_i) {
        var start = _i,
            l;

        while (_i < tokens.length) {
            if (l = checkSC(_i)) _i += l;
            else {
                currentBlockLN = tokens[_i].ln;
                if (l = checkAtrule(_i)) _i += l;
                else if (l = checkRuleset(_i)) _i += l;
                else if (l = checkUnknown(_i)) _i += l;
                else throwError();
            }
        }

        return _i - start;
    }

    function getStylesheet(_i) {
        var t,
            stylesheet = needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.StylesheetType] : [CSSPNodeType.StylesheetType];

        while (pos < tokens.length) {
            if (checkSC(pos)) stylesheet = stylesheet.concat(getSC());
            else {
                currentBlockLN = tokens[pos].ln;
                if (checkRuleset(pos)) stylesheet.push(getRuleset());
                else if (checkAtrule(pos)) stylesheet.push(getAtrule());
                else if (checkUnknown(pos)) stylesheet.push(getUnknown());
                else throwError();
            }
        }

        return stylesheet;
    }

//tset = vhash | any | sc | operator
    function checkTset(_i) {
        return checkVhash(_i) ||
               checkAny(_i) ||
               checkSC(_i) ||
               checkOperator(_i);
    }

    function getTset() {
        if (checkVhash(pos)) return getVhash();
        else if (checkAny(pos)) return getAny();
        else if (checkSC(pos)) return getSC();
        else if (checkOperator(pos)) return getOperator();
    }

    function checkTsets(_i) {
        var start = _i,
            l;

        while (l = checkTset(_i)) {
            _i += l;
        }

        return _i - start;
    }

    function getTsets() {
        var tsets = [],
            x;

        while (x = getTset()) {
            if ((needInfo && typeof x[1] === 'string') || typeof x[0] === 'string') tsets.push(x);
            else tsets = tsets.concat(x);
        }

        return tsets;
    }

    // node: Unary
    function checkUnary(_i) {
        if (_i < tokens.length &&
            (tokens[_i].type === TokenType.HyphenMinus ||
            tokens[_i].type === TokenType.PlusSign)
        ) return 1;

        return fail(tokens[_i]);
    }

    function getUnary() {
        var startPos = pos;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.UnaryType, tokens[pos++].value] :
                [CSSPNodeType.UnaryType, tokens[pos++].value];
    }

    // node: Unknown
    function checkUnknown(_i) {
        if (_i < tokens.length && tokens[_i].type === TokenType.CommentSL) return 1;

        return fail(tokens[_i]);
    }

    function getUnknown() {
        var startPos = pos;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.UnknownType, tokens[pos++].value] :
                [CSSPNodeType.UnknownType, tokens[pos++].value];
    }

//    uri = seq('url(') sc*:s0 string:x sc*:s1 ')' -> this.concat([#uri], s0, [x], s1)
//        | seq('url(') sc*:s0 (~')' ~m_w char)*:x sc*:s1 ')' -> this.concat([#uri], s0, [[#raw, x.join('')]], s1),
    function checkUri(_i) {
        var start = _i,
            l;

        if (_i < tokens.length && tokens[_i++].value !== 'url') return fail(tokens[_i - 1]);

        if (!tokens[_i] || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i]);

        return tokens[_i].right - start + 1;
    }

    function getUri() {
        var startPos = pos,
            uriExcluding = {};

        pos += 2;

        uriExcluding[TokenType.Space] = 1;
        uriExcluding[TokenType.Tab] = 1;
        uriExcluding[TokenType.Newline] = 1;
        uriExcluding[TokenType.LeftParenthesis] = 1;
        uriExcluding[TokenType.RightParenthesis] = 1;

        if (checkUri1(pos)) {
            var uri = (needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.UriType] : [CSSPNodeType.UriType])
                        .concat(getSC())
                        .concat([getString()])
                        .concat(getSC());

            pos++;

            return uri;
        } else {
            var uri = (needInfo? [{ ln: tokens[startPos].ln }, CSSPNodeType.UriType] : [CSSPNodeType.UriType])
                        .concat(getSC()),
                l = checkExcluding(uriExcluding, pos),
                raw = needInfo?
                        [{ ln: tokens[pos].ln }, CSSPNodeType.RawType, joinValues(pos, pos + l)] :
                        [CSSPNodeType.RawType, joinValues(pos, pos + l)];

            uri.push(raw);

            pos += l + 1;

            uri = uri.concat(getSC());

            pos++;

            return uri;
        }
    }

    function checkUri1(_i) {
        var start = _i,
            l = checkSC(_i);

        if (l) _i += l;

        if (tokens[_i].type !== TokenType.StringDQ && tokens[_i].type !== TokenType.StringSQ) return fail(tokens[_i]);

        _i++;

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    // value = (sc | vhash | any | block | atkeyword | operator | important)+:x -> this.concat([#value], x)
    function checkValue(_i) {
        var start = _i,
            l;

        while (_i < tokens.length) {
            if (l = _checkValue(_i)) _i += l;
            else break;
        }

        if (_i - start) return _i - start;

        return fail(tokens[_i]);
    }

    function _checkValue(_i) {
        return checkSC(_i) ||
               checkVhash(_i) ||
               checkAny(_i) ||
               checkBlock(_i) ||
               checkAtkeyword(_i) ||
               checkOperator(_i) ||
               checkImportant(_i);
    }

    function getValue() {
        var ss = needInfo? [{ ln: tokens[pos].ln }, CSSPNodeType.ValueType] : [CSSPNodeType.ValueType],
            t;

        while (pos < tokens.length && _checkValue(pos)) {
            t = _getValue();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') ss.push(t);
            else ss = ss.concat(t);
        }

        return ss;
    }

    function _getValue() {
        if (checkSC(pos)) return getSC();
        else if (checkVhash(pos)) return getVhash();
        else if (checkAny(pos)) return getAny();
        else if (checkBlock(pos)) return getBlock();
        else if (checkAtkeyword(pos)) return getAtkeyword();
        else if (checkOperator(pos)) return getOperator();
        else if (checkImportant(pos)) return getImportant();
    }

    // node: Vhash
    function checkVhash(_i) {
        if (_i >= tokens.length || tokens[_i].type !== TokenType.NumberSign) return fail(tokens[_i]);

        var l = checkNmName2(_i + 1);

        if (l) return l + 1;

        return fail(tokens[_i]);
    }

    function getVhash() {
        var startPos = pos;

        pos++;

        return needInfo?
                [{ ln: tokens[startPos].ln }, CSSPNodeType.VhashType, getNmName2()] :
                [CSSPNodeType.VhashType, getNmName2()];
    }

    function checkNmName(_i) {
        var start = _i;

        // start char / word
        if (tokens[_i].type === TokenType.HyphenMinus ||
            tokens[_i].type === TokenType.LowLine ||
            tokens[_i].type === TokenType.Identifier ||
            tokens[_i].type === TokenType.DecimalNumber) _i++;
        else return fail(tokens[_i]);

        for (; _i < tokens.length; _i++) {
            if (tokens[_i].type !== TokenType.HyphenMinus &&
                tokens[_i].type !== TokenType.LowLine &&
                tokens[_i].type !== TokenType.Identifier &&
                tokens[_i].type !== TokenType.DecimalNumber) break;
        }

        tokens[start].nm_name_last = _i - 1;

        return _i - start;
    }

    function getNmName() {
        var s = joinValues(pos, tokens[pos].nm_name_last);

        pos = tokens[pos].nm_name_last + 1;

        return s;
    }

    function checkNmName2(_i) {
        var start = _i;

        if (tokens[_i].type === TokenType.Identifier) return 1;
        else if (tokens[_i].type !== TokenType.DecimalNumber) return fail(tokens[_i]);

        _i++;

        if (!tokens[_i] || tokens[_i].type !== TokenType.Identifier) return 1;

        return 2;
    }

    function getNmName2() {
        var s = tokens[pos].value;

        if (tokens[pos++].type === TokenType.DecimalNumber &&
                pos < tokens.length &&
                tokens[pos].type === TokenType.Identifier
        ) s += tokens[pos++].value;

        return s;
    }

    function checkExcluding(exclude, _i) {
        var start = _i;

        while(_i < tokens.length) {
            if (exclude[tokens[_i++].type]) break;
        }

        return _i - start - 2;
    }

    function joinValues(start, finish) {
        var s = '';

        for (var i = start; i < finish + 1; i++) {
            s += tokens[i].value;
        }

        return s;
    }

    function joinValues2(start, num) {
        if (start + num - 1 >= tokens.length) return;

        var s = '';

        for (var i = 0; i < num; i++) {
            s += tokens[start + i].value;
        }

        return s;
    }

    function markSC() {
        var ws = -1, // whitespaces
            sc = -1, // ws and comments
            t;

        for (var i = 0; i < tokens.length; i++) {
            t = tokens[i];
            switch (t.type) {
                case TokenType.Space:
                case TokenType.Tab:
                case TokenType.Newline:
                    t.ws = true;
                    t.sc = true;

                    if (ws === -1) ws = i;
                    if (sc === -1) sc = i;

                    break;
                case TokenType.CommentML:
                    if (ws !== -1) {
                        tokens[ws].ws_last = i - 1;
                        ws = -1;
                    }

                    t.sc = true;

                    break;
                default:
                    if (ws !== -1) {
                        tokens[ws].ws_last = i - 1;
                        ws = -1;
                    }

                    if (sc !== -1) {
                        tokens[sc].sc_last = i - 1;
                        sc = -1;
                    }
            }
        }

        if (ws !== -1) tokens[ws].ws_last = i - 1;
        if (sc !== -1) tokens[sc].sc_last = i - 1;
    }

    return function(_tokens, rule, _needInfo) {
        return _getAST(_tokens, rule, _needInfo);
    }

}());
    return function(s, rule, _needInfo) {
        return getCSSPAST(getTokens(s), rule, _needInfo);
    }
}());
exports.srcToCSSP = srcToCSSP;

},{}],6:[function(require,module,exports){
// CSSP

exports.srcToCSSP = require('./gonzales.cssp.node.js').srcToCSSP;

exports.csspToSrc = require('./cssp.translator.node.js').csspToSrc;

exports.csspToTree = function(tree, level) {
    var spaces = dummySpaces(level),
        level = level ? level : 0,
        s = (level ? '\n' + spaces : '') + '[';

    tree.forEach(function(e) {
        if (e.ln === undefined) {
            s += (Array.isArray(e) ? exports.csspToTree(e, level + 1) : ('\'' + e.toString() + '\'')) + ', ';
        }
    });

    return s.substr(0, s.length - 2) + ']';
}

function dummySpaces(num) {
    return '                                                  '.substr(0, num * 2);
}

},{"./cssp.translator.node.js":4,"./gonzales.cssp.node.js":5}],7:[function(require,module,exports){
pu = require('../index.js');


},{"../index.js":8}],8:[function(require,module,exports){
module.exports = require('./lib/prettyugly.js');


},{"./lib/prettyugly.js":17}],9:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'atrulers';
  },

  process: function(node) {
    var pretty = [];
    for (var i = 0; i < node.length; i++) {
      if (node[i][0] === 'ruleset') {
        pretty.push(['s', '\n  ']);
        // go into blocks
        for (var j = 0; j < node[i][2].length; j++) {
          if (node[i][2][j][0] === 's') {
            node[i][2][j][1] = node[i][2][j][1] === '\n'
              ? '\n  '
              : '\n    ';
          }
        }
      }
      pretty.push(node[i]);
    }
    pretty.push(['s', '\n'])
    return pretty;
  }

};

},{}],10:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'atruleb';
  },

  process: function(node) {
    node.splice(2, 0, ['s', ' ']);
    return node;
  }

};

},{}],11:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    var pretty = [];
    for (var i = 0; i < node.length; i++) {
      if (node[i][0] === 'declaration') {
        pretty.push(['s', '\n  ']);
      }
      pretty.push(node[i]);
    }
    pretty.push(['s', '\n']);
    return pretty;
  }

};

},{}],12:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    if (node[node.length - 2] && node[node.length - 2][0] !== 'decldelim') {
      node.splice(node.length - 1, 0, ['decldelim']);
    }
    return node;
  }

};

},{}],13:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'atrulerq';
  },

  process: function(node) {
    node.push(['s', ' ']);
    return node;
  }

};

},{}],14:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'selector';
  },

  process: function(node) {
    for (var i = 0; i < node.length; i++) {
      if (node[i][0] === 'simpleselector') {
        if (node[i + 1] && node[i + 1][0] === 'delim') {
          if (i > 1) {
            node[i].splice(1, 0, ['s', ' ']);
          }
        } else {
          if (i > 1) {
            node[i].splice(1, 0, ['s', ' ']);
          }
          node[i].push(['s', ' ']);
        }
      }
    }
    return node;
  }

};

},{}],15:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'stylesheet';
  },

  process: function(node) {
    var pretty = [];
    for (var i = 0; i < node.length; i++) {
      if (i > 0 && node[i][0] !== 's') {
        pretty.push(['s', '\n']);
        pretty.push(node[i]);
        pretty.push(['s', '\n']);
      } else {
        pretty.push(node[i]);
      }
    }
    pretty.push(['s', '\n']);
    return pretty;
  }

};

},{}],16:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'value';
  },

  process: function(node) {
    node.splice(1, 0, ['s', ' ']);
    return node;
  }

};

},{}],17:[function(require,module,exports){
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
},{"./pretty/at":10,"./pretty/at-block":9,"./pretty/blocks":11,"./pretty/last-delimiter":12,"./pretty/mq":13,"./pretty/selector":14,"./pretty/tops":15,"./pretty/value":16,"./ugly/comments":18,"./ugly/dedup-delimiters":19,"./ugly/ie-pseudo-fix":20,"./ugly/last-delimiter":21,"./ugly/space-adjacent":22,"./ugly/space-at-block":23,"./ugly/space-attribs":24,"./ugly/space-delimiter":25,"./ugly/space-functions":26,"./ugly/space-important":27,"./ugly/space-mq":28,"./ugly/space-rulesets":29,"./ugly/space-selectorops":30,"./ugly/space-single":31,"./ugly/space-trim":32,"./ugly/space-values":33,"./util":34,"gonzales-ast":1}],18:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'comment';
  },

  process: function(node) {

    var text = node[1];

    // important comments
    if (text.charAt(0) === '!') {
      // trim trailing space
      node[1] = text.trim();
      return node;
    }

    // ie mac hack ends
    if (this.ie5machack) { 
      this.ie5machack = false;
      node = ['raw', '/**/'];
      return node;
    }

    // ie5 mac hack starts
    if (text.charAt(text.length - 1) === '\\') {
      this.ie5machack = true;
      node[1] = '\\'; // minify the hack
      return node;
    }

    // return nothing, delete the comment
  },
  
  ie5machack: false

};

},{}],19:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    var delim_added = false;
    var decl_found = false;
    return node.filter(function(n) {

      if (n[0] === 'declaration') {
        decl_found = true;
      }

      if (n[0] !== 'decldelim') {
        delim_added = false;
        return true;
      }
      if (delim_added) {
        return false;
      }

      if (!decl_found) { // leading delimiter, forget it
        return false;
      }

      delim_added = true;
      return true;
    });
  }

};

},{}],20:[function(require,module,exports){
// add space after first-(line|letter)

module.exports = {

  test: function(name, nodes) {
    return name === 'pseudoc' || name === 'pseudoe';
  },

  process: function(node) {
    var val = node[1][1];
    if (val === 'first-line' || val === 'first-letter') {
      node[1][1] += ' ';
    }
    return node;
  }
};

},{}],21:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    if (node[node.length - 1][0] === 'decldelim') {
      node.pop();
    }
    return node;
  }

};

},{}],22:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return (
      name === 'block' ||
      name === 'simpleselector' ||
      name === 'value'
    );
  },

  process: function(node) {

    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 's') {
        if (node[i - 1] && node[i - 1][0] === 's') {
          node.splice(i, 1);
        }
      }
    }

    return node;
  }

};

},{"../util.js":34}],23:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'atruleb';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'block') {
        util.trimPrevNext(node, i);
      }
    }

    return node;
  }

};

},{"../util.js":34}],24:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'attrib';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'attrselector') {
        util.trimPrevNext(node, i);
      }
    }
    return node;
  }

};

},{"../util.js":34}],25:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'decldelim') {
        util.trimPrevNext(node, i);
      }
    }
    return node;
  }

};

},{"../util.js":34}],26:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'funktion';
  },

  process: function(node) {
    util.trim(node[2]);

    for (var i = 1; i < node[2].length; i++) {
      if (node[2][i][0] === 's') {
        if (util.aroundOperator(node[2], i)) {
          node[2].splice(i, 1);
        }
      }
    }

    return node;
  }

};

},{"../util.js":34}],27:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'value';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'important') {
        util.trimPrevNext(node, i);
      }
    }
    return node;
  }

};

},{"../util.js":34}],28:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'atrulerq';
  },

  process: function(node) {

    if (node[1][0] === 's' && node[2][0] === 'braces') {
      util.trim(node);
    } else {
      util.trimRight(node);
    }

    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'operator') {
        util.trimPrevNext(node, i);
      }
    }

    return node;
  }

};

},{"../util.js":34}],29:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'stylesheet' || name === 'atrulers';
  },

  process: function(node) {
    var newnode = [];
    newnode.push(node[0]);
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] !== 's') {
        newnode.push(node[i]);
      }
    }
    return newnode;
  }

};

},{"../util.js":34}],30:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'simpleselector';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'combinator') {
        util.trimPrevNext(node, i);
      }
    }
    return node;
  }

};

},{"../util.js":34}],31:[function(require,module,exports){
module.exports = {

  test: function(name, nodes) {
    return name === 's';
  },

  process: function(node) {
    node[1] = ' ';
    return node;
  }

};

},{}],32:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return (
      name === 'stylesheet' ||
      name === 'ruleset' ||
      name === 'block' ||
      name === 'selector' ||
      name === 'simpleselector' ||
      name === 'declaration' ||
      name === 'property' ||
      name === 'value' ||
      name === 'atrules' ||
      name === 'atrulers' ||
      name === 'atkeyword' ||
      name === 'braces'
    );
  },

  process: function(node) {
    util.trim(node);
    
    // special case, these have two more "intro" nodes, namely ( and )
    if (node[0] === 'braces') { 
      util.trimBraces(node);
    }
    
    return node;
  }

};

},{"../util.js":34}],33:[function(require,module,exports){
var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'value' || name === 'braces';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 's') {
        if (util.aroundOperator(node, i)) {
          node.splice(i, 1);
        }
      }
    }
    return node;
  }

};

},{"../util.js":34}],34:[function(require,module,exports){
exports.trim = function trim(ast) {
  if (ast.length < 2) {
    return; // already empty, nothing to trim
  }
  if (ast[ast.length - 1][0] === 's') {
    ast.pop();
  }
  if (ast[1] && ast[1][0] === 's') {
    ast.splice(1, 1);
  }
};

exports.trimRight = function trim(ast) {
  if (ast.length < 2) {
    return; // already empty, nothing to trim
  }
  if (ast[ast.length - 1][0] === 's') {
    ast.pop();
  }
};

exports.trimBraces = function trim(ast) {
  if (ast.length < 4) {
    return; // already empty, nothing to trim
  }
  if (ast[3] && ast[3][0] === 's') {
    ast.splice(3, 1);
  }
};

exports.trimPrevNext = function trim(node, i) {
  var prev = node[i - 1];

  if (prev && prev[0] === 's') {
    node.splice(i - 1, 1)
    i--;
  }
  var next = node[i + 1];
  if (next && next[0] === 's') {
    node.splice(i + 1, 1);
  }
};

exports.aroundOperator = function aroundOperator(node, i) {
  var prev = node[i - 1];
  var next = node[i + 1];
  return (
    (prev && prev[0] === 'operator') ||
    (next && next[0] === 'operator') ||
    (prev && prev[0] === 'ident' && prev[1] === '*') ||
    (next && next[0] === 'ident' && next[1] === '*')
  );
};

},{}]},{},[7])