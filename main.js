// -=-=-=-=-=-=-=-=-=-=-=//
// Perguntas e Respostas //
// -=-=-=-=-=-=-=-=-=-=-=//
const faqBlocos = document.querySelectorAll(".bloco_faq");

faqBlocos.forEach((bloco) => {
    bloco.addEventListener("click", (e) => {
        e.stopPropagation();

        const jaAtivo = bloco.classList.contains("ativo");

        /* FECHAR OUTROS */

        faqBlocos.forEach((b) => {
            if (b !== bloco) {
                b.classList.remove("ativo");
            }
        });

        /* CLIQUE */

        if (!jaAtivo) {
            bloco.classList.add("ativo");
        } else {
            bloco.classList.remove("ativo");
        }
    });
});

/* FECHAR CLICANDO FORA */

document.addEventListener("click", (e) => {
    const clicouDentro = e.target.closest(".bloco_faq");

    if (!clicouDentro) {
        faqBlocos.forEach((bloco) => {
            bloco.classList.remove("ativo");
        });
    }
});

// -=-=-=-=-=-=-=-=-=-=-=-//
// Carrossel de Feedbacks //
// -=-=-=-=-=-=-=-=-=-=-=-//

const slider = document.querySelector(".slider");
let slides = document.querySelectorAll(".slides");
const dotContainer = document.querySelector(".dots");
const btnLeft = document.querySelector(".left");
const btnRight = document.querySelector(".right");

const sliderFeedback = document.querySelector(".slider-feedback");

let startX = 0;
let startY = 0;
let currentX = 0;

let isDragging = false;
let isScrollingY = false;
let moved = false;

let lastSwipeTime = 0;

let autoplayTimer = null;
let autoplayPaused = false;
let sliderVisible = true;

const AUTOPLAY_DELAY = 4500;

let autoplayStartTime = null;
let autoplayRemaining = AUTOPLAY_DELAY;

// ======================
// CLONES
// ======================

const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

slider.appendChild(firstClone);
slider.prepend(lastClone);

slides = document.querySelectorAll(".slides");

let currentSlide = 1;
const maxSlide = slides.length - 2;

// ======================
// DOTS
// ======================

const createDots = () => {
    for (let i = 0; i < maxSlide; i++) {
        dotContainer.insertAdjacentHTML(
            "beforeend",
            `<button class="dots__dot" data-slide="${i}"></button>`,
        );
    }
};

const activateDot = (slide) => {
    document
        .querySelectorAll(".dots__dot")
        .forEach((dot) => dot.classList.remove("active"));

    const activeDot = document.querySelector(
        `.dots__dot[data-slide="${slide}"]`,
    );

    if (activeDot) activeDot.classList.add("active");
};

// ======================
// POSICIONAMENTO
// ======================

const goToSlide = (slide) => {
    slides.forEach((s, i) => {
        s.style.transform = `translateX(${100 * (i - slide)}%)`;
    });
};

// ======================
// LOOP PERFEITO
// ======================

const fixLoop = () => {
    if (currentSlide === maxSlide + 1) {
        slides.forEach((slide) => (slide.style.transition = "none"));

        currentSlide = 1;

        goToSlide(currentSlide);

        requestAnimationFrame(() => {
            slides.forEach(
                (slide) => (slide.style.transition = "transform .5s ease"),
            );
        });
    }

    if (currentSlide === 0) {
        slides.forEach((slide) => (slide.style.transition = "none"));

        currentSlide = maxSlide;

        goToSlide(currentSlide);

        requestAnimationFrame(() => {
            slides.forEach(
                (slide) => (slide.style.transition = "transform .5s ease"),
            );
        });
    }
};

// ======================
// NAVEGAÇÃO
// ======================

const nextSlide = () => {
    currentSlide++;

    goToSlide(currentSlide);

    activateDot((currentSlide - 1 + maxSlide) % maxSlide);

    setTimeout(fixLoop, 500);

    resetAutoplay();
};

const prevSlide = () => {
    currentSlide--;

    goToSlide(currentSlide);

    activateDot((currentSlide - 1 + maxSlide) % maxSlide);

    setTimeout(fixLoop, 500);

    resetAutoplay();
};

// ======================
// AUTOPLAY
// ======================

const startAutoplay = () => {
    if (autoplayPaused || !sliderVisible) return;

    clearTimeout(autoplayTimer);

    autoplayStartTime = Date.now();

    autoplayTimer = setTimeout(() => {
        autoplayRemaining = AUTOPLAY_DELAY;

        nextSlide();
    }, autoplayRemaining);
};

const stopAutoplay = () => {
    clearTimeout(autoplayTimer);

    const elapsed = Date.now() - autoplayStartTime;

    autoplayRemaining = Math.max(AUTOPLAY_DELAY - elapsed, 0);
};

const resetAutoplay = () => {
    autoplayRemaining = AUTOPLAY_DELAY;

    if (!autoplayPaused && sliderVisible) startAutoplay();
};

