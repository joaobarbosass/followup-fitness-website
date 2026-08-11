// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
// Menu Auto-Hide com Detecção de Scroll //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

const header = document.querySelector("header");
const blocoMain = document.querySelector(".bloco-main");
const gsapDisponivel = typeof gsap !== "undefined";

if (gsapDisponivel && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

let lastScrollTop = 0;
let lastScrollTime = 0;
let ticking = false;

const SCROLL_THRESHOLD = 5;
const THROTTLE_DELAY = 100;

/**
 * Controla visibilidade do header
 */
function updateHeaderVisibility() {
    const currentScrollTop =
        window.scrollY || document.documentElement.scrollTop;
    const desktopHeaderFixo = window.innerWidth > 1200;

    const scrollDifference = Math.abs(currentScrollTop - lastScrollTop);

    // 🔥 limite da hero/main
    const limiteHero = blocoMain.offsetHeight * 0.8;

    header.classList.toggle("header-scrolled", currentScrollTop > 18);

    if (desktopHeaderFixo) {
        header.classList.remove("header-hidden");
        lastScrollTop = currentScrollTop;
        ticking = false;

        return;
    }

    // ======================
    // ÁREA DO HERO
    // ======================

    // Enquanto estiver no bloco main:
    // header sempre visível
    if (currentScrollTop <= limiteHero) {
        header.classList.remove("header-hidden");

        lastScrollTop = currentScrollTop;
        ticking = false;

        return;
    }

    // ======================
    // RESTANTE DA PÁGINA
    // ======================

    if (scrollDifference > SCROLL_THRESHOLD) {
        // Scroll para baixo
        if (currentScrollTop > lastScrollTop) {
            header.classList.add("header-hidden");
        }

        // Scroll para cima
        else {
            header.classList.remove("header-hidden");
        }

        lastScrollTop = currentScrollTop;
    }

    // Sempre mostrar no topo
    if (currentScrollTop <= 0) {
        header.classList.remove("header-hidden");
        lastScrollTop = 0;
    }

    ticking = false;
}

/**
 * Throttle
 */
function throttledScroll() {
    const now = Date.now();

    if (now - lastScrollTime >= THROTTLE_DELAY) {
        lastScrollTime = now;

        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateHeaderVisibility);
        }
    }
}

// Evento scroll
window.addEventListener("scroll", throttledScroll, {
    passive: true,
});
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

const feedbacksContainer = document.querySelector(".bloco_fundo_feedbacks");
const slider = feedbacksContainer.querySelector(".slider");
let slides = feedbacksContainer.querySelectorAll(".slides");

const dotContainer = feedbacksContainer.querySelector(".dots");
const btnLeft = feedbacksContainer.querySelector(".botao_icone_slider.left");
const btnRight = feedbacksContainer.querySelector(".botao_icone_slider.right");

const sliderFeedback = feedbacksContainer.querySelector(".slider-feedback");
const feedbacksContador = feedbacksContainer.querySelector(
    ".feedbacks-contador",
);

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

const MOVE_THRESHOLD = 6;
const VELOCITY_THRESHOLD = 0.3; // ⬅️ ajuste fino da inércia

// ======================
// CLONES
// ======================

const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

slider.appendChild(firstClone);
slider.prepend(lastClone);

slides = slider.querySelectorAll(".slides");

let currentSlide = 1;
const maxSlide = slides.length - 2;

// ======================
// DOTS
// ======================

const createDots = () => {
    for (let i = 0; i < maxSlide; i++) {
        const imagem = slides[i + 1]?.querySelector("img");
        const src = imagem?.getAttribute("src") || "";

        dotContainer.insertAdjacentHTML(
            "beforeend",
            `<button class="dots__dot" data-slide="${i}" aria-label="Ver feedback ${i + 1}" style="background-image: url('${src}')"></button>`,
        );
    }
};

const activateDot = (slide) => {
    dotContainer
        .querySelectorAll(".dots__dot")
        .forEach((dot) => dot.classList.remove("active"));

    const activeDot = dotContainer.querySelector(
        `.dots__dot[data-slide="${slide}"]`,
    );

    if (activeDot) {
        activeDot.classList.add("active");
        centralizarMiniaturaAtiva(activeDot);
    }

    if (feedbacksContador) {
        feedbacksContador.textContent = `${Number(slide) + 1} / ${maxSlide}`;
    }
};

