(function () {
  var THEME_POST = 'https://navi-0304.tumblr.com/post/832250829562101760/golden-hour-a-macos-27-inspired-tumblr-theme';
  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }
  each('a[href="#gg-post"]', function (a) {
    a.href = THEME_POST;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  var MSG = {
    'gg-submit': "This opens your Submit page.",
    'gg-demo': 'This opens on Tumblr once the theme is installed.',
    'gg-archive': 'This opens your Tumblr archive.',
  };
  function toast(m) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = m;
    t.classList.add('show');
    clearTimeout(t._g);
    t._g = setTimeout(function () {
      t.classList.remove('show');
    }, 2200);
  }
  document.addEventListener(
    'click',
    function (e) {
      var a = e.target.closest('a[href^="#gg-"]');
      if (!a || a.hasAttribute('data-win') || a.hasAttribute('data-open')) return;
      var k = a.getAttribute('href').slice(1);
      if (!MSG[k]) return;
      e.preventDefault();
      e.stopPropagation();
      if (a.classList.contains('dk')) {
        a.classList.add('bounce');
        setTimeout(function () {
          a.classList.remove('bounce');
        }, 1e3);
      }
      if (a.classList.contains('d-icon') && !matchMedia('(hover: none)').matches) {
        document.querySelectorAll('.d-icon.sel').forEach(function (x) {
          x.classList.remove('sel');
        });
        a.classList.add('sel');
        return;
      }
      toast(MSG[k]);
    },
    true,
  );
  document.addEventListener(
    'dblclick',
    function (e) {
      var a = e.target.closest('.d-icon[href^="#gg-"]');
      if (a && !a.hasAttribute('data-win') && MSG[a.getAttribute('href').slice(1)]) {
        e.stopPropagation();
        toast(MSG[a.getAttribute('href').slice(1)]);
      }
    },
    true,
  );
  function hashMsg() {
    var k = location.hash.slice(1);
    if (!MSG[k]) return;
    history.replaceState(null, '', location.pathname + location.search);
    toast(MSG[k]);
  }
  window.addEventListener('hashchange', hashMsg);
  hashMsg();
  var liked = {};
  try {
    liked = JSON.parse(localStorage.getItem('gg-liked') || '{}') || {};
  } catch (e) {}
  each('.f-actions .lk', function (lk) {
    var b = lk.querySelector('.like_button');
    if (!b) return;
    var id = b.getAttribute('data-post-id');
    if (liked[id]) b.classList.add('liked');
    lk.style.cursor = 'pointer';
    lk.addEventListener('click', function (e) {
      e.preventDefault();
      var on = !b.classList.contains('liked');
      b.classList.toggle('liked', on);
      if (on) liked[id] = 1;
      else delete liked[id];
      try {
        localStorage.setItem('gg-liked', JSON.stringify(liked));
      } catch (e) {}
    });
  });
  var n = 0;
  each('audio[data-gg-song]', function (a) {
    var name = 'ggPost' + ++n;
    window[name] = function (d) {
      var r = d && d.results && d.results[0];
      if (r && r.previewUrl) a.src = r.previewUrl;
      try {
        delete window[name];
      } catch (e) {
        window[name] = undefined;
      }
    };
    var s = document.createElement('script');
    s.src =
      'https://itunes.apple.com/search?media=music&entity=song&limit=1&term=' +
      encodeURIComponent(a.getAttribute('data-gg-song')) +
      '&callback=' +
      name;
    document.head.appendChild(s);
  });
})();