// ======================
// VISIBILIDADE
// ======================

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                sliderVisible = entry.isIntersecting;

                if (sliderVisible) startAutoplay();
                else stopAutoplay();
            });
        },
        { threshold: 0.3 },
    );

    observer.observe(slider);
}

// ======================
// FEEDBACK
// ======================

const showFeedback = (icon) => {
    sliderFeedback.textContent = icon;

    sliderFeedback.classList.add("show");

    setTimeout(() => {
        sliderFeedback.classList.remove("show");
    }, 600);
};

// ======================
// SWIPE
// ======================

slider.addEventListener(
    "touchstart",
    (e) => {
        const touch = e.touches[0];

        startX = touch.clientX;
        startY = touch.clientY;
        currentX = startX;

        isDragging = true;
        isScrollingY = false;
        moved = false;

        stopAutoplay();
    },
    { passive: true },
);

slider.addEventListener(
    "touchmove",
    (e) => {
        if (!isDragging) return;

        const touch = e.touches[0];

        const diffX = touch.clientX - startX;
        const diffY = touch.clientY - startY;

        if (!moved) {
            moved = true;

            if (Math.abs(diffY) > Math.abs(diffX)) {
                isScrollingY = true;
                return;
            }
        }

        if (isScrollingY) return;

        e.preventDefault();

        currentX = touch.clientX;

        slides.forEach((slide, i) => {
            slide.style.transition = "none";

            slide.style.transform = `translateX(${100 * (i - currentSlide)}%) translateX(${diffX}px)`;
        });
    },
    { passive: false },
);

slider.addEventListener("touchend", () => {
    if (!isDragging) return;

    isDragging = false;

    lastSwipeTime = Date.now();

    const diff = currentX - startX;

    slides.forEach((slide) => (slide.style.transition = "transform .5s ease"));

    if (!isScrollingY) {
        if (diff < -70) nextSlide();
        else if (diff > 70) prevSlide();
        else goToSlide(currentSlide);
    }

    resetAutoplay();
});

// ======================
// CLICK (tap)
// ======================

slider.addEventListener("click", (e) => {
    if (moved) return;

    if (Date.now() - lastSwipeTime < 350) return;

    if (!e.target.closest(".slides")) return;

    autoplayPaused = !autoplayPaused;

    if (autoplayPaused) {
        stopAutoplay();
        showFeedback("⏸");
    } else {
        startAutoplay();
        showFeedback("▶");
    }
});

// ======================
// BOTÕES
// ======================

btnRight.addEventListener("click", nextSlide);
btnLeft.addEventListener("click", prevSlide);

// ======================
// DOTS
// ======================

dotContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("dots__dot")) return;

    e.stopPropagation();

    currentSlide = Number(e.target.dataset.slide) + 1;

    goToSlide(currentSlide);

    activateDot(e.target.dataset.slide);

    resetAutoplay();
});

// ======================
// TECLADO
// ======================

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevSlide;
    if (e.key === "ArrowRight") nextSlide;
});

// ======================
// INIT
// ======================

const init = () => {
    createDots();
    goToSlide(currentSlide);
    activateDot(0);
    startAutoplay();
};

init();

// -=-=-=-=-=-=-=-=-=-=-=-=-//
// Menu Hambúrguer CELULAR //
// -=-=-=-=-=-=-=-=-=-=-=-//

// Menu celular - Hambúrguer
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".links_header");
const links = document.querySelectorAll(".links_header a");

function closeMenu() {
    nav.classList.remove("active");
    toggle.classList.remove("active");
    document.body.classList.remove("menu-open");
}

function openMenu() {
    nav.classList.add("active");
    toggle.classList.add("active");
    document.body.classList.add("menu-open");
}

/* abrir / fechar */

toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    if (nav.classList.contains("active")) {
        closeMenu();
    } else {
        openMenu();
    }
});

/* clicar em link com fade*/

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");

        if (id.startsWith("#")) {
            e.preventDefault();

            const secao = document.querySelector(id);

            if (secao) {
                const elementos = secao.querySelectorAll(".animar");

                elementos.forEach((el) => {
                    el.classList.remove("aparecer");
                });

                /* SCROLL SUAVE */

                secao.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                /* FADE */

                elementos.forEach((el, i) => {
                    setTimeout(() => {
                        el.classList.add("aparecer");
                    }, i * 120);
                });
            }
        }

        closeMenu();
    });
});

/* clicar fora */

document.addEventListener("click", (e) => {
    if (
        nav.classList.contains("active") &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
    ) {
        closeMenu();
    }
});

/* voltar para desktop */

window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        closeMenu();
    }
});

// -=-=-=-=-=-=-=-=//
// Fade Elementos //
// -=-=-=-=-=-=-=//

const elementos = document.querySelectorAll(".animar");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add("aparecer");
                }, index * 120);

                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.2,
    },
);

elementos.forEach((el) => observer.observe(el));

// anima hero ao carregar
window.addEventListener("load", () => {
    const hero = document.querySelectorAll(".animar-hero");

    hero.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add("aparecer");
        }, i * 200);
    });
});