const centralizarMiniaturaAtiva = (activeDot) => {
    requestAnimationFrame(() => {
        const targetLeft =
            activeDot.offsetLeft -
            dotContainer.clientWidth / 2 +
            activeDot.offsetWidth / 2;
        const maxLeft = dotContainer.scrollWidth - dotContainer.clientWidth;
        const left = Math.max(0, Math.min(targetLeft, maxLeft));

        dotContainer.scrollTo({
            left,
            behavior: "smooth",
        });
    });
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

slider.addEventListener("touchend", (e) => {
    if (!isDragging) return;

    isDragging = false;

    const diff = currentX - startX;
    const time = Date.now() - startTime;
    const velocity = Math.abs(diff) / time; // ⬅️ cálculo da inércia

    const swipeThreshold = slider.clientWidth * 0.07;

    slides.forEach((slide) => (slide.style.transition = TRANSITION));

    // TAP
    if (!moved) {
        const tocouNaImagem = e.target.closest("img");

        if (!tocouNaImagem) return;

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

const imagens = feedbacksContainer.querySelectorAll(".slides img");

imagens.forEach((img) => {
    img.addEventListener("click", (e) => {
        if ("ontouchstart" in window) return;

        e.stopPropagation();

        autoplayPaused = !autoplayPaused;

        if (autoplayPaused) {
            stopAutoplay();
            showFeedback("⏸");
        } else {
            startAutoplay();
            showFeedback("▶");
        }
    });
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

// -=-=-=-=-=-=-=-=-=-=-=-=-//
// Menu Hambúrguer CELULAR //
// -=-=-=-=-=-=-=-=-=-=-=-//

// Menu celular - Hambúrguer
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".links_header");
const links = document.querySelectorAll(".links_header a");
const menuClose = document.querySelector(".menu-close");
const menuOverlay = document.querySelector(".menu-overlay");
const menuItems = document.querySelectorAll(".links_header ul li");

function atualizarMenuMobileAtivo(id) {
    if (!id) return;

    const linksMobile = document.querySelectorAll(".links_header a[href^='#']");

    linksMobile.forEach((link) => {
        const ativo = link.getAttribute("href") === `#${id}`;

        link.classList.toggle("active", ativo);
        link.closest("li")?.classList.toggle("active", ativo);
    });
}

let menuMobileActiveTicking = false;

function detectarSecaoAtivaMobile() {
    if (window.innerWidth > 1200) {
        menuMobileActiveTicking = false;
        return;
    }

    const secoes = document.querySelectorAll("main section[id]");
    const pontoLeitura = (header?.offsetHeight || 0) + 48;
    let secaoAtual = secoes[0];

    secoes.forEach((secao) => {
        const topo = secao.getBoundingClientRect().top;

        if (topo <= pontoLeitura) {
            secaoAtual = secao;
        }
    });

    atualizarMenuMobileAtivo(secaoAtual?.id);
    menuMobileActiveTicking = false;
}

function agendarDeteccaoSecaoAtivaMobile() {
    if (menuMobileActiveTicking) return;

    menuMobileActiveTicking = true;
    requestAnimationFrame(detectarSecaoAtivaMobile);
}

function atualizarCompensacaoScrollbar() {
    const larguraScrollbar =
        window.innerWidth - document.documentElement.clientWidth;

    document.body.style.setProperty(
        "--scrollbar-compensacao",
        `${larguraScrollbar}px`,
    );
}

function limparCompensacaoScrollbar() {
    document.body.style.setProperty("--scrollbar-compensacao", "0px");
}

function animarMenuAbrindo() {
    if (!gsapDisponivel) return;

    gsap.killTweensOf([nav, menuOverlay, menuItems]);
    gsap.set([nav, menuOverlay, menuItems], {
        clearProps: "transform,opacity",
    });
}

function animarMenuFechando() {
    if (gsapDisponivel) {
        gsap.killTweensOf([nav, menuOverlay, menuItems]);
        gsap.set([nav, menuOverlay, menuItems], {
            clearProps: "transform,opacity",
        });
    }

    nav.classList.remove("active");
    menuOverlay?.classList.remove("active");
    document.body.classList.remove("menu-open");

    setTimeout(() => {
        limparCompensacaoScrollbar();
    }, 360);
}

function aplicarCascataItensVisiveis() {
    const visibleItems = Array.from(
        document.querySelectorAll(".links_header ul li"),
    ).filter((item) => !item.hidden);

    visibleItems.forEach((item, index) => {
        item.style.setProperty("--delay", `${index * 0.08}s`);
    });
}

function closeMenu() {
    animarMenuFechando();

    const menuList = nav?.querySelector("ul");
    if (menuList) {
        menuList.scrollTop = 0;
    }
}

function openMenu() {
    aplicarCascataItensVisiveis();
    detectarSecaoAtivaMobile();
    atualizarCompensacaoScrollbar();

    nav.classList.remove("no-transition");
    nav.classList.add("active");
    menuOverlay?.classList.add("active");
    document.body.classList.add("menu-open");
    animarMenuAbrindo();
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

/* botão fechar */

if (menuClose) {
    menuClose.addEventListener("click", (e) => {
        e.stopPropagation();
        closeMenu();
    });
}

menuOverlay?.addEventListener("click", () => {
    closeMenu();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("active")) {
        closeMenu();
    }
});

function navegarParaSecao(secaoAlvo) {
    if (!secaoAlvo) return;

    navegandoPorMenu = true;
    atualizarMenuMobileAtivo(secaoAlvo.id);

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

        // ✅ SEÇÃO CLICADA → mantém o estado atual; só anima se nunca tiver animado
        else if (secao === secaoAlvo) {
            elementos.forEach((el) => {
                if (el.dataset.animado !== "true") {
                    el.classList.remove("aparecer");
                }
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

    const menuDesktopVisivel = window.innerWidth > 1200;
    const posicaoSecao = secaoAlvo.getBoundingClientRect().top + window.scrollY;
    const navegandoParaCima = posicaoSecao < window.scrollY;
    const alturaHeader =
        menuDesktopVisivel || navegandoParaCima ? header?.offsetHeight || 0 : 0;
    const respiroHeader = menuDesktopVisivel || navegandoParaCima ? 18 : 8;
    const destinoScroll = Math.max(
        posicaoSecao - alturaHeader - respiroHeader,
        0,
    );

    window.scrollTo({
        top: destinoScroll,
        behavior: "smooth",
    });

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
            if (el.dataset.animado === "true") return;

            setTimeout(() => {
                el.classList.add("aparecer");
                el.dataset.animado = "true";
            }, i * 20);
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
            }, 40); // delay extra mínimo após parar
        }, 120); // espera curta e mais responsiva
    };

    window.addEventListener("scroll", handleScroll);

    // FALLBACK: se não houver scroll (já está na seção), anima mesmo assim
    fallbackTimeout = setTimeout(() => {
        animarSecao();
    }, 420); // fallback curto para não travar o início do fade
}

/* clicar em link - SEMPRE FECHA MENU */

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (!id.startsWith("#")) {
            closeMenu();
            return;
        }

        e.preventDefault();

        const secaoAlvo = document.querySelector(id);
        if (secaoAlvo) {
            navegarParaSecao(secaoAlvo);
        }

        closeMenu();
    });
});

