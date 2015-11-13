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
            window.location = '/user/' + userInfo.username;
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
  if (location.href.indexOf('/root/edit/') < 0) {
    return
  }

  var $chkContent = $('#chkContent').change(function() {
    $('.contentWrapper').toggle()
  })  

  if (content) {
    $('#content').val(content)
    $chkContent.attr('checked', true).change()
  }

  //Edit mode
  $("input, textarea").each(function() {
    var $this = $(this)
      , val   = $this.val();
    val.length < 20  && val.trim() == 'undefined' && $this.val('');
  });



  /*
  edit plugins
  */
  $('.editor').wysihtml5({
      html: true
    , stylesheets: ["/css/libs.min.css", "/css/prod.min.css?v=217"]
  });

  $('.autocomplete').magicSuggest({
      placeholder : '[可不填]'
    , value       : keyword  || ''
    , data        : keywords || []
  });

}());

/*Pager*/
(function() {

  var urlLocation = decodeURIComponent(location.pathname);

  var makeActive = function($link) {
    $link.closest('li').addClass('active');
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

  //keywords selected;
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