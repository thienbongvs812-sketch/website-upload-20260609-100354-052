import { H as Hls } from "./hls-vendor-dru42stk.js";

export function setupMoviePlayer(source) {
    const shell = document.querySelector("[data-player-shell]");
    const video = document.querySelector("[data-player-video]");
    const startButton = document.querySelector("[data-player-start]");

    if (!shell || !video || !startButton || !source) {
        return;
    }

    let attached = false;

    const attachSource = function () {
        if (attached) {
            return;
        }

        attached = true;
        video.controls = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };

    const startPlayback = function () {
        attachSource();
        shell.classList.add("is-playing");
        startButton.setAttribute("hidden", "hidden");
        const playResult = video.play();

        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {
                startButton.removeAttribute("hidden");
                shell.classList.remove("is-playing");
            });
        }
    };

    startButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
    });

    shell.addEventListener("click", function () {
        if (!attached) {
            startPlayback();
        }
    });
}
