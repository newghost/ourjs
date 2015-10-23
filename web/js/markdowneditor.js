(function ($) {

    function h(q) {
        return function (c) {
            c.prependToLeadingLine((new Array(q + 1)).join('#') + ' ');
        };
    }

    function wrap() {
        var args = arguments;
        return function (c) {
            c.wrap.apply(null, args);
        };
    }

    function replace(x, y) {
        return function (c) {
            c.replace(x, y)
        };
    }

    function linecount() {
        return Math.ceil(eval($.map($('#editor').val().split('\n'), function (n, i) {
            return Math.ceil(n.length / 75)
        }).join('+')) / 43 * 10) / 10;
    }

    function wordcount() {
        return $('#editor').val().split(/[\s]/).length;
    }

    function charcount() {
        return $('#editor').val().length;
    }
    $.markdownEditor = {
        buttons: {
            'h1': {
                'name': 'H1',
                'icon': '',
                callback: h(1)
            },
            'h2': {
                'name': 'H2',
                'icon': '',
                callback: h(2)
            },
            'h3': {
                'name': 'H3',
                'icon': '',
                callback: h(3)
            },
            'h4': {
                'name': 'H4',
                'icon': '',
                callback: h(4)
            },
            'h5': {
                'name': 'H5',
                'icon': '',
                callback: h(5)
            },
            'h6': {
                'name': 'H6',
                'icon': '',
                callback: h(6)
            },
            'bold': {
                'name': '加粗',
                'icon': 'bold',
                callback: wrap('**')
            },
            'italic': {
                'name': '斜体',
                'icon': 'italic',
                callback: wrap('*')
            },
            'code': {
                'name': '代码',
                'icon': 'barcode',
                callback: wrap('`')
            },
            'quote': {
                'name': '引用',
                'icon': 'comment',
                callback: function (caret) {
                    caret.prependToEveryLine('> ');
                }
            },
            'link': {
                'name': '链接',
                'icon': 'share',
                callback: function (caret) {
                    caret.wrap('[' + caret.text + '](', ')');
                }
            },
            'indent': {
                'name': '缩进',
                'icon': 'indent-left',
                callback: function (caret) {
                    caret.prependToEveryLine("    ")
                }
            },
            'outdent': {
                'name': '缩出',
                'icon': 'indent-right',
                callback: function (caret) {
                    caret.replaceInSelection(/[ ]{4}(?![ ]{4})/g, "");
                }
            }
        },
        toolbars: {
            'default': [
                ['h4', 'h5'],
                ['bold', 'italic'],
                ['link'],
                ['quote', 'code']
            ]
        }
    };
    $.fn.markdownEditor = function (opts) {
        return $(this).each(function () {
            var $toolbarLoc = opts.toolbarLoc.addClass('me-toolbar-wrapper'),
                toolbar = opts.toolbar,
                $preview = opts.preview,
                $this = $(this).addClass('me-editor'),
                ui = new $.markdownEditor.ui($toolbarLoc, $this),
                loop, that = this;

            $this.preview = function () {
                $this.val()
                    ? $preview.html(markdown.toHTML($this.val()))
                    : $preview.html('<h3 class="preview">评论预览</h3>');
                $.markdownEditor.filepicker.update();
            };
            $this.preview();

            preview = $this.preview;

            $this.on('keydown', function (e) {
                var code = e.keyCode ? e.keyCode : e.which;

                clearTimeout(loop);
                loop = setTimeout(function () {
                    $this.preview();
                }, 250);

                if (code == 9) {
                    $this.caret().replace("    ", true);
                    e.stopPropagation();
                    return false;
                }
            });

            ui.rebuildToolbar(toolbar);
            $.markdownEditor.filepicker.clickHandlers();
        });
    }

    $.markdownEditor.ui = function ($bar, $o) {
        this.$bar = $bar;
        this.$textarea = $o;

        return this;
    }
    $.markdownEditor.ui.prototype.rebuildToolbar = function (toolbar) {
        var layout = $.markdownEditor.toolbars[toolbar],
            i = layout.length,
            bar = $('<div></div>').prop('class', 'btn-toolbar');

        for (var i = 0; i < layout.length; i++) {
            var group = layout[i];
            var out = $("<div></div>").addClass('btn-group');

            for (var j = 0; j < group.length; j++) {
                var key = group[j];
                this.makeButton(key, $.markdownEditor.buttons[key]).appendTo(out);
            }
            out.appendTo(bar);
        }

        this.$bar.html(bar);
    }
    $.markdownEditor.ui.prototype.makeButton = function (key, obj) {
        var button = $("<button></button>").addClass('me-' + key).addClass('btn').attr('alt', obj.name).click(this.clickHandler(obj.callback));
        button.addClass(obj.btn_class);
        if (obj.icon == '') {
            button.html(obj.name)
        } else {
            var icon = $("<i></i>").addClass('icon-' + obj.icon).addClass(obj.icon_class);
            button.append(icon);
            button.attr('rel', 'tooltip');
            button.attr('title', obj.name);
            button.tooltip({
                "placement": "bottom"
            })
        }
        return button

    }
    $.markdownEditor.ui.prototype.clickHandler = function (callback) {
        var that = this;
        return function (e) {
            callback.apply(null, [that.$textarea.caret(), that.$textarea]);
            that.$textarea.preview();
        };
    }
    $.markdownEditor.layout = function () {
        var source = $('#source');
        var preview = $('#preview');
        source.hide();
        preview.addClass('span12').removeClass('span6');
    }
    $.markdownEditor.filepicker = {};
    $.markdownEditor.filepicker.target = null;
    $.markdownEditor.filepicker.clickHandlers = function () {
        $(".me-open").click(function () {
            filepicker.getFile(filepicker.MIMETYPES.TEXT, function (url, data) {
                $.markdownEditor.filepicker.target = data;
                $('title').prepend($.markdownEditor.filepicker.target.name + " ");
                $('#filename').html($.markdownEditor.filepicker.target.name);
                $.ajax({
                    url: url,
                    success: function (data) {
                        $("#editor").html(data);
                        preview();
                    }
                });
            });
        });
        $(".me-savemd").click(function () {
            filepicker.getUrlFromData($("#editor").val(), function (dataUrl) {
                filepicker.saveAs(dataUrl, 'text/plain', {
                    'modal': true
                }, function (dataUrl) {
                    console.log("save md as " + dataUrl);
                });
            });
        });
        $(".me-savehtml").click(function () {
            filepicker.getUrlFromData($("#preview").html(), function (dataUrl) {
                filepicker.saveAs(dataUrl, 'text/html', {
                    'modal': true
                }, function (dataUrl) {
                    console.log("save html as " + dataUrl);
                });
            });
        });
    };
    $.markdownEditor.filepicker.update = function () {
        $('#stat').html(linecount() + " Pages " + wordcount() + " Words " + charcount() + " Characters");
    };
    $.markdownEditor.ui.adjust = function () {
        $('#editor').height($(window).height() - 160);
    };

})(jQuery);