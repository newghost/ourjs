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
