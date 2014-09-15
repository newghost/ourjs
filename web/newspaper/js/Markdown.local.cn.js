// Usage:
//
// var myConverter = new Markdown.Editor(myConverter, null, { strings: Markdown.local.cn });

(function () {
    Markdown.local = Markdown.local || {};
    Markdown.local.cn = {
        bold: "加粗 <strong> Ctrl+B",
        boldexample: "加粗文本",

        italic: "强调 <em> Ctrl+I",
        italicexample: "强调文本",

        link: "链接 <a> Ctrl+L",
        linkdescription: "添加链接",
        linkdialog: "<p><b>添加链接</b></p>",

        quote: "引用 <blockquote> Ctrl+Q",
        quoteexample: "引用",

        code: "代码，例如 <pre><code> Ctrl+K",
        codeexample: "在这里输入代码",

        image: "图片 <img> Ctrl+G",
        imagedescription: "插入图片描述",
        imagedialog: "<p><b>插入图片</b></p>",

        olist: "有序列表 <ol> Ctrl+O",
        ulist: "无序列表 <ul> Ctrl+U",
        litem: "列表",

        heading: "标题 <h1>/<h2> Ctrl+H",
        headingexample: "标题",

        hr: "分隔线 <hr> Ctrl+R",

        undo: "取消 - Ctrl+Z",
        redo: "重做 - Ctrl+Y",
        redomac: "重做 - Ctrl+Shift+Z",

        help: "Markdown Editing 帮助"
    };
})();