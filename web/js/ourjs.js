/*!
* OurJS.org
* Copyright Kris Zhang (kris.newghost@gmail.com)
*/

/*
jQuery Plugin
*/
(function($) {
  $.fn.toJSON = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
})(jQuery);


/*
* debug
*/
window.console = window.console || {
  log: function() {}
}


var OurJS = window.OurJS || {};
var conf = conf || {};

/*
Navigation
*/
(function() {

  OurJS.navi = function() {

    var hasActive = false;

    $("ul.nav.toggle li>a").each(function() {
      var $link = $(this)
        , href  = $link.attr('href') || 'NO-ATTR-VALUE'
        , path  = decodeURIComponent(location.pathname)
        ;

      //remove '/'
      if (path.length > 1 && href.length > 1 && (href.indexOf(path) > -1 || path.indexOf(href) > -1)) {
        hasActive = true;
        $link.closest("li").addClass("active");
        $link.closest("li.dropdown").addClass("active");
      }
    });

    !hasActive && $('ul.nav>li').eq(0).addClass('active');

    var $navs = $(".nav.toggle>li").click(function(e) {
      var $this = $(this)
        , $about = $("#about");

      $navs.removeClass("active");
      $this.addClass("active");

      $(e.target).attr("id") == "aboutlink"
        ? $about.slideDown()
        : $about.slideUp();
    });
  };

  console.log('Powered By OurJS')

  OurJS.navi();
})();


/*
Responsibile loading
*/
(function() {
  OurJS.loadCol1 = function() {

    var $articles = $("#articles.col1")
      , $loader   = $("#loader")
      , $loadmore = $("#loadmore")
      ;

    //too many data sent, need to optimized at node side
    var loadMore = function(e) {
      e && e.preventDefault && e.preventDefault();

      if ($loadmore.attr("disabled")) return;
      $loadmore.attr("disabled", true);
      $loader.show();

      var pageSize = conf.pageSize || 12
        , accounts = $("#articles .article").size()
        , nextPage = accounts / pageSize | 0;

      $.getJSON("/json/" + conf.category + "/" + nextPage, function(articles) {
        var len   = articles.length
          , home  = conf.homemeta || 'home'
          , $tmpl = $("#articles .article").eq(0)
          , outs  = []
          ;

        for (var i = 0; i < len; i++) {
          var $html   = $tmpl.clone()
            , article = articles[i]
            , url     = "/detail/" + article._id
            ;

          $html.find('.title>a')
            .html(article.title)
            .attr('href', article.content ? url : article.url)
            ;

          $html.find('.author').html(article.author).attr('href', '/userinfo/' + article.author);
          $html.find('.category').html(article.category).attr('href', '/{0}/{1}'.format(home, article.category));
          $html.find('.keyword').html(article.keyword).attr('href', '/bbs/{1}'.format(home, article.keyword));
          $html.find('.formatdate.date').html(OurJS.formatDateTime(article.postdate, true));
          $html.find('.summary').html(article.summary || '');
          $html.find('.reply').attr('href', url + '#count').find('b').html(article.replyNum || 0);

          outs.push($html);
        }

        $loadmore.attr("disabled", len < pageSize);
        $loader.hide();

        $articles.append(outs);
      });
    };

    if ($articles.size()) {
      //update status of loadmore button
      $("#articles .article").size() < conf.pageSize && $loadmore.attr("disabled", true);
      $loadmore.click(loadMore);

      if ($articles.size() && $loader.size()) {
        $(window).scroll(function() {
          if($(window).scrollTop() + $(window).height() == $(document).height()) {
            loadMore();
          }
        });
      }
    };

  };

  OurJS.loadCol1();
})();

/*
Format reference url
*/
(function() {
  OurJS.formatUrl = function() {
    $("a.originUrl").each(function() {
      var $url = $(this);

      var href = $url.attr("href");
      href = href.replace("http://www.", '');
      href = href.replace("http://", '');
      href = href.replace("https://www.", '');
      href = href.replace("https://", '');

      var idx = href.indexOf('/');
      idx = idx > 0 ? idx : href.length;

      $url.text(href.substr(0, idx));
    });
  };

  OurJS.formatUrl();
})();

