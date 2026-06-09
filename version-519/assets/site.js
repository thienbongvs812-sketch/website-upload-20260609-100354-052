(function () {
  var header = document.querySelector('[data-role="siteHeader"]');
  var navToggle = document.querySelector('[data-role="navToggle"]');
  var mobileNav = document.querySelector('[data-role="mobileNav"]');

  function setHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-role="hero"]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
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
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    show(0);
    schedule();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var search = scope.querySelector('[data-role="searchInput"]');
    var year = scope.querySelector('[data-role="yearFilter"]');
    var region = scope.querySelector('[data-role="regionFilter"]');
    var type = scope.querySelector('[data-role="typeFilter"]');
    var clear = scope.querySelector('[data-role="clearFilter"]');
    var empty = scope.querySelector('[data-role="emptyState"]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function value(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = value(search);
      var y = value(year);
      var r = value(region);
      var t = value(type);
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-keywords') || '').toLowerCase();
        var cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var ok = true;

        if (q && text.indexOf(q) === -1 && cardTitle.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (r && cardRegion !== r) {
          ok = false;
        }
        if (t && cardType !== t) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [search, year, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        apply();
      });
    }

    apply();
  });
})();
