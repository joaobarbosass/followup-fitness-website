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

const TRANSITION = "transform .5s ease";
const AUTOPLAY_DELAY = 4500;

let startX = 0;
let startY = 0;
let currentX = 0;
let startTime = 0; // ⬅️ NOVO (inércia)

let isDragging = false;
let isScrollingY = false;
let moved = false;

let autoplayTimer = null;
let autoplayPaused = false;
let sliderVisible = true;

let autoplayStartTime = null;
let autoplayRemaining = AUTOPLAY_DELAY;

let isFixingLoop = false;

let navegandoPorMenu = false;
let usuarioJaScrollou = false; // ⬅️ rastreia se o usuário já scrollou e o fade funcionou

const MOVE_THRESHOLD = 6;
const VELOCITY_THRESHOLD = 0.3; // ⬅️ ajuste fino da inércia

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
// LOOP INFINITO
// ======================

slider.addEventListener("transitionend", (e) => {
    if (isFixingLoop) return;
    if (e.propertyName !== "transform") return;
    if (e.target !== slides[0]) return;

    if (currentSlide === maxSlide + 1) {
        isFixingLoop = true;
        currentSlide = 1;

        requestAnimationFrame(() => {
            slides.forEach((slide) => (slide.style.transition = "none"));
            goToSlide(currentSlide);

            requestAnimationFrame(() => {
                slides.forEach(
                    (slide) => (slide.style.transition = TRANSITION),
                );
                isFixingLoop = false;
            });
        });
    }

    if (currentSlide === 0) {
        isFixingLoop = true;
        currentSlide = maxSlide;

        requestAnimationFrame(() => {
            slides.forEach((slide) => (slide.style.transition = "none"));
            goToSlide(currentSlide);

            requestAnimationFrame(() => {
                slides.forEach(
                    (slide) => (slide.style.transition = TRANSITION),
                );
                isFixingLoop = false;
            });
        });
    }
});

// ======================
// NAVEGAÇÃO
// ======================

const nextSlide = () => {
    if (isFixingLoop) return;

    currentSlide++;
    goToSlide(currentSlide);
    activateDot((currentSlide - 1 + maxSlide) % maxSlide);

    resetAutoplay();
};

const prevSlide = () => {
    if (isFixingLoop) return;

    currentSlide--;
    goToSlide(currentSlide);
    activateDot((currentSlide - 1 + maxSlide) % maxSlide);

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

    if (!autoplayStartTime) return;

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
// SWIPE + TAP + INÉRCIA
// ======================

slider.addEventListener(
    "touchstart",
    (e) => {
        const touch = e.touches[0];

        startX = touch.clientX;
        startY = touch.clientY;
        currentX = startX;
        startTime = Date.now(); // ⬅️ importante

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
            if (
                Math.abs(diffX) > MOVE_THRESHOLD ||
                Math.abs(diffY) > MOVE_THRESHOLD
            ) {
                moved = true;
            }

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

    const diff = currentX - startX;
    const time = Date.now() - startTime;
    const velocity = Math.abs(diff) / time; // ⬅️ cálculo da inércia

    const swipeThreshold = slider.clientWidth * 0.07;

    slides.forEach((slide) => (slide.style.transition = TRANSITION));

    // TAP
    if (!moved) {
        autoplayPaused = !autoplayPaused;

        if (autoplayPaused) {
            stopAutoplay();
            showFeedback("⏸");
        } else {
            startAutoplay();
            showFeedback("▶");
        }

        return;
    }

    // SWIPE COM INÉRCIA
    if (!isScrollingY) {
        if (
            diff < -swipeThreshold ||
            (velocity > VELOCITY_THRESHOLD && diff < 0)
        ) {
            nextSlide();
        } else if (
            diff > swipeThreshold ||
            (velocity > VELOCITY_THRESHOLD && diff > 0)
        ) {
            prevSlide();
        } else {
            goToSlide(currentSlide);
        }
    }

    moved = false;
    isScrollingY = false;

    resetAutoplay();
});

// ======================
// CLICK (DESKTOP)
// ======================

slider.addEventListener("click", () => {
    if ("ontouchstart" in window) return;

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

btnLeft.addEventListener("click", () => btnLeft.blur());
btnRight.addEventListener("click", () => btnRight.blur());

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
    if (!sliderVisible) return;

    if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
    }

    if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
    }
});

// ======================
// INIT
// ======================

