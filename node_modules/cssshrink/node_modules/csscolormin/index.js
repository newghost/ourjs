var color = require("color");
var string = require("color-string");

exports.min = function min(c) {

  if (Array.isArray(c)) {
    var colour = color({
      r: c[0],
      g: c[1],
      b: c[2],
    });
    if ('3' in c) {
      colour.alpha(c[3]);
    }
  } else {
    var colour = color(c);
  }
  var alpha = colour.values.alpha;
  var rgb = colour.values.rgb;

  if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0 && alpha === 0) {
    return 'transparent';
  }

  if (alpha !== 1) {
    // no choice, gotta be rgba
    if (alpha < 1) {
      alpha = String(alpha).replace('0.', '.');
    }
    return string
      .rgbaString(rgb, alpha)
      .replace(/ /g, '')
      .toLowerCase();
  }

  // hex, short hex, or keyword
  var hex = colour.hexString();
  if (hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6]) {
    hex = ['#', hex[1], hex[3], hex[5]].join('');
  }
  var word = colour.keyword();
  if (!word || hex.length < word.length) {
    return hex.toLowerCase();
  }
  return word.toLowerCase();
};


// only key names that have shorter equivalents
// e.g. "red" and "blue" are not here
exports.keywords = {
  "aliceblue": "#f0f8ff",
  "antiquewhite": "#faebd7",
  "aquamarine": "#7fffd4",
  "black": "#000",
  "blanchedalmond": "#ffebcd",
  "blueviolet": "#8a2be2",
  "burlywood": "#deb887",
  "cadetblue": "#5f9ea0",
  "chartreuse": "#7fff00",
  "chocolate": "#d2691e",
  "cornflowerblue": "#6495ed",
  "cornsilk": "#fff8dc",
  "darkblue": "#00008b",
  "darkcyan": "#008b8b",
  "darkgoldenrod": "#b8860b",
  "darkgray": "#a9a9a9",
  "darkgreen": "#006400",
  "darkgrey": "#a9a9a9",
  "darkkhaki": "#bdb76b",
  "darkmagenta": "#8b008b",
  "darkolivegreen": "#556b2f",
  "darkorange": "#ff8c00",
  "darkorchid": "#9932cc",
  "darksalmon": "#e9967a",
  "darkseagreen": "#8fbc8f",
  "darkslateblue": "#483d8b",
  "darkslategray": "#2f4f4f",
  "darkslategrey": "#2f4f4f",
  "darkturquoise": "#00ced1",
  "darkviolet": "#9400d3",
  "deeppink": "#ff1493",
  "deepskyblue": "#00bfff",
  "dodgerblue": "#1e90ff",
  "firebrick": "#b22222",
  "floralwhite": "#fffaf0",
  "forestgreen": "#228b22",
  "fuchsia": "#f0f",
  "gainsboro": "#dcdcdc",
  "ghostwhite": "#f8f8ff",
  "goldenrod": "#daa520",
  "greenyellow": "#adff2f",
  "honeydew": "#f0fff0",
  "indianred": "#cd5c5c",
  "lavender": "#e6e6fa",
  "lavenderblush": "#fff0f5",
  "lawngreen": "#7cfc00",
  "lemonchiffon": "#fffacd",
  "lightblue": "#add8e6",
  "lightcoral": "#f08080",
  "lightcyan": "#e0ffff",
  "lightgoldenrodyellow": "#fafad2",
  "lightgray": "#d3d3d3",
  "lightgreen": "#90ee90",
  "lightgrey": "#d3d3d3",
  "lightpink": "#ffb6c1",
  "lightsalmon": "#ffa07a",
  "lightseagreen": "#20b2aa",
  "lightskyblue": "#87cefa",
  "lightslategray": "#789",
  "lightslategrey": "#789",
  "lightsteelblue": "#b0c4de",
  "lightyellow": "#ffffe0",
  "limegreen": "#32cd32",
  "magenta": "#f0f",
  "mediumaquamarine": "#66cdaa",
  "mediumblue": "#0000cd",
  "mediumorchid": "#ba55d3",
  "mediumpurple": "#9370db",
  "mediumseagreen": "#3cb371",
  "mediumslateblue": "#7b68ee",
  "mediumspringgreen": "#00fa9a",
  "mediumturquoise": "#48d1cc",
  "mediumvioletred": "#c71585",
  "midnightblue": "#191970",
  "mintcream": "#f5fffa",
  "mistyrose": "#ffe4e1",
  "moccasin": "#ffe4b5",
  "navajowhite": "#ffdead",
  "olivedrab": "#6b8e23",
  "orangered": "#ff4500",
  "palegoldenrod": "#eee8aa",
  "palegreen": "#98fb98",
  "paleturquoise": "#afeeee",
  "palevioletred": "#db7093",
  "papayawhip": "#ffefd5",
  "peachpuff": "#ffdab9",
  "powderblue": "#b0e0e6",
  "rosybrown": "#bc8f8f",
  "royalblue": "#4169e1",
  "saddlebrown": "#8b4513",
  "sandybrown": "#f4a460",
  "seagreen": "#2e8b57",
  "seashell": "#fff5ee",
  "slateblue": "#6a5acd",
  "slategray": "#708090",
  "slategrey": "#708090",
  "springgreen": "#00ff7f",
  "steelblue": "#4682b4",
  "turquoise": "#40e0d0",
  "white": "#fff",
  "whitesmoke": "#f5f5f5",
  "yellow": "#ff0",
  "yellowgreen": "#9acd32"
};