/* fechar ao clicar fora */

document.addEventListener("click", (e) => {
    if (
        nav.classList.contains("active") &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target) &&
        !menuOverlay?.contains(e.target)
    ) {
        closeMenu();
    }
});

/* fechar ao descer a tela */

let lastScrollY = 0;

window.addEventListener(
    "scroll",
    () => {
        const currentScrollY = window.scrollY;
        agendarDeteccaoSecaoAtivaMobile();

        // Fechar menu apenas quando scrollar para BAIXO
        if (currentScrollY > lastScrollY && nav.classList.contains("active")) {
            closeMenu();
        }

        lastScrollY = currentScrollY;
    },
    { passive: true },
);

/* fechar ao redimensionar para mobile */

window.addEventListener("resize", () => {
    if (window.innerWidth > 1200) {
        closeMenu();
    }

    agendarDeteccaoSecaoAtivaMobile();
});

window.addEventListener("load", agendarDeteccaoSecaoAtivaMobile);

// -════════════════════════════════════════════════════════//
// Botões do Bloco Main (Quero começar / Ver planos)         //
// -════════════════════════════════════════════════════════//

const botoesMain = document.querySelectorAll(
    ".bloco-main__acoes a, .banner_drop_camisetas, .footer_coluna li a, .icon-header, .links_header_desktop a",
);