/*
For puzzle
*/
(function() {
  OurJS.puzzle = function() {
    $(".puzzle li .btn").on('click', function() {
      var $btn          = $(this)
        , $container    = $btn.closest('.puzzle')
        , $puzzle       = $btn.closest('li')
        , $result       = $container.find('.result')
        , answeredClass = 'answered'
        , correctClass  = 'correct'
        ;

      if ($puzzle.hasClass(answeredClass)) {
        return;
      }

      $puzzle.addClass(answeredClass);

      if ($btn.hasClass(correctClass)) {
        $btn.addClass('btn-success');
      } else {
        $puzzle.find(".correct").addClass('btn-success');
        $btn.addClass('btn-danger');
      }

      var all   = $container.find('ol > li').size()
        , wrong = $container.find('.btn-danger').size()
        , done  = $container.find('li.answered').size()
        , right = done - wrong
        ;

      $result.html(right + ' / ' + wrong + ' of ' + all);

    }).attr('title', function() {
      return $(this).text()
    });
  };

  OurJS.puzzle();
})();


/*
Responsive loadMore
*/
(function() {

  OurJS.loadMoreUserArticles = function() {

    var $articles = $("#article_container")
      , $loader   = $("#loader")
      , $loadmore = $("#loadmore_userarticle")
      , pageSize  = conf.pageSize || 12
      ;

    //too many data sent, need to optimized at node side
    var loadMore = function(e) {
      e && e.preventDefault();

      if ($loadmore.attr("disabled")) return;
      $loadmore.attr("disabled", true);
      $loader.show();

      var accounts = $("#article_container .article").size()
        , userid   = location.pathname.split('/')[2]
        , nextPage = accounts / pageSize | 0
        ;

      $.getJSON("/userjson/" + userid + "/" + nextPage, function(articles) {
        var len   = articles.length
          , $tmpl = $("#article_container .article").eq(0)
          , outs  = [];

        for (var i = 0; i < len; i++) {
          var article = articles[i];
          var $html = $tmpl.clone();

          $html.find('.title>a')
            .html(article.title)
            .attr('href', '/detail/' + article._id)
            ;

          $html.find('.author').html(article.author).attr('href', '/userinfo/' + article.author);
          $html.find('.keyword').html(article.keyword).attr('href', '/bbs/{0}'.format(article.keyword));
          $html.find('.formatdate.date').html(OurJS.formatDateTime(article.postdate, true));
          $html.find('.summary').html(article.summary || '');

          outs.push($html);
        }

        $loadmore.attr("disabled", len < pageSize);
        $loader.hide();

        $articles.append(outs);
      });
    };

    //update status of loadmore button
    $("#article_container .article").size() < pageSize && $loadmore.attr("disabled", true);
    $loadmore.click(loadMore);

    if ($articles.size() && $loader.size()) {
      $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
          loadMore();
        }
      });
    }
  };

  OurJS.loadMoreUserArticles();
})();




