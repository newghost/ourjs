### 1. AST — Abstract Syntax Tree

Если вы не знаете, что такое AST, сначала почитайте [Wikipedia/Abstract syntax tree] (http://en.wikipedia.org/wiki/Abstract_syntax_tree).

#### 1.1. CSSP AST

Данный формат AST обеспечивает совместимость с [CSSP] (https://github.com/css/cssp).

В общем виде выглядит вот так:

    ['stylesheet',
      ['atrules', ..],
      ['s', ' '],
      ['comment', 'sample'],
      ['ruleset',
        ['selector', ..]],
        ['block', ..]]

#### 1.2. Известные проблемы

*operator* / *unary* — довольно искусственное разделение, вдобавок *unary* неверно назван. Утилитам, работающим с AST, может потребоваться обрабатывать узлы обоих типов вместо одного.

*raw* — в данный момент *raw* содержит неразобранный `progid` IE. Вероятно, в будущем имеет смысл всё-таки разбирать эту часть в полноценный AST.

### 2. Структура узла

Узел являет собою JavaScript-массив по следующей схеме:

    ['тип узла', <- обязательно, есть у каждого узла
     <содержимое>] <- опционально
Содержимым могут быть как другие узлы, так и текст CSS.

В случае, когда AST разбирается в режиме `needInfo`, в узел включается info-object. Сейчас в нём только номер строки, с которой начинается текст данного узла в стиле, но в будущем информации будет больше:

    [{ ln: ln }, <- info-object
     'тип узла', <- обязательно, есть у каждого узла
     <содержимое>] <- опционально
Если в ваш код приехал AST и вы не знаете, в каком режиме был разбор, проверьте тип первого элемента у первого узла.

### 3. Узлы

#### stylesheet

Стиль. Корневой узел AST.

Состоит из *ruleset* (набор правил с селекторами), *atrules* (однострочное at-правило), *atruleb* (блочное at-правило) и *atruler* (at-правило с *ruleset*). Эти узлы перемежаются *s* (пробельные символы) и *comment* (коментарии).

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

Коментарий.

    /* test */

    ↓

    ['comment', ' test ']

#### s

Пробельный символ: пробел, `\t`, `\n`, `\r`.

    /*a*/  /*b*/

    ↓

    ['comment', 'a'],
    ['s', '  '],
    ['comment', 'b']

#### string

Строка.

    'test'
    "test"

    ↓

    ['string', ''test'']
    ['string', '"test"']

#### ident

Идентификатор или имя. Идентификаторы в CSS встречаются на каждом шагу, потому примеры покажут лишь несколько вариантов.

В *atkeyword*:

    @import ..;

    ↓

    ['atkeyword',
      ['ident', 'import']]
В *clazz*:

    .abc

    ↓

    ['clazz',
      ['ident', 'abc']]
В *dimension*:

    10px

    ↓

    ['dimension',
      ['number', '10'],
      ['ident', 'px']]

#### number

Число.

    10
    12.34

    ↓

    ['number', '10']
    ['number', '12.34']

#### percentage

Число с процентом.

    10%

    ↓

    ['percentage',
      ['number', '10']]

#### dimension

Число с единицей длины.

    10px

    ↓

    ['dimension',
      ['number', '10'],
      ['ident', 'px']]

#### shash

Шестнадцатиричное число в контексте *simpleselector*.

    .. #FFF .. { .. }

    ↓

    ['shash', 'FFF']

#### vhash

Шестнадцатиричное число в контексте *value*.

    .. { ..: #FFF }

    ↓

    ['vhash', 'FFF']

#### clazz

Класс.

    .abc

    ↓

    ['clazz',
      ['ident', 'abc']]

#### namespace

Символ пространства имён в *simpleselector*.

    *|E { .. }

    ↓

    ['simpleselector',
      ['ident', '*'],
      ['namespace'],
      ['ident', 'E']]

#### combinator

Комбинаторный оператор: `+`, `>`, `~`.

Контекст `simpleselector`.

    x+y { .. }

    ↓

    ['simpleselector',
      ['ident', 'x'],
      ['combinator', '+'],
      ['ident', 'y']]

#### operator

Оператор: `/`, `,`, `:`, `=`.

С некоторой натяжкой можно сказать, что этот узел отвечает за "разделяющую пунктуацию" вне *simpleselector*, обычно в функциях.

    test(x,y)

    ↓

    ['funktion',
      ['ident', 'test'],
      ['functionBody',
        ['ident', 'x'],
        ['operator', ','],
        ['ident', 'y']]]

#### unary

Унарный оператор: `+`, `-`.

Везде (чаще в функциях), где по контексту подразумевается "арифметический" смысл операторов `+` и `-`.

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

Скобки всех типов.

Обратите внимание на то, что в узле сначала следуют скобки, а потом содержимое скобок.

    ()
    (1)

    ↓

    ['braces', '(', ')']
    ['braces', '(', ')',
      ['number', '1']]

#### attrselector

Оператор селектора атрибутов: `=`, `~=`, `^=`, `$=`, `*=`, `|=`.

    [a='b']

    ↓

    ['attrib',
      ['ident', 'a'],
      ['attrselector', '='],
      ['string', ''b'']]

#### attrib

Селектор атрибутов.

    [a='b']

    ↓

    ['attrib',
      ['ident', 'a'],
      ['attrselector', '='],
      ['string', ''b'']]

#### nth

Числа и идентификаторы в контексте *nthselector*.

    :nth-child(2n+1)

    ↓

    ['nthselector', 
      ['ident', 'nth-child'], 
      ['nth', '2n'], 
      ['unary', '+'], 
      ['nth', '1']]

#### nthselector

Узел для `:nth-` псевдоклассов.

Состоит из идентификатора псевдокласса и содержимого.

    :nth-last-child(+3n-2)

    ↓

    ['nthselector',
      ['ident', 'nth-last-child'],
      ['unary', '+'],
      ['nth', '3n'],
      ['unary', '-'],
      ['nth', '2']]

#### pseudoc

Псевдокласс.

    test:visited

    ↓

    ['simpleselector', 
      ['ident', 'test'], 
      ['pseudoc', 
        ['ident', 'visited']]]

#### pseudoe

Псевдоэлемент.

    p::first-line

    ↓

    ['simpleselector', 
      ['ident', 'p'], 
      ['pseudoe', 
        ['ident', 'first-line']]]

#### delim

Разделитель *simpleselector* в *selector*: `,`.

    x,y{ .. }

    ↓

    ['selector',
      ['simpleselector',
        ['ident', 'x']],
      ['delim'],
      ['simpleselector',
        ['ident', 'y']]]

#### simpleselector

Наборы селекторов между разделяющими запятыми.

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

Узел для хранения группы *simpleselector*.

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

Узел для хранения пары свойство / значение.

Состоит из *property* (идентификатор свойства) и *value* (значение свойства).

    color: red

    ↓

    ['declaration',
      ['property',
        ['ident', 'color']],
      ['value',
        ['s', ' '],
        ['ident', 'red']]]

#### block

Часть стиля в фигурных скобках.

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

Разделитель *declaration* в *block*: `;`.

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

Узел для хранения IE `filter`.

Состоит из *property* (идентификатор свойства), *filterv* (содержание) и *progid* (собственно, `progid`).

    filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')

    ↓

    ['filter',
      ['property',
        ['ident', 'filter']],
      ['filterv',
        ['progid',
          ['raw', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')']]]]

#### raw

Те части стиля, что не разбираются в AST. Относится к специфичным для браузеров вставкам, обычно IE `filter`.

    progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')

    ↓

    ['progid',
      ['raw', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')']]]]

#### funktion, functionBody

Функция.

Состоит из *ident* (имя функции) и *functionBody* (тело функции).

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

Узел для хранения `expression`.

    left:expression(document.body.offsetWidth+1)

    ↓

    ['declaration',
      ['property',
        ['ident', 'left']],
      ['value',
        ['functionExpression', 'document.body.offsetWidth+1']]]

#### important

Ключевое слово `!important`.

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

Набор правил с селекторами.

Состоит из *selector* (селекторы) и *block* (набор правил).

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

Идентификатор at-правила.

    @font-face ..

    ↓

    ['atkeyword',
      ['ident', 'font-face']]

#### atrules

Однострочное at-правило.

Состоит из *atkeyword* (идентификатор правила) и собственно правила.

    @import url('/css/styles.css')

    ↓

    ['atrules',
      ['atkeyword', 
        ['ident', 'import']], 
      ['s', ' '], 
      ['uri', 
        ['string', ''/css/styles.css'']]]

#### atruleb

Блочное at-правило.

Состоит из *atkeyword* (идентификатор правила), правила и блока.

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

At-правило с *ruleset*.

Состоит из *atkeyword* (идентификатор правила), *atrulerq* (правила) и *atrulers* (стиля).

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

Узел для того, что парсер не считает CSS, но может выделить и продолжить работу дальше.

    // invalid

    ↓

    ['stylesheet',
      ['unknown', '// invalid']]