botoesMain.forEach((botao) => {
    botao.addEventListener("click", (e) => {
        const href = botao.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        e.preventDefault();

        if (botao.classList.contains("icon-header")) {
            navegandoPorMenu = false;

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        const secaoAlvo = document.querySelector(href);

        navegarParaSecao(secaoAlvo);
    });
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//
// Microinteração Cards Camiseta   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//

document.querySelectorAll(".foto_camiseta_card").forEach((card) => {
    card.addEventListener("click", (e) => {
        e.stopPropagation();

        const jaAtivo = card.classList.contains("zoom-ativo");

        document
            .querySelectorAll(".foto_camiseta_card.zoom-ativo")
            .forEach((item) => item.classList.remove("zoom-ativo"));

        if (!jaAtivo) card.classList.add("zoom-ativo");
    });
});

document.addEventListener("click", (e) => {
    if (e.target.closest(".grade_fotos_camiseta")) return;

    document
        .querySelectorAll(".foto_camiseta_card.zoom-ativo")
        .forEach((card) => card.classList.remove("zoom-ativo"));
});

// -=-=-=-=-=-=-=-//
// Fade Elementos //
// -=-=-=-=-=-=-=-//

const elementos = document.querySelectorAll(".animar");
const animacoesGsapCompletas =
    gsapDisponivel && typeof ScrollTrigger !== "undefined";

if (!animacoesGsapCompletas) {
    const fadeObserver = new IntersectionObserver(
        (entries) => {
            if (navegandoPorMenu) return;

            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                // Evita reanimar elementos já concluídos.
                if (entry.target.dataset.animado === "true") {
                    fadeObserver.unobserve(entry.target);
                    return;
                }

                const fadeIndex = Number(entry.target.dataset.fadeIndex || 0);
                const delay = (fadeIndex % 4) * 20;

                setTimeout(() => {
                    entry.target.classList.add("aparecer");
                    entry.target.dataset.animado = "true";
                    fadeObserver.unobserve(entry.target);
                }, delay);
            });
        },
        {
            threshold: window.innerWidth <= 768 ? 0.24 : 0.08,
            rootMargin: window.innerWidth <= 768 ? "0px 0px -12% 0px" : "0px",
        },
    );

    elementos.forEach((el, i) => {
        el.dataset.fadeIndex = String(i);
        fadeObserver.observe(el);
    });

    // anima hero ao carregar
    window.addEventListener("load", () => {
        const hero = document.querySelectorAll(".animar-hero");

        hero.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add("aparecer");
            }, i * 200);
        });
    });
} else {
    elementos.forEach((el) => {
        el.classList.add("aparecer");
        el.dataset.animado = "true";
    });

    document.querySelectorAll(".animar-hero").forEach((el) => {
        el.classList.add("aparecer");
    });
}

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

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
// Animações Premium com GSAP     //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

function animarNumerosHero() {
    const numeros = document.querySelectorAll(".bloco-main__numeros strong");

    numeros.forEach((numero) => {
        const textoOriginal = numero.textContent.trim();
        const possuiMais = textoOriginal.includes("+");
        const valorFinal = Number(textoOriginal.replace(/\D/g, ""));
        const contador = { valor: 0 };

        gsap.to(contador, {
            valor: valorFinal,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => {
                const valorAtual = Math.round(contador.valor);
                numero.textContent = possuiMais ? `+${valorAtual}` : valorAtual;
            },
        });
    });
}

