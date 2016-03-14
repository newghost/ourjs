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

  /*
  根据地址栏地址选中默认的菜单
  */
  OurJS.navi = function() {

    var hasActive = false;

    $("ul.nav.toggle li>a").each(function() {
      var $link = $(this)
        , href  = $link.attr('href') || 'NO-ATTR-VALUE'
        , path  = location.pathname
        , idx   = path.indexOf('?')
        ;

      if (idx > 0) {
        path = path.substr(0, idx)
      }
      path = decodeURIComponent(path)

      //remove '/'
      if (path.length > 1 && href.length > 1 && (href == path)) {
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

      $timeSpan
        .text(dateStr)
        .removeClass('hide')
    });


  };

  var formatDateTime = function(date, isDate, isTime) {
    var addPrefix = function(n) {
      if (n < 10) {
        return '0' + n;
      }
      return n;
    }

    date = new Date(parseInt(date));

    var Y = date.getFullYear()
      , M = date.getMonth() + 1
      , D = date.getDate()
      , h = date.getHours()
      , m = date.getMinutes()
      , s = date.getSeconds()
      ;

    var date = Y  + '-' + addPrefix(M) + '-' + addPrefix(D);
    var time = addPrefix(h) + ':' + addPrefix(m) + ':' + addPrefix(s);

    if (isTime) {
      return time
    }

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

  $('.datetime').datepicker({
      format: "yyyy-mm-dd"
    , language: "zh-CN"
    , todayHighlight: true
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


/*股市行情*/
(function() {

  var $stock = $('.stock')

  if ($stock.size() < 1) {
    return
  }

  var maxInterval = 10 * 60 * 1000

  var setStock = function() {
    $.getJSON('/json/stock', function(json) {
      if (!json.time || (+ new Date() - json.time > maxInterval)) {
        return $stock.hide()
      }

      json.time = OurJS.formatDateTime(json.time, null, true)

      $stock.view(json, { formatter: function(val) {
        var $tag = $(this)

        if ($tag[0].tagName == 'B') {
          val < 0
            ? $tag.addClass('down')
            : $tag.removeClass('down')

          val = val + '%'
        }

        return val
      }})
    })
  }

  //周六周日不需要一直刷新行情
  var day = (new Date()).getDay()
  day !== 6 && day !== 0 && setInterval(setStock, 4000)


  setStock()

})();


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



(function() {

  var $chart = $('#chart_rong')

  var drawChart = function(days, shrq, shall, szrq, szall, rq, all) {
    var option = {
      animation: false,
      tooltip: {
        trigger: 'axis'
      },
      grid: {
          left   : 54
        , right  : 16
        , top    : 12
        , bottom : '24%'
      },
      xAxis : [
        {
            type : 'category'
          , boundaryGap : false
          , data : days
        }
      ],
      yAxis : [
        {
            type : 'value'
        }
      ],
      dataZoom: [
        {
            type: 'inside'
          , start: 50
          , end: 100
        },
        {
            show: true
          , type: 'slider'
          , y: '90%'
          , start: 50
          , end: 100
        }
      ],
      series : [
        {
            name:'沪深两融总额'
          , type:'line'
          //, stack: '总量'
          , areaStyle: {normal: {}}
          , data: all
        },{
            name:'沪深融券总额'
          , type:'line'
          //, stack: '总量'
          , areaStyle: {normal: {}}
          , data: rq
        },{
            name:'沪市两融余额'
          , type:'line'
          , stack: '总量'
          , areaStyle: {normal: {}}
          , data: shall
        },{
            name:'沪市融券余额'
          , type:'line'
          , stack: '总量'
          , areaStyle: {normal: {}}
          , data: shrq
        },{
            name:'深市两融余额'
          , type:'line'
          , stack: '总量'
          , areaStyle: {normal: {}}
          , data: szall
        },{
            name:'深市融券余额'
          , type:'line'
          , stack: '总量'
          , areaStyle: {normal: {}}
          , data: szrq
        }
      ]
    }

    //如果在行情页面上，复写一些属性
    $chart.closest('.chart-wrapper').size() && $.extend(option, {
      animation: false,
      tooltip: {
        trigger: 'axis'
      },
      legend: {
          data: ['沪深两融总额','沪深融券总额','沪市两融余额','沪市融券余额','深市两融余额','深市融券余额']
        , x: 'left' 
      },
      toolbox: {
        feature: {
            saveAsImage: {}
        }
      },
      grid: {
          left   : 54
        , right  : 16
        , top    : 48
        , bottom : '16%'
      },
      dataZoom: [
        {
            type: 'inside'
          , start: 50
          , end: 100
        },
        {
            show: true
          , type: 'slider'
          , y: '90%'
          , start: 50
          , end: 100
        }
      ],
    })

    var myChart = echarts.init($chart[0])
    myChart.setOption(option)
  }

  var init = function() {
    if ($chart.size() < 1) {
      return
    }

    $.getJSON('/json/rzrq', function(data) {
      var keys = Object.keys(data.sh).sort()

      var days  = []
        , shrq  = []
        , shall = []
        , szrq  = []
        , szall = []
        , rq    = []
        , all   = []

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
          , shv = data.sh[key].split(',')
          , szv = (data.sz[key] || '').split(',')
          , sh_rq   = parseInt(shv[0])
          , sh_all  = parseInt(shv[1])
          , sz_rq   = parseInt(szv[0])
          , sz_all  = parseInt(szv[1])

        days.push(key)
        shrq.push(sh_rq)
        shall.push(sh_all)
        szrq.push(sz_rq)
        szall.push(sz_all)
        rq.push(sh_rq + sz_rq)
        all.push(sz_all + sh_all)

        if (szv.length < 2) {
          console.log(key, data.sz[key])
        }
      }

      drawChart(days, shrq, shall, szrq, szall, rq, all)
    })
  }

  init()

})();


(function() {

  var $chart = $('#chart_baozhenjin')

  var drawChart = function(dimensions, end, ins, out) {
    var option = {
        animation: false,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            }
        },
        grid: {
            left   : 54
          , right  : 16
          , top    : 12
          , bottom : '24%'
        },
        xAxis: {
            type: 'category',
            data: dimensions,
            scale: true,
            boundaryGap : false,
            axisLine: {onZero: false},
            splitLine: {show: false},
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax'
        },
        yAxis: {
            scale: true,
            splitArea: {
                show: true
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 50,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                y: '90%',
                start: 50,
                end: 100
            }
        ],
        series : [
          {
              name:'期末余额'
            , type:'line'
            //, stack: '总量'
            , areaStyle: {normal: {}}
            , data: end
          },{
              name:'转入金额'
            , type:'line'
            //, stack: '总量'
            , areaStyle: {normal: {}}
            , data: ins
          },{
              name:'转出金额'
            , type:'line'
            //, stack: '总量'
            , areaStyle: {normal: {}}
            , data: out
          }
        ]
    }


    //如果在行情页面上，复写一些属性
    $chart.closest('.chart-wrapper').size() && $.extend(option, {
      toolbox: {
        feature: {
            saveAsImage: {}
        }
      },
      legend: {
          data: ['期末余额','转入金额','转出金额']
        , x: 'left' 
      },
      grid: {
          left   : 54
        , right  : 16
        , top    : 48
        , bottom : '16%'
      }
    })


    var myChart = echarts.init($chart[0])
    myChart.setOption(option)
  }

  var init = function() {
    if ($chart.size() < 1) {
      return
    }

    $.getJSON('/json/baozhenjin', function(data) {
      var rows  = data.baozhenjin
        , keys  = []
        , end   = []
        , ins   = []
        , out   = []

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
          , col = row[1].split(',')

        keys.push(row[0])
        end.push(parseInt(col[0]))
        ins.push(parseInt(col[2]))
        out.push(parseInt(col[3]))
      }
      
      drawChart(keys, end, ins, out)
    })
  }

  init()

})();