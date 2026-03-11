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

let startX = 0;
let currentX = 0;
let isDragging = false;

let autoplay;

// ======================
// CLONES (loop infinito)
// ======================

const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

slider.appendChild(firstClone);
slider.prepend(lastClone);

slides = document.querySelectorAll(".slides");

let currentSlide = 1;
const maxSlide = slides.length - 2;

// -=-=-//
// Dots //
// -=-=-//

const createDots = () => {
    for (let i = 0; i < maxSlide; i++) {
        dotContainer.insertAdjacentHTML(
            "beforeend",
            `<button class="dots__dot" data-slide="${i}"></button>`,
        );
    }
};

// -=-=-=-=-=//
// Move Dots //
// -=-=-=-=-=//

const activateDot = (slide) => {
    document
        .querySelectorAll(".dots__dot")
        .forEach((dot) => dot.classList.remove("active"));

    document
        .querySelector(`.dots__dot[data-slide="${slide}"]`)
        .classList.add("active");
};

// -=-=-=-//
// Slides //
// -=-=-=-//

const goToSlide = (slide) => {
    slides.forEach((s, i) => {
        s.style.transform = `translateX(${100 * (i - slide)}%)`;
    });
};

const nextSlide = () => {
    currentSlide++;
    goToSlide(currentSlide);

    if (currentSlide === maxSlide + 1) {
        setTimeout(() => {
            slides.forEach((slide) => (slide.style.transition = "none"));

            currentSlide = 1;
            goToSlide(currentSlide);

            requestAnimationFrame(() => {
                slides.forEach(
                    (slide) => (slide.style.transition = "transform .5s ease"),
                );
            });
        }, 500);
    }

    activateDot((currentSlide - 1 + maxSlide) % maxSlide);
};

const prevSlide = () => {
    currentSlide--;
    goToSlide(currentSlide);

    if (currentSlide === 0) {
        setTimeout(() => {
            slides.forEach((slide) => (slide.style.transition = "none"));

            currentSlide = maxSlide;
            goToSlide(currentSlide);

            requestAnimationFrame(() => {
                slides.forEach(
                    (slide) => (slide.style.transition = "transform .5s ease"),
                );
            });
        }, 500);
    }

    activateDot((currentSlide - 1 + maxSlide) % maxSlide);
};

// -=-=-=-=-//
// Autoplay //
// -=-=-=-=-//

const startAutoplay = () => {
    autoplay = setInterval(nextSlide, 4500);
};

const stopAutoplay = () => {
    clearInterval(autoplay);
};

// -=-=-=//
// Swipe //
// -=-=-=//

slider.addEventListener("touchstart", (e) => {
    stopAutoplay();

    startX = e.touches[0].clientX;
    isDragging = true;
});

slider.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    slides.forEach((slide, i) => {
        slide.style.transition = "none";
        slide.style.transform = `translateX(${100 * (i - currentSlide)}%) translateX(${diff}px)`;
    });
});

slider.addEventListener("touchend", () => {
    isDragging = false;

    const diff = currentX - startX;

    slides.forEach((slide) => {
        slide.style.transition = "transform .5s ease";
    });

    if (diff < -60) nextSlide();
    else if (diff > 60) prevSlide();
    else goToSlide(currentSlide);

    startAutoplay();
});

// ======================
// Hover pause
// ======================

slider.addEventListener("mouseenter", stopAutoplay);
slider.addEventListener("mouseleave", startAutoplay);

// ======================
// Botões
// ======================

btnRight.addEventListener("click", () => {
    stopAutoplay();
    nextSlide();
    startAutoplay();
});

btnLeft.addEventListener("click", () => {
    stopAutoplay();
    prevSlide();
    startAutoplay();
});

// ======================
// Dots
// ======================

dotContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("dots__dot")) return;

    stopAutoplay();

    currentSlide = Number(e.target.dataset.slide) + 1;

    goToSlide(currentSlide);
    activateDot(e.target.dataset.slide);

    startAutoplay();
});

// ======================
// Teclado
// ======================

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
});

// ======================
// Init
// ======================

const init = () => {
    createDots();
    goToSlide(1);
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
