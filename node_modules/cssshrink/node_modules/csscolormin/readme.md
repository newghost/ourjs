Utility that minifies CSS colors

## Why

Cause we're counting bytes here!

## What

This little module uses the `color` npm module to do the heavy lifting.

So it will take any string input like `"white"`, `"rgba(0,0,0,1)"`, `"hsla(..)"`, `"hsv()"`, `"cmyk()"`, etc

Then it converts to `rgba()`, because we're targeting browsers.

Then it tries to minify the result as best as possible, e.g. removes the `a` in `rgba` if not needed,
tries an `#rrggbb`, an `#rgb` or a color name (e.g. `red`) and returns the shortest.

The return values are also consistently lowercase.

## Installation

    $ npm install csscolormin

## Usage

There's a single function provided by the module. It accepts any type of input that `color` module accepts, 
plus an rgb/rgba array.

Examples:

```js
var min = require('csscolormin');
min("white");
min("rgb(0, 0, 0)");
min("rgba(0, 0, 0, 0)");
min("hsl(0, 0, 0)");
min("hsla(0, 0, 0, 0)");
min("#bbaadd");
min([0, 0, 0, 0]);
min({r: 0, g: 0, b: 0, a: 50%});
```

Some more examples and returned values:

```js
min("white"); // "#fff"
min("black"); // "#000"
min("fuchsia"); // "#f0f"
min("red"); // "red"
min("#333333"); // "#333"
min("rgb(10, 30, 25)"); // "#0a1e19"
min("rgba(10, 30, 25, 1)"); // "#0a1e19"
min("rgba(10, 30, 25, 0.1)"); // "rgba(10,30,25,.1)"
min("rgba(10, 30, 25, 0)"); // "transparent"
min("hsl(120, 50%, 60%)"); // "#6c6"
min("blue"); // "blue"
min("goldenrod"); // "#daa520"
min([255, 0,   0, 1]); // "red"
min([255, 127, 0, 0]); // "transparent"
min([255, 127, 0]); // "#ff7f00"
min({r: 0, g: 0, b: 255, a: 0.5}); // "rgba(0,0,255,.5)"
```

## More

 * Playground: http://colormin.csspatterns.com
 * The `color` module: https://github.com/harthur/color