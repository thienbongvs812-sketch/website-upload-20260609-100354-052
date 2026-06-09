(function () {
    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        var hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
        }

        show(0);
        start();
    }

    function setupPageFilter() {
        var input = document.querySelector('[data-page-filter]');
        var region = document.querySelector('[data-region-filter]');
        var type = document.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
        var count = document.querySelector('[data-result-count]');

        if (!cards.length || (!input && !region && !type)) {
            return;
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-keywords') + ' ' + card.getAttribute('data-title'));
                var sameRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                var sameType = !typeValue || card.getAttribute('data-type') === typeValue;
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) && sameRegion && sameType;
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部影片';
            }
        }

        [input, region, type].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });

        apply();
    }

    function buildCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.detail) + '">' +
            '<div class="poster" data-title="' + escapeHtml(movie.title) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove();">' +
            '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
            '<span class="poster-play">▶</span>' +
            '<div class="poster-caption"><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p></div>' +
            '</div>' +
            '<div class="movie-meta">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>' +
            '<div class="movie-tags">' + tags + '</div>' +
            '</div>' +
            '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        var status = document.querySelector('[data-search-status]');
        var movies = window.MOVIE_INDEX || [];

        if (!form || !input || !results || !movies.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;

        function render() {
            var keyword = normalize(input.value);
            var filtered = movies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine,
                    movie.summary,
                    movie.category,
                    movie.keywords
                ].join(' '));
                return !keyword || haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);

            results.innerHTML = filtered.map(buildCard).join('');
            if (status) {
                var label = keyword ? '“' + input.value + '” 找到 ' + filtered.length + ' 条结果' : '显示前 ' + filtered.length + ' 条推荐结果';
                status.textContent = label;
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var nextUrl = window.location.pathname + '?q=' + encodeURIComponent(input.value.trim());
            window.history.replaceState(null, '', nextUrl);
            render();
        });

        input.addEventListener('input', render);
        render();
    }

    function setupButtons() {
        document.querySelectorAll('[data-like-button]').forEach(function (button) {
            button.addEventListener('click', function () {
                var span = button.querySelector('span');
                var value = Number(span && span.textContent) || 0;
                if (span) {
                    span.textContent = String(value + 1);
                }
                button.classList.add('is-liked');
            });
        });

        document.querySelectorAll('[data-copy-link]').forEach(function (button) {
            button.addEventListener('click', function () {
                var href = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(href).then(function () {
                        button.textContent = '已复制链接';
                    }).catch(function () {
                        button.textContent = '复制失败';
                    });
                } else {
                    button.textContent = '当前浏览器不支持复制';
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupPageFilter();
        setupSearchPage();
        setupButtons();
    });
}());