function animarHeaderDesktop() {
    const navDesktop = document.querySelector(".links_header_desktop");
    const indicador = document.querySelector(".header-indicador");
    const linksDesktop = document.querySelectorAll(".links_header_desktop a");

    if (!navDesktop || !indicador || !linksDesktop.length) return;

    function moverIndicador(link) {
        if (!link) return;
        if (window.innerWidth <= 1200) return;

        const margemIndicador = 4;
        const xIndicador = link.offsetLeft + margemIndicador;
        const larguraIndicador = Math.max(
            link.offsetWidth - margemIndicador * 2,
            0,
        );

        gsap.killTweensOf(indicador);

        gsap.to(indicador, {
            x: xIndicador,
            width: larguraIndicador,
            opacity: 1,
            duration: 0.36,
            ease: "power3.out",
            overwrite: true,
        });
    }

    function ativarLink(id) {
        atualizarMenuMobileAtivo(id);

        const linkAtivo = Array.from(linksDesktop).find(
            (link) => link.getAttribute("href") === `#${id}`,
        );

        if (!linkAtivo) return;

        linksDesktop.forEach((link) => link.classList.remove("active"));
        linkAtivo.classList.add("active");
        moverIndicador(linkAtivo);
    }

    document.querySelectorAll("main section").forEach((secao) => {
        ScrollTrigger.create({
            trigger: secao,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
                if (self.isActive) ativarLink(secao.id);
            },
        });
    });

    window.addEventListener("resize", () => {
        const linkAtivo =
            navDesktop.querySelector("a.active") || linksDesktop[0];
        moverIndicador(linkAtivo);
    });

    ativarLink("bloco-main");

    window.addEventListener("load", () => {
        const linkAtivo =
            navDesktop.querySelector("a.active") || linksDesktop[0];
        moverIndicador(linkAtivo);
    });

    document.fonts?.ready.then(() => {
        const linkAtivo =
            navDesktop.querySelector("a.active") || linksDesktop[0];
        moverIndicador(linkAtivo);
    });
}

