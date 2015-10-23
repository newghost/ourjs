!function($, wysi) {
    "use strict";

    var templates = {
        "font-styles": "<li class='dropdown'>" +
                           "<a class='btn dropdown-toggle' data-toggle='dropdown' href='#'>" +
                               "<i class='icon-font'></i>&nbsp;<span class='current-font'>普通文本</span>&nbsp;<b class='caret'></b>" +
                           "</a>" +
                           "<ul class='dropdown-menu'>" +
                               "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='div'>普通文本</a></li>" +
                               "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h2'>标题 2</a></li>" +
                               "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h3'>标题 3</a></li>" +
                           "</ul>" +
                           '<a class="btn" data-wysihtml5-command="formatBlock" title="代码" data-wysihtml5-command-value="pre">代码</a>' +
                           '<a class="btn" data-wysihtml5-command="formatBlock" title="引用" data-wysihtml5-command-value="blockquote">引用</a>' +
                       "</li>",
        "emphasis":    "<li>" +
                           "<div class='btn-group'>" +
                               "<a class='btn' data-wysihtml5-command='bold' title='CTRL+B'>加粗</a>" +
                               "<a class='btn' data-wysihtml5-command='italic' title='CTRL+I'>斜体</a>" +
                               "<a class='btn' data-wysihtml5-command='underline' title='CTRL+U'>下划线</a>" +
                           "</div>" +
                       "</li>",
        "lists":       "<li>" +
                           "<div class='btn-group'>" +
                               "<a class='btn' data-wysihtml5-command='insertUnorderedList' title='无序列表'><i class='icon-list'></i></a>" +
                               "<a class='btn' data-wysihtml5-command='insertOrderedList' title='有序列表'><i class='icon-th-list'></i></a>" +
                               "<a class='btn' data-wysihtml5-command='Outdent' title='缩进'><i class='icon-indent-right'></i></a>" +
                               "<a class='btn' data-wysihtml5-command='Indent' title='缩出'><i class='icon-indent-left'></i></a>" +
                           "</div>" +
                       "</li>",
        "link":        "<li>" +
                           "<div class='bootstrap-wysihtml5-insert-link-modal modal hide fade'>" +
                               "<div class='modal-header'>" +
                                   "<a class='close' data-dismiss='modal'>&times;</a>" +
                                   "<h3>插入链接</h3>" +
                               "</div>" +
                               "<div class='modal-body'>" +
                                   "<input placeholder='http://' class='bootstrap-wysihtml5-insert-link-url input-xlarge' type='url'>" +
                               "</div>" +
                               "<div class='modal-footer'>" +
                                   "<a href='#' class='btn' data-dismiss='modal'>取消</a>" +
                                   "<a href='#' class='btn btn-primary' data-dismiss='modal'>插入链接</a>" +
                               "</div>" +
                           "</div>" +
                           "<a class='btn' data-wysihtml5-command='createLink' title='链接'><i class='icon-share'></i></a>" +
                       "</li>",
        "image":       "<li>" +
                           "<div class='bootstrap-wysihtml5-insert-image-modal modal hide fade'>" +
                               "<div class='modal-header'>" +
                                   "<a class='close' data-dismiss='modal'>&times;</a>" +
                                   "<h3>插入图片</h3>" +
                               "</div>" +
                               "<div class='modal-body'>" +
                                   "<input placeholder='http://' class='bootstrap-wysihtml5-insert-image-url input-xlarge' type='url'>" +
                               "</div>" +
                               "<div class='modal-footer'>" +
                                   "<a href='#' class='btn' data-dismiss='modal'>取消</a>" +
                                   "<a href='#' class='btn btn-primary' data-dismiss='modal'>插入图片</a>" +
                               "</div>" +
                           "</div>" +
                           "<a class='btn' data-wysihtml5-command='insertImage' title='图片'><i class='icon-picture'></i></a>" +
                       "</li>",

        "html":
                       "<li>" +
                           "<div class='btn-group'>" +
                               "<a class='btn' data-wysihtml5-action='change_view' title='编辑HTML'><i class='icon-pencil'></i> HTML</a>" +
                           "</div>" +
                       "</li>"
    };

    var defaultOptions = {
        "font-styles": true,
        "emphasis": true,
        "lists": true,
        "html": false,
        "link": true,
        "image": true,
        events: {},
        parserRules: {
            "classes": {
              "table": 1,
              "list": 1
            },
            "tags": {
                "tr": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "strike": {
                    "remove": 1
                },
                "form": {
                    "rename_tag": "div"
                },
                "rt": {
                    "rename_tag": "span"
                },
                "code": {},
                "acronym": {
                    "rename_tag": "span"
                },
                "br": {
                    "add_class": {
                        "clear": "clear_br"
                    }
                },
                "details": {
                    "rename_tag": "div"
                },
                "h4": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "em": {},
                "title": {
                    "remove": 1
                },
                "multicol": {
                    "rename_tag": "div"
                },
                "figure": {
                    "rename_tag": "div"
                },
                "xmp": {
                    "rename_tag": "span"
                },
                "small": {
                    "rename_tag": "span",
                    "set_class": "wysiwyg-font-size-smaller"
                },
                "area": {
                    "remove": 1
                },
                "time": {
                    "rename_tag": "span"
                },
                "dir": {
                    "rename_tag": "ul"
                },
                "bdi": {
                    "rename_tag": "span"
                },
                "command": {
                    "remove": 1
                },
                "ul": {},
                "progress": {
                    "rename_tag": "span"
                },
                "dfn": {
                    "rename_tag": "span"
                },
                "iframe": {
                    "remove": 1
                },
                "figcaption": {
                    "rename_tag": "div"
                },
                "a": {
                    "check_attributes": {
                        "href": "url"
                    },
                    "set_attributes": {
                        "rel": "nofollow",
                        "target": "_blank"
                    }
                },
                "img": {
                    "check_attributes": {
                        "width": "numbers",
                        "alt": "alt",
                        "src": "url",
                        "height": "numbers"
                    },
                    "add_class": {
                        "align": "align_img"
                    }
                },
                "rb": {
                    "rename_tag": "span"
                },
                "footer": {
                    "rename_tag": "div"
                },
                "noframes": {
                    "remove": 1
                },
                "abbr": {
                    "rename_tag": "span"
                },
                "u": {},
                "bgsound": {
                    "remove": 1
                },
                "sup": {
                    "rename_tag": "span"
                },
                "address": {
                    "rename_tag": "div"
                },
                "basefont": {
                    "remove": 1
                },
                "nav": {
                    "rename_tag": "div"
                },
                "h1": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "head": {
                    "remove": 1
                },
                "tbody": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "dd": {
                    "rename_tag": "div"
                },
                "s": {
                    "rename_tag": "span"
                },
                "li": {},
                "td": {
                    "check_attributes": {
                        "rowspan": "numbers",
                        "colspan": "numbers"
                    },
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "object": {
                    "remove": 1
                },
                "div": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "option": {
                    "rename_tag": "span"
                },
                "select": {
                    "rename_tag": "span"
                },
                "i": {},
                "track": {
                    "remove": 1
                },
                "wbr": {
                    "remove": 1
                },
                "fieldset": {
                    "rename_tag": "div"
                },
                "big": {
                    "rename_tag": "span",
                    "set_class": "wysiwyg-font-size-larger"
                },
                "button": {
                    "rename_tag": "span"
                },
                "noscript": {
                    "remove": 1
                },
                "svg": {
                    "remove": 1
                },
                "input": {
                    "remove": 1
                },
                "table": {},
                "keygen": {
                    "remove": 1
                },
                "h5": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "meta": {
                    "remove": 1
                },
                "map": {
                    "rename_tag": "div"
                },
                "isindex": {
                    "remove": 1
                },
                "mark": {
                    "rename_tag": "span"
                },
                "caption": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "tfoot": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "base": {
                    "remove": 1
                },
                "video": {
                    "remove": 1
                },
                "strong": {},
                "canvas": {
                    "remove": 1
                },
                "output": {
                    "rename_tag": "span"
                },
                "marquee": {
                    "rename_tag": "span"
                },
                "b": {},
                "q": {
                    "check_attributes": {
                        "cite": "url"
                    }
                },
                "applet": {
                    "remove": 1
                },
                "span": {},
                "rp": {
                    "rename_tag": "span"
                },
                "spacer": {
                    "remove": 1
                },
                "source": {
                    "remove": 1
                },
                "aside": {
                    "rename_tag": "div"
                },
                "frame": {
                    "remove": 1
                },
                "section": {
                    "rename_tag": "div"
                },
                "body": {
                    "rename_tag": "div"
                },
                "ol": {},
                "nobr": {
                    "rename_tag": "span"
                },
                "html": {
                    "rename_tag": "div"
                },
                "summary": {
                    "rename_tag": "span"
                },
                "var": {
                    "rename_tag": "span"
                },
                "del": {
                    "remove": 1
                },
                "blockquote": {
                    "check_attributes": {
                        "cite": "url"
                    }
                },
                "style": {
                    "remove": 1
                },
                "device": {
                    "remove": 1
                },
                "meter": {
                    "rename_tag": "span"
                },
                "h3": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "textarea": {
                    "rename_tag": "span"
                },
                "embed": {
                    "remove": 1
                },
                "hgroup": {
                    "rename_tag": "div"
                },
                "font": {
                    "rename_tag": "span",
                    "add_class": {
                        "size": "size_font"
                    }
                },
                "tt": {
                    "rename_tag": "span"
                },
                "noembed": {
                    "remove": 1
                },
                "thead": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "blink": {
                    "rename_tag": "span"
                },
                "plaintext": {
                    "rename_tag": "span"
                },
                "xml": {
                    "remove": 1
                },
                "h6": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "param": {
                    "remove": 1
                },
                "th": {
                    "check_attributes": {
                        "rowspan": "numbers",
                        "colspan": "numbers"
                    },
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "legend": {
                    "rename_tag": "span"
                },
                "hr": {},
                "label": {
                    "rename_tag": "span"
                },
                "dl": {
                    "rename_tag": "div"
                },
                "kbd": {
                    "rename_tag": "span"
                },
                "listing": {
                    "rename_tag": "div"
                },
                "dt": {
                    "rename_tag": "span"
                },
                "nextid": {
                    "remove": 1
                },
                "pre": {},
                "center": {
                    "rename_tag": "div",
                    "set_class": "wysiwyg-text-align-center"
                },
                "audio": {
                    "remove": 1
                },
                "datalist": {
                    "rename_tag": "span"
                },
                "samp": {
                    "rename_tag": "span"
                },
                "col": {
                    "remove": 1
                },
                "article": {
                    "rename_tag": "div"
                },
                "cite": {},
                "link": {
                    "remove": 1
                },
                "script": {
                    "remove": 1
                },
                "bdo": {
                    "rename_tag": "span"
                },
                "menu": {
                    "rename_tag": "ul"
                },
                "colgroup": {
                    "remove": 1
                },
                "ruby": {
                    "rename_tag": "span"
                },
                "h2": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "ins": {
                    "rename_tag": "span"
                },
                "p": {
                    "add_class": {
                        "align": "align_text"
                    }
                },
                "sub": {
                    "rename_tag": "span"
                },
                "comment": {
                    "remove": 1
                },
                "frameset": {
                    "remove": 1
                },
                "optgroup": {
                    "rename_tag": "span"
                },
                "header": {
                    "rename_tag": "div"
                }
            }
        },
        stylesheets: []
    };

    var Wysihtml5 = function(el, options) {
        this.el = el;
        this.toolbar = this.createToolbar(el, options || defaultOptions);
        this.editor =  this.createEditor(options);

        window.editor = this.editor;

        $('iframe.wysihtml5-sandbox').each(function(i, el){
            $(el.contentWindow).off('focus.wysihtml5').on({
              'focus.wysihtml5' : function(){
                 $('li.dropdown').removeClass('open');
               }
            });
        });
    };

    Wysihtml5.prototype = {

        constructor: Wysihtml5,

        createEditor: function(options) {
            options = $.extend(defaultOptions, options || {});
		    options.toolbar = this.toolbar[0];

		    var editor = new wysi.Editor(this.el[0], options);

            if(options && options.events) {
                for(var eventName in options.events) {
                    editor.on(eventName, options.events[eventName]);
                }
            }

            return editor;
        },

        createToolbar: function(el, options) {
            var self = this;
            var toolbar = $("<ul/>", {
                'class' : "wysihtml5-toolbar",
                'style': "display:none"
            });

            for(var key in defaultOptions) {
                var value = false;

                if(options[key] !== undefined) {
                    if(options[key] === true) {
                        value = true;
                    }
                } else {
                    value = defaultOptions[key];
                }

                if(value === true) {
                    toolbar.append(templates[key]);

                    if(key == "html") {
                        this.initHtml(toolbar);
                    }

                    if(key == "link") {
                        this.initInsertLink(toolbar);
                    }

                    if(key == "image") {
                        this.initInsertImage(toolbar);
                    }
                }
            }

            toolbar.find("a[data-wysihtml5-command='formatBlock']").click(function(e) {
                var el = $(e.srcElement);
                self.toolbar.find('.current-font').text(el.html());
            });

            this.el.before(toolbar);

            return toolbar;
        },

        initHtml: function(toolbar) {
            var changeViewSelector = "a[data-wysihtml5-action='change_view']";
            toolbar.find(changeViewSelector).click(function(e) {
                toolbar.find('a.btn').not(changeViewSelector).toggleClass('disabled');
            });
        },

        initInsertImage: function(toolbar) {
            var self = this;
            var insertImageModal = toolbar.find('.bootstrap-wysihtml5-insert-image-modal');
            var urlInput = insertImageModal.find('.bootstrap-wysihtml5-insert-image-url');
            var insertButton = insertImageModal.find('a.btn-primary');
            var initialValue = urlInput.val();

            var insertImage = function() {
                var url = urlInput.val();
                urlInput.val(initialValue);
                self.editor.composer.commands.exec("insertImage", url);
            };

            urlInput.keypress(function(e) {
                if(e.which == 13) {
                    insertImage();
                    insertImageModal.modal('hide');
                }
            });

            insertButton.click(insertImage);

            insertImageModal.on('shown', function() {
                urlInput.focus();
            });

            insertImageModal.on('hide', function() {
                self.editor.currentView.element.focus();
            });

            toolbar.find('a[data-wysihtml5-command=insertImage]').click(function() {
                insertImageModal.modal('show');
                insertImageModal.on('click.dismiss.modal', '[data-dismiss="modal"]', function(e) {
					e.stopPropagation();
				});
                return false;
            });
        },

        initInsertLink: function(toolbar) {
            var self = this;
            var insertLinkModal = toolbar.find('.bootstrap-wysihtml5-insert-link-modal');
            var urlInput = insertLinkModal.find('.bootstrap-wysihtml5-insert-link-url');
            var insertButton = insertLinkModal.find('a.btn-primary');
            var initialValue = urlInput.val();

            var insertLink = function() {
                var url = urlInput.val();
                urlInput.val(initialValue);
                self.editor.composer.commands.exec("createLink", {
                    href: url,
                    target: "_blank",
                    rel: "nofollow"
                });
            };
            var pressedEnter = false;

            urlInput.keypress(function(e) {
                if(e.which == 13) {
                    insertLink();
                    insertLinkModal.modal('hide');
                }
            });

            insertButton.click(insertLink);

            insertLinkModal.on('shown', function() {
                urlInput.focus();
            });

            insertLinkModal.on('hide', function() {
                self.editor.currentView.element.focus();
            });

            toolbar.find('a[data-wysihtml5-command=createLink]').click(function() {
                insertLinkModal.modal('show');
                insertLinkModal.on('click.dismiss.modal', '[data-dismiss="modal"]', function(e) {
					e.stopPropagation();
				});
                return false;
            });


        }
    };

    $.fn.wysihtml5 = function (options) {
        return this.each(function () {
            var $this = $(this);
            $this.data('wysihtml5', new Wysihtml5($this, options));
        });
    };

    $.fn.wysihtml5.Constructor = Wysihtml5;

}(window.jQuery, window.wysihtml5);
