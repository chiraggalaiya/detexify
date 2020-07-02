const { remote, shell } = require('electron');
const path = require('path');

var $ = Dom7;
var app = new Framework7({
  id: 'chirag.galaiya',
  root: '#app',
  theme: 'md',
});
var no_connection = app.toast.create({
  text: 'You are offline. Please try again later',
  closeTimeout: 2000,
  position: 'center',
});
var mainView = app.views.create('.view-main');


const draw = SVG('drawing');
const shapes = [];
let index = 0;
let shape;
var clearrr = 0;
var strokes = [];
var stroke = [];
var latest_request = 0;
const getDrawObject = () => {
  shape = "mouse paint";
  const option = {
    stroke: "#fff",
    'stroke-width': 4,
    'fill-opacity': 0,
  };
  return draw.polyline().attr(option);
}
draw.on('mousedown', event => {
  const shape = getDrawObject();
  shapes[index] = shape;
  shape.draw(event);
  init_list();
  if (clearrr == 0) {
    animated("l");
    clearrr = 0.5;
    document.querySelector("#clear").style.display = "block";
    setTimeout(() => {
      document.querySelector("#clear").style.opacity = 1;
      clearrr = 1;
    }, 10);
  }
});
draw.on('mousemove', event => {
  if (shape === 'mouse paint' && shapes[index]) {
    shapes[index].draw('point', event);
  }
})
draw.on('mouseup', event => {
  strokes.push(stroke);
  stroke = [];
  if (shape === 'mouse paint') {
    shapes[index].draw('stop', event);
  } else {
    shapes[index].draw(event);
  }
  index++;
  fetch_results();
});

SVG.Element.prototype.draw.extend("line polyline polygon", {
  init: function(t) {
    this.set = new SVG.Set;
    var i = this.startPoint,
      e = [
        [i.x, i.y],
        [i.x, i.y]
      ];
    this.el.plot(e)
  },
  calc: function(t) {
    var i = this.el.array().valueOf();
    if (i.pop(), t) {
      var e = this.transformPoint(t.clientX, t.clientY);
      i.push(this.snapToGrid([e.x, e.y]))
    }
    this.el.plot(i);
    stroke.push({
      "x": parseFloat((e.x * 1.45).toFixed(2)),
      "y": parseFloat((e.y * 1.45).toFixed(2)),
      "t": Date.now()
    });
  },
  point: function(t) {
    if (this.el.type.indexOf("poly") > -1) {
      var i = this.transformPoint(t.clientX, t.clientY),
        e = this.el.array().valueOf();
      return e.push(this.snapToGrid([i.x, i.y])), this.el.plot(e), void this.el.fire("drawpoint", {
        event: t,
        p: {
          x: i.x,
          y: i.y
        },
        m: this.m
      })
    }
    this.stop(t)
  },
  clean: function() {
    this.set.each(function() {
      this.remove()
    }), this.set.clear(), delete this.set
  }
});

document.querySelector("#clear").addEventListener("click", function() {
	strokes = [];
  stroke = [];
  draw.clear();
  setTimeout(function() {
    init_list();
  }, 350);
  if (clearrr == 1) {
    animated("t");
    clearrr = 0.5;
    document.querySelector("#clear").style.opacity = 0;
    setTimeout(() => {
      document.querySelector("#clear").style.display = "none";
      if (document.querySelectorAll("#drawing polyline").length > 0) {
        animated("l");
        clearrr = 0.5;
        document.querySelector("#clear").style.display = "block";
        setTimeout(() => {
          document.querySelector("#clear").style.opacity = 1;
          clearrr = 1;
        }, 10);
      }
      clearrr = 0;
    }, 500);
  }
});

function animate(a, b) {
  if (b) {
    if (a.classList.contains("animate__fadeIn") && a.classList.contains("animate__fadeOut")) {
      a.classList.remove("animate__fadeOut")
    } else {
      a.classList.add("animate__fadeIn")
    }
  } else {
    if (a.classList.contains("animate__fadeIn") && a.classList.contains("animate__fadeOut")) {
      a.classList.remove("animate__fadeIn")
    } else {
      a.classList.add("animate__fadeOut")
    }
  }
}

var animated_cur = "t";

function animated(a) {
  console.log("animating to " + a);
  var b = document.querySelector("#text");
  var c = document.querySelector("#list");
  if (a == "l" && animated_cur == "t") {
    animated_cur = "l";
    animate(b, false);
    setTimeout(function() {
      animate(c, true);
    }, 250);
  } else if (a == "t" && animated_cur == "l") {
    animated_cur = "t";
    animate(c, false);
    setTimeout(function() {
      animate(b, true);
    }, 250);
  }
}