const init = () => {
    createDots();
    goToSlide(currentSlide);

    slides.forEach((slide) => (slide.style.transition = TRANSITION));

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

function navegarParaSecao(secaoAlvo) {
    if (!secaoAlvo) return;

    navegandoPorMenu = true;

    const todasSecoes = document.querySelectorAll("main section");

    let passou = false;

    // ✅ MARCAR SEÇÕES ANTERIORES COMO JÁ ANIMADAS
    todasSecoes.forEach((secao) => {
        const elementos = secao.querySelectorAll(".animar");

        if (secao === secaoAlvo) passou = true;

        // ✅ ANTES → sem animação
        if (!passou) {
            elementos.forEach((el) => {
                el.classList.add("aparecer");
                el.dataset.animado = "true";
            });
        }

        // ✅ SEÇÃO CLICADA → reseta para animar quando aparecer
        else if (secao === secaoAlvo) {
            elementos.forEach((el) => {
                el.classList.remove("aparecer");
                el.dataset.animado = "false";
            });
        }

        // ✅ DEPOIS → só se nunca animou
        else {
            elementos.forEach((el) => {
                if (el.dataset.animado !== "true") {
                    el.classList.remove("aparecer");
                }
            });
        }
    });

    // scroll suave com scrollIntoView
    secaoAlvo.scrollIntoView({ behavior: "smooth", block: "start" });

    // ESPERA O SCROLL PARAR PRA ANIMAR (com delay extra para scrolls curtos)
    let scrollTimeout;
    let fallbackTimeout;
    let hasAnimated = false;

    const animarSecao = () => {
        if (hasAnimated) return;
        hasAnimated = true;

        // scroll parou, agora anima
        const elementos = secaoAlvo.querySelectorAll(".animar");

        elementos.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add("aparecer");
                el.dataset.animado = "true";
            }, i * 100);
        });

        window.removeEventListener("scroll", handleScroll);
        clearTimeout(fallbackTimeout);

        setTimeout(() => {
            navegandoPorMenu = false;
        }, 500);
    };

    const handleScroll = () => {
        clearTimeout(scrollTimeout);
        clearTimeout(fallbackTimeout);

        scrollTimeout = setTimeout(() => {
            // adiciona um delay extra pra ter certeza que parou
            setTimeout(() => {
                animarSecao();
            }, 150); // delay extra de 150ms após parar
        }, 800); // espera 800ms sem eventos de scroll
    };

    window.addEventListener("scroll", handleScroll);

    // FALLBACK: se não houver scroll (já está na seção), anima mesmo assim
    fallbackTimeout = setTimeout(() => {
        animarSecao();
    }, 1200); // 800ms (timeout) + 150ms (delay) + margem
}

/* clicar em link com fade*/

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (!id.startsWith("#")) return;

        e.preventDefault();

        const secaoAlvo = document.querySelector(id);

        navegarParaSecao(secaoAlvo);

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

// -════════════════════════════════════════════════════════//
// Botões do Bloco Main (Quero começar / Ver planos)         //
// -════════════════════════════════════════════════════════//

const botoesMain = document.querySelectorAll(".bloco-main__acoes a");

botoesMain.forEach((botao) => {
    botao.addEventListener("click", (e) => {
        const href = botao.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        e.preventDefault();

        const secaoAlvo = document.querySelector(href);

        navegarParaSecao(secaoAlvo);
    });
});

// -=-=-=-=-=-=-=-//
// Fade Elementos //
// -=-=-=-=-=-=-=-//

const elementos = document.querySelectorAll(".animar");

const fadeObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, index) => {
            // 🔥 BLOQUEIA observer quando clique vem do menu
            if (entry.isIntersecting) {
                // ⬅️ NÃO re-anima se já tem aparecer
                if (entry.target.dataset.animado === "true") return;

                // ⬅️ marca que o usuário já scrollou (fade funcionou)
                usuarioJaScrollou = true;

                setTimeout(() => {
                    entry.target.classList.add("aparecer");
                    entry.target.dataset.animado = "true";
                }, index * 120);
            }
        });
    },
    {
        threshold: 0.2,
    },
);

elementos.forEach((el) => fadeObserver.observe(el));

// anima hero ao carregar
window.addEventListener("load", () => {
    const hero = document.querySelectorAll(".animar-hero");

    hero.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add("aparecer");
        }, i * 200);
    });
});

// -=-=-=-=-=-=-=-=-//
// Banner Camisetas //
// -=-=-=-=-=-=-=-=-//
const target = document.querySelector(".typing-banner");

let typingExecutado = false;

const observerTyping = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !typingExecutado) {
                typingExecutado = true;
                iniciarTyping(entry.target);
            }
        });
    },
    {
        threshold: 0.5,
    },
);

if (target) observerTyping.observe(target);

// ======================
// DIGITAÇÃO + LOOP
// ======================

function iniciarTyping(elemento) {
    const texto = elemento.textContent.trim();

    let index = 0;
    let apagando = false;

    elemento.textContent = "";

    setTimeout(() => {
        function loop() {
            if (!apagando) {
                // ✍️ DIGITANDO -> cursor FIXO
                elemento.classList.remove("typing");

                if (index < texto.length) {
                    elemento.textContent += texto[index];
                    index++;

                    setTimeout(loop, 65);
                } else {
                    // ⏸️ TERMINOU -> começa piscar
                    elemento.classList.add("typing");

                    // 🔥 espera piscando antes de apagar
                    setTimeout(() => {
                        apagando = true;
                        loop();
                    }, 3000);
                }
            } else {
                // 🧹 APAGANDO -> cursor FIXO
                elemento.classList.remove("typing");

                if (index > 0) {
                    elemento.textContent = texto.substring(0, index - 1);
                    index--;

                    setTimeout(loop, 50);
                } else {
                    // 🔥 terminou de apagar -> volta a piscar
                    elemento.classList.add("typing");

                    // 🔥 espera piscando antes de digitar
                    setTimeout(() => {
                        apagando = false;
                        loop();
                    }, 1500);
                }
            }
        }

        loop();
    }, 700);
}
