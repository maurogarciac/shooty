'use strict';

(function() {

  const socket = io("http://localhost:4269");
  const canvas = document.getElementById('whiteboard');
  const colors = document.getElementsByClassName('color');
  const context = canvas.getContext('2d');

  var current = {
    color: 'black'
  };
  var drawing = false;

  // maybe make the offset be defined programatically instead of hardcoded
  const bodyRect = document.body.getBoundingClientRect(),
    elemRect = canvas.getBoundingClientRect(),
    offset_top   = elemRect.top - bodyRect.top,
    offset_left  = elemRect.left - bodyRect.left;
  // console.log('Canvas is ' + offset_top + ' vertical pixels from <body>');
  // console.log('Canvas is ' + offset_left + ' left pixels from <body>');


  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  
  // touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('draw', onDrawingEvent);

  canvas.width = 900;
  canvas.height = 600;


  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();

    context.moveTo(x0 - offset_left, y0 - offset_top);
    context.lineTo(x1 - offset_left, y1 - offset_top);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('draw', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  function onMouseDown(e){
    drawing = true;

    // console.log(e.clientX)
    // console.log(e.clientY)

    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
  }

  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

})();