function iniciarAnimacoesGsap() {
    if (!gsapDisponivel || typeof ScrollTrigger === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
        const startLeve = () => (window.innerWidth <= 768 ? "top 78%" : "top 86%");
        const elementoVisivel = (alvo) => {
            const elemento =
                typeof alvo === "string" ? document.querySelector(alvo) : alvo;

            if (!elemento) return false;

            const rect = elemento.getBoundingClientRect();
            const alturaTela =
                window.innerHeight || document.documentElement.clientHeight;

            return rect.top < alturaTela * 0.88 && rect.bottom > 0;
        };
        const animarLeve = (alvos, trigger = alvos) => {
            if (elementoVisivel(trigger)) {
                gsap.set(alvos, {
                    opacity: 1,
                    y: 0,
                    clearProps: "transform",
                });
                return;
            }

            gsap.set(alvos, {
                opacity: 0,
                y: 10,
            });

            gsap.to(alvos, {
                opacity: 1,
                y: 0,
                duration: 0.36,
                stagger: 0.04,
                ease: "power1.out",
                clearProps: "transform",
                scrollTrigger: {
                    trigger,
                    start: startLeve,
                    once: true,
                    invalidateOnRefresh: true,
                },
            });
        };

        gsap.fromTo(
            ".animar-hero",
            { opacity: 0, y: 8 },
            {
                opacity: 1,
                y: 0,
                duration: 0.42,
                stagger: 0.06,
                ease: "power1.out",
                clearProps: "transform",
            },
        );

        gsap.utils
            .toArray(
                ".titulo_sobre_mim, .titulo_como_funciona, .titulo_feedbacks, .titulo_camiseta, .subtitulo_camiseta, .titulo_planos",
            )
            .forEach((titulo) => animarLeve(titulo));

        animarLeve(".bloco_sobre_mim");
        animarLeve(".bloco_faq", ".blocos_como_funciona");
        animarLeve(".bloco_fundo_feedbacks");
        animarLeve(".explicacao_feedbacks");
        animarLeve(".bloco_video_camiseta, .bloco_fotos_camiseta", ".bloco_camiseta");
        animarLeve(".bloco_plano", ".bloscos_planos");
        animarLeve(".footer_brand, .footer_coluna, .footer_bottom", ".footer");

        animarHeaderDesktop();

        window.addEventListener("load", () => {
            ScrollTrigger.refresh();
        });

        return;
    }

    gsap.set(".bloco_faq, .bloco_plano", {
        transformPerspective: 900,
        transformOrigin: "center 70%",
    });

    const startResponsivo = (desktop, mobile) => () =>
        window.innerWidth <= 768 ? mobile : desktop;

    const elementoJaVisivel = (alvo) => {
        const elemento =
            typeof alvo === "string" ? document.querySelector(alvo) : alvo;

        if (!elemento) return false;

        const rect = elemento.getBoundingClientRect();
        const alturaTela =
            window.innerHeight || document.documentElement.clientHeight;

        return rect.top < alturaTela * 0.86 && rect.bottom > alturaTela * 0.08;
    };

    const criarAnimacaoScroll = (
        alvos,
        estadoInicial,
        estadoFinal,
        trigger,
        start,
    ) => {
        if (elementoJaVisivel(trigger)) {
            gsap.set(alvos, {
                ...estadoFinal,
                clearProps: "transform,clipPath,filter",
            });
            return;
        }

        gsap.set(alvos, estadoInicial);

        gsap.fromTo(alvos, estadoInicial, {
            ...estadoFinal,
            immediateRender: false,
            scrollTrigger: {
                trigger,
                start,
                once: true,
                invalidateOnRefresh: true,
            },
        });
    };

    const heroTimeline = gsap.timeline({
        defaults: {
            ease: "power3.out",
        },
        delay: 0.42,
    });

    heroTimeline
        .fromTo(
            ".banner_drop_camisetas",
            { opacity: 0, y: 42, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        )
        .fromTo(
            ".banner_drop_camisetas_imagens img",
            { opacity: 0, y: 24, rotate: -2 },
            {
                opacity: 1,
                y: 0,
                rotate: 0,
                duration: 0.65,
                stagger: 0.1,
            },
            "-=0.48",
        )
        .add(() => {
            document
                .querySelector(".banner_drop_camisetas")
                ?.classList.add("banner-brilho");
        })
        .fromTo(
            ".bloco-main__tag, .bloco-main__titulo, .bloco-main__descricao",
            { opacity: 0, y: 36, filter: "blur(8px)" },
            {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.75,
                stagger: 0.12,
            },
            "-=0.34",
        )
        .fromTo(
            ".bloco-main__acoes",
            { opacity: 0, y: 22, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.58 },
            "-=0.24",
        )
        .fromTo(
            ".bloco-main__numeros span",
            { opacity: 0, y: 18 },
            {
                opacity: 1,
                y: 0,
                duration: 0.55,
                stagger: 0.08,
                onStart: animarNumerosHero,
            },
            "-=0.18",
        );

    gsap.utils
        .toArray(
            ".titulo_sobre_mim, .titulo_como_funciona, .titulo_feedbacks, .titulo_camiseta, .subtitulo_camiseta, .titulo_planos",
        )
        .forEach((titulo) => {
            criarAnimacaoScroll(
                titulo,
                { opacity: 0, y: 34, clipPath: "inset(0 0 100% 0)" },
                {
                    opacity: 1,
                    y: 0,
                    clipPath: "inset(0 0 0% 0)",
                    duration: 0.78,
                    ease: "power3.out",
                },
                titulo,
                startResponsivo("top 82%", "top 76%"),
            );
        });

    criarAnimacaoScroll(
        ".bloco_sobre_mim",
        { opacity: 0, y: 38, scale: 0.97 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.82,
            ease: "power3.out",
        },
        ".bloco_sobre_mim",
        startResponsivo("top 78%", "top 64%"),
    );

    criarAnimacaoScroll(
        ".foto_gustavo_sobre_mim",
        { opacity: 0, x: -36, scale: 0.94 },
        {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
        },
        ".bloco_sobre_mim",
        startResponsivo("top 78%", "top 64%"),
    );

    criarAnimacaoScroll(
        ".conteudo_texto > *",
        { opacity: 0, x: 28 },
        {
            opacity: 1,
            x: 0,
            duration: 0.68,
            stagger: 0.09,
            ease: "power3.out",
        },
        ".bloco_sobre_mim",
        startResponsivo("top 78%", "top 64%"),
    );

    criarAnimacaoScroll(
        ".bloco_faq",
        { opacity: 0, y: 54, scale: 0.94, rotateX: 9 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.78,
            stagger: 0.12,
            ease: "back.out(1.25)",
            clearProps: "transform",
        },
        ".blocos_como_funciona",
        startResponsivo("top 76%", "top 62%"),
    );

    criarAnimacaoScroll(
        ".bloco_fundo_feedbacks",
        { opacity: 0, y: 42, scale: 0.97 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.82,
            ease: "power3.out",
        },
        ".bloco_fundo_feedbacks",
        startResponsivo("top 78%", "top 64%"),
    );

    criarAnimacaoScroll(
        ".explicacao_feedbacks",
        { opacity: 0, y: 18 },
        {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
        },
        ".explicacao_feedbacks",
        startResponsivo("top 84%", "top 76%"),
    );

    criarAnimacaoScroll(
        ".bloco_video_camiseta, .bloco_fotos_camiseta",
        { opacity: 0, y: 54, scale: 0.95, rotateX: 7 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.78,
            stagger: 0.14,
            ease: "power3.out",
        },
        ".bloco_camiseta",
        startResponsivo("top 76%", "top 62%"),
    );

    criarAnimacaoScroll(
        ".bloco_plano",
        { opacity: 0, y: 58, scale: 0.93, rotateX: 10 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.82,
            stagger: 0.14,
            ease: "back.out(1.2)",
            clearProps: "transform",
        },
        ".bloscos_planos",
        startResponsivo("top 78%", "top 62%"),
    );

    gsap.to(".selo_destaque", {
        y: -5,
        duration: 1.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
    });

    criarAnimacaoScroll(
        ".footer_brand, .footer_coluna, .footer_bottom",
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.1,
            ease: "power3.out",
        },
        ".footer",
        startResponsivo("top 84%", "top 74%"),
    );

    animarHeaderDesktop();

    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });
}

