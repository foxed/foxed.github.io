var about_canvas = $('#about_canvas')[0];
context = about_canvas .getContext('2d');
var x = 45;
var y = -3;

var ms = new Image();
ms.src = 'images/ms.png';

var fulvio = new Image();
fulvio.src = 'images/f.png';

var anders = new Image();
anders.src = 'images/a.png';

ms.onload = function () {
    drawInPosition();
};

$('#pnav_about').mousemove(function (e) {

    if (e.which == 1) {
        x = 40 + $('#win_about')[0].getBoundingClientRect().left / 15;
        y = 3 - $('#win_about')[0].getBoundingClientRect().top / 20;
        drawInPosition();

    }
});

function drawInPosition() {
    context.clearRect(0, 0, 600, 325)
    context.drawImage(ms, 0, y);
    context.drawImage(fulvio, x / 2, 0);
    context.drawImage(anders, -x, 0);

}
