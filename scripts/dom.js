var canvas = $('#canvas')[0];
var win = $('#win')[0];

$(function () {
    $(".resize").resizable();

    $("#win").draggable({
        handle: "#pnav"
    });
    $("#win_contact").draggable({
        handle: "#pnav_contact"
    });

    $("#win_photo").draggable({
        handle: "#pnav_photo"
    });
    $(".icon").draggable();
    $('#canvas').click(function () {
        changeColors();
        clear();
    });
    $('.close').click(function () {
        close($(this).closest(".win"));
    });
    function openSoundcloud() {
        window.location.href = "http://www.soundcloud.com/lumiset";
        handleClick('soundCloud')
    }

    function openContact() {
        $("#win_contact").show();
        drawInPosition();
        handleClick('contact');
    }
    function openPhoto() {
        $("#win_photo").show();
        drawInPosition();
        handleClick('photo');
    }

    function close(element) {
    if (!element.is('#win_photo')) {
    }
    element.hide()
    }

    function isMobile() {
        return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
    }


    function openTrack(elem) {
        var trackNbr = elem.attr('id');
        changeColors();
        changeNote(trackNbr);
        stopCurrentTrackAndStartTrack(trackNbr);
        handleTrackPlay(trackNbr);
    }

    if (isMobile()) {
        $('.icon.soundcloud').click(function () {
            openSoundcloud();
        });
        $('.icon.contact').click(function () {
            openContact();
        });
        $('.icon.photo').click(function () {
            openContact();
        });
        $('.icon.track').click(function () {
            openTrack($(this))
        });
    } else {
        $('.icon.soundcloud').dblclick(function () {
            openSoundcloud()
        });
        $('.icon.contact').dblclick(function () {
            openContact()
        });
        $('.icon.photo').dblclick(function () {
            openPhoto()
        });
        $('.icon.track').dblclick(function () {
            openTrack($(this))
        });
    }

});
