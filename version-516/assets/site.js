(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('.site-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var keyword = input ? input.value.trim() : '';
            if (!keyword) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchType = !type || card.getAttribute('data-type') === type;
                var match = matchKeyword && matchYear && matchType;
                card.classList.toggle('hidden-by-filter', !match);
                if (match) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    var searchForm = document.querySelector('[data-search-page-form]');
    var searchInput = document.querySelector('[data-search-page-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchTitle = document.querySelector('[data-search-results-title]');

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="movie-cover" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="cover-shade"></span><span class="play-mini">▶</span></a>' +
            '<div class="movie-card-body"><h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
            '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div></div></article>';
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

    function renderSearch(keyword) {
        if (!searchResults || !window.MOVIE_INDEX) {
            return;
        }
        var q = String(keyword || '').trim().toLowerCase();
        var list = window.MOVIE_INDEX;
        var results = q ? list.filter(function (movie) {
            return [movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine]
                .join(' ')
                .toLowerCase()
                .indexOf(q) !== -1;
        }) : list.slice(0, 60);
        searchResults.innerHTML = results.slice(0, 160).map(cardHtml).join('');
        if (searchTitle) {
            searchTitle.textContent = q ? '搜索结果：' + results.length + ' 条' : '精选片库';
        }
    }

    if (searchForm && searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        searchInput.value = q;
        renderSearch(q);
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var keyword = searchInput.value.trim();
            var url = keyword ? './search.html?q=' + encodeURIComponent(keyword) : './search.html';
            window.history.replaceState(null, '', url);
            renderSearch(keyword);
        });
    }
})();
