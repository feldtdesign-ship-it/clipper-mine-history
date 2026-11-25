(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    { key: "mine", title: "The mine", span: "1918 to 1969", test: function (k, c) { return k < "1970" && c !== "Context"; } },
    { key: "around", title: "Around the mine", span: "1957 to 1975, nearby and at Lamont", test: function (k, c) { return c === "Context"; } },
    { key: "station", title: "The station", span: "1970 to 1972", test: function (k, c) { return k >= "1970" && k < "1973" && c !== "Context"; } },
    { key: "after", title: "After the station", span: "late 1970s to 2024", test: function (k, c) { return k >= "1973" && c !== "Context"; } }
  ];

  /* Five strings, 1951 to 1970. Every item is a timeline.csv row; keep them in step. */
  var STRINGS = [
    { title: "Listening at College", color: "#8fc1e3", items: [
      { y: 1957.7, row: 0, lab: "Rainier heard at College", yr: "1957", text: "Waves from Rainier, an underground nuclear shot in Nevada, show up on the College seismogram 3,600 km away.", src: "DTIC AD0607639, report p. 5", g: "Document" },
      { y: 1963.3, row: 0, lab: "Townshend runs the observatory", yr: "1963", text: "Jack Townshend becomes chief of the College Magnetic and Seismological Observatory.", src: "UAF Centennial profile; UAF news, 2012", g: "Reported" },
      { y: 1963.94, row: 1, lab: "Lamont station opens at College", yr: "10 Dec 1963", text: "Lamont's long-period station at College starts recording, once the cooperating station has built the vault.", src: "DTIC AD0622794, Table I, report p. 4", g: "Document" }
    ] },
    { title: "Lamont underground", color: "#d9a38a", items: [
      { y: 1960.2, row: 0, lab: "1,850 ft down, Sterling Mine, NJ", yr: "early 1960", text: "Lamont installs a strain seismograph 1,850 ft down in an unused drift of the Sterling Mine, Ogdensburg, New Jersey.", src: "Alsop, Sutton and Ewing, JGR 66(2), 1961, p. 631", g: "Document" },
      { y: 1969.4, row: 1, end: true, lab: "Bulkhead-door tests", yr: "1969", text: "Ogdensburg tests behind two and three bulkhead doors set the rule: instrument tanks in an air-tight vault with a bulkhead door.", src: "DTIC AD0730950, report p. 5", g: "Document" }
    ] },
    { title: "The University on Ester Dome", color: "#a9c48f", items: [
      { y: 1963.0, row: 0, lab: "Observatory on the summit", yr: "1962 to 1963", text: "The Geophysical Institute finishes a two-story aurora observatory near the top of Ester Dome, at about 2,500 ft.", src: "GI Annual Report 1962-63, PDF p. 12", g: "Document" },
      { y: 1964.0, row: 1, lab: "Seismology, with Lamont gear", yr: "1963 to 1964", text: "The Institute starts seismology. Site noise studies use equipment on loan from Lamont.", src: "GI Annual Report 1963-64, PDF p. 69", g: "Document" }
    ] },
    { title: "People in between", color: "#c9bea9", items: [
      { y: 1959.0, row: 0, lab: "Oliver on test panel", yr: "Jan 1959", text: "Jack Oliver of Lamont sits on the federal Panel on Seismic Improvement, on detecting nuclear tests.", src: "Panel report, 7 Jan 1959, CIA-RDP80B01676R004300120011-2", g: "Document" },
      { y: 1963.45, row: 1, lab: "Ewing joins Institute advisers", yr: "Jun 1963", text: "Maurice Ewing, Lamont's director, joins the Geophysical Institute's Advisory Committee.", src: "GI Annual Report 1962-63, PDF p. 51", g: "Document" },
      { y: 1968.5, row: 0, end: true, lab: "Kienle at Lamont", yr: "1968 to 1970", text: "Jurgen Kienle spends two years at Lamont, then joins the Geophysical Institute on 1 Jul 1970.", src: "GI Annual Report 1969-70, PDF p. 128", g: "Document" }
    ] },
    { title: "The Lounsburys at the Clipper", color: "#d4a646", items: [
      { y: 1951.0, row: 0, lab: "Lloyd Lounsbury works the Clipper", yr: "1951", text: "A USGS report: the Clipper is a winding tunnel about 500 ft long, \"worked by Lloyd Lounsbury.\"", src: "USGS OFR 51-46, p. 16", g: "Document" }
    ] }
  ];

  function drawStrings() {
    var svg = document.getElementById("strings-svg");
    var list = document.getElementById("strings-list");
    if (!svg || !list) { return; }
    var ns = "http://www.w3.org/2000/svg";
    var X0 = 60, X1 = 1000, KX = 1110, KY = 260;
    function x(yr) { return X0 + (yr - 1950) * (X1 - X0) / 20; }
    function s(tag, attrs, text) {
      var e = document.createElementNS(ns, tag), k;
      for (k in attrs) { if (attrs.hasOwnProperty(k)) { e.setAttribute(k, attrs[k]); } }
      if (text) { e.textContent = text; }
      svg.appendChild(e);
      return e;
    }
    [1950, 1955, 1960, 1965, 1970].forEach(function (yr) {
      s("line", { "class": "s-axis", x1: x(yr), x2: x(yr), y1: 20, y2: 510 });
      s("text", { "class": "s-axis-t", x: x(yr), y: 540, "text-anchor": "middle" }, String(yr));
    });
    var lines = [];
    STRINGS.forEach(function (st, i) {
      var y = 60 + i * 100;
      var first = x(st.items[0].y);
      s("text", { "class": "s-title", x: X0, y: y - 22, fill: st.color }, st.title);
      s("path", { "class": "s-line", d: "M" + X0 + "," + y + " L" + first + "," + y, stroke: st.color, "stroke-dasharray": "2 6", opacity: "0.5" });
      var d = "M" + first + "," + y + " L" + X1 + "," + y + " C" + (X1 + 60) + "," + y + " " + (X1 + 50) + "," + KY + " " + KX + "," + KY;
      lines.push(s("path", { "class": "s-line", d: d, stroke: st.color }));
      st.items.forEach(function (it) {
        s("circle", { "class": "s-dot", cx: x(it.y), cy: y, r: 7, fill: st.color });
        var t = s("text", { "class": "s-lab", x: it.end ? x(it.y) + 4 : x(it.y) - 4, y: y + 26 + it.row * 19, "text-anchor": it.end ? "end" : "start" });
        var a = document.createElementNS(ns, "tspan");
        a.setAttribute("class", "y"); a.textContent = it.yr.replace(/^(early |Jan |Jun |10 Dec )/, "").slice(0, 4) + "  ";
        t.appendChild(a);
        t.appendChild(document.createTextNode(it.lab));
      });
    });
    s("circle", { "class": "s-knot-ring", cx: KX, cy: KY, r: 22 });
    s("circle", { "class": "s-knot", cx: KX, cy: KY, r: 11 });
    s("text", { "class": "s-knot-t", x: KX + 36, y: KY - 50 }, "Aug 1970");
    s("text", { "class": "s-knot-t", x: KX + 36, y: KY - 22 }, "Old Clipper Gold Mine");
    ["Owner: Lloyd Lounsbury", "Contact: Jack Townshend,", "College Observatory", "Lamont site sheet, 28 Aug 1970"].forEach(function (line, k) {
      s("text", { "class": "s-knot-s", x: KX + 36, y: KY + 8 + k * 20 }, line);
    });

    STRINGS.forEach(function (st) {
      var card = el("div", "s-card");
      card.style.setProperty("--c", st.color);
      card.appendChild(el("h3", null, st.title));
      var ol = el("ol");
      st.items.forEach(function (it) {
        var li = el("li");
        var b = el("b", null, it.yr);
        b.appendChild(el("span", "g", it.g));
        li.appendChild(b);
        li.appendChild(el("p", null, it.text));
        li.appendChild(el("span", "src", it.src));
        ol.appendChild(li);
      });
      card.appendChild(ol);
      list.appendChild(card);
    });
    var knot = el("div", "s-card knot");
    knot.appendChild(el("h3", null, "Where they meet: 28 Aug 1970"));
    var kp = el("p", null, "Lamont's site sheet for its five new high-gain stations names the Fairbanks site the \"Old Clipper Gold Mine,\" owned by Lloyd Lounsbury, with Jack Townshend of the College Observatory as principal contact. The install ran 17 Aug to 26 Sep 1970, under the same contract.");
    knot.appendChild(kp);
    knot.appendChild(el("span", "src", "DTIC AD0730950, report p. 7; DTIC AD0729918, report p. 1. Document."));
    knot.appendChild(el("p", "note", "What the strings do not show: who first proposed the Clipper, or any work in the mine before Aug 1970. Those are open questions."));
    list.appendChild(knot);

    if (reduce || !("IntersectionObserver" in window)) { return; }
    lines.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) { return; }
      io.disconnect();
      lines.forEach(function (p, k) {
        p.getBoundingClientRect();
        p.style.transition = "stroke-dashoffset 2.6s cubic-bezier(.45,0,.2,1) " + (k * 0.18) + "s";
        p.style.strokeDashoffset = "0";
      });
    }, { rootMargin: "0px 0px -20% 0px" });
    io.observe(svg);
  }

  function renderTimeline(rows) {
    var host = document.getElementById("timeline");
    host.innerHTML = "";
    ERAS.forEach(function (era) {
      var sec = el("section", "era " + era.key + " reveal");
      var head = el("div", "era-head");
      head.appendChild(el("h3", null, era.title));
      head.appendChild(el("span", null, era.span));
      sec.appendChild(head);
      rows.filter(function (r) { return era.test(r.sort_key, r.category); }).forEach(function (r) {
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
      fit = Math.min(vw * 0.94 / w, vh * 0.8 / h, 1);
      lb.classList.toggle("nozoom", fit >= 0.98);
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
      document.documentElement.style.overflow = "hidden";
      show(i);
      document.getElementById("lb-x").focus();
    }
    function close() {
      lb.classList.remove("open"); lb.hidden = true;
      document.documentElement.style.overflow = "";
      if (lastFocus) { lastFocus.focus(); }
    }
    img.addEventListener("pointerdown", function (e) {
      e.preventDefault(); moved = false;
      drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      try { img.setPointerCapture(e.pointerId); } catch (err) { }
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
        if (zoomed) { reset(); } else if (fit < 0.98) { zoomAt(e.clientX, e.clientY, 1); }
      }
      drag = null;
    });
    lb.addEventListener("wheel", function (e) {
      e.preventDefault();
      var ns = Math.min(Math.max(s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), fit), 1);
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
    var img = document.createElement("img");
    img.className = "r-img";
    img.draggable = false;
    stage.appendChild(img);
    var cur = 0;
    function url(i) { return "../" + encodeURI(SLIDES[i][0]).replace(/,/g, "%2C").replace(/'/g, "%27"); }
    function show(i) {
      cur = (i + SLIDES.length) % SLIDES.length;
      img.classList.remove("in");
      img.onload = function () { img.classList.add("in"); };
      img.src = url(cur);
      img.alt = SLIDES[cur][2];
      capT.textContent = SLIDES[cur][2];
      capS.textContent = SLIDES[cur][3];
      nEl.textContent = ("0" + (cur + 1)).slice(-2);
      new Image().src = url((cur + 1) % SLIDES.length);
    }
    document.getElementById("reel-next").addEventListener("click", function () { show(cur + 1); });
    document.getElementById("reel-prev").addEventListener("click", function () { show(cur - 1); });
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { show(cur + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { show(cur - 1); e.preventDefault(); }
      if (e.key === "Enter") { viewer.open(cur); }
    });
    var sx = null;
    stage.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    stage.addEventListener("pointerup", function (e) {
      if (sx === null) { return; }
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); } else { viewer.open(cur); }
    });
    show(0);
  }

  drawTrace();
  drawStrings();
  reel();
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
