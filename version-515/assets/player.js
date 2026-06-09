import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(stage) {
    var video = stage.querySelector('video');
    var button = stage.querySelector('[data-play-button]');
    var message = stage.querySelector('[data-player-message]');
    var source = stage.getAttribute('data-src');
    var hls = null;
    var initialized = false;

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function initialize() {
        if (!video || !source) {
            setMessage('播放源暂不可用。');
            return;
        }

        if (!initialized) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放遇到网络或媒体错误，请刷新后重试。');
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    }
                });
            } else {
                setMessage('当前浏览器不支持 HLS 播放。');
                return;
            }
            initialized = true;
        }

        stage.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setMessage('浏览器阻止了自动播放，请再次点击播放器。');
                stage.classList.remove('is-playing');
            });
        }
    }

    if (button) {
        button.addEventListener('click', initialize);
    }

    stage.addEventListener('click', function (event) {
        if (event.target === stage) {
            initialize();
        }
    });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
