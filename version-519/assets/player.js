(function () {
  function initFrame(frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.player-overlay');
    var url = frame.getAttribute('data-play');
    var attached = false;

    function attach() {
      if (attached || !video || !url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(url);
        hls.attachMedia(video);
        frame.hlsInstance = hls;
      } else {
        video.src = url;
      }
      attached = true;
    }

    function play() {
      attach();
      if (button) {
        button.classList.add('is-hidden');
      }
      if (video) {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  }

  document.querySelectorAll('.player-frame').forEach(initFrame);
})();
