/* ==========================================================================
   main.js — comportamentos pequenos. O site funciona sem JavaScript;
   isto só melhora a experiência.
   1. Fotos que ainda não existem mostram um aviso (data-hint)
   2. Menu destaca a seção que está na tela
   3. Cabeçalho ganha uma linha depois que a página rola
   4. Os fios que saem das portas e chegam à linha do tempo
   ========================================================================== */

(() => {
  "use strict";

  /* 1. Fotos ----------------------------------------------------------------
     Cada <figure data-photo> tem um <img>. Se o arquivo não existir, a figura
     recebe .is-empty e o CSS mostra o texto de data-hint no lugar. */
  function markEmpty(figure) {
    figure.classList.add("is-empty");
  }

  document.querySelectorAll("[data-photo]").forEach((figure) => {
    const img = figure.querySelector("img");
    if (!img) {
      markEmpty(figure);
      return;
    }
    // A imagem pode ter falhado antes deste script rodar
    if (img.complete && img.naturalWidth === 0) {
      markEmpty(figure);
    }
    img.addEventListener("error", () => markEmpty(figure));
    img.addEventListener("load", () => figure.classList.remove("is-empty"));
  });

  /* 2. Menu: seção atual ----------------------------------------------------- */
  const links = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
            if (isCurrent) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      // Conta como "atual" a seção que cruza a faixa do meio da tela
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }

  /* 3. Cabeçalho ------------------------------------------------------------ */
  const header = document.querySelector("[data-header]");
  if (header) {
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* 4. Fios do início --------------------------------------------------------
     Cada fio sai do meio de uma porta e termina exatamente em cima do fio
     reto da linha do tempo. Como isso depende da largura da tela, o desenho
     é refeito quando a janela muda de tamanho. O vermelho (cuidar) vem da
     porta da direita e termina à esquerda do azul: por isso eles se cruzam. */
  const braid = document.querySelector("[data-braid]");
  const probe = document.querySelector("[data-braid-probe]");
  const doorBuild = document.querySelector(".door--build");
  const doorCare = document.querySelector(".door--care");

  if (braid && probe && doorBuild && doorCare) {
    const buildPath = braid.querySelector(".braid__build");
    const carePath = braid.querySelector(".braid__care");

    const drawBraid = () => {
      const box = braid.getBoundingClientRect();
      if (!box.width) return; // escondido no celular

      const w = box.width;
      const h = box.height;
      const ruler = getComputedStyle(probe);
      const half = parseFloat(getComputedStyle(buildPath).strokeWidth) / 2 || 1.5;
      const laneCare = parseFloat(ruler.width) + half;
      const laneBuild = parseFloat(ruler.paddingLeft) + half;
      const middleOf = (el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - box.left;
      };
      // Sai reto da porta e chega reto no fio (por isso os pontos de controle
      // repetem o x do começo e o x do fim)
      const curve = (x0, x1, a, b) =>
        `M${x0} 0 C${x0} ${h * a}, ${x1} ${h * b}, ${x1} ${h}`;

      braid.setAttribute("viewBox", `0 0 ${w} ${h}`);
      buildPath.setAttribute("d", curve(middleOf(doorBuild), laneBuild, 0.55, 0.45));
      carePath.setAttribute("d", curve(middleOf(doorCare), laneCare, 0.85, 0.2));
    };

    drawBraid();
    window.addEventListener("resize", drawBraid);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawBraid);
  }
})();
