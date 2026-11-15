(function () {
  "use strict";
  var S = window.SITE;
  var enc = encodeURIComponent;

  /* ---------- Links fixos ---------- */
  function wa(texto) {
    return "https://wa.me/" + S.whatsapp + "?text=" + enc(texto);
  }
  function setHref(id, href) {
    var el = document.getElementById(id);
    if (el) el.href = href;
  }
  setHref("link-fale-conosco", wa(S.mensagemContato));
  setHref("link-whatsapp", wa(S.mensagemContato));
  setHref("link-instagram", "https://www.instagram.com/" + S.instagram + "/");
  setHref("link-telefone", "tel:+" + S.telefoneFixo);
  setHref("link-mapa", "https://www.google.com/maps/search/?api=1&query=" + enc(S.endereco));

  /* ---------- Disponibilidade ----------
     Hoje: abre o WhatsApp com a pergunta pronta.
     Depois (com banco de dados): preencha SITE.apiDisponibilidade e esta
     função passa a mostrar "Disponível / Indisponível" direto no cartão. */
  function linkConsulta(p) {
    var msg = "Olá! Gostaria de consultar a disponibilidade da planta " +
      p.nome + " (" + p.cientifico + ").";
    return wa(msg);
  }

  function carregarDisponibilidade(cards) {
    if (!S.apiDisponibilidade) return;
    fetch(S.apiDisponibilidade)
      .then(function (r) { return r.json(); })
      .then(function (dados) {
        // Formato esperado: { "cobra-lily": true, "black-bat": false, ... }
        cards.forEach(function (c) {
          var status = dados[c.id];
          if (typeof status === "undefined") return;
          var badge = c.el.querySelector(".plant__status");
          badge.textContent = status ? "Disponível" : "Indisponível";
          badge.classList.add(status ? "is-yes" : "is-no");
        });
      })
      .catch(function () { /* se a API falhar, o botão do WhatsApp continua funcionando */ });
  }

  /* ---------- Cartões de planta ---------- */
  function criarCard(p, destaqueClasse) {
    var li = document.createElement("article");
    li.className = "plant " + (destaqueClasse || "");
    li.tabIndex = 0;
    li.setAttribute("data-id", p.id);
    li.innerHTML =
      '<div class="plant__photo">' +
        '<img src="' + p.foto + '" alt="' + p.nome + ' (' + p.cientifico + ')" loading="lazy">' +
        '<div class="plant__overlay">' +
          '<span class="plant__status" aria-live="polite"></span>' +
          '<a class="plant__cta" href="' + linkConsulta(p) + '" target="_blank" rel="noopener">Consultar disponibilidade</a>' +
        '</div>' +
      '</div>' +
      '<h3 class="plant__name">' + p.nome + '</h3>' +
      '<p class="plant__sci">(' + p.cientifico + ')</p>';
    return li;
  }

  var destaque = document.getElementById("plantas-destaque");
  var grade = document.getElementById("plantas-grade");
  var cards = [];

  window.PLANTAS.forEach(function (p) {
    var el = criarCard(p, p.destaque ? "plant--big" : "");
    (p.destaque ? destaque : grade).appendChild(el);
    cards.push({ id: p.id, el: el });
  });

  /* Em telas de toque (sem "hover"): 1º toque abre o painel, toque fora fecha */
  var semHover = window.matchMedia("(hover: none)").matches;
  if (semHover) {
    document.addEventListener("click", function (e) {
      var card = e.target.closest(".plant");
      var jaAbertos = document.querySelectorAll(".plant.is-open");
      jaAbertos.forEach(function (c) { if (c !== card) c.classList.remove("is-open"); });
      if (card && !e.target.closest(".plant__cta")) card.classList.toggle("is-open");
    });
  } else {
    document.querySelectorAll(".hint--touch").forEach(function (h) { h.hidden = true; });
  }

  carregarDisponibilidade(cards);

  /* ---------- Destaca o item do menu da seção visível ---------- */
  var links = document.querySelectorAll(".topbar__nav a[href^='#']");
  var secoes = Array.prototype.map.call(links, function (a) {
    return document.querySelector(a.getAttribute("href"));
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secoes.forEach(function (s) { if (s) io.observe(s); });
  }
})();
