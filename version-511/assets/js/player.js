import { H as Hls } from './hls-vendor-dru42stk.js';

var panels = document.querySelectorAll('.video-panel');

panels.forEach(function(panel) {
  var video = panel.querySelector('video[data-hls]');
  var button = panel.querySelector('.player-start');
  var address = video ? video.getAttribute('data-hls') : '';
  var ready = false;
  var hls = null;

  function attach() {
    if (!video || !address || ready) {
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(address);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function() {});
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
      });
    } else {
      video.src = address;
    }

    ready = true;
  }

  function play() {
    attach();
    panel.classList.add('is-playing');
    if (video) {
      video.play().catch(function() {});
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function() {
      if (!ready) {
        play();
      }
    });
  }

  window.addEventListener('pagehide', function() {
    if (hls) {
      hls.destroy();
    }
  });
});
