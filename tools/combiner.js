/*
Author  : Kris Zhang: http://github.com/newghost
License : MIT
*/

var fs    = require('fs')
  , path  = require('path')


var Combine = function(inputFile, outputFile, removeLines, baseFolder) {

  var TARGET  = {}
    , curJS   = ''
    , curCSS  = ''
    , CTRL  

  var mergeCssJs = function() {
    var files         = Object.keys(TARGET)
      , inputFolder   = baseFolder || path.dirname(inputFile)

    files.forEach(function(targetFile) {

      var files  = TARGET[targetFile]

      files.forEach(function(file, idx) {
        var filePath = path.join(inputFolder, file)

        try {
          var codes = fs.readFileSync(filePath).toString()
          TARGET[targetFile][idx] = codes
        } catch (e) {
          console.log(e)
        }
      })

      //target File Path may have domain
      var targetFilePath  = targetFile
        , idx             = targetFilePath.indexOf('//') 

      if (idx > -1) {
        targetFilePath = targetFilePath.substr(idx + 2)
        targetFilePath = targetFilePath.substr(targetFilePath.indexOf('/'))
      }

      targetFilePath = targetFilePath.indexOf('?') > -1
        ? targetFilePath.substr(0, targetFilePath.indexOf('?'))
        : targetFilePath

      fs.writeFile(path.join(inputFolder, targetFilePath), TARGET[targetFile].join(CTRL), function(err) {
        if (err) {
          console.log(err)
        }
      })
    })
  }

  var grepUrl = function(line, tag) {
    var idx = line.toLowerCase().indexOf(tag)

    line = line.substring(idx + tag.length)

    '\'"'.indexOf(line[0]) > -1 && (line = line.substr(1))

    idx = line.indexOf('"')
    idx < 0 && (idx = line.indexOf('\''))
    idx < 0 && (idx = line.indexOf(' '))
    idx < 0 && (idx = line.indexOf('>'))

    line = line.substring(0, idx)

    return line
  }

  var pickupFiles = function(line) {
    var formatLine = line.trim().toLowerCase()

    if (formatLine.indexOf('<!--#output=end-->') > -1) {
      curCSS  = ''
      curJS   = ''
    }

    //<!--#output="/css/all.css"-->
    if (formatLine.indexOf('<!--#output="') == 0) {
      var file = line.substr(13)
      file = file.substr(0, file.indexOf('"-->'))

      if (file.indexOf('.css') > 0) {
        TARGET[file] = []
        curCSS = file
        return removeLines ? '<link rel="stylesheet" type="text/css" href="' + file + '">' : line
      }

      if (file.indexOf('.js') > 0) {
        TARGET[file] = []
        curJS = file
        return removeLines ? '<script type="text/javascript" src="' + file + '"></script>' : line
      }

      return line
    }

    if (curCSS && formatLine.indexOf('<link') == 0) {
      var url = grepUrl(line, 'href=')

      if (url) {
        TARGET[curCSS].push(url)
        return removeLines ? '' : line
      }
    }

    if (curJS && formatLine.indexOf('<script') == 0) {
      var url = grepUrl(line, 'src=')

      if (url) {
        TARGET[curJS].push(url)
        return removeLines ? '' : line
      }
    }

    return line
  }

  var removeEmpty = function(line) {
    return line
  }

  var init = function() {
    if (!inputFile) {
      console.error('no input html file')
      return
    }

    fs.readFile(inputFile, function(err, data) {
      var CODES = data.toString()

      CTRL  = CODES.indexOf('\r\n') > 0 ? '\r\n' : '\n'

      var codes   = CODES.split(/[\r\n]+/g)

      if (removeLines) {
        codes = codes.map(pickupFiles)
        codes = codes.filter(removeEmpty)
      } else {
        codes.map(pickupFiles)
      }

      mergeCssJs()

      outputFile && fs.writeFile(outputFile, codes.join(CTRL), function(err) {
        if (err) {
          console.log(err)
        }
      })
    })
  }

  init()
}


/*
node combiner inputFile ouptFile
*/
var defaultCommand  = function() {
  var inputFile     = process.argv[2]
    , outputFile    = process.argv[3] || ''
    , removeLines   = process.argv.indexOf('-r') > 0
    , baseIdx       = process.argv.indexOf('-base')

  if (outputFile[0] == '-') {
    outputFile = null
  }

  var baseFolder = baseIdx > 0 ? process.argv[baseIdx + 1] : null

  if (inputFile) {
    Combine(inputFile, outputFile, removeLines, baseFolder)
  }
}



defaultCommand()



module.exports = Combine