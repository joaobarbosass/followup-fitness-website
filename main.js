(function () {
    // Config
    const scrollSpeed = 80; // velocidade base do scroll
    const smoothness = 12; // suavidade do lerp global
    const keyScrollStep = 120; // pixels por tecla (setas, pgup/down)

    // Estados
    let currentScroll = window.pageYOffset;
    let targetScroll = window.pageYOffset;
    let isLinkAnimating = false;

    // Atualiza estados iniciais ao carregar/redimensionar
    window.addEventListener("load", () => {
        currentScroll = window.pageYOffset;
        targetScroll = window.pageYOffset;
    });
    window.addEventListener("resize", () => {
        currentScroll = window.pageYOffset;
        targetScroll = window.pageYOffset;
    });

    // ===== Loop global de scroll =====
    function updateScroll() {
        if (!isLinkAnimating) {
            currentScroll += (targetScroll - currentScroll) / smoothness;
            if (Math.abs(targetScroll - currentScroll) < 0.5)
                currentScroll = targetScroll;
            window.scrollTo(0, currentScroll);
        }
        requestAnimationFrame(updateScroll);
    }
    requestAnimationFrame(updateScroll);

    // ===== Scroll via roda do mouse =====
    window.addEventListener(
        "wheel",
        (e) => {
            if (isLinkAnimating) {
                isLinkAnimating = false;
                currentScroll = window.pageYOffset;
                targetScroll = window.pageYOffset;
                return;
            }

            e.preventDefault();
            targetScroll += e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
            targetScroll = Math.max(
                0,
                Math.min(
                    targetScroll,
                    document.body.scrollHeight - window.innerHeight,
                ),
            );
        },
        { passive: false },
    );

    // ===== Função de easing =====
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    // ===== Scroll suave em links internos =====
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (!href || href === "#") return;
            e.preventDefault();

            const id = href.slice(1);
            const targetElement = document.getElementById(id);
            if (!targetElement) return;

            const header = document.querySelector("header");
            const headerStyle = header
                ? getComputedStyle(header).position
                : null;
            const headerHeight =
                header && headerStyle !== "static" ? header.offsetHeight : 0;

            const rectTop =
                targetElement.getBoundingClientRect().top + window.pageYOffset;
            const finalTarget = Math.max(0, rectTop - headerHeight);

            isLinkAnimating = true;
            const duration = 600;
            const startY = window.pageYOffset;
            const distance = finalTarget - startY;
            let startTime = null;

            function step(timestamp) {
                if (startTime === null) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const next = easeInOutQuad(
                    Math.min(elapsed, duration),
                    startY,
                    distance,
                    duration,
                );
                window.scrollTo(0, next);

                if (elapsed < duration) {
                    requestAnimationFrame(step);
                } else {
                    window.scrollTo(0, finalTarget);
                    currentScroll = finalTarget;
                    targetScroll = finalTarget;
                    try {
                        history.replaceState(null, "", "#" + id);
                    } catch (err) {}
                    isLinkAnimating = false;
                }
            }

            requestAnimationFrame(step);
        });
    });

    // ===== Scroll via teclado =====
    window.addEventListener("keydown", (e) => {
        if (isLinkAnimating) {
            isLinkAnimating = false;
            currentScroll = window.pageYOffset;
            targetScroll = window.pageYOffset;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                targetScroll += keyScrollStep;
                break;
            case "ArrowUp":
                e.preventDefault();
                targetScroll -= keyScrollStep;
                break;
            case "PageDown":
                e.preventDefault();
                targetScroll += window.innerHeight * 0.9;
                break;
            case "PageUp":
                e.preventDefault();
                targetScroll -= window.innerHeight * 0.9;
                break;
            case "Home":
                e.preventDefault();
                targetScroll = 0;
                break;
            case "End":
                e.preventDefault();
                targetScroll = document.body.scrollHeight - window.innerHeight;
                break;
            case " ": // espaço
                e.preventDefault();
                if (e.shiftKey) {
                    targetScroll -= window.innerHeight * 0.9;
                } else {
                    targetScroll += window.innerHeight * 0.9;
                }
                break;
        }

        targetScroll = Math.max(
            0,
            Math.min(
                targetScroll,
                document.body.scrollHeight - window.innerHeight,
            ),
        );
    });
})();

// ===== FAQ (abre/fecha) =====
document.querySelectorAll(".bloco_faq").forEach((bloco) => {
    bloco.addEventListener("click", () => {
        document.querySelectorAll(".bloco_faq").forEach((b) => {
            if (b !== bloco) b.classList.remove("ativo");
        });
        bloco.classList.toggle("ativo");
    });
});

// ===== Carrossel =====
document.addEventListener("DOMContentLoaded", function () {
    const main = new Splide("#main-slider", {
        type: "loop",
        perPage: 1,
        autoplay: false, // autoplay desativado
        arrows: true,
        pagination: true,
        speed: 600,
        easing: "cubic-bezier(.25,.8,.25,1)",
        lazyLoad: "nearby",
        keyboard: "global",
        trimSpace: false,
    });

    main.mount();

    // Acessibilidade: navegação por teclado
    const mainNode = document.getElementById("main-slider");
    if (mainNode) {
        mainNode.setAttribute("tabindex", "0");
        mainNode.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") main.go("<");
            if (e.key === "ArrowRight") main.go(">");
        });
    }
});
