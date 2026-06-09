(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function textOf(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (navButton && mobilePanel) {
      navButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      }

      function start() {
        if (timer || slides.length < 2) {
          return;
        }
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function reset() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        start();
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          reset();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          reset();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          reset();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll('[data-search-area]').forEach(function (area) {
      var input = area.querySelector('[data-search-input]');
      var cards = Array.prototype.slice.call(area.querySelectorAll('[data-search-card]'));
      var empty = area.querySelector('[data-empty-state]');
      var chips = Array.prototype.slice.call(area.querySelectorAll('[data-filter-value]'));
      var currentFilter = 'all';

      function apply() {
        var query = textOf(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = textOf(card.getAttribute('data-search-text'));
          var category = card.getAttribute('data-card-category') || '';
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedFilter = currentFilter === 'all' || category === currentFilter;
          var showCard = matchedQuery && matchedFilter;

          card.style.display = showCard ? '' : 'none';
          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          currentFilter = chip.getAttribute('data-filter-value') || 'all';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });

      apply();
    });
  });
})();
