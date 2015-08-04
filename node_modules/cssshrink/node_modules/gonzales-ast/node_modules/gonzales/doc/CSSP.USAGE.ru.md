### Использование Gonzales CSSP

#### 1. Пример

С помощью примера вы можете проверить правильность установки Gonzales и работоспособность всех его (трёх) функций.

Предполагается, что в production коде вы будете изменять AST более интеллектуально.

Код примера:

    var gonzales = require('gonzales'),
        src = 'a { color: red }',
        ast = gonzales.srcToCSSP(src);

    console.log('== SRC:');
    console.log(src);

    console.log('\n== SRC -> AST:');
    console.log(gonzales.csspToTree(ast));

    ast[1][1][1][1][1] = 'b';

    console.log('\n== AST\':');
    console.log(gonzales.csspToTree(ast));

    console.log('\n== AST\' -> SRC:');
    console.log(gonzales.csspToSrc(ast));
Результат выполнения:

    == SRC:
    a { color: red }

    == SRC -> AST:
    ['stylesheet', 
      ['ruleset', 
        ['selector', 
          ['simpleselector', 
            ['ident', 'a'], 
            ['s', ' ']]], 
        ['block', 
          ['s', ' '], 
          ['declaration', 
            ['property', 
              ['ident', 'color']], 
            ['value', 
              ['s', ' '], 
              ['ident', 'red'], 
              ['s', ' ']]]]]]

    == AST':
    ['stylesheet', 
      ['ruleset', 
        ['selector', 
          ['simpleselector', 
            ['ident', 'b'], 
            ['s', ' ']]], 
        ['block', 
          ['s', ' '], 
          ['declaration', 
            ['property', 
              ['ident', 'color']], 
            ['value', 
              ['s', ' '], 
              ['ident', 'red'], 
              ['s', ' ']]]]]]

    == AST' -> SRC:
    b { color: red }

#### 2. API

В Node.js подключить модуль можно так: `gonzales = require('gonzales')`.

Работать с CSSP AST можно через следующие функции.

##### SRC -> AST

Разбирает исходный стиль в AST: `gonzales.srcToCSSP(src, rule, needInfo)`, где:

* `src` — строка со стилем;
* `rule` — строка с типом токена, если стиль не является полным; например, вы хотите разобрать только *declaration*, в таком случае следует вызвать `srcToCSSP('color: red', 'declaration')`; если же стиль полный и info-object не нужен, вызов сокращается до `srcToCSSP(src)`;
* `needInfo` — включать ли info-object в AST; в большинстве случаев вам это не потребуется, но если включили, вы должны передавать то же значение `true` во все методы, где фигурирует аргумент `needInfo`.

##### AST -> SRC

Транслирует AST в стиль: `gonzales.csspToSrc(ast, hasInfo)`, где:

* `ast` — AST, который требуется транслировать;
* `needInfo` — включен ли info-object в AST; если при разборе стиля в AST `needInfo` был включен, здесь его тоже надо включить.

##### AST -> TREE

Транслирует AST в строковое представление дерева: `gonzales.csspToTree(ast)`, где:

* `ast` — AST, который требуется транслировать.

Эта функция полезна на стадии отладки или обучения.
