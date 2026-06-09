(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var layer = shell.querySelector('[data-play-layer]');
    var trigger = shell.querySelector('[data-play-trigger]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var loaded = false;
    var hls = null;

    function loadStream() {
      if (!video || loaded || !stream) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        shell.hlsInstance = hls;
        return;
      }

      video.src = stream;
    }

    function play() {
      loadStream();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (layer) {
      layer.addEventListener('click', function () {
        play();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          play();
        }
      });
    }
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  });
})();
