(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BamiosAudioPlayer = factory());
})(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var Bamios = /*#__PURE__*/function () {
    function Bamios(el, options) {
      _classCallCheck(this, Bamios);
      var opts = options || {};
      this.player = typeof el === 'string' ? document.querySelector(el) : undefined;
      if (undefined === this.player || null === this.player) throw 'Cannot determine player element!';
      this.audio = typeof el === 'string' ? document.querySelector(el + ' audio') : undefined;
      if (undefined === this.audio || null === this.audio) throw 'Cannot determine audio element!';
      this.stopOthersOnPlay = undefined !== opts.stopOthersOnPlay ? opts.stopOthersOnPlay : true;
      this.muted = false;
      this.isAdjustingTime = false;
      this.isClickedPlayBtn = false;
      this.initUi();
      this.initEvents();
    }
    _createClass(Bamios, [{
      key: "initUi",
      value: function initUi() {
        var _this = this;
        this.player.classList.add('bamios');

        // Volume control
        this.volumeCtl = document.createElement('div');
        this.volumeCtl.classList.add('bamios-volume-ctl');

        // Volume panel container
        this.volumePanelContainer = document.createElement('div');
        this.volumePanelContainer.classList.add('bamios-volume-panel-container');
        this.volumeCtl.append(this.volumePanelContainer);

        // Volume handle
        this.volumeHandle = document.createElement('div');
        this.volumeHandle.classList.add('bamios-volume-handle');
        this.volumePanelContainer.append(this.volumeHandle);

        // Volume panel
        this.volumePanel = document.createElement('div');
        this.volumePanel.classList.add('bamios-volume-panel');
        this.volumePanelContainer.append(this.volumePanel);

        // Volume slider
        this.volumeSlider = document.createElement('div');
        this.volumeSlider.classList.add('bamios-volume-slider');
        this.volumePanel.append(this.volumeSlider);

        // Volume button
        this.volumeBtn = document.createElement('button');
        this.volumeBtn.classList.add('bamios-btn');
        this.volumeBtn.classList.add('bamios-btn-volume');
        this.volumeBtn.innerHTML = Bamios.volumeIcon();
        this.volumeCtl.append(this.volumeBtn);

        // Controls left
        var controlsLeft = document.createElement('div');
        controlsLeft.classList.add('bamios-left-controls');

        // Replay button
        this.replayBtn = document.createElement('button');
        this.replayBtn.setAttribute('type', 'button');
        this.replayBtn.setAttribute('title', 'Replay');
        this.replayBtn.classList.add('bamios-btn');
        this.replayBtn.classList.add('bamios-btn-replay');
        this.replayBtn.innerHTML = Bamios.replayIcon();
        controlsLeft.append(this.replayBtn);

        // Play button
        var playBtn = document.createElement('button');
        playBtn.classList.add('bamios-btn');
        playBtn.classList.add('bamios-btn-play-pause');
        playBtn.addEventListener('click', function (playBtnEvent) {
          if (!playBtnEvent.currentTarget.classList.contains('bamios-playing') && _this.stopOthersOnPlay) {
            Bamios.pauseOtherPlayers();
          }
          if (!playBtnEvent.currentTarget.classList.contains('bamios-playing')) {
            _this.isClickedPlayBtn = true;
            Bamios.playPlayer(_this.player);
          } else {
            _this.isClickedPlayBtn = false;
            Bamios.pausePlayer(_this.player);
          }
        });
        playBtn.innerHTML = Bamios.playIcon();
        controlsLeft.append(playBtn);

        // Forward button
        var forwardBtn = document.createElement('button');
        forwardBtn.classList.add('bamios-btn');
        forwardBtn.classList.add('bamios-btn-forward');
        forwardBtn.addEventListener('click', function () {
          _this.audio.currentTime = _this.audio.currentTime + 10;
        });
        forwardBtn.innerHTML = Bamios.forwardIcon();
        controlsLeft.append(forwardBtn);
        this.player.append(controlsLeft);

        // Controls right
        this.controlsRight = document.createElement('div');
        this.controlsRight.classList.add('bamios-right-controls');

        // Current time
        var currentTime = document.createElement('div');
        currentTime.classList.add('bamios-current-time');
        currentTime.innerText = '00:00';
        this.controlsRight.append(currentTime);
        this.audio.ontimeupdate = function () {
          currentTime.innerHTML = Bamios.toTimeString(_this.audio.currentTime);
          var currentPercent = _this.audio.currentTime / _this.audio.duration * 100 + '%';
          playProgress.style.width = currentPercent;
          if (!mouseClickedDurationBar) {
            progressHandle.style.transform = 'translate(' + (playProgress.getBoundingClientRect().width - 8) + 'px, -50%)';
          }
        };
        this.audio.onended = function () {
          _this.stop();
        };

        // Duration bar
        var durationBar = document.createElement('div');
        durationBar.classList.add('bamios-progress-bar');
        var mouseClickedDurationBar = false;
        var mouseEnteredDurationBar = false;
        durationBar.addEventListener('mousedown', function (durationBarEvent) {
          mouseClickedDurationBar = true;
          _this.isAdjustingTime = true;
          _this.pause();
          var offsetX = durationBarEvent.clientX - durationBar.getBoundingClientRect().left;
          if (offsetX >= 0 && offsetX <= durationBar.getBoundingClientRect().width) {
            var second = offsetX / durationBar.getBoundingClientRect().width * _this.audio.duration;
            _this.setCurrentTime(second);
            progressHandle.style.transform = 'translate(' + (offsetX - 8) + 'px, -50%)';
          }
        });
        window.addEventListener('mouseup', function () {
          mouseClickedDurationBar = false;
          if (_this.isAdjustingTime) {
            _this.isAdjustingTime = false;
            if (_this.stopOthersOnPlay && _this.isClickedPlayBtn) {
              Bamios.pauseOtherPlayers();
              _this.play();
            }
          }
          if (!mouseEnteredDurationBar) {
            progressHandle.style.transition = 'opacity 0.6s ease-in-out';
            progressHandle.style.opacity = 0;
          }
          if (!_this.muted) {
            _this.audio.muted = false;
          }
        });
        durationBar.addEventListener('mouseenter', function () {
          mouseEnteredDurationBar = true;
          progressHandle.style.display = 'block';
          progressHandle.style.transition = 'opacity 0.15s ease-in-out';
          progressHandle.style.opacity = 1;
        });
        durationBar.addEventListener('mouseleave', function () {
          mouseEnteredDurationBar = false;
          if (!mouseClickedDurationBar) {
            progressHandle.style.display = 'none';
            progressHandle.style.transition = 'opacity 0.6s ease-in-out';
            progressHandle.style.opacity = 0;
          }
        });
        window.addEventListener('mousemove', function (durationBarEvent) {
          if (mouseClickedDurationBar) {
            _this.audio.muted = true;
            var offsetX = durationBarEvent.clientX - durationBar.getBoundingClientRect().left;
            var second = offsetX / durationBar.getBoundingClientRect().width * _this.audio.duration;
            if (offsetX >= 0 && offsetX <= durationBar.getBoundingClientRect().width) {
              progressHandle.style.transform = 'translate(' + (offsetX - 8) + 'px, -50%)';
              _this.setCurrentTime(second);
            }
          }
        });

        // Progress
        this.progress = document.createElement('div');
        this.progress.classList.add('bamios-progress-list');
        var playProgress = document.createElement('div');
        playProgress.classList.add('bamios-play-progress');
        this.progress.append(playProgress);

        // Progress handle
        var progressHandle = document.createElement('div');
        progressHandle.classList.add('bamios-progress-handle');
        durationBar.append(progressHandle);
        durationBar.append(this.progress);

        // Add duration bar
        this.controlsRight.append(durationBar);

        // Duration
        this.duration = document.createElement('div');
        this.duration.classList.add('bamios-duration');
        this.duration.innerText = '00:00';
        this.controlsRight.append(this.duration);

        // Volume control
        this.controlsRight.append(this.volumeCtl);
        this.volumeSlider.style.width = '100%';
        this.audio.onloadedmetadata = function () {
          _this.duration.innerText = Bamios.toTimeString(_this.audio.duration);
          _this.volumeHandle.style.transform = 'translate(' + (_this.audio.volume * 80 - 8) + 'px, -50%)';
        };
        this.player.append(this.controlsRight);
      }
    }, {
      key: "initEvents",
      value: function initEvents() {
        var _this2 = this;
        var mouseClickedVolumeWrapper = false;
        var mouseEnteredVolumeWrapper = false;
        var mouseEnteredVolumeCtl = false;
        var mouseHoverVolumeCtl = false;
        this.replayBtn.addEventListener('click', function () {
          _this2.audio.currentTime = _this2.audio.currentTime - 10;
        });
        this.volumeBtn.addEventListener('click', function (volumeBtnEvent) {
          if (_this2.audio.volume > 0) {
            if (!volumeBtnEvent.currentTarget.classList.contains('muted')) {
              volumeBtnEvent.currentTarget.classList.add('muted');
              volumeBtnEvent.currentTarget.innerHTML = Bamios.volumeOffIcon();
              _this2.volumeSlider.style.width = '0%';
              _this2.volumeHandle.style.transform = 'translate(-8px, -50%)';
              _this2.audio.muted = true;
              _this2.muted = true;
            } else {
              volumeBtnEvent.currentTarget.classList.remove('muted');
              volumeBtnEvent.currentTarget.innerHTML = Bamios.volumeIcon();
              _this2.volumeSlider.style.width = _this2.audio.volume * 100 + '%';
              _this2.volumeHandle.style.transform = 'translate(' + (_this2.audio.volume * 80 - 8) + 'px, -50%)';
              _this2.audio.muted = false;
              _this2.muted = false;
            }
          }
        });
        this.volumeCtl.addEventListener('mouseenter', function () {
          mouseHoverVolumeCtl = true;
          if (window.innerWidth > 520) {
            _this2.volumePanel.style.width = '80px';
            _this2.volumeCtl.style.paddingLeft = '15px';
            _this2.volumeCtl.style.background = 'rgba(0, 0, 0, 0.04)';
            _this2.volumePanelContainer.style.marginRight = '10px';
            _this2.volumePanel.style.opacity = 1;
            setTimeout(function () {
              if (mouseHoverVolumeCtl && !_this2.audio.muted) {
                _this2.volumeHandle.style.transform = 'translate(' + (_this2.audio.volume * 80 - 8) + 'px, -50%)';
              }
            }, 150);
          }
        });
        this.volumeCtl.addEventListener('mouseleave', function () {
          if (!mouseClickedVolumeWrapper) {
            mouseHoverVolumeCtl = false;
            _this2.volumePanel.style.width = 0;
            _this2.volumeCtl.style.paddingLeft = 0;
            _this2.volumeCtl.style.background = 'transparent';
            _this2.volumePanelContainer.style.marginRight = 0;
            _this2.volumePanel.style.opacity = 0;
            _this2.volumeHandle.style.opacity = 0;
            _this2.volumeHandle.style.display = 'none';
          }
        });
        this.volumePanelContainer.addEventListener('mousedown', function (volumePanelContainerEvent) {
          mouseClickedVolumeWrapper = true;
          var offsetX = volumePanelContainerEvent.clientX - _this2.volumePanelContainer.getBoundingClientRect().left;
          if (offsetX >= 0 && offsetX <= 80) {
            var volume = offsetX / 80;
            if (volume < 0) volume = 0;
            if (volume > 1) volume = 1;
            _this2.audio.volume = volume;
            _this2.volumeSlider.style.width = volume * 100 + '%';
            _this2.volumeHandle.style.transform = 'translate(' + (offsetX - 8) + 'px, -50%)';
            if (volume <= 0) {
              _this2.volumeBtn.innerHTML = Bamios.volumeOffIcon();
              _this2.audio.muted = true;
              _this2.muted = true;
            } else if (volume <= 0.6) {
              _this2.volumeBtn.innerHTML = Bamios.volumeLowIcon();
              _this2.audio.muted = false;
              _this2.muted = false;
            } else {
              _this2.volumeBtn.innerHTML = Bamios.volumeIcon();
              _this2.audio.muted = false;
              _this2.muted = false;
            }
          }
        });
        window.addEventListener('mouseup', function (durationBarEvent) {
          mouseClickedVolumeWrapper = false;
          if (!mouseEnteredVolumeWrapper) {
            _this2.volumeHandle.style.opacity = 0;
            _this2.volumeHandle.style.display = 'none';
          }
          if (!mouseEnteredVolumeCtl) {
            _this2.volumePanel.style.width = 0;
            _this2.volumeCtl.style.paddingLeft = 0;
            _this2.volumeCtl.style.background = 'transparent';
            _this2.volumePanelContainer.style.marginRight = 0;
            _this2.volumePanel.style.opacity = 0;
          }
        });
        window.addEventListener('mousemove', function (volumePanelContainerEvent) {
          if (mouseClickedVolumeWrapper) {
            var offsetX = volumePanelContainerEvent.clientX - _this2.volumePanelContainer.getBoundingClientRect().left;
            var volume = offsetX / 80;
            if (volume < 0) volume = 0;
            if (volume > 1) volume = 1;
            if (offsetX <= 0) {
              _this2.audio.volume = 0;
              _this2.volumeSlider.style.width = 0;
              _this2.volumeHandle.style.transform = 'translate(-8px, -50%)';
            } else if (offsetX > 0 && offsetX <= _this2.volumePanelContainer.getBoundingClientRect().width) {
              _this2.audio.volume = volume;
              _this2.volumeSlider.style.width = volume * 100 + '%';
              _this2.volumeHandle.style.transform = 'translate(' + (offsetX - 8) + 'px, -50%)';
            } else {
              _this2.audio.volume = 1;
              _this2.volumeSlider.style.width = '100%';
              _this2.volumeHandle.style.transform = 'translate(' + (80 - 8) + 'px, -50%)';
            }
            if (volume <= 0) {
              _this2.volumeBtn.innerHTML = Bamios.volumeOffIcon();
              _this2.audio.muted = true;
              _this2.muted = true;
            } else if (volume <= 0.5) {
              _this2.volumeBtn.innerHTML = Bamios.volumeLowIcon();
              _this2.audio.muted = false;
              _this2.muted = false;
            } else {
              _this2.volumeBtn.innerHTML = Bamios.volumeIcon();
              _this2.audio.muted = false;
              _this2.muted = false;
            }
          }
        });
        this.volumePanelContainer.addEventListener('mouseenter', function () {
          mouseEnteredVolumeWrapper = true;
          _this2.volumeHandle.style.opacity = 1;
          _this2.volumeHandle.style.display = 'block';
        });
        this.volumePanelContainer.addEventListener('mouseleave', function () {
          mouseEnteredVolumeWrapper = false;
          if (!mouseClickedVolumeWrapper) {
            _this2.volumeHandle.style.opacity = 0;
            _this2.volumeHandle.style.display = 'none';
          }
        });
        this.volumeCtl.addEventListener('mouseenter', function () {
          mouseEnteredVolumeCtl = true;
        });
        this.volumeCtl.addEventListener('mouseleave', function () {
          mouseEnteredVolumeCtl = false;
        });
      }
    }, {
      key: "setCurrentTime",
      value: function setCurrentTime(second) {
        if (second >= 0 && second <= this.audio.duration) {
          this.audio.currentTime = second;
        }
      }
    }, {
      key: "play",
      value: function play() {
        Bamios.playPlayer(this.player);
      }
    }, {
      key: "pause",
      value: function pause() {
        Bamios.pausePlayer(this.player);
      }
    }, {
      key: "stop",
      value: function stop() {
        Bamios.pausePlayer(this.player);
        this.audio.currentTime = 0;
      }
    }], [{
      key: "playIcon",
      value: function playIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.56 10.87l-6.07 3.44A1 1 0 019 15.45v-6.9a1 1 0 011.46-.86l6.07 3.44a1 1 0 01.03 1.74z"/></svg>';
      }
    }, {
      key: "pauseIcon",
      value: function pauseIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.24 13a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v6zm5.48 0a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v6z"/></svg>';
      }
    }, {
      key: "replayIcon",
      value: function replayIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M8.72 10.324l-.59.436a.55.55 0 01-.35.109c-.16 0-.3-.06-.42-.18s-.18-.264-.18-.43c0-.214.103-.387.31-.521l1.44-.96a.646.646 0 01.225-.1c.083-.018.161-.028.235-.028.193 0 .346.059.46.175.113.117.17.262.17.436v5.78a.579.579 0 01-.185.436.67.67 0 01-.475.173.635.635 0 01-.46-.175.584.584 0 01-.18-.436v-4.715zm5.219 5.426c-.572 0-1.058-.151-1.454-.455-.397-.303-.699-.727-.905-1.27s-.31-1.168-.31-1.875c0-.713.104-1.34.31-1.88s.508-.962.905-1.265c.396-.304.882-.455 1.454-.455.574 0 1.059.151 1.455.455.396.303.699.725.906 1.265.206.54.31 1.167.31 1.88 0 .707-.104 1.333-.31 1.875-.207.543-.51.967-.906 1.27-.396.304-.88.455-1.455.455zm0-1.199c.281 0 .522-.089.726-.266s.362-.443.476-.8.17-.802.17-1.335c0-.54-.057-.986-.17-1.34s-.272-.618-.476-.795-.444-.265-.726-.265a1.07 1.07 0 00-.719.266c-.207.177-.367.441-.48.795-.114.354-.17.8-.17 1.34 0 .533.056.979.17 1.335.113.356.273.623.48.8.207.176.446.265.719.265zm4.081-8.567A8.457 8.457 0 0012.011 3.5L12 3.502V2.53a.58.58 0 00-.94-.45l-2.43 2a.57.57 0 000 .92l2.43 2a.58.58 0 00.94-.53V5.5h.011c1.735 0 3.367.675 4.597 1.9a6.47 6.47 0 011.913 4.601 6.463 6.463 0 01-1.9 4.605 6.47 6.47 0 01-4.6 1.913h-.011a6.47 6.47 0 01-4.595-1.899 6.469 6.469 0 01-1.915-4.6 6.557 6.557 0 011.925-4.63 1 1 0 00-1.409-1.42A8.573 8.573 0 003.5 12.022a8.456 8.456 0 002.501 6.014 8.45 8.45 0 006.007 2.483h.015a8.452 8.452 0 006.013-2.501 8.455 8.455 0 002.484-6.021 8.45 8.45 0 00-2.5-6.013z"/></svg>';
      }
    }, {
      key: "forwardIcon",
      value: function forwardIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M8.72 10.324l-.59.436a.55.55 0 01-.35.109c-.16 0-.3-.06-.42-.18s-.18-.264-.18-.43c0-.214.103-.387.31-.521l1.44-.96a.646.646 0 01.225-.1c.083-.018.161-.028.235-.028.193 0 .346.059.46.175.113.117.17.262.17.436v5.78a.579.579 0 01-.185.436.67.67 0 01-.475.173.635.635 0 01-.46-.175.584.584 0 01-.18-.436v-4.715zm5.219 5.426c-.572 0-1.058-.151-1.454-.455-.397-.303-.699-.727-.905-1.27s-.31-1.168-.31-1.875c0-.713.104-1.34.31-1.88s.508-.962.905-1.265c.396-.304.882-.455 1.454-.455.574 0 1.059.151 1.455.455.396.303.699.725.906 1.265.206.54.31 1.167.31 1.88 0 .707-.104 1.333-.31 1.875-.207.543-.51.967-.906 1.27-.396.304-.88.455-1.455.455zm0-1.199c.281 0 .522-.089.726-.266s.362-.443.476-.8.17-.802.17-1.335c0-.54-.057-.986-.17-1.34s-.272-.618-.476-.795-.444-.265-.726-.265a1.07 1.07 0 00-.719.266c-.207.177-.367.441-.48.795-.114.354-.17.8-.17 1.34 0 .533.056.979.17 1.335.113.356.273.623.48.8.207.176.446.265.719.265zm4.045-8.58a1 1 0 10-1.408 1.419 6.548 6.548 0 011.923 4.629 6.472 6.472 0 01-1.913 4.601 6.466 6.466 0 01-4.595 1.899h-.011a6.472 6.472 0 01-4.601-1.913 6.467 6.467 0 01-1.9-4.605A6.473 6.473 0 017.393 7.4a6.465 6.465 0 014.597-1.9h.011v.97a.579.579 0 00.939.53l2.43-2a.57.57 0 000-.92l-2.43-2a.58.58 0 00-.94.45v.97h-.011A8.455 8.455 0 005.98 5.984a8.456 8.456 0 00-2.501 6.014c-.003 2.272.879 4.411 2.484 6.021s3.741 2.498 6.014 2.501h.014c2.268 0 4.4-.882 6.007-2.483a8.456 8.456 0 002.501-6.014 8.562 8.562 0 00-2.515-6.052z"/></svg>';
      }
    }, {
      key: "volumeIcon",
      value: function volumeIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M13.5 4.23v15.54a1.8 1.8 0 01-3.19 1.13l-4-4.9H4.2a1.7 1.7 0 01-1.7-1.7V9.7A1.7 1.7 0 014.2 8h2.11l4-4.9a1.8 1.8 0 013.19 1.13zm5.771 14.661c3.793-3.8 3.793-9.982-.001-13.78a.751.751 0 00-1.061 1.06c3.209 3.214 3.209 8.445-.001 11.66a.752.752 0 00.531 1.281.759.759 0 00.532-.221zm-2.121-2.12c2.627-2.631 2.627-6.911 0-9.541a.751.751 0 00-1.061 1.06 5.258 5.258 0 010 7.42.75.75 0 101.061 1.061z"/></svg>';
      }
    }, {
      key: "volumeLowIcon",
      value: function volumeLowIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M13.5 4.23v15.54a1.8 1.8 0 01-3.19 1.13l-4-4.9H4.2a1.7 1.7 0 01-1.7-1.7V9.7A1.7 1.7 0 014.2 8h2.11l4-4.9a1.8 1.8 0 013.19 1.13zm3.65 12.541c2.627-2.631 2.627-6.911 0-9.541a.751.751 0 00-1.061 1.06 5.258 5.258 0 010 7.42.75.75 0 101.061 1.061z"/></svg>';
      }
    }, {
      key: "volumeOffIcon",
      value: function volumeOffIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M13.5 4.23v15.54a1.8 1.8 0 01-3.19 1.13l-4-4.9H4.2a1.7 1.7 0 01-1.7-1.7V9.7A1.7 1.7 0 014.2 8h2.11l4-4.9a1.8 1.8 0 013.19 1.13zm8.03 10.55a.75.75 0 000-1.061l-4.5-4.5a.75.75 0 10-1.061 1.061l4.5 4.5a.748.748 0 001.061 0zm-4.5 0l4.5-4.5a.75.75 0 10-1.061-1.061l-4.5 4.5a.75.75 0 101.061 1.061z"/></svg>';
      }
    }, {
      key: "playPlayer",
      value: function playPlayer(player) {
        var playPauseButton = player.querySelector('.bamios-btn-play-pause');
        var audio = player.querySelector('audio');
        playPauseButton.classList.add('bamios-playing');
        playPauseButton.innerHTML = Bamios.pauseIcon();
        audio.play();
      }
    }, {
      key: "pausePlayer",
      value: function pausePlayer(player) {
        var playPauseButton = player.querySelector('.bamios-btn-play-pause');
        var audio = player.querySelector('audio');
        playPauseButton.classList.remove('bamios-playing');
        playPauseButton.innerHTML = Bamios.playIcon();
        audio.pause();
      }
    }, {
      key: "pauseOtherPlayers",
      value: function pauseOtherPlayers() {
        var players = document.querySelectorAll('.bamios');
        for (var i = 0; i < players.length; i++) {
          Bamios.pausePlayer(players[i]);
        }
      }
    }, {
      key: "toTimeString",
      value: function toTimeString(totalSeconds) {
        var totalMinutes = Math.floor(totalSeconds / 60);
        var seconds = Math.floor(totalSeconds % 60);
        var minutes = Math.floor(totalMinutes % 60);
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
      }
    }]);
    return Bamios;
  }();

  return Bamios;

}));
