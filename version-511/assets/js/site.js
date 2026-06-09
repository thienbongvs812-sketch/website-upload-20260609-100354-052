(function() {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-root]').forEach(function(root) {
    var input = root.querySelector('.js-search');
    var sort = root.querySelector('.js-sort');
    var grid = root.querySelector('.movie-grid');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    }

    function applySort() {
      if (!grid || !sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards.slice().sort(function(a, b) {
        if (value === 'year-asc') {
          return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
        }
        if (value === 'hot-desc') {
          return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
        }
        if (value === 'title-asc') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });
      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (sort) {
      sort.addEventListener('change', applySort);
      applySort();
    }
  });
})();
