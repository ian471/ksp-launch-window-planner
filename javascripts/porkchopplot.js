// Generated by CoffeeScript 1.6.2
(function() {
  var PALETTE, PLOT_HEIGHT, PLOT_WIDTH, PLOT_X_OFFSET, PorkchopPlot, TIC_LENGTH, i, _i, _j, _k, _l, _m;

  PLOT_WIDTH = 300;

  PLOT_HEIGHT = 300;

  PLOT_X_OFFSET = 70;

  TIC_LENGTH = 5;

  PALETTE = [];

  for (i = _i = 64; _i < 69; i = ++_i) {
    PALETTE.push([64, i, 255]);
  }

  for (i = _j = 133; _j <= 255; i = ++_j) {
    PALETTE.push([128, i, 255]);
  }

  for (i = _k = 255; _k >= 128; i = --_k) {
    PALETTE.push([128, 255, i]);
  }

  for (i = _l = 128; _l <= 255; i = ++_l) {
    PALETTE.push([i, 255, 128]);
  }

  for (i = _m = 255; _m >= 128; i = --_m) {
    PALETTE.push([255, i, 128]);
  }

  PorkchopPlot = (function() {
    function PorkchopPlot(container, secondsPerDay) {
      var _this = this;

      this.container = container;
      this.secondsPerDay = secondsPerDay != null ? secondsPerDay : 24 * 3600;
      this.canvas = $('canvas', this.container);
      this.canvasContext = this.canvas[0].getContext('2d');
      this.progressContainer = $('.progressContainer');
      this.plotImageData = this.canvasContext.createImageData(PLOT_WIDTH, PLOT_HEIGHT);
      this.prepareCanvas();
      this.mission = null;
      this.deltaVs = null;
      this.selectedPoint = null;
      this.dragStart = null;
      this.dragTouchIdentifier = null;
      this.dragged = false;
      this.worker = new Worker("javascripts/porkchopworker.js");
      this.worker.onmessage = function(event) {
        return _this.workerMessage(event);
      };
      $('.zoomInBtn', this.container).click(function(event) {
        return _this.zoomIn();
      });
      $('.zoomOutBtn', this.container).click(function(event) {
        return _this.zoomOut();
      });
      this.canvas.mousemove(function(event) {
        var offsetX, offsetY, pointer, x, y, _ref, _ref1;

        if ((_this.deltaVs != null) && (_this.dragStart == null)) {
          offsetX = ((_ref = event.offsetX) != null ? _ref : event.pageX - _this.canvas.offset().left) | 0;
          offsetY = ((_ref1 = event.offsetY) != null ? _ref1 : event.pageY - _this.canvas.offset().top) | 0;
          x = offsetX - PLOT_X_OFFSET;
          y = offsetY;
          if (x >= 0 && x < PLOT_WIDTH && y < PLOT_HEIGHT) {
            pointer = {
              x: x,
              y: y
            };
          }
          return _this.drawPlot(pointer);
        }
      }).mouseleave(function(event) {
        if (_this.dragStart == null) {
          return _this.drawPlot();
        }
      }).mousedown(function(event) {
        console.log("Mousedown", event);
        if (event.which === 1) {
          return _this.startPanning(event.pageX, event.pageY);
        }
      }).on('touchstart', function(event) {
        var touch;

        if (event.originalEvent.touches.length === 1) {
          touch = event.originalEvent.touches[0];
          return _this.startPanning(touch.pageX, touch.pageY, touch.identifier);
        }
      });
      $(document).on('mousemove', function(event) {
        if (_this.dragStart != null) {
          return _this.panTo(event.pageX, event.pageY);
        }
      }).on('touchmove', function(event) {
        var touch, _len, _n, _ref, _results;

        if (_this.dragStart != null) {
          _ref = event.originalEvent.changedTouches;
          _results = [];
          for (_n = 0, _len = _ref.length; _n < _len; _n++) {
            touch = _ref[_n];
            if (!(touch.identifier === _this.dragTouchIdentifier)) {
              continue;
            }
            event.preventDefault();
            _results.push(_this.panTo(touch.pageX, touch.pageY));
          }
          return _results;
        }
      }).on('mouseup', function(event) {
        if (event.which === 1 && (_this.dragStart != null)) {
          return _this.stopPanning(event.pageX, event.pageY, true);
        }
      }).on('touchcancel touchend', function(event) {
        var touch, _len, _n, _ref, _results;

        if (_this.dragStart != null) {
          _ref = event.originalEvent.changedTouches;
          _results = [];
          for (_n = 0, _len = _ref.length; _n < _len; _n++) {
            touch = _ref[_n];
            if (!(touch.identifier === _this.dragTouchIdentifier)) {
              continue;
            }
            event.preventDefault();
            _results.push(_this.stopPanning(touch.pageX, touch.pageY, false));
          }
          return _results;
        }
      });
    }

    PorkchopPlot.prototype.calculate = function(mission, erase) {
      var ctx, _n, _o;

      this.mission = mission;
      if (erase == null) {
        erase = false;
      }
      this.mission.xResolution = this.mission.xScale / PLOT_WIDTH;
      this.mission.yResolution = this.mission.yScale / PLOT_WIDTH;
      ctx = this.canvasContext;
      if (erase) {
        ctx.clearRect(PLOT_X_OFFSET, 0, PLOT_WIDTH, PLOT_HEIGHT);
      }
      ctx.clearRect(PLOT_X_OFFSET + PLOT_WIDTH + 85, 0, 95, PLOT_HEIGHT + 10);
      ctx.clearRect(20, 0, PLOT_X_OFFSET - TIC_LENGTH - 21, PLOT_HEIGHT + TIC_LENGTH);
      ctx.clearRect(PLOT_X_OFFSET - 40, PLOT_HEIGHT + TIC_LENGTH, PLOT_WIDTH + 80, 20);
      ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (i = _n = 0; 0.25 > 0 ? _n <= 1.0 : _n >= 1.0; i = _n += 0.25) {
        if (i === 1.0) {
          ctx.textBaseline = 'top';
        }
        ctx.fillText(((this.mission.shortestTimeOfFlight + i * this.mission.yScale) / this.secondsPerDay) | 0, PLOT_X_OFFSET - TIC_LENGTH - 3, (1.0 - i) * PLOT_HEIGHT);
      }
      ctx.textAlign = 'center';
      for (i = _o = 0; 0.25 > 0 ? _o <= 1.0 : _o >= 1.0; i = _o += 0.25) {
        ctx.fillText(((this.mission.earliestDeparture + i * this.mission.xScale) / this.secondsPerDay) | 0, PLOT_X_OFFSET + i * PLOT_WIDTH, PLOT_HEIGHT + TIC_LENGTH + 3);
      }
      this.deltaVs = null;
      return this.worker.postMessage(this.mission);
    };

    PorkchopPlot.prototype.zoomIn = function() {
      var xCenter, yCenter;

      xCenter = this.mission.earliestDeparture + this.selectedPoint.x * this.mission.xResolution;
      yCenter = this.mission.shortestTimeOfFlight + ((PLOT_HEIGHT - 1) - this.selectedPoint.y) * this.mission.yResolution;
      this.mission.xScale /= Math.sqrt(2);
      this.mission.yScale /= Math.sqrt(2);
      this.mission.earliestDeparture = Math.max(xCenter - this.mission.xScale / 2, 0);
      this.mission.shortestTimeOfFlight = Math.max(yCenter - this.mission.yScale / 2, 1);
      return this.calculate(this.mission);
    };

    PorkchopPlot.prototype.zoomOut = function() {
      var earliestDeparture, shortestTimeOfFlight, xCenter, yCenter;

      xCenter = this.mission.earliestDeparture + this.selectedPoint.x * this.mission.xResolution;
      yCenter = this.mission.shortestTimeOfFlight + ((PLOT_HEIGHT - 1) - this.selectedPoint.y) * this.mission.yResolution;
      this.mission.xScale *= Math.sqrt(2);
      this.mission.yScale *= Math.sqrt(2);
      earliestDeparture = Math.max(xCenter - this.mission.xScale / 2, 0);
      shortestTimeOfFlight = Math.max(yCenter - this.mission.yScale / 2, 1);
      return this.calculate(this.mission);
    };

    PorkchopPlot.prototype.workerMessage = function(event) {
      var color, colorIndex, j, logDeltaV, logMaxDeltaV, logMinDeltaV, mean, relativeDeltaV, stddev, x, y, _n, _o;

      if ('log' in event.data) {
        return console.log.apply(console, event.data.log);
      } else if ('progress' in event.data) {
        return this.progressContainer.show().find('.progress-bar').width((event.data.progress * 100 | 0) + "%");
      } else if ('deltaVs' in event.data) {
        this.progressContainer.hide().find('.progress-bar').width("0%");
        this.deltaVs = event.data.deltaVs;
        if (this.deltaVs instanceof ArrayBuffer) {
          this.deltaVs = new Float64Array(this.deltaVs);
        }
        logMinDeltaV = Math.log(event.data.minDeltaV);
        mean = event.data.sumLogDeltaV / event.data.deltaVCount;
        stddev = Math.sqrt(event.data.sumSqLogDeltaV / event.data.deltaVCount - mean * mean);
        logMaxDeltaV = Math.min(Math.log(event.data.maxDeltaV), mean + 2 * stddev);
        i = 0;
        j = 0;
        for (y = _n = 0; 0 <= PLOT_HEIGHT ? _n < PLOT_HEIGHT : _n > PLOT_HEIGHT; y = 0 <= PLOT_HEIGHT ? ++_n : --_n) {
          for (x = _o = 0; 0 <= PLOT_WIDTH ? _o < PLOT_WIDTH : _o > PLOT_WIDTH; x = 0 <= PLOT_WIDTH ? ++_o : --_o) {
            logDeltaV = Math.log(this.deltaVs[i++]);
            if (isNaN(logDeltaV)) {
              color = [255, 255, 255];
            } else {
              relativeDeltaV = isNaN(logDeltaV) ? 1.0 : (logDeltaV - logMinDeltaV) / (logMaxDeltaV - logMinDeltaV);
              colorIndex = Math.min(relativeDeltaV * PALETTE.length | 0, PALETTE.length - 1);
              color = PALETTE[colorIndex];
            }
            this.plotImageData.data[j++] = color[0];
            this.plotImageData.data[j++] = color[1];
            this.plotImageData.data[j++] = color[2];
            this.plotImageData.data[j++] = 255;
          }
        }
        this.drawDeltaVScale(logMinDeltaV, logMaxDeltaV);
        this.selectedPoint = event.data.minDeltaVPoint;
        this.drawPlot();
        return $(this).trigger("plotComplete");
      }
    };

    PorkchopPlot.prototype.prepareCanvas = function() {
      var ctx, j, paletteKey, x, y, _n, _o, _p, _q;

      ctx = this.canvasContext;
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(PLOT_X_OFFSET - 1, 0);
      ctx.lineTo(PLOT_X_OFFSET - 1, PLOT_HEIGHT + 1);
      ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, PLOT_HEIGHT + 1);
      ctx.stroke();
      ctx.beginPath();
      for (i = _n = 0; 0.25 > 0 ? _n <= 1.0 : _n >= 1.0; i = _n += 0.25) {
        y = PLOT_HEIGHT * i + 1;
        ctx.moveTo(PLOT_X_OFFSET - 1, y);
        ctx.lineTo(PLOT_X_OFFSET - 1 - TIC_LENGTH, y);
        x = PLOT_X_OFFSET - 1 + PLOT_WIDTH * i;
        ctx.moveTo(x, PLOT_HEIGHT + 1);
        ctx.lineTo(x, PLOT_HEIGHT + 1 + TIC_LENGTH);
      }
      ctx.stroke();
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (i = _o = 0; 0.05 > 0 ? _o <= 1.0 : _o >= 1.0; i = _o += 0.05) {
        if (i % 0.25 === 0) {
          continue;
        }
        y = PLOT_HEIGHT * i + 1;
        ctx.moveTo(PLOT_X_OFFSET - 1, y);
        ctx.lineTo(PLOT_X_OFFSET - 1 - TIC_LENGTH, y);
        x = PLOT_X_OFFSET - 1 + PLOT_WIDTH * i;
        ctx.moveTo(x, PLOT_HEIGHT + 1);
        ctx.lineTo(x, PLOT_HEIGHT + 1 + TIC_LENGTH);
      }
      ctx.stroke();
      ctx.font = 'italic 12pt "Helvetic Neue",Helvetica,Arial,sans serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'black';
      ctx.fillText("Departure Date (days from epoch)", PLOT_X_OFFSET + PLOT_WIDTH / 2, PLOT_HEIGHT + 40);
      ctx.save();
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'top';
      ctx.fillText("Time of Flight (days)", -PLOT_HEIGHT / 2, 0);
      ctx.restore();
      paletteKey = ctx.createImageData(20, PLOT_HEIGHT);
      i = 0;
      for (y = _p = 0; 0 <= PLOT_HEIGHT ? _p < PLOT_HEIGHT : _p > PLOT_HEIGHT; y = 0 <= PLOT_HEIGHT ? ++_p : --_p) {
        j = ((PLOT_HEIGHT - y - 1) * PALETTE.length / PLOT_HEIGHT) | 0;
        for (x = _q = 0; _q < 20; x = ++_q) {
          paletteKey.data[i++] = PALETTE[j][0];
          paletteKey.data[i++] = PALETTE[j][1];
          paletteKey.data[i++] = PALETTE[j][2];
          paletteKey.data[i++] = 255;
        }
      }
      ctx.putImageData(paletteKey, PLOT_X_OFFSET + PLOT_WIDTH + 60, 0);
      ctx.fillText(String.fromCharCode(0x2206) + "v", PLOT_X_OFFSET + PLOT_WIDTH + 45, PLOT_HEIGHT / 2);
      return ctx.restore();
    };

    PorkchopPlot.prototype.drawDeltaVScale = function(logMinDeltaV, logMaxDeltaV) {
      var ctx, deltaV, _n;

      ctx = this.canvasContext;
      ctx.save();
      ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'alphabetic';
      for (i = _n = 0; 0.25 > 0 ? _n < 1.0 : _n > 1.0; i = _n += 0.25) {
        deltaV = Math.exp(i * (logMaxDeltaV - logMinDeltaV) + logMinDeltaV);
        if (deltaV.toFixed().length > 6) {
          deltaV = deltaV.toExponential(3);
        } else {
          deltaV = deltaV.toFixed();
        }
        ctx.fillText(deltaV + " m/s", PLOT_X_OFFSET + PLOT_WIDTH + 85, (1.0 - i) * PLOT_HEIGHT);
        ctx.textBaseline = 'middle';
      }
      ctx.textBaseline = 'top';
      deltaV = Math.exp(logMaxDeltaV);
      if (deltaV.toFixed().length > 6) {
        deltaV = deltaV.toExponential(3);
      } else {
        deltaV = deltaV.toFixed();
      }
      ctx.fillText(deltaV + " m/s", PLOT_X_OFFSET + PLOT_WIDTH + 85, 0);
      return ctx.restore();
    };

    PorkchopPlot.prototype.drawPlot = function(pointer) {
      var ctx, deltaV, tip, x, y;

      if (this.deltaVs != null) {
        ctx = this.canvasContext;
        ctx.save();
        ctx.putImageData(this.plotImageData, PLOT_X_OFFSET, 0);
        ctx.lineWidth = 1;
        if (this.selectedPoint != null) {
          x = this.selectedPoint.x;
          y = this.selectedPoint.y;
          ctx.beginPath();
          if ((pointer != null ? pointer.x : void 0) !== x) {
            ctx.moveTo(PLOT_X_OFFSET + x, 0);
            ctx.lineTo(PLOT_X_OFFSET + x, PLOT_HEIGHT);
          }
          if ((pointer != null ? pointer.y : void 0) !== y) {
            ctx.moveTo(PLOT_X_OFFSET, y);
            ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, y);
          }
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.stroke();
        }
        if (pointer != null) {
          x = pointer.x;
          y = pointer.y;
          ctx.beginPath();
          ctx.moveTo(PLOT_X_OFFSET + x, 0);
          ctx.lineTo(PLOT_X_OFFSET + x, PLOT_HEIGHT);
          ctx.moveTo(PLOT_X_OFFSET, y);
          ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, y);
          ctx.strokeStyle = 'rgba(255,255,255,0.75)';
          ctx.stroke();
          deltaV = this.deltaVs[(y * PLOT_WIDTH + x) | 0];
          if (!isNaN(deltaV)) {
            tip = " " + String.fromCharCode(0x2206) + "v = " + deltaV.toFixed() + " m/s ";
            ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
            ctx.fillStyle = 'black';
            ctx.textAlign = x < PLOT_WIDTH / 2 ? 'left' : 'right';
            ctx.textBaseline = y > 15 ? 'bottom' : 'top';
            ctx.fillText(tip, x + PLOT_X_OFFSET, y);
          }
        }
        return ctx.restore();
      }
    };

    PorkchopPlot.prototype.startPanning = function(pageX, pageY, touchIdentifier) {
      var offsetX, offsetY;

      if (touchIdentifier == null) {
        touchIdentifier = null;
      }
      if (this.deltaVs != null) {
        offsetX = (pageX - this.canvas.offset().left) | 0;
        offsetY = (pageY - this.canvas.offset().top) | 0;
        if (offsetX >= PLOT_X_OFFSET && offsetX < (PLOT_X_OFFSET + PLOT_WIDTH) && offsetY < PLOT_HEIGHT) {
          event.preventDefault();
          this.dragTouchIdentifier = touchIdentifier;
          return this.dragStart = {
            x: pageX,
            y: pageY
          };
        }
      }
    };

    PorkchopPlot.prototype.panTo = function(pageX, pageY) {
      var ctx, deltaX, deltaY, dirtyHeight, dirtyWidth, dirtyX, dirtyY;

      this.dragged = true;
      ctx = this.canvasContext;
      ctx.clearRect(PLOT_X_OFFSET, 0, PLOT_WIDTH, PLOT_HEIGHT);
      deltaX = pageX - this.dragStart.x;
      if (deltaX > this.mission.earliestDeparture / this.mission.xResolution) {
        deltaX = this.mission.earliestDeparture / this.mission.xResolution;
        this.dragStart.x = pageX - deltaX;
      }
      deltaY = pageY - this.dragStart.y;
      if (deltaY < (1 - this.mission.shortestTimeOfFlight) / this.mission.yResolution) {
        deltaY = (1 - this.mission.shortestTimeOfFlight) / this.mission.yResolution;
        this.dragStart.y = pageY - deltaY;
      }
      dirtyX = Math.max(-deltaX, 0);
      dirtyY = Math.max(-deltaY, 0);
      dirtyWidth = PLOT_WIDTH - Math.abs(deltaX);
      dirtyHeight = PLOT_HEIGHT - Math.abs(deltaY);
      return ctx.putImageData(this.plotImageData, PLOT_X_OFFSET + deltaX, deltaY, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    };

    PorkchopPlot.prototype.stopPanning = function(pageX, pageY, showPointer) {
      var deltaX, deltaY, offsetX, offsetY, x, y;

      this.canvas.removeClass('grabbing');
      if (this.dragged) {
        if (this.dragStart.x !== pageX || this.dragStart.y !== pageY) {
          deltaX = pageX - this.dragStart.x;
          deltaY = pageY - this.dragStart.y;
          this.mission.earliestDeparture = Math.max(this.mission.earliestDeparture - deltaX * this.mission.xResolution, 0);
          this.mission.shortestTimeOfFlight = Math.max(this.mission.shortestTimeOfFlight + deltaY * this.mission.yResolution, 1);
          this.calculate(this.mission);
        } else {
          this.drawPlot();
        }
      } else {
        offsetX = (pageX - this.canvas.offset().left) | 0;
        offsetY = (pageY - this.canvas.offset().top) | 0;
        x = offsetX - PLOT_X_OFFSET;
        y = offsetY;
        if (x >= 0 && x < PLOT_WIDTH && y < PLOT_HEIGHT && !isNaN(this.deltaVs[(y * PLOT_WIDTH + x) | 0])) {
          this.selectedPoint = {
            x: x,
            y: y
          };
          this.drawPlot(showPointer ? this.selectedPoint : void 0);
          $(this).trigger('click', this.selectedPoint);
        }
      }
      this.dragStart = null;
      this.dragTouchIdentifier = null;
      return this.dragged = false;
    };

    return PorkchopPlot;

  })();

  (typeof exports !== "undefined" && exports !== null ? exports : this).PorkchopPlot = PorkchopPlot;

}).call(this);
