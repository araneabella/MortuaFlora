/* =====================================================
   Cliente da API Technoworks  (rota livre /rest/{ra})
   Todos os registros ficam numa só coleção e se separam pelo campo "tipo":
     interesse  -> pedido de consulta (dados do cliente + planta)  [criado pelo site]
     pedido     -> pagamento + entrega                              [criado pelo admin]
     estoque    -> quantidades por planta (1 documento)             [admin]
   Sem RA configurado, funciona em MODO TESTE (localStorage do navegador).
   ===================================================== */
(function () {
  "use strict";
  var S = window.SITE;
  var MOCK = !S.ra;
  var root = (S.apiBase || "").replace(/\/$/, "") + "/rest/" + encodeURIComponent(S.ra || "");
  var KEY = "mf_mock_db";

  function unwrap(j) { return j && typeof j === "object" && "dados" in j ? j.dados : j; }

  function http(method, url, body) {
    var opt = { method: method, headers: {} };
    if (body !== undefined) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) { var err = new Error((j && (j.erro || j.mensagem || j.message)) || ("HTTP " + r.status)); err.status = r.status; throw err; }
        return j;
      });
    });
  }

  /* ---------- modo teste ---------- */
  function dbRead() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function dbWrite(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function rid() { return "t" + Math.random().toString(36).slice(2, 10); }
  function wait(v) { return new Promise(function (ok) { setTimeout(function () { ok(v); }, 120); }); }

  var api = {
    modoTeste: MOCK,

    list: function () {
      if (MOCK) return wait(dbRead());
      return http("GET", root + "?limite=50").then(function (j) { var d = unwrap(j); return Array.isArray(d) ? d : []; });
    },
    get: function (id) {
      if (MOCK) return wait(dbRead().filter(function (x) { return x.id === id; })[0] || null);
      return http("GET", root + "/" + encodeURIComponent(id)).then(unwrap);
    },
    create: function (obj) {
      obj.criadoEm = new Date().toISOString();
      if (MOCK) { var a = dbRead(); obj.id = rid(); a.push(obj); dbWrite(a); return wait(obj); }
      return http("POST", root, obj).then(function (j) {
        var d = unwrap(j) || {}; if (!d.id && j && j.id) d.id = j.id;
        return Object.assign({}, obj, d);
      });
    },
    patch: function (id, campos) {
      if (MOCK) { var a = dbRead(); a.forEach(function (x) { if (x.id === id) Object.assign(x, campos); }); dbWrite(a); return wait(true); }
      return http("PATCH", root + "/" + encodeURIComponent(id), campos).then(unwrap);
    },
    remove: function (id) {
      if (MOCK) { dbWrite(dbRead().filter(function (x) { return x.id !== id; })); return wait(true); }
      return http("DELETE", root + "/" + encodeURIComponent(id));
    },

    /* ---------- estoque (leitura pública de UM documento só) ---------- */
    getEstoque: function () {
      if (MOCK) {
        return api.list().then(function (a) {
          var e = a.filter(function (x) { return x.tipo === "estoque"; })[0];
          return e ? e.itens : null;
        });
      }
      if (!S.estoqueId) return Promise.resolve(null);
      return api.get(S.estoqueId).then(function (d) { return d && d.itens ? d.itens : null; });
    },
    /* admin: grava (cria o documento se ainda não existir). Devolve o documento. */
    saveEstoque: function (itens) {
      return api.list().then(function (a) {
        var e = a.filter(function (x) { return x.tipo === "estoque"; })[0];
        if (e) return api.patch(e.id, { itens: itens }).then(function () { e.itens = itens; return e; });
        return api.create({ tipo: "estoque", itens: itens });
      });
    }
  };

  window.MF = window.MF || {};
  window.MF.api = api;
})();
