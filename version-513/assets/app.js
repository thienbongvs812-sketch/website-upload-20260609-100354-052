(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    qsa('[data-filter-bar]').forEach(function (bar) {
      var panel = bar.closest('.content-panel') || document;
      var cards = qsa('.movie-card', panel);
      qsa('[data-filter]', bar).forEach(function (button) {
        button.addEventListener('click', function () {
          var filter = button.getAttribute('data-filter') || 'all';
          qsa('[data-filter]', bar).forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          cards.forEach(function (card) {
            var haystack = [
              card.getAttribute('data-title'),
              card.getAttribute('data-region'),
              card.getAttribute('data-type'),
              card.getAttribute('data-year'),
              card.getAttribute('data-tags')
            ].join(' ');
            var match = filter === 'all' || haystack.indexOf(filter) !== -1;
            card.classList.toggle('hidden-card', !match);
          });
        });
      });
    });
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function movieCard(movie) {
    var safeTitle = escapeHtml(movie.title);
    var meta = escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year);
    var line = escapeHtml(movie.one_line || '精彩影片，欢迎观看。');
    return '' +
      '<article class="movie-card">' +
        '<a class="movie-poster" href="' + movie.url + '" aria-label="观看 ' + safeTitle + '">' +
          '<img src="' + movie.cover + '" alt="' + safeTitle + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
          '<span class="play-badge">▶</span>' +
        '</a>' +
        '<div class="movie-info">' +
          '<h3><a href="' + movie.url + '">' + safeTitle + '</a></h3>' +
          '<p class="movie-meta">' + meta + '</p>' +
          '<p class="movie-line">' + line + '</p>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var page = qs('[data-search-page]');
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var input = qs('[data-search-input]', page);
    var resultBox = qs('[data-search-results]', page);
    var title = qs('[data-search-title]', page);
    var desc = qs('[data-search-desc]', page);
    var query = readQuery();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line]
        .join(' ')
        .toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    if (title) {
      title.textContent = '搜索结果';
    }
    if (desc) {
      desc.textContent = results.length ? '已为你匹配相关影片。' : '没有找到完全匹配的影片，可以尝试更短的关键词。';
    }
    if (resultBox) {
      resultBox.innerHTML = results.map(movieCard).join('');
    }
  }

  function initActionButtons() {
    qsa('[data-like-button], [data-favorite-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        button.classList.toggle('active');
      });
    });
    qsa('[data-share-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (navigator.share) {
          navigator.share({ title: document.title, url: window.location.href }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(function () {
            button.textContent = '已复制';
            window.setTimeout(function () {
              button.textContent = '分享';
            }, 1600);
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initActionButtons();
  });
})();
