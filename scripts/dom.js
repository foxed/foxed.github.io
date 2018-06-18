var canvas = $('#canvas')[0];
var win = $('#win')[0];

$(function () {
    $(".resize").resizable();

    $("#win").draggable({
        handle: "#pnav"
    });
    $("#win_about").draggable({
        handle: "#pnav_about"
    });
    $(".icon").draggable();
    $('#canvas').click(function () {
        changeColors();
        clear();
    });
    $('.close').click(function () {
        close($(this).closest(".win"));
    });

    function openAbout() {
      $("#win_about").show();
      drawInPosition();
      handleClick('about');
    }

    window.onload = (function () {
      openAbout();
    });    


    function close(element) {
    if (!element.is('#win_about')) {
    }
      element.hide()
    }
    function isMobile() {
      return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
    }

    if (isMobile()) {
      $('.icon.about').click(function () {
        openAbout();
      });    
    } else {
      $('.icon.about').dblclick(function () {
        openAbout()
      });      
    }
});