/*
Regist/Edit user functionalities
*/
(function() {
  
  var refresh = function() {
    //signIn(userInfo);
    window.setTimeout(function() {
      window.location.reload();
    }, 50);
  };

  var init = function() {
    $('#signtab a').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
    });

    var submitHandler = function(e) {
      var $form     = $('#signup form:visible')
        , userInfo  = $form.toJSON()
        ;

      e && e.preventDefault();

      if (!$form.valid()) {
        return;
      }

      $("#signOK").attr("disabled", true);

      if ($form.closest('#signuptab').size() > 0) {
        $.post('/user.signup.post', userInfo, function(userInfo) {
          $("#signOK").attr("disabled", false);
          if (userInfo && userInfo.username) {
            if ($("#signupSubscribe").is(":checked")) {
              $("#to").val($("#signupEmail").val());
              $("#subscribe").attr('target', "subscribeFrame").submit();
              alert('欢迎订阅我们的文摘！\r\n我们使用第三方邮件列表服务，\r\n如果您想退订\r\n在邮件正文中单击“退订”链接即可！\r\n\r\n由于第三方邮件列表的限制\r\n请您在1小时内登录邮箱，验证邮件:)');
            }
            refresh();
          } else {
            alert('注册失败！该用户名/邮箱可能被占用');
          }
        }, 'json');
      }

      if ($form.closest('#signintab').size() > 0) {
        $("#signOK").attr("disabled", false);
        $.post('/user.signin.post', userInfo, function(userInfo) {
          if (userInfo && userInfo.username) {
            refresh();
          } else {
            alert('登录失败！　请检查用户名或密码');
          }
        }, 'json');
      }

      return false;
    };

    $('#signuptab form').submit(submitHandler).validate({
      rules: {
          username: { minlength: 4, maxlength: 16, required: true }
        , password: { minlength: 4, maxlength: 32, required: true }
        , email:    { minlength: 4, maxlength: 64, email: true}
      }
    });

    $('#signintab form').submit(submitHandler).validate({
      rules: {
          username: { minlength: 4, maxlength: 16, required: true }
        , password: { minlength: 4, maxlength: 32, required: true }
      }
    });

    $("#signOK")
      .attr("disabled", false)
      .click(submitHandler)
      ;

    $("#useredit form").submit(function(e) {
      var $form = $(this);
      e.preventDefault();

      if ($form.valid()) {
        var userInfo = $form.toJSON();

        $.post('/user.edit.post', userInfo, function(data) {
          if (data.done) {
            window.location = '/userinfo/' + userInfo.username;
          } else {
            alert('修改失败！ 可能是密码不匹配！');
          }
        }, 'json');
      }
    }).validate({
      rules: {
          password:     { minlength: 3, maxlength: 32, required: true }
        , email:        { minlength: 3, maxlength: 64, email: true, required: true}
        , company:      { maxlength: 32 }
        , briefinfo:    { maxlength: 300 }
        , newPassword:  { minlength: 3, maxlength: 32 }
        , confPassword: { minlength: 3, maxlength: 32, equalTo: "#newPassword" }
      }
    });

    $('.formatdate').each(function() {
      var $timeSpan = $(this)
        , postTime = parseInt($timeSpan.text())
        , fromNow  = (new Date() - postTime) / 1000 | 0
        , isDate  = $timeSpan.hasClass('date')
        , dateStr
        ;

      if (fromNow < 0 || isDate) {
        dateStr = formatDateTime(postTime, isDate);
      } else if (fromNow < 60) {
        dateStr = fromNow + '秒前';
      } else if (fromNow < 3600) {
        dateStr = parseInt(fromNow / 60) + '分钟前';
      } else if (fromNow < 86400) {
        dateStr = parseInt(fromNow / 3600) + '小时前';
      } else if (fromNow < 259200) {
        dateStr = parseInt(fromNow / 86400) + '天前';
      } else {
        dateStr = formatDateTime(postTime, isDate);
      }

      $timeSpan.text(dateStr);
    });

    if ($('#addReply').size() > 0) {
      var converter = Markdown.getSanitizingConverter();
      converter.hooks.chain("preBlockGamut", function (text, rbg) {
          return text.replace(/^ {0,3}""" *\n((?:.*?\n)+?) {0,3}""" *$/gm, function (whole, inner) {
              return "<blockquote>" + rbg(inner) + "</blockquote>\n";
          });
      });

      //new Markdown.Editor(myConverter, null, { strings: Markdown.local.fr });
      var editor = new Markdown.Editor(converter, null, { strings: Markdown.local.cn });
      editor.run();
    }

    $('#addReply').submit(function(e) {
      e.preventDefault();

      if (!conf.username && !$('#nickname').val()) {
        alert('Please signup or enter a nickname')
        return false;
      };

      var postData  = $('#addReply').toJSON()
        , $reply    = $('#wmd-preview')
        , reply     = $reply.html()
        ;

      postData.reply = reply;

      if (reply && conf._id && (conf.username || postData.nickname)) {
        $.ajax({
            url: '/reply/add/' + conf._id
          , type: 'post'
          , data: JSON.stringify(postData)
          , success: function(data) {
            if (data) {
              return alert(data);
            }

            var comment = '<li>'
              + '<a class="avatar">'
              + '<img src="http://www.gravatar.com/avatar/' + conf.useravatar + '">'
              + '</a>'
              + '<div class="info">'
              + ' <b></b> '
              + ' <a target="_blank"></a>'
              + ' <span class="formatdate date"></span>'
              + '</div>'
              + '<div class="content"></div>'
              + '</li>'
              ;

            var $comment = $(comment);

            $comment.find('.info b').text('#' + $("#comments_list li").size());
            $comment.find('.info span').text(formatDateTime(new Date()), true);
            $comment.find('.content').html(reply);

            conf.username
              ? $comment.find('.info a').attr('href', '/userinfo/' + conf.username).text(conf.username)
              : $comment.find('.info a').text(postData.nickname);

            $("#comments_list").append($comment);
            $("#wmd-input").val('').trigger('keydown');
            $reply.html('');
          }
          , error: function(xhr, type, message) {
            alert(type + ' ' + message);
          }
        });
      }
    });
  };

  var formatDateTime = function(date, isDate) {
    var addPrefix = function(n) {
      if (n < 10) {
        return '0' + n;
      }
      return n;
    }

    date = new Date(date);

    var Y = date.getFullYear()
      , M = date.getMonth() + 1
      , D = date.getDate()
      , h = date.getHours()
      , m = date.getMinutes()
      , s = date.getSeconds()
      ;

    var date = Y  + '-' + addPrefix(M) + '-' + addPrefix(D);
    var time = addPrefix(h) + ':' + addPrefix(m) + ':' + addPrefix(s);

    return isDate ? date : (date + ' ' + time);
  };

  var signout = function() {
    $.getJSON('/user.signout.post', function(data) {
      data.done && refresh();
    });
  };

  init();

  OurJS.Users = {
      refresh   : refresh
    , signout   : signout
  };

  OurJS.formatDateTime = formatDateTime;

}());

