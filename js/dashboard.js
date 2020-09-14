var Dashboard = {
  create: function(params) {
    var self = this,
    doc = document,
    canvas = doc.querySelector(params.el),
    ctx = canvas.getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    width = params.width * dpr,
    height = params.height * dpr,
    color = params.color,
    // 绘制圆弧
    // 中心点坐标
    x = width / 2,
    y = height / 2,
    // 半径
    r = width / 2 * 0.95,
    // 线条宽度
    lineWidth = 8 * dpr,
    // 开始角度
    startAngle = 160,
    // 结束角度
    endAngle = 220,
    // 指示球半径
    br = lineWidth * 1.3,
    // 指针缩放值
    pointerScale = Math.min(params.pointer.scale, 1) * dpr,
    // 指针绘制位置半径
    prr = width / 2 * 0.75,
    maxValue = params.maxValue,
    currentValue = Math.min(params.currentValue, maxValue),
    highlightEndAngle = Math.max(0, currentValue) / maxValue * endAngle,
    pointerImg = new Image(),
    dashboardParams = {
      ctx: ctx,
      x: x,
      y: y,
      r: r,
      dpr: dpr,
      width: width,
      height: height,
      color: color,
      lineWidth: lineWidth,
      startAngle: startAngle,
      endAngle: endAngle,
      br: br,
      pointerScale: pointerScale,
      prr: prr,
      maxValue: maxValue,
      currentValue: currentValue,
      highlightEndAngle: highlightEndAngle,
      pointerImg: pointerImg,
      update: params.update
    };
    
    canvas.setAttribute('width', width)
    canvas.setAttribute('height', height)
    pointerImg.src = params.pointer.src
    pointerImg.onload = function () {
      self.animation(params.duration, dashboardParams)
    }
  },
  // 动画算法
  quadEaseOut: function (t, b, c, d) {
    return -c *(t /= d) * (t - 2) + b
  },
  // 动画函数
  animation: function(duration, params) {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
    cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame,
    self = this,
    ctx = params.ctx,
    t = 0,
    maxValue = params.maxValue,
    highlightEndAngle = params.highlightEndAngle,
    endAngle = params.endAngle,
    run = function() {
      ctx.clearRect(0, 0, params.width, params.height)
      t += 5
      var mt = Math.min(t, duration) // 时间不能超过动画时长
      var stepAngle = self.quadEaseOut(mt, 0, highlightEndAngle, duration)
      // 绘制背景弧
      self.drawArc(0.2, endAngle, params)
      // 绘制高亮弧
      self.drawArc(1, stepAngle, params)
      // 绘制高亮球
      self.drawBall(stepAngle, params)
      // 绘制指针
      self.drawPointer(stepAngle, params)
      // 绘制刻度背景
      var count = 31
      var cAngle = endAngle / count
      
      self.drawCalibration(0.2, count, -cAngle, params)
      // 绘制高亮刻度
      self.drawCalibration(1, self.quadEaseOut(mt, 0, Math.ceil(highlightEndAngle / cAngle), duration),  -cAngle, params)
      
      if (t > duration) {
        cancelAnimationFrame(run)
        return
      }
      if (typeof params.update === 'function') {
        // 更新仪表值
        params.update((stepAngle / endAngle * maxValue).toFixed(2))
      }
      requestAnimationFrame(run)
    };
    run()
  },
  drawArc: function(opacity, angle, params) {
    var ctx = params.ctx
    ctx.save()
    ctx.lineWidth = params.lineWidth
    ctx.translate(params.x, params.y)
    ctx.strokeStyle = params.color
    ctx.globalAlpha = opacity || 1
    ctx.beginPath()
    ctx.arc(0, 0, (params.width * 0.95 - 10 * params.dpr) / 2, params.startAngle * Math.PI / 180, (angle + params.startAngle) * Math.PI / 180, false)
    ctx.stroke()
    ctx.restore()
  },
  // 绘制刻度
  drawCalibration: function(opacity, total, angle, params) {
    var w = 10 * params.dpr,
    ctx = params.ctx,
    x = params.x,
    y = params.y,
    endAngle = params.endAngle,
    r = params.r;
    for(var i = 0; i < total; i++) {
      var deg = ((angle * i - (360 - endAngle - angle) / 2) * Math.PI / 180)
      ctx.save()
      ctx.translate(x + r * 0.9 * Math.sin(deg), y + r * 0.9* Math.cos(deg))
      ctx.rotate((((360 - endAngle - angle) / 2) + 90 - angle * i) * Math.PI / 180)
      ctx.fillStyle = params.color
      ctx.globalAlpha = opacity || 1
      ctx.fillRect(-w / 2, -w / 4, w, w / 2);
      ctx.restore()
    }
  },
  // 绘制圆球
  drawBall: function(angle, params) {
    var ctx = params.ctx,
    x = params.x,
    y = params.y,
    br = params.br,
    endAngle = params.endAngle,
    r = params.r,
    bx = x + (r - br / 2) * Math.sin(-((angle + (360 - endAngle) / 2) * Math.PI / 180)),
    by = y + (r - br / 2) * Math.cos(-((angle + (360 - endAngle) / 2) * Math.PI / 180));
    ctx.save()
    ctx.beginPath()
    ctx.arc(bx, by, br, 0, 2 * Math.PI)
    ctx.fillStyle = params.color
    ctx.fill()
    ctx.restore()
  },
  // 绘制指针
  drawPointer: function(angle, params) {
    var ctx = params.ctx,
    x = params.x,
    y = params.y,
    prr = params.prr,
    pointerImg = params.pointerImg,
    endAngle = params.endAngle,
    pointerScale = params.pointerScale,
    deg = -((angle + (360 - endAngle) / 2) * Math.PI / 180);
    ctx.save()
    ctx.translate(x + (prr - pointerImg.naturalWidth * pointerScale / 2) * Math.sin(deg), y + (prr - pointerImg.naturalHeight * pointerScale / 2) * Math.cos(deg))
    ctx.rotate((((360 - endAngle) / 2) + angle) * Math.PI / 180)
    ctx.scale(pointerScale, pointerScale)
    ctx.drawImage(pointerImg, -pointerImg.naturalWidth / 2, -pointerImg.naturalHeight / 2)
    ctx.restore()
  }
}