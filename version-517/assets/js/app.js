(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      target.classList.add('is-hidden');
    }
  }, true);

  var toggle = qs('.menu-toggle');
  var mobileNav = qs('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = qsa('.hero-slide');
  var dots = qsa('.hero-dot');
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  function initVideoPlayer(player) {
    var video = qs('video', player);
    var button = qs('.play-overlay', player);
    var url = player.getAttribute('data-play');
    var ready = false;
    var hlsInstance = null;
    var start = function () {
      if (!video || !url) {
        return;
      }
      player.classList.add('is-playing');
      if (!ready) {
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    player.addEventListener('click', function (event) {
      if (event.target === video && ready) {
        return;
      }
      if (!ready) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  qsa('.video-player').forEach(initVideoPlayer);

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="search-card" href="' + escapeHtml(item.url) + '">' +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<p>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="tag-list">' + tags + '</div>' +
      '</a>';
  }

  var searchForm = qs('#search-page-form');
  var searchInput = qs('#search-page-input');
  var resultBox = qs('#search-results');
  var resultTitle = qs('#search-result-title');
  if (searchForm && searchInput && resultBox && typeof siteSearchData !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    var render = function (query) {
      var normalized = String(query || '').trim().toLowerCase();
      var list = siteSearchData.filter(function (item) {
        if (!normalized) {
          return item.hot;
        }
        return item.searchText.indexOf(normalized) !== -1;
      }).slice(0, normalized ? 80 : 48);
      if (resultTitle) {
        resultTitle.textContent = normalized ? '搜索结果' : '热门推荐';
      }
      resultBox.innerHTML = list.length ? list.map(movieCard).join('') : '<div class="search-card"><h3>暂无匹配影片</h3><p>可以尝试输入影片名、题材、地区或年份。</p></div>';
    };
    render(initial);
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render(query);
    });
  }
})();
