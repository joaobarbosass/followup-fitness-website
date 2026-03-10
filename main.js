// -=-=-=-=-=-=-=-=-=-=-=//
// Perguntas e Respostas//
// -=-=-=-=-=-=-=-=-=-=-=//
const faqBlocos = document.querySelectorAll(".bloco_faq");

faqBlocos.forEach((bloco) => {
    bloco.addEventListener("click", (e) => {
        e.stopPropagation();

        const jaAtivo = bloco.classList.contains("ativo");

        /* PRESS */
        bloco.classList.remove("press");
        void bloco.offsetWidth;
        bloco.classList.add("press");

        setTimeout(() => {
            bloco.classList.remove("press");
        }, 260);

        /* GLOW */
        bloco.classList.remove("glow");
        void bloco.offsetWidth;
        bloco.classList.add("glow");

        setTimeout(() => {
            bloco.classList.remove("glow");
        }, 350);

        /* fechar outros */
        faqBlocos.forEach((b) => {
            if (b !== bloco) {
                b.classList.remove("ativo");
            }
        });

        /* toggle */
        if (!jaAtivo) {
            bloco.classList.add("ativo");
        } else {
            bloco.classList.remove("ativo");
        }
    });
});

/* fechar clicando fora */

document.addEventListener("click", (e) => {
    const clicouDentro = e.target.closest(".bloco_faq");

    if (!clicouDentro) {
        faqBlocos.forEach((bloco) => {
            if (bloco.classList.contains("ativo")) {
                bloco.classList.remove("ativo");

                bloco.classList.add("glow");

                setTimeout(() => {
                    bloco.classList.remove("glow");
                }, 350);
            }
        });
    }
});

// -=-=-=-=-=-=-=-=-=//
// Carrossel de FOTOS//
// -=-=-=-=-=-=-=-=-=//
const slides = document.querySelectorAll(".slides");
const dotContainer = document.querySelector(".dots");
const btnLeft = document.querySelector(".left");
const btnRight = document.querySelector(".right");

let currentSlide = 0;
const maxSlide = slides.length;

/* cria dots */
const createDots = () => {
    slides.forEach((_, i) => {
        dotContainer.insertAdjacentHTML(
            "beforeend",
            `<button class="dots__dot" data-slide="${i}"></button>`,
        );
    });
};

/* ativa dot */
const activateDot = (slide) => {
    document
        .querySelectorAll(".dots__dot")
        .forEach((dot) => dot.classList.remove("active"));

    document
        .querySelector(`.dots__dot[data-slide="${slide}"]`)
        .classList.add("active");
};

/* move slides */
const goToSlide = (slide) => {
    slides.forEach((s, i) => {
        s.style.transform = `translateX(${100 * (i - slide)}%)`;
    });
};

/* próximo */
const nextSlide = () => {
    currentSlide = currentSlide === maxSlide - 1 ? 0 : currentSlide + 1;
    goToSlide(currentSlide);
    activateDot(currentSlide);
};

/* anterior */
const prevSlide = () => {
    currentSlide = currentSlide === 0 ? maxSlide - 1 : currentSlide - 1;
    goToSlide(currentSlide);
    activateDot(currentSlide);
};

/* init */
const init = () => {
    createDots();
    goToSlide(0);
    activateDot(0);
};
init();

/* eventos */
btnRight.addEventListener("click", nextSlide);
btnLeft.addEventListener("click", prevSlide);

dotContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("dots__dot")) {
        currentSlide = Number(e.target.dataset.slide);
        goToSlide(currentSlide);
        activateDot(currentSlide);
    }
});

/* teclado */
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
});

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
            const secao = document.querySelector(id);

            if (secao) {
                const elementos = secao.querySelectorAll(".animar");

                elementos.forEach((el, i) => {
                    el.classList.remove("aparecer");

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
