(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    var button = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 18) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (button && mobileNav && header) {
      button.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
        header.classList.toggle("menu-open");
      });
    }
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a href=\"./" + escapeHtml(movie.url) + "\">" +
      "<div class=\"card-cover\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">" +
      "<div class=\"card-shadow\"></div>" +
      "<span class=\"play-badge\" aria-hidden=\"true\"></span>" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year || "") + "</span>" +
      "</div>" +
      "<div class=\"card-body\">" +
      "<h3>" + escapeHtml(movie.title) + "</h3>" +
      "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var movies = window.SITE_MOVIES || [];

    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var categorySelect = form.querySelector("[data-category-select]");
      var panel = document.querySelector("[data-search-panel]");
      var results = document.querySelector("[data-search-results]");

      function runSearch() {
        if (!results) {
          return;
        }

        var query = input ? input.value.trim().toLowerCase() : "";
        var category = categorySelect ? categorySelect.value : "";
        var matched = movies.filter(function (movie) {
          var text = String(movie.search || "").toLowerCase();
          var categoryOk = !category || movie.category === category;
          var queryOk = !query || text.indexOf(query) !== -1;
          return categoryOk && queryOk;
        }).slice(0, 48);

        if (panel) {
          panel.hidden = false;
        }

        if (!matched.length) {
          results.innerHTML = "<div class=\"no-results\">没有找到相关影片</div>";
          return;
        }

        results.innerHTML = matched.map(movieCard).join("");
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch();
      });

      if (input) {
        input.addEventListener("input", function () {
          if (input.value.trim().length > 0 || categorySelect && categorySelect.value) {
            runSearch();
          }
        });
      }

      if (categorySelect) {
        categorySelect.addEventListener("change", runSearch);
        if (form.closest(".always-open")) {
          runSearch();
        }
      }
    });
  }

  function initPageFilter() {
    var input = document.querySelector("[data-page-filter-input]");
    var yearSelect = document.querySelector("[data-page-year-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-page-grid] .movie-card"));

    if (!cards.length) {
      return;
    }

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var text = String(card.getAttribute("data-title") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var visible = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year);
        card.style.display = visible ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", filterCards);
    }
  }

  window.startMoviePlayer = function (videoId, overlayId, buttonId, stream) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function playVideo() {
      attachStream();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        playVideo();
      });
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initHeader();
    initHero();
    initSearch();
    initPageFilter();
  });
})();