iniciarAnimacoesGsap();

// -=-=-=-=-=-=-=-=-=-=-=-=-//
// Tela de Loading (Global) //
// -=-=-=-=-=-=-=-=-=-=-=-=-//

document.body.classList.add("loading");

let loadingFinalizado = false;
let feedbacksInicializado = false;

function iniciarFeedbacksSeguro() {
    if (feedbacksInicializado || typeof init !== "function") return;

    feedbacksInicializado = true;
    init();
}

window.hideLoading = function () {
    const loadingScreen = document.getElementById("loading-screen");

    if (!loadingScreen || loadingFinalizado) return;

    loadingFinalizado = true;

    const finalizarLoading = () => {
        document.body.classList.remove("loading");

        if (loadingScreen.parentNode) {
            loadingScreen.remove();
        }
    };

    if (gsapDisponivel) {
        gsap.killTweensOf([loadingScreen, ".loading-content"]);

        gsap.to(".loading-content", {
            opacity: 0,
            y: -6,
            duration: 0.18,
            ease: "power2.out",
        });

        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.24,
            ease: "power2.out",
            onComplete: finalizarLoading,
        });

        return;
    }

    loadingScreen.classList.add("hidden");

    setTimeout(() => {
        finalizarLoading();
    }, 250);
};

function startApp() {
    const startTime = Date.now();

    try {
        iniciarFeedbacksSeguro();
    } catch (error) {
        console.error("Erro ao iniciar componentes da página:", error);
    }

    const elapsedTime = Date.now() - startTime;

    const minimumLoadingTime = 120;

    const remainingTime = Math.max(minimumLoadingTime - elapsedTime, 0);

    const liberarLoading = () => {
        window.hideLoading?.();
    };

    setTimeout(liberarLoading, remainingTime);
}

startApp();

setTimeout(() => {
    window.hideLoading?.();
}, 1200);