/*
Edit Page
*/
(function() {
  if (location.href.indexOf('/root/edit/') > 0) {
    //Edit mode
    if (location.href.indexOf("/root/edit/add") < 0) {
      content && $('#content').val(content);
      summary && $('#summary').val(summary);

      var value = $("[name=category]").attr("data");
      $("[name=category] option").each(function() {
        $(this).val() == value && $(this).attr("selected", true);
      });

      var value = $("[name=keyword]").attr("data");
      $("[name=keyword] option").each(function() {
        $(this).val() == value && $(this).attr("selected", true);
      });

    //Add mode
    } else {
      $("input, textarea").each(function() {
        var $this = $(this)
          , val   = $this.val();
        val.length < 20  && val.trim() == 'undefined' && $this.val('');
      });
    };

    //Save draft function
    $('#saveDraft').click(function() {
      $('#verify').val('-1');
      $('#editArticleForm').submit();
    });


    $('#editArticleForm').submit(function(e) {
      var summary = $('#summary').val()
        , content = $('#content').val()
        ;

      if (summary.length < 100 && content.length < 100) {
        e.preventDefault();
        alert('请填写至少100字的摘要或正文');
      }
    });

    /*
    edit plugins
    */
    $('.editor').wysihtml5({
        html: true
      , stylesheets: ["/css/libs.min.css", "/css/prod.min.css?v=217"]
    });
  }
}());

/*Pager*/
(function() {

  var urlLocation = decodeURIComponent(location.pathname);

  var makeActive = function($link) {
    $link.closest('li').addClass('active');
    $link.attr('href', 'javascript:void(0)');
  };

  //navigation selected;
  $('.pagination>ul>li>a').each(function() {
    var $this = $(this)
      , href  = $this.attr('href')
      , idx   = urlLocation.indexOf(href)
      ;
    if (idx > -1 && !jQuery.isNumeric(urlLocation.charAt(idx + href.length))) {
      makeActive($this);
    }
  });  

  $('.pagination>ul>li.active').size() < 1 && makeActive($('.pagination>ul>li>a').eq(0));

  //keywrods selected;
  $('#keyNav>ul>li').removeClass('active');
  $('#keyNav>ul>li>a').each(function() {
    var $this = $(this);
    if (urlLocation.indexOf($this.attr('href')) > -1) {
      makeActive($this);
      return;
    }
  });
  $('#keyNav>ul>li.active').size() < 1 && makeActive($('#keyNav>ul>li>a').eq(0));
}());

/*Couter*/
(function() {
  
  OurJS.count = function() {
    $('.count').each(function() {
      var $count  = $(this)
        , cn      = 0
        , all     = 0
        ;

      var size = $($count.data('count')).text().split('').forEach(function(code) {
        code.charCodeAt(0)>255 && cn++;
        all++;
      });

      $count.find('span').text('[ 非英文:{0}, 总字符:{1} ]'.format(cn, all));
    });
  };

  OurJS.count();
}());


