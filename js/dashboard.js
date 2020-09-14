var dashboard = function(options) {
  var doc = document
  var canvas = doc.querySelector(options.el)
  var ctx = canvas.getContext("2d")
  var dpr = window.devicePixelRatio || 1
  var width = options.width * dpr
  var height = options.height * dpr
  canvas.setAttribute('width', width)
  canvas.setAttribute('height', height)
  
  // 绘制圆弧
  // 中心点坐标
  var x = width / 2
  var y = height / 2
  // 半径
  var r = width / 2 * 0.95
  // 线条宽度
  var lineWidth = 8 * dpr
  ctx.lineWidth = lineWidth

  // 结束角度
  var endAngle = 220

  // 指示球半径
  var br = lineWidth * 1.3

  // 指针绘制半径
  var prr = width / 2 * 0.75

  // 动画算法
  function quadEaseOut(t, b, c, d) {
    return -c *(t /= d) * (t - 2) + b
  }

  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
  var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame


  // 动画函数
  function animation(duration) {
    var t = 0
    var run = function() {
      ctx.clearRect(0, 0, width, height)
      t += 5
      var mt = Math.min(t, duration) // 时间不能超过动画时长
      var stepAngle = quadEaseOut(mt, 0, highlightEndAngle, duration)
      // 绘制背景弧
      drawArc(0.2, endAngle)
      // 绘制高亮弧
      drawArc(1, stepAngle)
      // 绘制高亮球
      drawBall(stepAngle)
      // 绘制指针
      drawPointer(stepAngle)
      // 绘制刻度背景
      var count = 31
      var cAngle = endAngle / count
      
      drawCalibration(0.2, count, -cAngle)
      // 绘制高亮刻度
      drawCalibration(1, quadEaseOut(mt, 0, Math.ceil(highlightEndAngle / cAngle), duration),  -cAngle)
      
      if (t > duration) {
        cancelAnimationFrame(run)
        return
      }
      if (typeof options.update === 'function') {
        // 更新仪表值
        options.update((stepAngle / endAngle * options.maxValue).toFixed(2))
      }
      requestAnimationFrame(run)
    }
    run()
  }


  function drawArc(opacity, angle) {
    ctx.save()
    ctx.translate(x, y)
    ctx.strokeStyle = options.color
    ctx.globalAlpha = opacity || 1
    ctx.beginPath()
    ctx.arc(0, 0, (width * 0.95 - 10 * dpr) / 2, 160 * Math.PI / 180, (angle + 160) * Math.PI / 180, false)
    ctx.stroke()
    ctx.restore()
  }
  

  // 绘制高亮弧
  var currentValue = Math.min(options.currentValue, options.maxValue)
  var highlightEndAngle = Math.max(0, currentValue) / options.maxValue * endAngle
  

  // 绘制刻度
  function drawCalibration(opacity, total, angle) {
    var w = 10 * dpr
    for(var i = 0; i < total; i++) {
      var deg = ((angle * i - (360 - endAngle - angle) / 2) * Math.PI / 180)
      ctx.save()
      ctx.translate(x + r * 0.9 * Math.sin(deg), y + r * 0.9* Math.cos(deg))
      ctx.rotate((((360 - endAngle - angle) / 2) + 90 - angle * i) * Math.PI / 180)
      ctx.fillStyle = options.color
      ctx.globalAlpha = opacity || 1
      ctx.fillRect(-w / 2, -w / 4, w, w / 2);
      ctx.restore()
    }
  }


  // 绘制圆球
  function drawBall(angle) {
    var bx = x + (r - br / 2) * Math.sin(-((angle + (360 - endAngle) / 2) * Math.PI / 180))
    var by = y + (r - br / 2) * Math.cos(-((angle + (360 - endAngle) / 2) * Math.PI / 180))
    ctx.save()
    ctx.beginPath()
    ctx.arc(bx, by, br, 0, 2 * Math.PI)
    ctx.fillStyle = options.color
    ctx.fill()
    ctx.restore()
  }


  // 绘制指针
  function drawPointer(angle) {
    var scale = options.pointer.scale * dpr
    var deg = -((angle + (360 - endAngle) / 2) * Math.PI / 180)
    ctx.save()
    ctx.translate(x + (prr - img.naturalWidth * scale / 2) * Math.sin(deg), y + (prr - img.naturalHeight * scale / 2) * Math.cos(deg))
    ctx.rotate((((360 - endAngle) / 2) + angle) * Math.PI / 180)
    ctx.scale(scale, scale)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
    ctx.restore()
  }

  

  var img = new Image()
  img.src = options.pointer.src
  img.onload = function () {
    animation(options.duration)
  }
  
}