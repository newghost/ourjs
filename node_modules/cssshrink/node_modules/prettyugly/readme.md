Uglify (strip spaces) or prettify (add consistent spaces) CSS code

    "Ambition makes you look pretty ugly..."
    ~ Radiohead, Paranoid Android

## Installation

    $ npm install prettyugly

## Usage

```js
var prettyugly = require('../index.js');
var css =
  'a {background :  red ; color: blue}';
var ugly   = prettyugly.ugly(css);
var pretty = prettyugly.pretty(css);
```

The pretty result:

```css
a {
  background: red;
  color: blue;
}
```

The ugly:

```css
a{background:red;color:blue}
```

## CLI

    $ prettyugly pretty stuffs/example.css
    $ prettyugly ugly stuffs/example.css

## Playground

Available at http://prettyugly.csspatterns.com