/*
* comments
*/
(function() {

  var $nickname = $('#nickname')
    , family  = '白毕卞蔡曹岑常车陈成程池邓丁范方樊费冯符傅甘高葛龚古关郭韩何贺洪侯胡华黄霍姬简江姜蒋金康柯孔赖郎乐雷黎李连廉梁廖林凌刘柳龙卢鲁陆路吕罗骆马梅孟莫母穆倪宁欧区潘彭蒲皮齐戚钱强秦丘邱饶任沈盛施石时史司徒苏孙谭汤唐陶田童涂王危韦卫魏温文翁巫邬吴伍武席夏萧谢辛邢徐许薛严颜杨叶易殷尤于余俞虞元袁岳云曾詹张章赵郑钟周邹朱褚庄卓'
    , given   = '一乙二十丁厂七卜人入八九几儿了力乃刀又三于干亏士工土才寸下大丈与万上小口巾山千乞川亿个勺久凡及夕丸么广亡门义之尸弓己已子卫也女飞刃习叉马乡丰王井开夫天无元专云扎艺木五支厅不太犬区历尤友匹车巨牙屯比互切瓦止少日中冈贝内水见午牛手毛气升长仁什片仆化仇币仍仅斤爪反介父从今凶分乏公仓月氏勿欠风丹匀乌凤勾文六方火为斗忆订计户认心尺引丑巴孔队办以允予劝双书幻玉刊示末未击打巧正扑扒功扔去甘世古节本术可丙左厉右石布龙平灭轧东卡北占业旧帅归且旦目叶甲申叮电号田由史只央兄叼叫另叨叹四生失禾丘付仗代仙们仪白仔他斥瓜乎丛令用甩印乐句匆册犯外处冬鸟务包饥主市立闪兰半汁汇头汉宁穴它讨写让礼训必议讯记永司尼民出辽奶奴加召皮边发孕圣对台矛纠母幼丝式刑动扛寺吉扣考托老执巩圾扩扫地扬场耳共芒亚芝朽朴机权过臣再协西压厌在有百存而页匠夸夺灰达列死成夹轨邪划迈毕至此贞师尘尖劣光当早吐吓虫曲团同吊吃因吸吗屿帆岁回岂刚则肉网年朱先丢舌竹迁乔伟传乒乓休伍伏优伐延件任伤价份华仰仿伙伪自血向似后行舟全会杀合兆企众爷伞创肌朵杂危旬旨负各名多争色壮冲冰庄庆亦刘齐交次衣产决充妄闭问闯羊并关米灯州汗污江池汤忙兴宇守宅字安讲军许论农讽设访寻那迅尽导异孙阵阳收阶阴防奸如妇好她妈戏羽观欢买红纤级约纪驰巡'

  var getName = function() {
    return family.charAt(Math.random() * family.length)
      + given.charAt(Math.random() * given.length)
      + given.charAt(Math.random() * given.length)
  };

  var init = function() {
    var $input = $('#wmd-input');

    $('.comments .command a.reply').on('click', function() {
      var $container = $(this).closest('li')
        , floor      = $container.find('.floor').text()
        , name       = $container.find('.info a').text()
        ;

      var value = $input.val();
      value && (value += '\n');

      $input
        .focus()
        .val( value + '@{1} #{0}\n\n'.format(floor, name))
        ;
    });

    $('.comments .command a.remove').on('click', function() {
      var $container = $(this).closest('li')
        , $content   = $container.find('.content')
        , floor      = parseInt($container.find('.floor').text())
        , _id        = conf._id
        ;

      if (floor > -1 && _id) {
        $.get('/reply/del/{0}/{1}'.format(_id, floor), function(data) {
          $content.html('<s>' + $content.text() + '</s>');
        });
      }
    });

    $('#addReply .icon-refresh').on('click', function() {
      var nickname = getName();
      $nickname.val(nickname).change();
    });

    $nickname
      .on('change', function() {
        $.cookie('nickname', $nickname.val(), { expires: 365, path: '/' });
      })
      .val($.cookie('nickname') || getName())
      .change()
      ;
  };

  init();

}());


/*
* dropdown menu
*/
(function() {

  var $menuNav = $('.menu.nav');

  var $btnNavBar = $('.btn.btn-navbar').on('click', function() {    
    $menuNav.css('display', $menuNav.is(':visible') ? '' : 'block');
  });

  var timer;
  $(document).on('touchstart', function(e) {
    if (timer) return;
    timer = setTimeout(function() {
      timer = null;

      var $target = $(e.target);
      if ($btnNavBar.is(':visible') && $menuNav.is(':visible') && $target.closest('.btn-navbar').size() < 1 && $target.closest('.nav').size() < 1) {
        $menuNav.css('display', '');
      }
    }, 100);
  });

}());


(function() {

  var browser   = $.browser || {}
    , progress  = NProgress

  if (browser.msie && $.browser.versionNumber < 8) {
    return
  }

  progress.configure({
      parent    : '.navbar .navbar-inner'
    , template  : '<div class="bar" role="bar"></div>'
  })

  progress.start()

  $(document)
    .ready(function() {
      progress.inc(0.5)
      setTimeout(function() {
        progress.done()
      }, 4000)
    })
    .ajaxStart(function() {
      progress.start()
    })
    .ajaxComplete(function() {
      progress.done()
    })

  $(window).load(function() {
    progress.done()
  })

}());