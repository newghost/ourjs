/*!@preserve
Powered by ourjs.com
*/

var OurJS = window.OurJS || {};

/*
* Init
*/
(function() {

  $(document).foundation();
  $('.right-off-canvas-menu').html($('.top-menu').html());

})();


/*
* jQuery Plugins
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
* Keywords selected
*/
(function() {

  var urlLocation = decodeURIComponent(location.pathname);

  //keywrods selected;
  $('#keyNav>ul>li').removeClass('active');
  $('#keyNav>ul>li>a').each(function() {
    var $this = $(this);
    if (urlLocation.indexOf($this.attr('href')) > -1) {
      $this.closest('li').addClass('active');
      return;
    }
  });

  $('#keyNav>ul>li.active').size() < 1 && $('#keyNav>ul>li').eq(0).addClass('active');

})();


/*
* format DateTime
*/
(function() {

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

  var init = function() {

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
        dateStr = fromNow + ' seconds';
      } else if (fromNow < 3600) {
        dateStr = parseInt(fromNow / 60) + ' minutes';
      } else if (fromNow < 86400) {
        dateStr = parseInt(fromNow / 3600) + ' hours';
      } else if (fromNow < 259200) {
        dateStr = parseInt(fromNow / 86400) + ' days';
      } else {
        dateStr = formatDateTime(postTime, isDate);
      }

      $timeSpan.text(dateStr);
    });

  };

  init();

  OurJS.formatDateTime = formatDateTime;

})();


/*
Responsibile loading
*/
(function() {

  OurJS.loadMore = function() {

    var $articles       = $("#articles")
      , $loader         = $("#loader")
      , $loadmore       = $("#loadmore")
      , articleSelector = "#articles .article"
      ;

    //too many data sent, need to optimized at node side
    var loadMore = function(e) {
      e && e.preventDefault && e.preventDefault();

      if ($loadmore.attr("disabled")) return;
      $loadmore.attr("disabled", true);
      $loader.show();

      var pageSize = conf.pageSize || 12
        , url
        ;

      //Loading more: from userinfo page
      if (location.pathname.indexOf('userinfo') > -1) {
        var accounts  = $(articleSelector).size()
          , userid    = location.pathname.split('/')[2]
          , nextPage  = accounts / pageSize | 0
          ;

        url = '/userjson/' + userid + "/" + nextPage;
      }
      //Loading more: from homepage
      else {
        var accounts = $(articleSelector).size()
          , nextPage = accounts / pageSize | 0
          ;

        url = '/json/' + conf.category + '/' + nextPage
      }

      $.getJSON(url, function(articles) {
        var len   = articles.length
          , home  = conf.homemeta || 'home'
          , $tmpl = $(articleSelector).eq(0)
          , outs  = []
          ;

        for (var i = 0; i < len; i++) {
          var $html   = $tmpl.clone()
            , article = articles[i]
            ;

          $html.find('.title>a')
            .html(article.title)
            .attr('href', article.content ? ("/article/" + (article.urlSlug || article._id)) : article.url)
            ;

          $html.find('.author').html(article.author).attr('href', '/userinfo/' + article.author);
          $html.find('.keyword').html(article.keyword || '').attr('href', '/{0}/{1}'.format(home, article.category || ''));
          $html.find('.category').html(article.category || '').attr('href', '/{0}/{1}'.format(home, article.category || ''));
          $html.find('.formatdate.date').html(OurJS.formatDateTime(article.postdate, true));
          $html.find('.summary').html(article.summary || '');

          outs.push($html);
        }

        $loadmore.attr("disabled", len < pageSize);
        $loader.hide();

        $articles.append(outs);
      });
    };

    if ($articles.size()) {
      //update status of loadmore button
      $(articleSelector).size() < conf.pageSize && $loadmore.attr("disabled", true);
      $loadmore.click(loadMore);

      if ($articles.size()) {
        $(window).scroll(function() {
          if($(window).scrollTop() + $(window).height() == $(document).height()) {
            loadMore();
          }
        });
      }
    };

  };

  OurJS.loadMore();

  console && console.log && console.log('Powered By OurJS')

})();


/*
* Comments
*/
(function() {

  var $nickname = $('#nickname')
    , $editor   = $('#addReply .editor')
    ;

  /*
  Get random name, codes from: http://stackoverflow.com/questions/7666516/fancy-name-generator-in-node-js
  */
  var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
    "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
    "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
    "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
    "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
    "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
    "wandering", "withered", "wild", "black", "young", "holy", "solitary",
    "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
    "polished", "ancient", "purple", "lively", "nameless"]
    , nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
    "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
    "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
    "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
    "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
    "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
    "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
    "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
    "frog", "smoke", "star"]
    ;

  var getName = function() {
    return adjs[Math.floor(Math.random()*(adjs.length-1))]+"_"+nouns[Math.floor(Math.random()*(nouns.length-1))];
  };

  var init = function() {
    $('.comments .command a.reply').on('click', function() {
      var $container = $(this).closest('li')
        , floor      = $container.find('.floor').text()
        , name       = $container.find('.info a').text()
        ;

      var value = $editor.html();
      value && (value += '<br>');

      $editor
        .focus()
        .html(value + '#{0} @{1}<br><br>'.format(floor, name))
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

    $('#addReply .refresh').on('click', function() {
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

  $('#addReply').submit(function(e) {
    e.preventDefault();

    if (!conf.username && !$('#nickname').val()) {
      alert('Please signup or enter a nickname')
      return false;
    };

    var postData  = $('#addReply').toJSON()
      , reply     = $editor.html()
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

          $comment.find('.info b').text('#' + $(".comments>ul>li").size());
          $comment.find('.info span').text(OurJS.formatDateTime(new Date()), true);
          $comment.find('.content').html(reply);

          conf.username
            ? $comment.find('.info a').attr('href', '/userinfo/' + conf.username).text(conf.username)
            : $comment.find('.info a').text(postData.nickname);

          $(".comments>ul").append($comment);
          $("#wmd-input").val('').trigger('keydown');
          $editor.html('');
        }
        , error: function(xhr, type, message) {
          alert(type + ' ' + message);
        }
      });
    }
  });


  init();

})();


/*
* Editor
*/
(function() {

  //Enable MediumEditor
  var editor = new MediumEditor('.editor', {
      anchorInputPlaceholder: 'Type a link'
    , buttonLabels: 'fontawesome'
    , buttons: ['header1', 'header2', 'bold', 'italic', 'strikethrough', 'pre', 'quote', 'anchor', 'image', 'unorderedlist', 'orderedlist']
    , firstHeader: 'h1'
    , secondHeader: 'h2'
    , forcePlainText: false
  });

  //Update data for posting
  var editorHandler = function(e) {
    var $this   = $(this)
      , id      = $this.attr('id')
      , $input  = $this.closest('form').find('[name={0}]'.format(id))

    $input.val($this.html())
  };

  $('.editor')
    .on('keydown', editorHandler)
    .on('mouseup', editorHandler)

  $('#editArticleForm').submit(function() {
    $('.editor').trigger('keydown')
  })

  //Loading history: let back button works
  $('.editor').each(function() {
    var $this = $(this)
      , id = $this.attr('id')

    if (id) {
      var $input  = $this.closest('form').find('[name={0}]'.format(id))
        , val     = $input.val()

      val && !$this.val() && $this.html(val)
    }
  })

  //Loading select index from 
  $('select[data-val]').each(function() {
    var $select = $(this)
      , val     = $select.data('val')

    $select.find('option').each(function() {
      var $option = $(this);
      $option.val() == val && $option.attr('selected', true)
    })
  })

})();