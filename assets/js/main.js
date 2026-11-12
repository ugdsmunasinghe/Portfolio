(function () {
  var root = document.documentElement;
  root.classList.add('js', 'loading');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* theme */
  try {
    var t = localStorage.getItem('ds-theme');
    if (t) root.setAttribute('data-theme', t);
  } catch (e) {}

  var themeBtn = $('#theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      var n = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', n);
      try { localStorage.setItem('ds-theme', n); } catch (e) {}
    });
  }

  /* marquee + qr build */
  var words = [
    'Quality Assurance', 'Test Cases', 'Spring Boot', 'ASP.NET Core',
    'REST APIs', 'Defect Reporting', 'Java', 'C#', 'Python',
    'SQL Server', 'Usability Testing', 'Git'
  ];
  var h = '';
  for (var r = 0; r < 2; r++) {
    words.forEach(function (w) { h += '<span>' + w + '</span>'; });
  }
  var mq = $('#mq');
  if (mq) mq.innerHTML = h + h;

  var pat = '1110111101001111011011010011110100110111011110111';
  var q = '';
  for (var i = 0; i < 49; i++) {
    q += '<i class="' + (pat[i] === '1' ? '' : 'o') + '"></i>';
  }
  var qr = $('#qr');
  if (qr) qr.innerHTML = q;

  /* loader */
  var nm = $('#ldName'), idx = 0;
  if (nm) {
    'Dilhara Savindi'.split(' ').forEach(function (w) {
      var s = document.createElement('span');
      s.className = 'ld-word';
      w.split('').forEach(function (c) {
        var l = document.createElement('span');
        l.textContent = c;
        l.style.setProperty('--i', idx++);
        s.appendChild(l);
      });
      nm.appendChild(s);
    });
  }

  var bar = $('#ldBar'), num = $('#ldNum'), loader = $('#loader'), finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    if (loader) loader.classList.add('out');
    root.classList.remove('loading');
    setTimeout(function () {
      var heroRoot = $('#heroRoot');
      if (heroRoot) heroRoot.classList.add('ready');
      $$('.hero-top,.role,.lede,.cta-row,.hero .rule').forEach(function (e) {
        e.classList.add('in');
      });
    }, reduce ? 0 : 350);
    setTimeout(function () {
      if (loader) loader.style.display = 'none';
    }, 1100);
  }

  var dur = reduce ? 200 : 1900, t0 = performance.now();
  function tick(now) {
    var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1-p, 3);
    if (bar) bar.style.transform = 'scaleX(' + e + ')';
    if (num) num.textContent = Math.round(e * 100);
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(finish, reduce ? 0 : 250);
    }
  }
  requestAnimationFrame(tick);
  setTimeout(finish, 5000);

  /* reveal + counters */
  function count(el) {
    var to = +el.getAttribute('data-count'), s = performance.now(), d = 1400;
    if (reduce) {
      el.textContent = to;
      return;
    }
    (function f(n) {
      var p = Math.min(1, (n - s) / d);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(f);
    })(s);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          $$('[data-count]', e.target).forEach(count);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    $$('.rv,.rvx').forEach(function (el) {
      if (!el.closest('.hero')) io.observe(el);
    });
  } else {
    $$('.rv,.rvx').forEach(function (el) {
      el.classList.add('in');
    });
  }

  /* scroll: progress, nav, parallax, active link */
  var prog = $('#progress'),
      nav = $('#nav'),
      disc = $('#disc'),
      links = $$('#links a'),
      secs = links.map(function (a) { return $(a.getAttribute('href')); }),
      ticking = false;

  function onScroll() {
    var y = window.scrollY,
        max = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (nav) nav.classList.toggle('stuck', y > 10);
    if (!reduce && y < window.innerHeight * 1.4 && disc) {
      disc.style.transform = 'translateY(' + (y * -0.12) + 'px) scale(' + (1 + y * 0.0002) + ')';
    }
    var cur = -1;
    secs.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i;
    });
    links.forEach(function (a, i) {
      a.classList.toggle('on', i === cur);
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* tilt + magnetic (fine pointers only) */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('[data-tilt]').forEach(function (c) {
      var s = $('.shot', c);
      if (!s) return;
      c.addEventListener('pointermove', function (e) {
        var b = s.getBoundingClientRect(),
            x = (e.clientX - b.left) / b.width - 0.5,
            y = (e.clientY - b.top) / b.height - 0.5;
        s.style.transform = 'perspective(800px) rotateY(' + (x * 9) + 'deg) rotateX(' + (-y * 9) + 'deg) scale(1.02)';
      });
      c.addEventListener('pointerleave', function () {
        s.style.transform = '';
      });
    });

    $$('[data-mag]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25) + 'px)';
      });
      b.addEventListener('pointerleave', function () {
        b.style.transform = '';
      });
    });
  }

  /* copy email */
  var cb = $('#copyBtn');
  if (cb) {
    cb.addEventListener('click', function () {
      var v = cb.getAttribute('data-copy');
      function ok() {
        cb.textContent = 'Copied';
        setTimeout(function () { cb.textContent = 'Copy'; }, 1600);
      }
      function fallback() {
        var r = document.createRange(),
            a = cb.parentNode.querySelector('a');
        r.selectNodeContents(a);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
        cb.textContent = 'Selected';
        setTimeout(function () { cb.textContent = 'Copy'; }, 1600);
      }
      try {
        navigator.clipboard.writeText(v).then(ok, fallback);
      } catch (e) {
        fallback();
      }
    });
  }

  /* project image galleries */
  var projectGalleries = {
    recruitai: {
      title: 'RecruitAI — AI Recruitment Platform',
      images: Array.from({ length: 26 }, function (_, i) {
        var num = String(i + 1).padStart(2, '0');
        return 'assets/images/projects/recruitai/recruitai-' + num + '.jpg';
      })
    },
    inklink: {
      title: 'InkLink — Storytelling Platform',
      images: Array.from({ length: 4 }, function (_, i) {
        var num = String(i + 1).padStart(2, '0');
        return 'assets/images/projects/inklink/inklink-' + num + '.jpg';
      })
    },
    biopohora: {
      title: 'BIO Pohora — Subsidy Mobile App',
      images: Array.from({ length: 19 }, function (_, i) {
        var num = String(i + 1).padStart(2, '0');
        return 'assets/images/projects/biopohora/biopohora-' + num + '.png';
      })
    }
  };

  var modal = $('#galleryModal');
  var modalImg = $('#galleryImg');
  var modalTitle = $('#galleryTitle');
  var modalCounter = $('#galleryCounter');
  var modalPrev = $('#galleryPrev');
  var modalNext = $('#galleryNext');
  var modalClose = $('#galleryClose');
  var modalBackdrop = $('#galleryBackdrop');

  var currentGalleryKey = null;
  var currentGalleryIndex = 0;

  function updateGalleryImage() {
    if (!currentGalleryKey || !projectGalleries[currentGalleryKey]) return;
    var gal = projectGalleries[currentGalleryKey];
    
    // Smooth crossfade animation
    modalImg.classList.add('fade-out');
    setTimeout(function () {
      modalImg.src = gal.images[currentGalleryIndex];
      modalImg.onload = function () {
        modalImg.classList.remove('fade-out');
        modalImg.classList.add('fade-in');
        setTimeout(function () {
          modalImg.classList.remove('fade-in');
        }, 350);
      };
      modalCounter.textContent = (currentGalleryIndex + 1) + ' / ' + gal.images.length;
    }, 180);
  }

  function openGallery(key) {
    if (!projectGalleries[key]) return;
    currentGalleryKey = key;
    currentGalleryIndex = 0;
    var gal = projectGalleries[key];
    modalTitle.textContent = gal.title;
    modalImg.src = gal.images[0];
    modalCounter.textContent = '1 / ' + gal.images.length;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeGallery() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function prevImage() {
    if (!currentGalleryKey) return;
    var total = projectGalleries[currentGalleryKey].images.length;
    currentGalleryIndex = (currentGalleryIndex - 1 + total) % total;
    updateGalleryImage();
  }

  function nextImage() {
    if (!currentGalleryKey) return;
    var total = projectGalleries[currentGalleryKey].images.length;
    currentGalleryIndex = (currentGalleryIndex + 1) % total;
    updateGalleryImage();
  }

  $$('[data-gallery]').forEach(function (card) {
    card.addEventListener('click', function () {
      var key = card.getAttribute('data-gallery');
      openGallery(key);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeGallery);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeGallery);
  if (modalPrev) modalPrev.addEventListener('click', prevImage);
  if (modalNext) modalNext.addEventListener('click', nextImage);

  window.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  /* Auto-cycling card preview animations */
  var previewCurators = {
    recruitai: [
      'assets/images/projects/recruitai/recruitai-07.jpg',
      'assets/images/projects/recruitai/recruitai-03.jpg',
      'assets/images/projects/recruitai/recruitai-12.jpg',
      'assets/images/projects/recruitai/recruitai-16.jpg',
      'assets/images/projects/recruitai/recruitai-21.jpg'
    ],
    inklink: [
      'assets/images/projects/inklink/inklink-03.jpg',
      'assets/images/projects/inklink/inklink-01.jpg',
      'assets/images/projects/inklink/inklink-02.jpg',
      'assets/images/projects/inklink/inklink-04.jpg'
    ],
    biopohora: [
      'assets/images/projects/biopohora/biopohora-19.png',
      'assets/images/projects/biopohora/biopohora-08.png',
      'assets/images/projects/biopohora/biopohora-18.png',
      'assets/images/projects/biopohora/biopohora-14.png',
      'assets/images/projects/biopohora/biopohora-10.png'
    ]
  };

  // Build dots indicator for each project
  Object.keys(previewCurators).forEach(function (key) {
    var dotsContainer = $('[data-dots="' + key + '"]');
    if (!dotsContainer) return;
    var list = previewCurators[key];
    list.forEach(function (_, idx) {
      var dot = document.createElement('span');
      dot.className = 'cycle-dot' + (idx === 0 ? ' active' : '');
      dotsContainer.appendChild(dot);
    });
  });

  // Cycle preview images with fade animation every 3.6s
  if (!reduce) {
    var previewIndices = { recruitai: 0, inklink: 0, biopohora: 0 };
    setInterval(function () {
      // Pause automatic cycling if gallery modal is open
      if (modal && modal.classList.contains('active')) return;

      Object.keys(previewCurators).forEach(function (key) {
        var imgEl = $('[data-cycle-img="' + key + '"]');
        var dots = $$('[data-dots="' + key + '"] .cycle-dot');
        if (!imgEl) return;

        var list = previewCurators[key];
        previewIndices[key] = (previewIndices[key] + 1) % list.length;
        var nextSrc = list[previewIndices[key]];

        // Animate transition
        imgEl.classList.add('fading');
        setTimeout(function () {
          imgEl.src = nextSrc;
          imgEl.onload = function () {
            imgEl.classList.remove('fading');
            imgEl.classList.add('fading-in');
            setTimeout(function () {
              imgEl.classList.remove('fading-in');
            }, 500);
          };
        }, 300);

        // Update dot indicator
        dots.forEach(function (d, idx) {
          d.classList.toggle('active', idx === previewIndices[key]);
        });
      });
    }, 3800);
  }
})();