function init_list() {
  console.log("initing list");
  //var el = document.querySelectorAll('.list-info-icons');
  //for(var i=0;i<el.length;i++){
  //  el[i].style.display = 'block';
  //}
  if (document.querySelector(".media-list").classList.contains("skeleton-text") == false) {
    document.querySelector("#list .list").classList.add("skeleton-text");
  }
  if (document.querySelector(".media-list").classList.contains("skeleton-effect-blink") == false) {
    document.querySelector("#list .list").classList.add("skeleton-effect-blink");
  }
  if (document.querySelector(".media-list").classList.contains("disabled") == false) {
    document.querySelector("#list .list").classList.add("disabled");
  }
  var el = document.querySelectorAll('.not-skeleton-block');
  for (var i = 0; i < el.length; i++) {
    el[i].classList.remove("not-skeleton-block");
    el[i].classList.add("skeleton-block");
  }
  var el = document.querySelectorAll('.symbol');
  for (var i = 0; i < el.length; i++) {
    el[i].style.display = "none";
  }
  var el = document.querySelectorAll('.symbol');
  for (var i = 0; i < el.length; i++) {
    el[i].style.display = "none";
  }
  var el = document.querySelectorAll('.list .item-title');
  for (var i = 0; i < el.length; i++) {
    el[i].innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  }
  var el = document.querySelectorAll('.list-info-icons');
  for (var i = 0; i < el.length; i++) {
    el[i].style.display = "block";
  }
}

function init_list_results() {
  if (document.querySelector(".media-list").classList.contains("skeleton-text")) {
    document.querySelector("#list .list").classList.remove("skeleton-text");
  }
  if (document.querySelector(".media-list").classList.contains("skeleton-effect-blink")) {
    document.querySelector("#list .list").classList.remove("skeleton-effect-blink");
  }
  if (document.querySelector(".media-list").classList.contains("disabled")) {
    document.querySelector("#list .list").classList.remove("disabled");
  }
  var el = document.querySelectorAll('.skeleton-block');
  for (var i = 0; i < el.length; i++) {
    el[i].classList.remove("skeleton-block");
    el[i].classList.add("not-skeleton-block");
  }
  var el = document.querySelectorAll('.symbol');
  for (var i = 0; i < el.length; i++) {
    el[i].style.display = "block";
  }
  var el = document.querySelectorAll('.symbol');
  for (var i = 0; i < el.length; i++) {
    el[i].style.display = "block";
  }
}

function fetch_results() {
  if (navigator.onLine) {
    const xhr = new XMLHttpRequest();
    latest_request += 1;
    var temp_req = latest_request;
    xhr.responseType = 'json';
    xhr.open("POST", 'https://detexify.kirelabs.org/api/classify', true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.send("strokes=" + JSON.stringify(strokes));
    xhr.onload = (e) => {
      if (clearrr == 1) {
        if (temp_req == latest_request) {
          var el = document.querySelectorAll('li');
          for (var i = 0; i < el.length; i++) {
            console.log(xhr.response[i]);
            el[i].querySelector(".symbol").className = "symbol " + xhr.response[i]["symbol"]["css_class"];
            if (xhr.response[i]["symbol"]["package"] == undefined) {
              el[i].querySelector(".list-info-icons").style.display = "none";
            } else {
              app.tooltip.get(el[i].querySelector(".list-info-icons")).setText("\\usepackage{" + xhr.response[i]["symbol"]["package"] + "}");
              el[i].querySelector(".list-info-icons").dataset.copy = "\\usepackage{" + xhr.response[i]["symbol"]["package"] + "}";
            }
            el[i].querySelector(".item-title").innerHTML = xhr.response[i]["symbol"]["command"];
            el[i].querySelector(".item-subtitle").innerHTML = xhr.response[i]["symbol"]["mathmode"] ? "mathmode" : "textmode";
            el[i].dataset.copy = xhr.response[i]["symbol"]["command"];
          }
          init_list_results();
        }
      } else {
        if (document.querySelector(".media-list").classList.contains("disabled") == false) {
          document.querySelector("#list .list").classList.add("disabled");
        }
      }
    }
  } else {
    no_connection.open();
  }
}

function copy(a, b = false) {
  if (b) {
    setTimeout(function() {
      copy(a);
    }, 10);
  } else {
    document.querySelector("input").value = a;
    document.querySelector("input").select();
    document.querySelector("input").setSelectionRange(0, 99999);
    document.execCommand("copy");
  }
}

document.querySelector("#launch").addEventListener("click", function() {
	shell.openExternal('https://chiraggalaiya.ga');
});

document.querySelector("#minimize").addEventListener("click", function() {
	remote.BrowserWindow.getFocusedWindow().minimize();
});

document.querySelector("#close").addEventListener("click", function() {
	remote.BrowserWindow.getFocusedWindow().close();
});

setTimeout(function() {
  animate(document.querySelector("#text"), true);
}, 300);