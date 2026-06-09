(function () {
    const ready = function (callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    ready(function () {
        const navToggle = document.querySelector("[data-nav-toggle]");
        const navLinks = document.querySelector("[data-nav-links]");

        if (navToggle && navLinks) {
            navToggle.addEventListener("click", function () {
                navLinks.classList.toggle("is-open");
            });
        }

        const searchInput = document.querySelector("[data-movie-search]");
        const cards = Array.from(document.querySelectorAll(".movie-card"));
        const resultCount = document.querySelector("[data-result-count]");

        if (searchInput && cards.length) {
            const updateSearch = function () {
                const keyword = searchInput.value.trim().toLowerCase();
                let visible = 0;

                cards.forEach(function (card) {
                    const source = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    const matched = !keyword || source.indexOf(keyword) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (resultCount) {
                    resultCount.textContent = String(visible);
                }
            };

            searchInput.addEventListener("input", updateSearch);
            updateSearch();
        }

        const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

        if (slides.length) {
            let active = 0;

            const showSlide = function (index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === active);
                });
            };

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });

            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    });
})();
