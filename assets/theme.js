(function () {
  var html = document.documentElement,
    body = document.body;
  var store = {
    get: function (k) {
      try {
        return localStorage.getItem('gg-' + k);
      } catch (e) {
        return null;
      }
    },
    set: function (k, v) {
      try {
        localStorage.setItem('gg-' + k, v);
      } catch (e) {}
    },
  };
  function $(s, r) {
    return (r || document).querySelector(s);
  }
  function $$(s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  }
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var mode = store.get('mode') || body.getAttribute('data-appearance') || 'auto';
  function applyMode() {
    var dark = mode === 'dark' || (mode === 'auto' && mq.matches);
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    $$('[data-mode]').forEach(function (b) {
      var on = b.getAttribute('data-mode') === mode;
      b.classList.toggle('on', on);
    });
    if (typeof icoStyle !== 'undefined') applyIco();
  }
  if (mq.addEventListener) {
    mq.addEventListener('change', applyMode);
  }
  applyMode();
  var range = $('#glass-range'),
    g = store.get('glass');
  function setGlass(v) {
    html.style.setProperty('--glass', (v / 100).toFixed(2));
    range.value = v;
    range.style.setProperty('--t', ((v - 35) / 60).toFixed(3));
  }
  setGlass(g ? parseInt(g, 10) : 72);
  range.addEventListener('input', function () {
    setGlass(this.value);
    store.set('glass', this.value);
  });
  var icoStyle = store.get('icostyle') || body.getAttribute('data-icostyle') || 'default';
  if (icoStyle === 'auto') icoStyle = 'default';
  function applyIco() {
    var eff = icoStyle === 'default' ? (html.getAttribute('data-theme') === 'dark' ? 'dark' : 'default') : icoStyle;
    html.setAttribute('data-icon-style', eff);
    $$('[data-icostyle]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-icostyle') === icoStyle);
    });
  }
  applyIco();
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-icostyle]');
    if (!b || !b.closest('#cc')) return;
    icoStyle = b.getAttribute('data-icostyle');
    store.set('icostyle', icoStyle);
    applyIco();
  });
  var showIcons = store.get('icons') !== null ? store.get('icons') === '1' : body.getAttribute('data-icons') === '1';
  var showWidgets =
    store.get('widgets') !== null ? store.get('widgets') === '1' : body.getAttribute('data-widgets') === '1';
  function applyToggles() {
    body.classList.toggle('hide-icons', !showIcons);
    body.classList.toggle('hide-widgets', !showWidgets);
    $$('[data-cmd="icons"]').forEach(function (b) {
      b.classList.toggle('on', showIcons);
    });
    $$('[data-cmd="widgets"]').forEach(function (b) {
      b.classList.toggle('on', showWidgets);
    });
    $$('#cc [data-cmd="icons"] .cc-state').forEach(function (x) {
      x.textContent = showIcons ? 'On' : 'Off';
    });
    $$('#cc [data-cmd="widgets"] .cc-state').forEach(function (x) {
      x.textContent = showWidgets ? 'On' : 'Off';
    });
    if (typeof freezeDesktop === 'function') {
      frozen = false;
      setTimeout(freezeDesktop, 0);
    }
  }
  applyToggles();
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var h24 = body.getAttribute('data-24h') === '1';
  function tick() {
    var d = new Date(),
      h = d.getHours(),
      m = ('0' + d.getMinutes()).slice(-2),
      t;
    if (h24) {
      t = ('0' + h).slice(-2) + ':' + m;
    } else {
      t = (h % 12 || 12) + ':' + m + (h < 12 ? ' AM' : ' PM');
    }
    $('#clock').textContent = days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + '  ' + t;
  }
  tick();
  setInterval(tick, 1e4);
  (function cal() {
    var d = new Date(),
      full = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $('#w-dow').textContent = full[d.getDay()];
    $('#w-day').textContent = d.getDate();
    var first = new Date(d.getFullYear(), d.getMonth(), 1).getDay(),
      n = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
      out = '';
    'SMTWTFS'.split('').forEach(function (c) {
      out += '<b>' + c + '</b>';
    });
    for (var i = 0; i < first; i++) out += '<span></span>';
    for (var k = 1; k <= n; k++) out += '<span' + (k === d.getDate() ? ' class="today"' : '') + '>' + k + '</span>';
    $('#w-grid').innerHTML = out;
  })();
  var openMenu = null;
  function closeMenus() {
    $$('.menu.show').forEach(function (m) {
      m.classList.remove('show');
    });
    $$('.mb-item.open').forEach(function (b) {
      b.classList.remove('open');
    });
    openMenu = null;
  }
  function showMenu(btn) {
    var id = btn.getAttribute('data-menu'),
      m = document.getElementById(id);
    if (!m) return;
    closeMenus();
    m.classList.add('show');
    btn.classList.add('open');
    openMenu = btn;
    if (id !== 'cc') {
      var r = btn.getBoundingClientRect();
      m.style.left = Math.min(r.left, window.innerWidth - m.offsetWidth - 8) + 'px';
    }
  }
  $$('[data-menu]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      if (openMenu === b) {
        closeMenus();
      } else {
        showMenu(b);
      }
    });
    b.addEventListener('mouseenter', function () {
      if (openMenu && openMenu !== b) showMenu(b);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.menu')) closeMenus();
  });
  var finder = $('#finder'),
    z = 200;
  function focusWin(w) {
    z++;
    w.style.zIndex = z;
    $$('.win').forEach(function (x) {
      x.classList.toggle('blur-state', x !== w);
    });
  }
  function openWin(id) {
    var w = document.getElementById(id);
    if (!w) return;
    var f = $('iframe[data-src]', w);
    if (f && !f.src) {
      f.src = f.getAttribute('data-src');
    }
    w.classList.remove('hidden', 'min');
    focusWin(w);
    var dk = $('.dk[data-win="' + id + '"]');
    if (dk) dk.classList.add('running');
  }
  function closeWin(w) {
    w.classList.add('hidden');
    if (w.id === 'finder') {
      $('#dk-home').classList.remove('running');
    }
    var dk = $('.dk[data-win="' + w.id + '"]');
    if (dk) dk.classList.remove('running');
  }
  $$('.win').forEach(function (w) {
    w.addEventListener('mousedown', function () {
      focusWin(w);
    });
  });
  focusWin(finder);
  var wide = function () {
    return window.innerWidth > 820;
  };
  function loadPos(k) {
    try {
      return JSON.parse(store.get('pos-' + k) || 'null');
    } catch (e) {
      return null;
    }
  }
  function savePos(k, x, y) {
    store.set('pos-' + k, JSON.stringify([Math.round(x), Math.round(y)]));
  }
  function clamp(el, x, y) {
    var minX = el.classList.contains('win') ? -el.offsetWidth + 80 : 0,
      maxX = window.innerWidth - (el.classList.contains('win') ? 80 : el.offsetWidth);
    var maxY = window.innerHeight - (el.classList.contains('win') ? 60 : el.offsetHeight);
    return [Math.max(minX, Math.min(maxX, x)), Math.max(30, Math.min(maxY, y))];
  }
  function place(el, x, y) {
    var p = clamp(el, x, y);
    el.style.position = 'fixed';
    el.style.left = p[0] + 'px';
    el.style.top = p[1] + 'px';
    el.style.right = 'auto';
    return p;
  }
  function draggable(el, handle, key, isWin) {
    var sx,
      sy,
      ox,
      oy,
      down = false,
      moved = false;
    handle.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.pointerType === 'touch' || !wide()) return;
      if (isWin && (e.target.closest('button,a,input,.lights') || el.classList.contains('max'))) return;
      var r = el.getBoundingClientRect();
      down = true;
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
      ox = r.left;
      oy = r.top;
      if (!isWin) e.preventDefault();
    });
    document.addEventListener('pointermove', function (e) {
      if (!down) return;
      if (!moved) {
        if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 5) return;
        moved = true;
        el.classList.add('dragging');
        if (isWin) {
          el.classList.add('dragged');
          el.style.transition = 'none';
          focusWin(el);
        }
      }
      place(el, ox + e.clientX - sx, oy + e.clientY - sy);
    });
    document.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) {
        el.classList.remove('dragging');
        if (isWin) el.style.transition = '';
        var r = el.getBoundingClientRect();
        savePos(key, r.left, r.top);
        el._dragged = true;
        setTimeout(function () {
          el._dragged = false;
        }, 50);
      }
    });
    el.addEventListener(
      'click',
      function (e) {
        if (el._dragged) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
  }
  var frozen = false;
  function freezeDesktop() {
    if (frozen || !wide()) return;
    var els = $$('.d-icon').concat($$('.widget')),
      rects = els.map(function (x) {
        return x.getBoundingClientRect();
      });
    if (
      rects.some(function (r) {
        return r.width === 0;
      })
    )
      return;
    els.forEach(function (x, i) {
      x.style.position = 'fixed';
      x.style.left = rects[i].left + 'px';
      x.style.top = rects[i].top + 'px';
      x.style.margin = '0';
      if (x.classList.contains('widget')) x.style.width = rects[i].width + 'px';
    });
    els.forEach(function (x) {
      var p = loadPos(x._key);
      if (p) place(x, p[0], p[1]);
    });
    frozen = true;
  }
  function unfreezeDesktop() {
    $$('.d-icon')
      .concat($$('.widget'))
      .forEach(function (x) {
        x.style.position = x.style.left = x.style.top = x.style.right = x.style.margin = x.style.width = '';
      });
    frozen = false;
  }
  $$('.d-icon').forEach(function (ic) {
    ic._key = 'icon-' + (ic.getAttribute('data-win') || ic.getAttribute('data-href')) + '-' + ic.textContent.trim();
    draggable(ic, ic, ic._key, false);
  });
  $$('.widget').forEach(function (w, i) {
    w._key = 'widget-' + i;
    draggable(w, w, w._key, false);
  });
  $$('[data-drag]').forEach(function (bar) {
    var w = bar.closest('.win');
    draggable(w, bar, 'win-' + w.id, true);
  });
  draggable(finder, $('.sidebar', finder), 'win-finder', true);
  $$('.win').forEach(function (w) {
    var p = loadPos('win-' + w.id);
    if (p && wide()) {
      w.classList.add('dragged');
      place(w, p[0], p[1]);
    }
  });
  window.addEventListener('load', freezeDesktop);
  setTimeout(freezeDesktop, 300);
  function cleanUp() {
    $$('.d-icon')
      .concat($$('.widget'))
      .forEach(function (x) {
        store.set('pos-' + x._key, '');
      });
    unfreezeDesktop();
    setTimeout(freezeDesktop, 0);
  }
  function resetWindows() {
    $$('.win').forEach(function (w) {
      store.set('pos-win-' + w.id, '');
      w.classList.remove('dragged');
      w.style.position = w.style.left = w.style.top = w.style.right = '';
    });
  }
  function run(cmd, el) {
    var w = (el && el.closest('.win')) || finder;
    switch (cmd) {
      case 'close':
        closeWin(w);
        break;

      case 'min':
        w.classList.add('min');
        break;

      case 'max':
        if (w === finder) {
          finder.classList.toggle('max');
          finder.style.left = '';
          finder.style.top = '';
          finder.classList.remove('dragged');
        }
        break;

      case 'restore':
        finder.classList.remove('hidden', 'min');
        focusWin(finder);
        $('#dk-home').classList.add('running');
        break;

      case 'front':
        $$('.win:not(.hidden)').forEach(function (x) {
          x.classList.remove('min');
        });
        break;

      case 'back':
        goPage('newer');
        break;

      case 'fwd':
        goPage('older');
        break;

      case 'spot':
        openSpot();
        break;

      case 'cc':
        setTimeout(function () {
          showMenu($('[data-menu="cc"]'));
        }, 0);
        break;

      case 'icons':
        showIcons = !showIcons;
        store.set('icons', showIcons ? '1' : '0');
        applyToggles();
        break;

      case 'widgets':
        showWidgets = !showWidgets;
        store.set('widgets', showWidgets ? '1' : '0');
        applyToggles();
        break;

      case 'cleanup':
        cleanUp();
        break;

      case 'copylink':
        (function () {
          var top = null,
            zz = -1;
          $$('.win:not(.hidden):not(.min)').forEach(function (x) {
            var v = parseInt(x.style.zIndex || 0, 10);
            if (x.id !== 'finder' && v > zz) {
              zz = v;
              top = x;
            }
          });
          copyLink(top);
        })();
        break;

      case 'resetwin':
        resetWindows();
        break;
    }
  }
  document.addEventListener('click', function (e) {
    var m = e.target.closest('[data-mode]');
    if (m) {
      mode = m.getAttribute('data-mode');
      store.set('mode', mode);
      applyMode();
      return;
    }
    var o = e.target.closest('[data-open]');
    if (o) {
      e.preventDefault();
      closeMenus();
      openWin(o.getAttribute('data-open'));
      return;
    }
    var c = e.target.closest('[data-cmd]');
    if (c) {
      var cmd = c.getAttribute('data-cmd');
      if (
        c.id === 'dk-home' &&
        !finder.classList.contains('hidden') &&
        !finder.classList.contains('min') &&
        __ggPath() !== '/'
      ) {
        return;
      }
      e.preventDefault();
      if (cmd !== 'cc' && !c.closest('#cc')) closeMenus();
      run(cmd, c);
      if (c.classList.contains('dk')) {
        c.classList.add('bounce');
        setTimeout(function () {
          c.classList.remove('bounce');
        }, 1e3);
      }
      return;
    }
    var wbtn = e.target.closest('.dk[data-win],.sb-a[data-win]');
    if (wbtn) {
      e.preventDefault();
      openWin(wbtn.getAttribute('data-win'));
    }
  });
  var touch = matchMedia('(hover: none)').matches;
  $$('.d-icon').forEach(function (ic) {
    ic.addEventListener('click', function (e) {
      e.preventDefault();
      $$('.d-icon.sel').forEach(function (x) {
        x.classList.remove('sel');
      });
      ic.classList.add('sel');
      if (touch) go(ic);
    });
    ic.addEventListener('dblclick', function () {
      go(ic);
    });
  });
  function go(ic) {
    var w = ic.getAttribute('data-win');
    if (w) {
      openWin(w);
    } else {
      location.href = ic.getAttribute('data-href');
    }
  }
  $('#wall').addEventListener('click', function () {
    $$('.d-icon.sel').forEach(function (x) {
      x.classList.remove('sel');
    });
  });
  var path = __ggPath();
  $$('.sb-a[data-path]').forEach(function (a) {
    var p = (a.getAttribute('data-path') || '').replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
    if (p === path) a.classList.add('on');
  });
  $('#sb-toggle').addEventListener('click', function () {
    finder.classList.toggle('sb-open');
  });
  $('.content', finder).addEventListener('click', function () {
    finder.classList.remove('sb-open');
  });
  if (!$('.sidebar .sb-tags-h + .sb-a')) {
    var th = $('.sb-tags-h');
    if (th) th.style.display = 'none';
  }
  var spot = $('#spot'),
    sin = $('#spot-in'),
    slist = $('#spot-list'),
    idx = 0;
  var items = [
    {
      t: 'Home',
      u: 'index.html',
      k: 'Folder',
    },
    {
      t: 'Archive',
      u: '#gg-archive',
      k: 'Folder',
    },
    {
      t: 'Random Post',
      u: 'random.html',
      k: 'Action',
    },
    {
      t: 'About This Blog',
      w: 'w-about',
      k: 'Window',
    },
    {
      t: 'Links',
      w: 'w-links',
      k: 'Window',
    },
  ];
  if ($('#w-ask'))
    items.push({
      t: 'Ask',
      w: 'w-ask',
      k: 'Window',
    });
  if ($('#w-msg'))
    items.push({
      t: 'Messages',
      w: 'w-msg',
      k: 'Window',
    });
  if ($('#w-photos'))
    items.push({
      t: 'Photos',
      w: 'w-photos',
      k: 'Window',
    });
  $$('#m-go a').forEach(function (a) {
    var t = a.textContent.trim();
    if (
      !items.some(function (i) {
        return i.t === t;
      })
    )
      items.push({
        t: t,
        u: a.getAttribute('href'),
        k: 'Page',
      });
  });
  function openSpot() {
    closeMenus();
    spot.classList.add('show');
    sin.value = '';
    render();
    sin.focus();
    setTimeout(function () {
      sin.focus();
    }, 30);
  }
  function closeSpot() {
    spot.classList.remove('show');
  }
  function render() {
    var q = sin.value.trim().toLowerCase(),
      res = q
        ? items.filter(function (i) {
            return i.t.toLowerCase().indexOf(q) > -1;
          })
        : [];
    var out = res
      .map(function (i, n) {
        return (
          '<a href="' +
          (i.u || '#') +
          '" data-w="' +
          (i.w || '') +
          '"' +
          (n === idx ? ' class="act"' : '') +
          '>' +
          i.t +
          '<small>' +
          i.k +
          '</small></a>'
        );
      })
      .join('');
    if (q)
      out +=
        '<a href="search.html?q=' +
        encodeURIComponent(q) +
        '"' +
        (res.length === idx ? ' class="act"' : '') +
        '>Search posts for “' +
        q.replace(/</g, '&lt;') +
        '”<small>Search</small></a>';
    slist.innerHTML = out;
    slist.classList.toggle('has', !!q);
  }
  sin.addEventListener('input', function () {
    idx = 0;
    render();
  });
  sin.addEventListener('keydown', function (e) {
    var links = $$('a', slist);
    if (e.key === 'ArrowDown') {
      idx = Math.min(idx + 1, links.length - 1);
      render();
      e.preventDefault();
    }
    if (e.key === 'ArrowUp') {
      idx = Math.max(idx - 1, 0);
      render();
      e.preventDefault();
    }
    if (e.key === 'Enter' && links[idx]) {
      e.preventDefault();
      links[idx].click();
    }
  });
  slist.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a && a.getAttribute('data-w')) {
      e.preventDefault();
      closeSpot();
      openWin(a.getAttribute('data-w'));
    }
  });
  $('#spot-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = sin.value.trim();
    if (q) location.href = 'search.html?q=' + encodeURIComponent(q);
  });
  $('#mb-search').addEventListener('click', function (e) {
    e.stopPropagation();
    openSpot();
  });
  document.addEventListener('click', function (e) {
    if (spot.classList.contains('show') && !e.target.closest('#spot,#mb-search,[data-cmd="spot"]')) closeSpot();
  });
  $$('.tb-search').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = f.q.value.trim();
      if (q) location.href = 'search.html?q=' + encodeURIComponent(q);
    });
  });
  (function () {
    var w = $('#w-music');
    if (!w) return;
    var audio = $('.wm-audio', w),
      list = $('.wm-list', w),
      tracks = [],
      cur = 0,
      jn = 0;
    $$('.wm-src i', w).forEach(function (i) {
      var q = (i.getAttribute('data-q') || '').trim(),
        au = (i.getAttribute('data-audio') || '').trim();
      if (!q) return;
      var parts = q.split(/\s+[-–—]\s+/);
      tracks.push({
        q: q,
        title: parts[0],
        artist: parts[1] || '',
        art: '',
        src: au,
        link: '',
        ready: !!au,
      });
    });
    if (!tracks.length) {
      w.style.display = 'none';
      return;
    }
    function fmt(t) {
      t = Math.max(0, Math.floor(t || 0));
      return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
    }
    function jsonp(url, cb) {
      var name = 'ggTune' + ++jn,
        sc = document.createElement('script'),
        done = false;
      window[name] = function (d) {
        done = true;
        cb(d);
        try {
          delete window[name];
        } catch (e) {
          window[name] = undefined;
        }
        sc.remove();
      };
      sc.src = url + '&callback=' + name;
      sc.onerror = function () {
        if (!done) cb(null);
      };
      setTimeout(function () {
        if (!done) {
          done = true;
          cb(null);
        }
      }, 8e3);
      document.head.appendChild(sc);
    }
    function renderList() {
      list.innerHTML = '';
      tracks.forEach(function (t, i) {
        var li = document.createElement('li');
        if (i === cur) li.className = 'cur';
        var im = t.art ? document.createElement('img') : document.createElement('i');
        if (t.art) {
          im.src = t.art;
          im.alt = '';
        } else {
          im.className = 'ph';
        }
        var sp = document.createElement('span'),
          b = document.createElement('b'),
          sm = document.createElement('small');
        b.textContent = t.title;
        sm.textContent = t.artist;
        sp.appendChild(b);
        sp.appendChild(sm);
        var eq = document.createElement('span');
        eq.className = 'wm-eq';
        eq.innerHTML = '<i></i><i></i><i></i>';
        li.appendChild(im);
        li.appendChild(sp);
        li.appendChild(eq);
        li.addEventListener('click', function () {
          load(i, true);
        });
        list.appendChild(li);
      });
    }
    function show() {
      var t = tracks[cur],
        img = $('.wm-art img', w);
      $('.wm-title', w).textContent = t.title;
      $('.wm-artist', w).textContent = t.artist;
      if (t.art) {
        img.src = t.art.replace('100x100', '300x300');
        img.hidden = false;
        $('.wm-art', w).classList.add('has-img');
      } else {
        img.hidden = true;
        $('.wm-art', w).classList.remove('has-img');
      }
      var o = $('.wm-open', w);
      if (t.link) {
        o.href = t.link;
      } else {
        o.removeAttribute('href');
      }
      renderList();
      if ('mediaSession' in navigator && window.MediaMetadata) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: t.title,
            artist: t.artist,
            artwork: t.art
              ? [
                  {
                    src: t.art.replace('100x100', '512x512'),
                    sizes: '512x512',
                  },
                ]
              : [],
          });
        } catch (e) {}
      }
    }
    function load(i, play) {
      cur = (i + tracks.length) % tracks.length;
      var t = tracks[cur];
      audio.src = t.src || '';
      show();
      tick();
      if (play && t.src) {
        var pr = audio.play();
        if (pr && pr.catch) pr.catch(function () {});
      } else if (play && !t.src) {
        toast('Preview not available');
      }
    }
    function tick() {
      var d = audio.duration || 30,
        c = audio.currentTime || 0;
      $('.wm-bar i', w).style.width = Math.min(1, c / d) * 100 + '%';
      $('.wm-cur', w).textContent = fmt(c);
      $('.wm-left', w).textContent = '-' + fmt(d - c);
    }
    audio.addEventListener('timeupdate', tick);
    audio.addEventListener('loadedmetadata', tick);
    audio.addEventListener('play', function () {
      w.classList.add('playing');
      $('.wm-play', w).title = 'Pause';
    });
    audio.addEventListener('pause', function () {
      w.classList.remove('playing');
      $('.wm-play', w).title = 'Play';
    });
    audio.addEventListener('ended', function () {
      load(cur + 1, true);
    });
    audio.addEventListener('error', function () {
      if (audio.getAttribute('src')) toast('This song could not be played');
    });
    $('.wm-play', w).addEventListener('click', function () {
      if (!audio.getAttribute('src')) {
        load(cur, true);
        return;
      }
      if (audio.paused) {
        var pr = audio.play();
        if (pr && pr.catch) pr.catch(function () {});
      } else {
        audio.pause();
      }
    });
    $('.wm-next', w).addEventListener('click', function () {
      load(cur + 1, !audio.paused || w.classList.contains('playing'));
    });
    $('.wm-prev', w).addEventListener('click', function () {
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }
      load(cur - 1, w.classList.contains('playing'));
    });
    $('.wm-list-btn', w).addEventListener('click', function () {
      list.hidden = !list.hidden;
      this.classList.toggle('on', !list.hidden);
    });
    $('.wm-bar', w).addEventListener('click', function (e) {
      if (!audio.duration) return;
      var r = this.getBoundingClientRect();
      audio.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * audio.duration;
    });
    $('.wm-bar', w).addEventListener('keydown', function (e) {
      if (!audio.duration) return;
      if (e.key === 'ArrowRight') audio.currentTime += 5;
      if (e.key === 'ArrowLeft') audio.currentTime -= 5;
      e.stopPropagation();
    });
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('nexttrack', function () {
          load(cur + 1, true);
        });
        navigator.mediaSession.setActionHandler('previoustrack', function () {
          load(cur - 1, true);
        });
      } catch (e) {}
    }
    show();
    tracks.forEach(function (t, i) {
      jsonp(
        'https://itunes.apple.com/search?media=music&entity=song&limit=1&term=' + encodeURIComponent(t.q),
        function (d) {
          var r = d && d.results && d.results[0];
          if (r) {
            t.title = r.trackName || t.title;
            t.artist = r.artistName || t.artist;
            t.art = r.artworkUrl100 || '';
            t.link = r.trackViewUrl || '';
            if (!t.src) t.src = r.previewUrl || '';
          }
          t.ready = true;
          if (i === cur) {
            if (!audio.getAttribute('src') && t.src) audio.src = t.src;
            show();
          } else {
            renderList();
          }
        },
      );
    });
  })();
  var pager = $('#pager');
  function pageUrl(dir) {
    return pager ? (pager.getAttribute('data-' + dir) || '').trim() : '';
  }
  function goPage(dir) {
    var u = pageUrl(dir);
    if (u) location.href = u;
  }
  if (pager) {
    var isPerma = body.classList.contains('is-permalink');
    [
      ['back', 'newer', isPerma ? 'Newer post' : 'Newer posts'],
      ['fwd', 'older', isPerma ? 'Older post' : 'Older posts'],
    ].forEach(function (x) {
      var b = $('[data-cmd="' + x[0] + '"]', pager);
      if (!b) return;
      b.title = x[2];
      b.setAttribute('aria-label', x[2]);
      b.classList.toggle('off', !pageUrl(x[1]));
    });
  }
  document.addEventListener('keydown', function (e) {
    var cmd = e.metaKey || e.ctrlKey,
      typing = /input|textarea/i.test(e.target.tagName);
    if (e.key === 'Escape') {
      closeSpot();
      closeMenus();
      return;
    }
    if (cmd && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSpot();
    }
    if (!typing && e.key === '/') {
      e.preventDefault();
      openSpot();
    }
    if (!typing && !cmd && !e.altKey && !spot.classList.contains('show')) {
      if (e.key === 'ArrowLeft' && pageUrl('newer')) goPage('newer');
      if (e.key === 'ArrowRight' && pageUrl('older')) goPage('older');
    }
  });
  var map = {
    text: ['.txt', 'TXT', '#8e8e93'],
    photo: ['.HEIC', 'HEIC', '#ff9f0a'],
    panorama: ['.HEIC', 'HEIC', '#ff9f0a'],
    photoset: ['.pdf', 'PDF', '#ff453a'],
    quote: ['.rtf', 'RTF', '#5e5ce6'],
    link: ['.webloc', 'URL', '#0a84ff'],
    chat: ['', 'CHAT', '#30d158'],
    video: ['.mov', 'MOV', '#bf5af2'],
    audio: ['.m4a', 'M4A', '#ff375f'],
    answer: ['', 'MAIL', '#0a84ff'],
  };
  $$('.file').forEach(function (f) {
    var t = f.getAttribute('data-type'),
      b = $('.file-body', f);
    if (t === 'text') {
      var imgs = $$('img', b).length,
        vids = $$('video,iframe[src*="video"],.npf_video, figure[data-npf*="video"]', b).length,
        aud = $$('audio,figure[data-npf*="audio"]', b).length;
      var words = (b.textContent || '').replace(/\s+/g, ' ').trim().split(' ').length;
      if (vids) t = 'video';
      else if (aud) t = 'audio';
      else if (imgs > 1 && words < 60) t = 'photoset';
      else if (imgs === 1 && words < 60) t = 'photo';
    }
    var m = map[t] || map.text;
    if (t === 'chat' || t === 'answer') {
      var d = $('.fn-date', f);
      if (d) d.remove();
    }
    $('.ext', f).textContent = m[0];
    $('.badge b', f).textContent = m[1];
    $('.badge', f).style.setProperty('--bc', m[2]);
  });
  (function () {
    var currentPath = decodeURIComponent(__ggPath()).replace(/\/+$/, '') || '/';
    var pageLabel = '';
    $$('.sb-a[data-path]').forEach(function (link) {
      if (pageLabel) return;
      try {
        var path =
          decodeURIComponent(new URL(link.getAttribute('data-path'), location.origin).pathname).replace(/\/+$/, '') ||
          '/';
        if (path === currentPath) {
          pageLabel = link.textContent.trim();
        }
      } catch (e) {}
    });
    if (!pageLabel) return;
    var cleanTitle = pageLabel.replace(/\.txt$/i, '').trim();
    var filename = cleanTitle.replace(/\s+/g, '_') + '.txt';
    $$('.file').forEach(function (f) {
      var name = $('.fn-date', f);
      var ext = $('.ext', f);
      var heading = $('.ptitle', f);
      var body = $('.file-body', f);
      if (name && !name.textContent.trim()) {
        name.textContent = filename.replace(/\.txt$/i, '');
        if (ext) ext.textContent = '.txt';
      }
      if (heading && body) {
        var firstContent = Array.from(body.children).find(function (el) {
          return !el.classList.contains('via') && !el.classList.contains('ptitle');
        });
        var firstHeading =
          firstContent && (firstContent.matches('h1,h2,h3') ? firstContent : firstContent.querySelector('h1,h2,h3'));
        function normalize(s) {
          return (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
        }
        if (firstHeading && normalize(firstHeading.textContent) === normalize(heading.textContent)) {
          heading.remove();
        }
      }
    });
    var toolbarTitle = $('.t-perma');
    if (toolbarTitle) toolbarTitle.textContent = filename;
  })();
  (function () {
    var currentPath = decodeURIComponent(__ggPath()).replace(/\/+$/, '') || '/';
    var pageLabel = '';
    $$('.sb-a[data-path]').forEach(function (link) {
      if (pageLabel) return;
      try {
        var linkPath =
          decodeURIComponent(new URL(link.getAttribute('data-path'), location.origin).pathname).replace(/\/+$/, '') ||
          '/';
        if (linkPath === currentPath && currentPath !== '/') {
          pageLabel = link.textContent.trim();
        }
      } catch (e) {}
    });
    if (!pageLabel) return;
    var filename = pageLabel
      .replace(/\.txt$/i, '')
      .trim()
      .replace(/\s+/g, '_');
    body.classList.add('is-custom-page');
    $$('.file').forEach(function (f) {
      var name = $('.fn-date', f);
      var ext = $('.ext', f);
      var badge = $('.badge b', f);
      var badgeIcon = $('.badge', f);
      var title = $('.file-body .ptitle', f);
      if (name) name.textContent = filename;
      if (ext) ext.textContent = '.txt';
      if (badge) badge.textContent = 'TXT';
      if (badgeIcon) {
        badgeIcon.style.setProperty('--bc', '#8e8e93');
      }
      if (title) title.remove();
    });
    var toolbar = $('.t-perma');
    if (toolbar) toolbar.textContent = filename + '.txt';
  })();
  $$('.file').forEach(function (f) {
    if ($('.pin-badge', f)) f.classList.add('is-pinned');
  });
  if (body.classList.contains('is-permalink') && !body.classList.contains('is-custom-page')) {
    var first = $('.file .fname');
    var toolbar = $('.t-perma');
    if (first && toolbar) {
      toolbar.textContent = first.textContent.replace(/\s+/g, '');
    }
  }
  if (body.classList.contains('is-tag') || body.classList.contains('is-search') || body.classList.contains('is-day')) {
    var ti = $('.t-index');
    if (ti) ti.remove();
  }
  (function () {
    var dock = $('#dock'),
      items = $$('.dk', dock),
      MAX = 1.6,
      RANGE = 150,
      raf = 0,
      mx = 0,
      fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    function update() {
      raf = 0;
      items.forEach(function (d) {
        var r = d.getBoundingClientRect(),
          c = r.left + r.width / 2,
          t = Math.max(0, 1 - Math.abs(mx - c) / RANGE);
        d.style.setProperty('--s', (1 + (MAX - 1) * (0.5 - 0.5 * Math.cos(Math.PI * t))).toFixed(3));
      });
    }
    dock.addEventListener('mousemove', function (e) {
      if (!wide()) return;
      mx = e.clientX;
      dock.classList.add('magnify');
      if (!raf) raf = requestAnimationFrame(update);
    });
    dock.addEventListener('mouseleave', function () {
      dock.classList.remove('magnify');
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      items.forEach(function (d) {
        d.style.setProperty('--s', '1');
      });
    });
  })();
  $$('.f-actions .lk').forEach(function (lk) {
    function sync() {
      lk.classList.toggle('liked', !!lk.querySelector('.liked'));
    }
    sync();
    if (window.MutationObserver) {
      new MutationObserver(sync).observe(lk, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  });
  (function () {
    var w = $('#w-about');
    if (!w) return;
    $$('[data-split]', w).forEach(function (ul) {
      (ul.getAttribute('data-split') || '').split(/\s*[,;]\s*/).forEach(function (t) {
        if (!t) return;
        var li = document.createElement('li');
        li.textContent = t;
        ul.appendChild(li);
      });
    });
    $$('.n-custom', w).forEach(function (n) {
      var raw = $('.n-raw', n),
        out = $('.n-body', n),
        list = null,
        kind = '';
      if (!raw || !out) return;
      raw.textContent.split(/\s*\|\s*/).forEach(function (line) {
        line = line.trim();
        if (!line) {
          list = null;
          return;
        }
        var c0 = line.charAt(0).toLowerCase(),
          sp = line.charAt(1) === ' ',
          todo = sp && c0 === 'o';
        var k = sp && c0 === '-' ? 'bul' : sp && (c0 === '+' || todo) ? 'check' : sp && c0 === '#' ? 'h' : '';
        var txt = k ? line.slice(2) : line,
          el;
        if (k === 'bul' || k === 'check') {
          if (!list || kind !== k) {
            list = document.createElement('ul');
            list.className = k === 'bul' ? 'n-bul' : 'n-check';
            out.appendChild(list);
            kind = k;
          }
          el = document.createElement('li');
          el.textContent = txt;
          if (todo) el.className = 'todo';
          list.appendChild(el);
          return;
        }
        list = null;
        el = document.createElement(k === 'h' ? 'h3' : 'p');
        el.textContent = txt;
        out.appendChild(el);
      });
    });
    $$('.nl-item', w).forEach(function (it) {
      var n = document.getElementById(it.getAttribute('data-note')),
        sn = $('.nl-snip', it);
      if (n && sn) {
        var src = $('.n-intro, .n-sub, .n-body p, .n-body li, li, p', n);
        sn.textContent = src ? src.textContent.replace(/\s+/g, ' ').trim() : '';
      }
      it.addEventListener('click', function () {
        $$('.nl-item', w).forEach(function (x) {
          x.classList.toggle('on', x === it);
        });
        $$('.nt-note', w).forEach(function (x) {
          x.classList.toggle('on', x === n);
        });
        if (!w.classList.contains('hidden')) setHash(slugFor(w));
      });
    });
    var c = $$('.nl-item', w).length;
    $('#nl-count').textContent = c + (c === 1 ? ' note' : ' notes');
  })();
  (function () {
    var w = $('#w-msg');
    if (!w) return;
    function initials(t) {
      t = (t || '').trim();
      var p = t.split(/\s+/);
      return (p[0] ? p[0].charAt(0) : '') + (p.length > 1 ? p[p.length - 1].charAt(0) : '');
    }
    $$('.m-ini', w).forEach(function (i) {
      i.textContent = initials(i.textContent).toUpperCase();
      i.style.width = 'auto';
    });
    var emojiOnly = null;
    try {
      var L = '{',
        R = '}';
      emojiOnly = new RegExp(
        '^(\\p' + L + 'Extended_Pictographic' + R + '|\\p' + L + 'Emoji_Component' + R + '|\\s)' + L + '1,6' + R + '$',
        'u',
      );
    } catch (e) {}
    $$('.m-chat', w).forEach(function (ch) {
      var me = (ch.getAttribute('data-me') || '').trim().toLowerCase(),
        th = $('.m-thread', ch),
        raw = $('.m-raw', ch);
      var lines = (raw ? raw.textContent : '').split(/\s*\|\s*/),
        prev = null,
        prevWho = '',
        names = {},
        out = [],
        delay = 0;
      lines.forEach(function (l) {
        var m = l.match(/^([^:>@<!]{1,40}):\s*(.+)$/);
        if (m) names[m[1].trim().toLowerCase()] = 1;
      });
      var multi =
        Object.keys(names).filter(function (n) {
          return n !== me;
        }).length > 1;
      lines.forEach(function (l) {
        l = l.trim();
        if (!l) return;
        var side = '',
          who = '',
          txt = l,
          m;
        if (l === '...' || l === '…') {
          side = 'them';
          txt = '';
          who = '__typing';
        } else if (l.charAt(0) === '@') {
          out.push({
            stamp: l.slice(1).trim(),
          });
          prev = null;
          return;
        } else if (l.charAt(0) === '!') {
          out.push({
            receipt: l.slice(1).trim() || 'Read',
          });
          return;
        } else if (l.charAt(0) === '>') {
          side = 'me';
          txt = l.slice(1).trim();
        } else if (l.charAt(0) === '<') {
          side = 'them';
          txt = l.slice(1).trim();
        } else if ((m = l.match(/^([^:]{1,40}):\s*(.+)$/))) {
          who = m[1].trim();
          txt = m[2];
          side = who.toLowerCase() === me ? 'me' : 'them';
        } else {
          side = 'them';
        }
        if (who !== '__typing' && /^(\.\.\.|…)$/.test((txt || '').trim())) {
          out.push({
            side: side,
            who: who,
            txt: '',
            typing: 1,
          });
          return;
        }
        out.push({
          side: side,
          who: who,
          txt: txt,
        });
      });
      out.forEach(function (o, i) {
        var el;
        if (o.stamp !== undefined) {
          el = document.createElement('div');
          el.className = 'm-stamp';
          el.textContent = o.stamp;
          th.appendChild(el);
          prev = null;
          return;
        }
        if (o.receipt !== undefined) {
          el = document.createElement('div');
          el.className = 'm-receipt';
          el.textContent = o.receipt;
          th.appendChild(el);
          return;
        }
        var next = out[i + 1],
          last = !next || next.side !== o.side || (next.who !== o.who && o.side === 'them') || next.stamp !== undefined;
        if (
          multi &&
          o.side === 'them' &&
          o.who &&
          o.who !== '__typing' &&
          (!prev || prev.side !== 'them' || prev.who !== o.who)
        ) {
          var n = document.createElement('div');
          n.className = 'm-who';
          n.textContent = o.who;
          th.appendChild(n);
        }
        el = document.createElement('div');
        if (o.who === '__typing' || o.typing) {
          el.className =
            'bub ' + (o.side || 'them') + ' tail typing' + (prev && prev.side !== (o.side || 'them') ? ' gap' : '');
          el.innerHTML = '<i></i><i></i><i></i>';
        } else {
          el.className = 'bub ' + o.side + (last ? ' tail' : '') + (prev && prev.side !== o.side ? ' gap' : '');
          try {
            if (emojiOnly && emojiOnly.test(o.txt)) el.className += ' emoji';
          } catch (e) {}
          el.textContent = o.txt;
        }
        el.style.animationDelay = Math.min(delay, 1.6) + 's';
        delay += 0.07;
        th.appendChild(el);
        prev = o;
      });
      var item = $('.ml-item[data-chat="' + ch.id + '"] .ml-snip', w),
        lastTxt = out
          .filter(function (o) {
            return o.txt;
          })
          .pop();
      if (item && lastTxt) item.textContent = lastTxt.txt;
    });
    function replay(ch) {
      $$('.bub', ch).forEach(function (b) {
        b.style.animation = 'none';
        void b.offsetWidth;
        b.style.animation = '';
      });
      var t = $('.m-thread', ch);
      t.scrollTop = t.scrollHeight;
    }
    $$('.ml-item', w).forEach(function (it) {
      it.addEventListener('click', function () {
        var ch = document.getElementById(it.getAttribute('data-chat'));
        $$('.ml-item', w).forEach(function (x) {
          x.classList.toggle('on', x === it);
        });
        $$('.m-chat', w).forEach(function (x) {
          x.classList.toggle('on', x === ch);
        });
        if (ch) replay(ch);
        if (!w.classList.contains('hidden')) setHash(slugFor(w));
      });
    });
    var first = $('.m-chat.on .m-thread', w);
    if (first)
      setTimeout(function () {
        first.scrollTop = first.scrollHeight;
      }, 50);
  })();
  (function () {
    var w = $('#w-photos');
    if (!w) return;
    var grid = $('.ph-grid', w),
      view = $('.ph-view', w),
      img = $('.pv-img', w),
      vid = $('.pv-vid', w),
      tiles = $$('.ph-tile', w),
      shown = [],
      idx = 0,
      filter = 'all';
    tiles.forEach(function (t) {
      var v = (t.getAttribute('data-video') || '').trim();
      if (v) t.classList.add('is-video');
      if (v) {
        var probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.src = v;
        probe.addEventListener('loadedmetadata', function () {
          var d = Math.round(probe.duration || 0);
          if (d) $('.ph-dur', t).textContent = Math.floor(d / 60) + ':' + ('0' + (d % 60)).slice(-2);
        });
      }
      t.addEventListener('click', function () {
        open(shown.indexOf(t));
      });
    });
    function albumOf(t) {
      return t.getAttribute('data-album') || '1';
    }
    function counts() {
      var nv = tiles.filter(function (t) {
        return t.classList.contains('is-video');
      }).length;
      $('.ph-n-all', w).textContent = tiles.filter(function (t) {
        return albumOf(t) === '1';
      }).length;
      var a2 = $('.ph-n-a2', w);
      var b2 = $('.ph-filter[data-filter="album2"]', w);
      if (b2)
        b2.style.display = tiles.some(function (t) {
          return albumOf(t) === '2';
        })
          ? ''
          : 'none';
      if (a2)
        a2.textContent = tiles.filter(function (t) {
          return albumOf(t) === '2';
        }).length;
      $('.ph-n-vid', w).textContent = nv;
      $('.ph-filter[data-filter="video"]', w).style.display = nv ? '' : 'none';
    }
    function apply() {
      shown = tiles.filter(function (t) {
        var ok =
          filter === 'video' ? t.classList.contains('is-video') : albumOf(t) === (filter === 'album2' ? '2' : '1');
        t.classList.toggle('hide', !ok);
        return ok;
      });
      var n = shown.length;
      $('.ph-count', w).textContent =
        n + (filter === 'video' ? (n === 1 ? ' video' : ' videos') : n === 1 ? ' item' : ' items');
    }
    $$('.ph-filter', w).forEach(function (b) {
      b.addEventListener('click', function () {
        filter = b.getAttribute('data-filter');
        $$('.ph-filter', w).forEach(function (x) {
          x.classList.toggle('on', x === b);
        });
        close();
        apply();
      });
    });
    $('.ph-zoom input', w).addEventListener('input', function () {
      w.style.setProperty('--ph', this.value + 'px');
    });
    function show() {
      var t = shown[idx];
      if (!t) return;
      var v = (t.getAttribute('data-video') || '').trim(),
        full = t.getAttribute('data-full'),
        cap = t.getAttribute('data-cap') || '';
      vid.pause();
      if (v) {
        img.hidden = true;
        vid.hidden = false;
        vid.poster = full;
        vid.src = v;
      } else {
        vid.hidden = true;
        vid.removeAttribute('src');
        vid.load();
        img.hidden = false;
        img.src = full;
        img.alt = cap;
      }
      $('.pv-cap', w).textContent = cap;
      $('.pv-pos', w).textContent = idx + 1 + ' of ' + shown.length;
      $('.pv-open', w).href = v || full;
      $('.pv-prev', w).disabled = idx <= 0;
      $('.pv-next', w).disabled = idx >= shown.length - 1;
      var n = tiles.indexOf(t) + 1;
      if (!w.classList.contains('hidden')) setHash('photo' + n);
    }
    function open(i) {
      if (i < 0) return;
      idx = i;
      view.hidden = false;
      show();
    }
    function close() {
      if (view.hidden) return;
      view.hidden = true;
      vid.pause();
      if (!w.classList.contains('hidden')) setHash('photos');
    }
    w._openPhoto = function (n) {
      filter = 'all';
      $$('.ph-filter', w).forEach(function (x) {
        x.classList.toggle('on', x.getAttribute('data-filter') === 'all');
      });
      apply();
      var t = tiles[n - 1];
      if (t) open(shown.indexOf(t));
    };
    w._isViewing = function () {
      return !view.hidden;
    };
    $('.pv-close', w).addEventListener('click', close);
    $('.pv-prev', w).addEventListener('click', function () {
      if (idx > 0) {
        idx--;
        show();
      }
    });
    $('.pv-next', w).addEventListener('click', function () {
      if (idx < shown.length - 1) {
        idx++;
        show();
      }
    });
    document.addEventListener(
      'keydown',
      function (e) {
        if (view.hidden || w.classList.contains('hidden') || w.classList.contains('min')) return;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopImmediatePropagation();
          $('.pv-prev', w).click();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          e.stopImmediatePropagation();
          $('.pv-next', w).click();
        } else if (e.key === 'Escape') {
          e.stopImmediatePropagation();
          close();
        }
      },
      true,
    );
    var sx = null;
    view.addEventListener(
      'touchstart',
      function (e) {
        sx = e.touches[0].clientX;
      },
      {
        passive: true,
      },
    );
    view.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) $(dx < 0 ? '.pv-next' : '.pv-prev', w).click();
    });
    var _cw = closeWin;
    closeWin = function (x) {
      if (x === w) {
        view.hidden = true;
        vid.pause();
      }
      _cw(x);
    };
    $$('.ph-filter', w).forEach(function (b) {
      b.addEventListener('click', function () {
        var s = $('span', b);
        if (s) $('.ph-title', w).textContent = s.textContent;
      });
    });
    counts();
    apply();
  })();
  var WIN_SLUG = {
      'w-ask': 'ask',
      'w-links': 'links',
    },
    CHAT_SLUG = {
      c1: 'chat1',
      c2: 'chat2',
      c3: 'chat3',
    },
    NOTE_SLUG = {
      'n-about': 'about',
      'n-links': 'about-links',
      'n-c1': 'note1',
      'n-c2': 'note2',
      'n-c3': 'note3',
      'n-c4': 'note4',
      'n-c5': 'note5',
    };
  function slugFor(w) {
    if (!w) return '';
    if (w.id === 'w-about') {
      var on = $('.nl-item.on', w);
      return NOTE_SLUG[on ? on.getAttribute('data-note') : 'n-about'] || 'about';
    }
    if (w.id === 'w-photos') {
      return 'photos';
    }
    if (w.id === 'w-msg') {
      var oc = $('.ml-item.on', w),
        cid = oc ? oc.getAttribute('data-chat') : 'c1';
      return cid === 'c1' ? 'messages' : CHAT_SLUG[cid];
    }
    return WIN_SLUG[w.id] || '';
  }
  function setHash(slug) {
    try {
      history.replaceState(null, '', location.pathname + location.search + (slug ? '#' + slug : ''));
    } catch (e) {}
  }
  function route() {
    var h = (location.hash || '').replace(/^#/, '').toLowerCase();
    if (!h) return;
    if (h === 'ask' || h === 'links') {
      if (document.getElementById('w-' + h)) openWin('w-' + h);
      return;
    }
    if (h === 'photos' || /^photo\d+$/.test(h)) {
      var pw = $('#w-photos');
      if (!pw) return;
      openWin('w-photos');
      if (h !== 'photos' && pw._openPhoto) pw._openPhoto(parseInt(h.slice(5), 10));
      return;
    }
    if (h === 'messages' || /^chat[1-3]$/.test(h)) {
      var mi = $('#w-msg .ml-item[data-chat="c' + (h === 'messages' ? 1 : h.slice(4)) + '"]');
      if (!mi) return;
      openWin('w-msg');
      mi.click();
      return;
    }
    for (var nid in NOTE_SLUG) {
      if (NOTE_SLUG[nid] === h) {
        var item = $('#w-about .nl-item[data-note="' + nid + '"]');
        if (!item) return;
        openWin('w-about');
        item.click();
        return;
      }
    }
  }
  var _open = openWin,
    _close = closeWin;
  openWin = function (id) {
    _open(id);
    var sl = slugFor(document.getElementById(id));
    if (sl) setHash(sl);
  };
  closeWin = function (w) {
    _close(w);
    var sl = slugFor(w);
    if (sl && location.hash.replace('#', '') === sl) setHash('');
  };
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(function () {
      t.classList.remove('show');
    }, 1800);
  }
  function copyLink(w) {
    var sl = slugFor(w);
    if (!sl) {
      toast('This window has no link');
      return;
    }
    var url = location.href.replace(/[#?].*$/, '').replace(/[^\/]*$/, '') + '#' + sl;
    var done = function () {
        toast('Link copied');
      },
      fail = function () {
        window.prompt('Copy this link:', url);
      };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, fail);
    } else {
      fail();
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    e.preventDefault();
    copyLink(b.closest('.win'));
  });
  window.addEventListener('hashchange', route);
  route();
  if (/^\/ask\/?$/i.test(location.pathname) && document.getElementById('w-ask')) openWin('w-ask');
  var trash = $('#dk-trash');
  if (trash.getAttribute('href')) {
    $('#trash-use').setAttribute('href', '#i-trash-full');
    $('#trash-tip').textContent = body.classList.contains('is-permalink') ? 'Older Post' : 'Older Posts';
  } else {
    trash.removeAttribute('href');
    trash.addEventListener('click', function (e) {
      e.preventDefault();
    });
    $('#trash-tip').textContent = 'Trash (empty)';
  }
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a, p) {
    var e = document.createElementNS(NS, n);
    for (var k in a) e.setAttribute(k, a[k]);
    p.appendChild(e);
    return e;
  }
  function qy(x0, y0, cx, cy, x1, y1, x) {
    var t = (x - x0) / (x1 - x0);
    return (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
  }
  function tower(gid, cx) {
    var gp = document.getElementById(gid);
    if (!gp) return;
    [
      [cx - 22, cx - 8],
      [cx + 8, cx + 22],
    ].forEach(function (l) {
      el(
        'path',
        {
          d: 'M' + l[0] + ' 740 L' + (l[0] + 3) + ' 318 L' + (l[1] - 3) + ' 318 L' + l[1] + ' 740z',
          style: 'fill:var(--bridge)',
        },
        gp,
      );
      el(
        'rect',
        {
          x: l[1] - 4,
          y: 318,
          width: 3,
          height: 422,
          style: 'fill:var(--bridge-dark)',
          opacity: 0.6,
        },
        gp,
      );
    });
    [326, 420, 520, 610].forEach(function (y, i) {
      el(
        'rect',
        {
          x: cx - 10,
          y: y,
          width: 20,
          height: i === 0 ? 14 : 10,
          style: 'fill:var(--bridge)',
        },
        gp,
      );
    });
    el(
      'rect',
      {
        x: cx - 26,
        y: 735,
        width: 52,
        height: 16,
        style: 'fill:var(--bridge-dark)',
      },
      gp,
    );
  }
  tower('tower-l', 480);
  tower('tower-r', 1180);
  var sus = $('#suspenders'),
    lights = $('#lights');
  if (sus) {
    for (var x = -50; x < 1700; x += 14) {
      var y =
        x < 480
          ? qy(480, 330, 210, 590, -60, 650, x)
          : x > 1180
            ? qy(1180, 330, 1440, 590, 1700, 650, x)
            : qy(480, 330, 830, 1010, 1180, 330, x);
      if (Math.abs(x - 480) < 26 || Math.abs(x - 1180) < 26) continue;
      if (y < 684)
        el(
          'line',
          {
            x1: x,
            y1: y,
            x2: x,
            y2: 684,
          },
          sus,
        );
      if (x % 42 === 0)
        el(
          'circle',
          {
            cx: x,
            cy: Math.min(y, 684),
            r: 1.6,
          },
          lights,
        );
    }
    for (var lx = -40; lx < 1660; lx += 20)
      el(
        'circle',
        {
          cx: lx,
          cy: 688,
          r: 1.3,
          fill: '#fff1c2',
        },
        lights,
      );
    var d = '';
    for (var tx = -60; tx < 1700; tx += 16) {
      d += 'M' + tx + ' 693 L' + (tx + 8) + ' 700 L' + (tx + 16) + ' 693 ';
    }
    $('#truss').setAttribute('d', d);
    el(
      'circle',
      {
        cx: 480,
        cy: 316,
        r: 3,
        fill: '#ff4d3d',
      },
      lights,
    );
    el(
      'circle',
      {
        cx: 1180,
        cy: 316,
        r: 3,
        fill: '#ff4d3d',
      },
      lights,
    );
    var st = $('#stars'),
      seed = 7;
    function rnd() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }
    for (var s = 0; s < 140; s++)
      el(
        'circle',
        {
          cx: rnd() * 1600,
          cy: rnd() * 480,
          r: rnd() * 1.2 + 0.2,
          opacity: rnd() * 0.8 + 0.2,
        },
        st,
      );
    var sh = $('#shimmer');
    for (var w = 0; w < 40; w++) {
      var wy = 720 + rnd() * 260,
        wx = rnd() * 1600,
        wl = 20 + rnd() * 90;
      el(
        'line',
        {
          x1: wx,
          y1: wy,
          x2: wx + wl,
          y2: wy,
          'stroke-width': 1 + rnd() * 1.5,
        },
        sh,
      );
    }
  }
})();
