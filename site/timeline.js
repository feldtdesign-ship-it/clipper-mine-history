(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.Flip !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  function drawTrace() {
    var svg = document.getElementById("trace");
    if (!svg) { return; }
    var ns = "http://www.w3.org/2000/svg";
    var W = 1200, mid = 80, pts = [], x, y, t, env, seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - 0.5; }
    for (x = 0; x <= W; x += 2) {
      t = x / W;
      y = rnd() * 3 + Math.sin(x * 0.09) * 1.2;
      env = Math.exp(-Math.pow((t - 0.62) / 0.12, 2));
      y += env * (Math.sin(x * 0.045) * 52 + Math.sin(x * 0.11 + 1.3) * 14);
      env = Math.exp(-Math.pow((t - 0.42) / 0.025, 2));
      y += env * rnd() * 46;
      pts.push(x + "," + (mid + y).toFixed(1));
    }
    var base = document.createElementNS(ns, "path");
    base.setAttribute("class", "base");
    base.setAttribute("d", "M0," + mid + " L" + W + "," + mid);
    svg.appendChild(base);
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", "M" + pts.join(" L"));
    svg.appendChild(p);
    if (reduce) { return; }
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    p.getBoundingClientRect();
    p.style.transition = "stroke-dashoffset 4.5s cubic-bezier(.45,0,.2,1) 0.9s";
    p.style.strokeDashoffset = "0";
  }

  function walkIn() {
    var gallery = document.getElementById("walk");
    if (!gallery) { return; }
    if (!hasGsap || reduce) { gallery.classList.add("switch"); return; }
    gsap.registerPlugin(ScrollTrigger, Flip);
    if (typeof window.Lenis !== "undefined") {
      var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on("scroll", function () { ScrollTrigger.update(); });
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    var items = gallery.querySelectorAll(".w-item");
    var cap = gallery.querySelector(".w-caption");
    gallery.classList.add("switch");
    var state = Flip.getState([items, cap], { props: "filter, opacity" });
    gallery.classList.remove("switch");
    Flip.to(state, {
      ease: "none",
      absolute: false,
      scale: true,
      simple: true,
      scrollTrigger: { trigger: gallery, start: "center center", end: "+=300%", pin: gallery.parentNode, scrub: true }
    });
  }

  function reveals() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduce) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  function parseCSV(text) {
    var rows = [], row = [], field = "", q = false, i, c;
    for (i = 0; i < text.length; i += 1) {
      c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
        else if (c === '"') { q = false; }
        else { field += c; }
      } else if (c === '"') { q = true; }
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== "\r") { field += c; }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    var head = rows.shift();
    return rows.filter(function (r) { return r.length > 1; }).map(function (r) {
      var o = {};
      head.forEach(function (h, k) { o[h] = r[k] || ""; });
      return o;
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text) { e.textContent = text; }
    return e;
  }

  var ERAS = [
    { key: "mine", title: "The mine", span: "1918 to 1969", test: function (k) { return k < "1970"; } },
    { key: "station", title: "The station", span: "1970 to 1972", test: function (k) { return k >= "1970" && k < "1973"; } },
    { key: "after", title: "After the station", span: "late 1970s to 2024", test: function (k) { return k >= "1973"; } }
  ];

  function renderTimeline(rows) {
    var host = document.getElementById("timeline");
    host.innerHTML = "";
    ERAS.forEach(function (era) {
      var sec = el("section", "era " + era.key + " reveal");
      var head = el("div", "era-head");
      head.appendChild(el("h3", null, era.title));
      head.appendChild(el("span", null, era.span));
      sec.appendChild(head);
      rows.filter(function (r) { return era.test(r.sort_key); }).forEach(function (r) {
        var row = el("article", "row");
        row.dataset.cat = r.category;
        row.appendChild(el("div", "yr", r.date));
        var body = el("div", "body");
        body.appendChild(el("p", "ev", r.event));
        var meta = el("div", "meta");
        meta.appendChild(el("span", "grade g-" + r.evidence_grade.toLowerCase(), r.evidence_grade));
        meta.appendChild(el("span", "cat", r.category));
        body.appendChild(meta);
        body.appendChild(el("span", "src", r.source + ". " + r.locator + "."));
        if (r.notes) { body.appendChild(el("p", "note", r.notes)); }
        row.appendChild(body);
        sec.appendChild(row);
      });
      host.appendChild(sec);
    });
    reveals();
    if (hasGsap && !reduce) { ScrollTrigger.refresh(); }
  }

  function filters() {
    var buttons = document.querySelectorAll(".filters button");
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons, function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        var f = b.getAttribute("data-filter");
        Array.prototype.forEach.call(document.querySelectorAll("#timeline .era"), function (sec) {
          var shown = 0;
          Array.prototype.forEach.call(sec.querySelectorAll(".row"), function (row) {
            var ok = f === "All" || row.dataset.cat === f;
            row.hidden = !ok;
            if (ok) { shown += 1; }
          });
          sec.hidden = shown === 0;
        });
        if (hasGsap && !reduce) { ScrollTrigger.refresh(); }
      });
    });
  }

  var SLIDES = [
    ["photos/Lamont 1971 plates/Lamont 1971, Plate 7, door photo crop.png", "dark", "The white door: entrance to the Old Clipper Seismic Station.", "Lamont 1971, Plate 7, report p. 52. DTIC AD0729918."],
    ["maps/DGGS 1982, Plate 1 crop, Lamont-Doherty seismograph station (abandoned).png", "paper", "The 1982 mine map labels the side drift \"Lamont-Doherty Seismograph Station (Abandoned)\", with steel doors.", "DGGS OFR 157, Plate 1, 1982."],
    ["maps/Lamont 1971, Figure II-1, Old Clipper mine plan.png", "paper", "The 1971 plan of the Old Clipper Gold Mine, with the area to be enlarged for the station.", "Lamont 1971, Figure II-1, report p. 12."],
    ["maps/Lamont 1971, Figure I-2, station location map.png", "paper", "The report's own location map. The New Vault arrow sits at Section 32.", "Lamont 1971, Figure I-2, report p. 4."],
    ["maps/DGGS 1982, Plate 1 crop, portal, house and garage.png", "paper", "Plate 1: the \"Timbered Entry to Mine Workings\" runs from the house and garage into the hill.", "DGGS OFR 157, Plate 1, 1982."],
    ["maps/DGGS 1982, Plate 1 crop, location map.png", "paper", "Plate 1 location map: the Clipper Mine on Eva Creek, north of the town of Ester.", "DGGS OFR 157, Plate 1, 1982."],
    ["maps/USMS 2493 Grass Valley mineral survey plat, recorded 2001.jpg", "paper", "Mineral Survey No. 2493, Grass Valley (lode): shaft, spring, cabin, outbuilding, stripping area, road and power line.", "USMS 2493 plat, recorded 2001 (recording number 50-2001-0164)."],
    ["maps/USGS Fairbanks D-3 topo 1949.jpg", "paper", "The 1949 topographic map. Ester Dome is on the right side of the sheet.", "USGS Fairbanks (D-3) quadrangle, 1949."],
    ["documents/Nash's News 2013 Aug, page 9, Clipper Mine Picnic.jpg", "paper", "July 2013: a car club picnic and tour of the mine.", "Nash's News, Aug 2013, p. 9, Vernon L. Nash Antique Auto Club. Reproduced with credit, as the masthead allows."],
    ["model/Model v2 still, portal and drift (approx, from Plate 1 1982).png", "dark", "Our model: the portal, the main drift and the station side drift. Approximate, traced from Plate 1.", "Our render, model v2. Not a survey."],
    ["model/Model v2 still, station side drift from above (approx, from Plate 1 1982).png", "dark", "Our model from above: the station side drift off the main drift. Position only.", "Our render, model v2. Not a survey."]
  ];


  var viewer = (function () {
    var lb = document.getElementById("lb");
    var img = document.getElementById("lb-img");
    var idx = 0, s = 1, fit = 1, tx = 0, ty = 0, zoomed = false, drag = null, moved = false, lastFocus = null;
    if (!lb) { return { open: function () {} }; }
    img.style.left = "0"; img.style.top = "0"; img.style.maxWidth = "none"; img.style.maxHeight = "none";
    function apply() { img.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")"; }
    function reset() {
      var w = img.naturalWidth || 1, h = img.naturalHeight || 1;
      var vw = window.innerWidth, vh = window.innerHeight;
      fit = Math.min(vw * 0.94 / w, vh * 0.8 / h);
      s = fit; zoomed = false; lb.classList.remove("zoomed");
      tx = (vw - w * s) / 2; ty = (vh * 0.9 - h * s) / 2;
      apply();
    }
    function zoomAt(cx, cy, ns) {
      var ix = (cx - tx) / s, iy = (cy - ty) / s;
      s = ns; tx = cx - ix * s; ty = cy - iy * s;
      zoomed = s > fit * 1.01; lb.classList.toggle("zoomed", zoomed);
      apply();
    }
    function show(i) {
      idx = (i + SLIDES.length) % SLIDES.length;
      img.style.visibility = "hidden";
      img.onload = function () { reset(); img.style.visibility = "visible"; };
      img.src = "../" + encodeURI(SLIDES[idx][0]).replace(/,/g, "%2C").replace(/'/g, "%27");
      img.alt = SLIDES[idx][2];
      document.getElementById("lb-t").textContent = SLIDES[idx][2];
      document.getElementById("lb-s").textContent = SLIDES[idx][3];
    }
    function open(i) {
      lastFocus = document.activeElement;
      lb.hidden = false; lb.classList.add("open");
      if (window.__lenis) { window.__lenis.stop(); }
      document.documentElement.style.overflow = "hidden";
      show(i);
      document.getElementById("lb-x").focus();
    }
    function close() {
      lb.classList.remove("open"); lb.hidden = true;
      if (window.__lenis) { window.__lenis.start(); }
      document.documentElement.style.overflow = "";
      if (lastFocus) { lastFocus.focus(); }
    }
    img.addEventListener("pointerdown", function (e) {
      e.preventDefault(); moved = false;
      drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      img.setPointerCapture(e.pointerId);
    });
    img.addEventListener("pointermove", function (e) {
      if (!drag) { return; }
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) { moved = true; }
      if (zoomed && moved) { lb.classList.add("drag"); tx = drag.tx + dx; ty = drag.ty + dy; apply(); }
    });
    img.addEventListener("pointerup", function (e) {
      lb.classList.remove("drag");
      if (!moved) {
        if (zoomed) { reset(); } else { zoomAt(e.clientX, e.clientY, Math.max(fit * 3, 1)); }
      }
      drag = null;
    });
    lb.addEventListener("wheel", function (e) {
      e.preventDefault();
      var ns = Math.min(Math.max(s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), fit), fit * 8);
      zoomAt(e.clientX, e.clientY, ns);
    }, { passive: false });
    lb.addEventListener("click", function (e) { if (e.target === lb) { close(); } });
    document.getElementById("lb-x").addEventListener("click", close);
    document.getElementById("lb-prev").addEventListener("click", function () { show(idx - 1); });
    document.getElementById("lb-next").addEventListener("click", function () { show(idx + 1); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) { return; }
      if (e.key === "Escape") { close(); }
      else if (e.key === "ArrowRight") { show(idx + 1); }
      else if (e.key === "ArrowLeft") { show(idx - 1); }
    });
    window.addEventListener("resize", function () { if (!lb.hidden) { reset(); } });
    return { open: open };
  })();

  function reel() {
    var stage = document.getElementById("reel-stage");
    if (!stage) { return; }
    var capT = document.querySelector("#reel-cap .t");
    var capS = document.querySelector("#reel-cap .src");
    var nEl = document.getElementById("reel-n");
    document.getElementById("reel-t").textContent = ("0" + SLIDES.length).slice(-2);
    var track = el("div", "r-track");
    stage.appendChild(track);
    var tiles = SLIDES.map(function (s, i) {
      var b = el("button", "r-tile");
      b.type = "button";
      b.setAttribute("aria-label", s[2]);
      var im = document.createElement("img");
      im.alt = "";
      im.draggable = false;
      im.decoding = "async";
      im.src = "../" + encodeURI(s[0]).replace(/,/g, "%2C").replace(/'/g, "%27");
      im.addEventListener("load", function () { center(false); });
      b.appendChild(im);
      b.addEventListener("click", function () {
        if (moved) { return; }
        if (i === cur) { viewer.open(cur); } else { goTo(i); }
      });
      track.appendChild(b);
      return b;
    });
    var cur = 0, moved = false;
    function center(animate) {
      var t = tiles[cur];
      var x = stage.clientWidth / 2 - (t.offsetLeft + t.offsetWidth / 2);
      if (hasGsap && animate) { gsap.set(track, { x: x }); } else { track.style.transform = "translateX(" + x + "px)"; }
    }
    function caption() {
      capT.textContent = SLIDES[cur][2];
      capS.textContent = SLIDES[cur][3];
      nEl.textContent = ("0" + (cur + 1)).slice(-2);
    }
    function mark() {
      tiles.forEach(function (t, k) {
        t.classList.toggle("cur", k === cur);
        t.setAttribute("aria-current", k === cur ? "true" : "false");
      });
    }
    function order() {
      var n = tiles.length, h = Math.floor(n / 2), k;
      for (k = -h; k < n - h; k += 1) { track.appendChild(tiles[(cur + k + n) % n]); }
    }
    function goTo(i) {
      var next = (i + tiles.length) % tiles.length;
      if (next === cur) { return; }
      var anim = hasGsap && !reduce;
      var before = tiles.map(function (t) { return t.getBoundingClientRect().left; });
      var state = anim ? Flip.getState(tiles) : null;
      cur = next; order(); mark(); center(false); caption();
      if (anim) {
        var jumpers = tiles.filter(function (t, k) { return Math.abs(t.getBoundingClientRect().left - before[k]) > stage.clientWidth * 0.6; });
        Flip.from(state, { duration: 1.1, ease: "power3.inOut", scale: false, simple: true, targets: tiles.filter(function (t) { return jumpers.indexOf(t) < 0; }) });
        if (jumpers.length) { gsap.fromTo(jumpers, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.5 }); }
        gsap.fromTo("#reel-cap .t", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.35, ease: "power3.out" });
      }
    }
    order(); mark(); caption();
    requestAnimationFrame(function () { center(false); });
    window.addEventListener("resize", function () { center(false); });
    window.addEventListener("load", function () { center(false); });
    document.getElementById("reel-next").addEventListener("click", function () { goTo(cur + 1); });
    document.getElementById("reel-prev").addEventListener("click", function () { goTo(cur - 1); });
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { goTo(cur + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { goTo(cur - 1); e.preventDefault(); }
    });
    var sx = null;
    stage.addEventListener("pointerdown", function (e) { sx = e.clientX; moved = false; });
    stage.addEventListener("pointermove", function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 8) { moved = true; } });
    stage.addEventListener("pointerup", function (e) {
      if (sx === null) { return; }
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { goTo(cur + (dx < 0 ? 1 : -1)); }
      setTimeout(function () { moved = false; }, 0);
    });
  }

  drawTrace();
  reel();
  walkIn();
  reveals();
  filters();

  fetch("../timeline.csv")
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var rows = parseCSV(text).sort(function (a, b) { return a.sort_key < b.sort_key ? -1 : 1; });
      renderTimeline(rows);
    })
    .catch(function () {
      var host = document.getElementById("timeline");
      host.innerHTML = "";
      host.appendChild(el("p", "loading", "Could not load timeline.csv. Open this page through a web server, not as a file."));
    });
})();
