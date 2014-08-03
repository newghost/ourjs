var fs        = require("fs")
  , jsp       = require("uglify-js").parser
  , pro       = require("uglify-js").uglify
  , cssshrink = require('cssshrink')
  ;

var js = function(inputFile, outputFile) {
  var ast = jsp.parse(fs.readFileSync(inputFile).toString()); // parse code and get the initial AST
  ast = pro.ast_mangle(ast); // get a new AST with mangled names
  ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
  var final_code = pro.gen_code(ast); // compressed code here
  fs.writeFileSync(outputFile, final_code, "utf-8");

  console.log('minified js:', inputFile, outputFile);
};

var css = function(inputFile, outputFile) {  
  var codes = cssshrink.shrink(fs.readFileSync(inputFile).toString());
  fs.writeFileSync(outputFile, codes, "utf-8");

  console.log('minified css:', inputFile, outputFile);
};

(function() {
  var args = process.argv;

  if (args.length < 4 || args[0].indexOf('node') < 0 || args[1].indexOf('minifier') < 0) {
    return
  }

  var inputFile   = args[2]
    , outputFile  = args[3]
    ;

  if (inputFile.substr(inputFile.length - 4) == '.css') {
    css(inputFile, outputFile);
  }

  if (inputFile.substr(inputFile.length - 3) == '.js') {
    js(inputFile, outputFile);
  }

})();