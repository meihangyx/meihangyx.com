/* ==========================================================================
   Meihang Co., Limited — Global Site Script
   js/main.js  ·  the single script of the entire site
   --------------------------------------------------------------------------
   A. Shared header injection          [复用-C]
   B. Shared footer injection          [复用-D]
   C. SEO configuration + JSON-LD      [复用-F]
   D. Scroll reveal observer           [复用-G]
   E. SVG sprite loader + mascots      [复用-E]
   F. Interactions: nav, scroll, top, news filter, form validation
   G. Active navigation by pathname
   ========================================================================== */
(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     0. COMPANY DATA — single source of truth for the whole site
     ----------------------------------------------------------------------- */
  var COMPANY = {
    name: 'Meihang Co., Limited',
    address: 'UNIT 98 OF FACTORY A, 1/F, UNION HING YIP FACTORY BUILDING, NO. 20 HING YIP STREET, KWUN TONG, HONG KONG',
    website: 'meihangyx.com',
    url: 'https://meihangyx.com/',
    emailSupport: 'support@meihangyx.com',
    emailAccount: 'liaoyuhua@meihangyx.com',
    scope: 'International trade, marketing consultancy, wholesale and import/export of general goods, supply chain support services'
  };

  /* Internal links are document-relative so the site works both when served
     over http(s) and when a file is opened directly from disk (file://).
     Under file:// a web server is absent, so "./" would land on the OS folder
     index instead of the homepage — hence the protocol-aware HOME_HREF. */
  var IS_FILE_PROTOCOL = (window.location.protocol === 'file:');
  var HOME_HREF = IS_FILE_PROTOCOL ? './index.html' : './';

  var NAV = [
    { label: 'Home', href: HOME_HREF, file: 'index.html', key: 'home' },
    { label: 'Services', href: './services.html', file: 'services.html', key: 'services' },
    { label: 'Culture', href: './culture.html', file: 'culture.html', key: 'culture' },
    { label: 'News', href: './news.html', file: 'news.html', key: 'news' },
    { label: 'Contact', href: './contact.html', file: 'contact.html', key: 'contact' }
  ];

  var SPRITE_URL = 'images/sprite.svg';

  document.documentElement.classList.add('has-js');

  /* -----------------------------------------------------------------------
     helpers
     ----------------------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function icon(id, cls) {
    return '<svg class="' + (cls || '') + '" aria-hidden="true" focusable="false"><use href="#' + id + '"></use></svg>';
  }

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* current page key: "/", "/index.html" and "./" all mean Home */
  function currentKey() {
    var path = window.location.pathname;
    if (path === '/' || path === '/index.html' || path === '' || /\/index\.html$/.test(path)) return 'home';
    var file = path.substring(path.lastIndexOf('/') + 1).toLowerCase();
    if (file === 'index.html') return 'home';
    for (var i = 0; i < NAV.length; i++) {
      if (NAV[i].file === file) return NAV[i].key;
    }
    var body = document.body;
    return (body && body.dataset.page) || '';
  }

  /* Under file:// any remaining "./" home links must point at the actual file,
     otherwise the browser shows the OS directory index. */
  function fixHomeLinks() {
    if (!IS_FILE_PROTOCOL) return;
    $$('a[href="./"]').forEach(function (a) { a.setAttribute('href', HOME_HREF); });
  }

  /* -----------------------------------------------------------------------
     E. SVG SPRITE LOADER — fetch once, inject, then hydrate mascots
     ----------------------------------------------------------------------- */
  var spriteReady = false;

  function loadSprite() {
    if (!window.fetch) return Promise.resolve(false);
    return fetch(SPRITE_URL, { cache: 'force-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('sprite ' + res.status);
        return res.text();
      })
      .then(function (text) {
        var holder = document.createElement('div');
        holder.style.position = 'absolute';
        holder.style.width = '0';
        holder.style.height = '0';
        holder.style.overflow = 'hidden';
        holder.setAttribute('aria-hidden', 'true');
        holder.innerHTML = text;
        document.body.insertBefore(holder, document.body.firstChild);
        spriteReady = true;
        hydrateMascots();
        return true;
      })
      .catch(function () {
        /* Graceful degradation. Browsers refuse fetch() and cross-document
           <use> references under the file:// protocol, so the sprite cannot be
           inlined when a page is opened straight from disk. Flag the document
           so the stylesheet can fall back to text/geometry instead of leaving
           empty icon boxes behind. */
        document.documentElement.classList.add('no-sprite');
        return false;
      });
  }

  function hydrateMascots() {
    $$('[data-mascot]').forEach(function (el) {
      if (el.dataset.mascotDone === '1') return;
      var id = el.getAttribute('data-mascot');
      var sizeClass = el.getAttribute('data-mascot-size') || 'md';
      var extra = el.getAttribute('data-mascot-class') || '';
      el.innerHTML = '<svg class="mascot mascot--' + sizeClass + ' ' + extra + '" aria-hidden="true" focusable="false">' +
        '<use href="#' + id + '"></use></svg>';
      el.dataset.mascotDone = '1';
    });
  }

  /* -----------------------------------------------------------------------
     A. SHARED HEADER  [复用-C]
     ----------------------------------------------------------------------- */
  function buildHeader() {
    var host = $('#site-header');
    if (!host) return;
    var key = currentKey();

    var brandMark = spriteReady
      ? '<span class="brand-mark">' + icon('logo') + '</span>'
      : '<span class="brand-mark brand-mark--fallback" aria-hidden="true">MH</span>';

    var navLinks = NAV.map(function (item) {
      return '<a class="nav-link' + (item.key === key ? ' is-active' : '') + '" href="' + item.href + '">' +
        item.label + '</a>';
    }).join('');

    var mobileLinks = NAV.map(function (item, i) {
      return '<a class="mobile-nav-link' + (item.key === key ? ' is-active' : '') + '" href="' + item.href + '" style="transition-delay:' +
        (90 + i * 55) + 'ms"><span class="idx">0' + (i + 1) + '</span>' + item.label + '</a>';
    }).join('');

    host.className = 'site-header';
    host.innerHTML =
      '<div class="header-inner">' +
        '<a class="brand" href="' + HOME_HREF + '" aria-label="' + esc(COMPANY.name) + ' home">' +
          brandMark +
          '<span class="brand-text">' + esc(COMPANY.name) + '<small>Global Trade &amp; Supply Chain</small></span>' +
        '</a>' +
        '<nav class="nav" aria-label="Primary">' + navLinks + '</nav>' +
        '<div class="header-actions">' +
          '<a class="header-cta" href="./contact.html">Talk to us</a>' +
          '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">' +
            icon('menu', 'nav-toggle-icon') +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="nav-overlay" data-close-nav></div>' +
      '<div class="mobile-nav" id="mobile-nav" aria-hidden="true">' +
        '<div class="mobile-nav-head">' +
          '<span>Navigation</span>' +
          '<button class="mobile-nav-close" type="button" data-close-nav aria-label="Close menu">' + icon('close') + '</button>' +
        '</div>' +
        mobileLinks +
        '<div class="mobile-nav-foot">' +
          '<p>' + esc(COMPANY.emailSupport) + '<br>' + esc(COMPANY.website) + '</p>' +
          '<a href="./privacy.html">Privacy Policy</a> &nbsp;·&nbsp; <a href="./terms.html">Terms of Service</a>' +
        '</div>' +
      '</div>';

    initNavToggle();
    initHeaderScroll();
  }

  /* -----------------------------------------------------------------------
     B. SHARED FOOTER  [复用-D]
     ----------------------------------------------------------------------- */
  function buildFooter() {
    var host = $('#site-footer');
    if (!host) return;

    var brandMark = spriteReady
      ? '<span class="brand-mark">' + icon('logo') + '</span>'
      : '<span class="brand-mark brand-mark--fallback" aria-hidden="true">MH</span>';

    var explore = NAV.map(function (item) {
      return '<li><a href="' + item.href + '">' + item.label + '</a></li>';
    }).join('');

    var year = new Date().getFullYear();

    host.className = 'site-footer';
    host.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' +
            '<a class="brand" href="' + HOME_HREF + '">' + brandMark +
              '<span class="brand-text">' + esc(COMPANY.name) + '<small>Global Trade &amp; Supply Chain</small></span>' +
            '</a>' +
            '<p>' + esc(COMPANY.scope) + '. Operating from Hong Kong, connecting manufacturers, distributors and retail partners across international markets.</p>' +
            '<span class="mascot-wrap" data-mascot="rocket-cat" data-mascot-size="sm"></span>' +
          '</div>' +
          '<div>' +
            '<h4 class="footer-title">Explore</h4>' +
            '<ul class="footer-list">' + explore + '</ul>' +
          '</div>' +
          '<div>' +
            '<h4 class="footer-title">Services</h4>' +
            '<ul class="footer-list">' +
              '<li><a href="./services.html#trade">International Trade</a></li>' +
              '<li><a href="./services.html#consulting">Marketing Consultancy</a></li>' +
              '<li><a href="./services.html#wholesale">Wholesale &amp; General Goods</a></li>' +
              '<li><a href="./services.html#supply">Supply Chain Support</a></li>' +
              '<li><a href="./services.html#app">Mobile Management App</a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4 class="footer-title">Contact</h4>' +
            '<ul class="footer-contact">' +
              '<li>' + icon('map-pin') + '<span>' + esc(COMPANY.address) + '</span></li>' +
              '<li>' + icon('globe') + '<span><a href="https://' + esc(COMPANY.website) + '">' + esc(COMPANY.website) + '</a></span></li>' +
              '<li>' + icon('mail') + '<span><a href="mailto:' + esc(COMPANY.emailSupport) + '">' + esc(COMPANY.emailSupport) + '</a></span></li>' +
              '<li>' + icon('users') + '<span><a href="mailto:' + esc(COMPANY.emailAccount) + '">' + esc(COMPANY.emailAccount) + '</a></span></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer-legal">' +
          '<span>© ' + year + ' ' + esc(COMPANY.name) + '. All rights reserved.</span>' +
          '<div class="footer-legal-links">' +
            '<a href="./privacy.html">Privacy Policy</a>' +
            '<a href="./terms.html">Terms of Service</a>' +
            '<a href="./contact.html">Contact</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>Company: ' + esc(COMPANY.name) + '</span>' +
          '<span>Office: ' + esc(COMPANY.address) + '</span>' +
          '<span>Website: ' + esc(COMPANY.website) + '</span>' +
        '</div>' +
      '</div>';
  }

  /* -----------------------------------------------------------------------
     C. SEO CONFIGURATION + JSON-LD  [复用-F]
     ----------------------------------------------------------------------- */
  var SEO = {
    '/': {
      title: 'Meihang Co., Limited — International Trade, Wholesale & Supply Chain Support',
      description: 'Meihang Co., Limited is a Hong Kong trading company delivering international trade, marketing consultancy, wholesale and import/export of general goods, and supply chain support services, plus a mobile management app for orders, inventory and trade operations.',
      image: 'https://meihangyx.com/images/hero.jpg'
    },
    '/services.html': {
      title: 'Services — International Trade, Consultancy, Wholesale & Supply Chain | Meihang',
      description: 'Eight business lines covering international trade, marketing consultancy, wholesale and import/export of general goods, supply chain support services, cross-border sourcing, trade compliance, channel operations and logistics — managed end to end through the Meihang mobile app.',
      image: 'https://meihangyx.com/images/app-phone.png'
    },
    '/culture.html': {
      title: 'Culture & Milestones — Meihang Co., Limited',
      description: 'The mission, vision and values behind Meihang Co., Limited, our milestone timeline, our team spirit and our approach to global compliance and responsible trade.',
      image: 'https://meihangyx.com/images/hero.jpg'
    },
    '/news.html': {
      title: 'News & Insights — Meihang Co., Limited',
      description: 'Trade updates, supply chain insights, product announcements and company news from Meihang Co., Limited.',
      image: 'https://meihangyx.com/images/news-1.jpg'
    },
    '/contact.html': {
      title: 'Contact Us — Meihang Co., Limited',
      description: 'Reach Meihang Co., Limited for business support, key account enquiries, partnership requests and general trade enquiries. Offices in Kwun Tong, Hong Kong.',
      image: 'https://meihangyx.com/images/map.png'
    },
    '/privacy.html': {
      title: 'Privacy Policy — Meihang Co., Limited',
      description: 'How Meihang Co., Limited collects, uses, shares and protects personal data across our website and our Google Play and Apple App Store mobile management application, including regional privacy rights and advertising disclosures.',
      image: 'https://meihangyx.com/images/hero.jpg'
    },
    '/terms.html': {
      title: 'Terms of Service — Meihang Co., Limited',
      description: 'The terms governing use of the Meihang Co., Limited website and mobile management application, including accounts, services, acceptable use, intellectual property, payments, advertising and Hong Kong governing law.',
      image: 'https://meihangyx.com/images/hero.jpg'
    }
  };

  function seoKey() {
    var path = window.location.pathname;
    if (path === '/' || path === '' || /\/index\.html$/.test(path)) return '/';
    var file = '/' + path.substring(path.lastIndexOf('/') + 1);
    return SEO[file] ? file : '/';
  }

  function setMeta(attr, key, content) {
    var el = document.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function applySEO() {
    var key = seoKey();
    var cfg = SEO[key];
    if (!cfg) return;

    document.title = cfg.title;

    setMeta('name', 'description', cfg.description);

    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', COMPANY.url + (key === '/' ? '' : key.substring(1)));

    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', COMPANY.name);
    setMeta('property', 'og:locale', 'en_HK');
    setMeta('property', 'og:title', cfg.title);
    setMeta('property', 'og:description', cfg.description);
    setMeta('property', 'og:url', COMPANY.url + (key === '/' ? '' : key.substring(1)));
    setMeta('property', 'og:image', cfg.image);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', cfg.title);
    setMeta('name', 'twitter:description', cfg.description);
    setMeta('name', 'twitter:image', cfg.image);

    injectJsonLd();
  }

  function injectJsonLd() {
    if (document.getElementById('ld-organization')) return;
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'ld-organization';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: COMPANY.name,
      url: COMPANY.url,
      email: COMPANY.emailSupport,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'UNIT 98 OF FACTORY A, 1/F, UNION HING YIP FACTORY BUILDING, NO. 20 HING YIP STREET',
        addressLocality: 'KWUN TONG',
        addressRegion: 'HONG KONG',
        addressCountry: 'HK'
      },
      sameAs: ['https://' + COMPANY.website],
      contactPoint: [{
        '@type': 'ContactPoint',
        contactType: 'business support',
        email: COMPANY.emailSupport,
        areaServed: 'Worldwide'
      }],
      description: COMPANY.scope
    });
    document.head.appendChild(ld);
  }

  /* -----------------------------------------------------------------------
     D. SCROLL REVEAL OBSERVER  [复用-G]
     ----------------------------------------------------------------------- */
  function initReveal() {
    var targets = $$('.reveal, .fade-up, .fade-in, .slide-left, .slide-right, .zoom-in, .stagger');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) {
      /* stagger children get an incremental index custom property */
      if (el.classList.contains('stagger')) {
        Array.prototype.forEach.call(el.children, function (child, i) {
          child.style.setProperty('--i', i);
        });
      }
      observer.observe(el);
    });
  }

  /* -----------------------------------------------------------------------
     F. INTERACTIONS
     ----------------------------------------------------------------------- */

  /* F1 — mobile navigation ------------------------------------------------ */
  function initNavToggle() {
    var toggle = $('.nav-toggle');
    var drawer = $('.mobile-nav');
    var overlay = $('.nav-overlay');
    if (!toggle || !drawer) return;

    function openNav() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      if (overlay) overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeNav() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      if (overlay) overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      if (drawer.classList.contains('is-open')) closeNav(); else openNav();
    });
    $$('[data-close-nav]').forEach(function (el) {
      el.addEventListener('click', closeNav);
    });
    $$('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && drawer.classList.contains('is-open')) closeNav();
    });
  }

  /* F2 — header behaviour on scroll --------------------------------------- */
  function initHeaderScroll() {
    var header = $('#site-header');
    if (!header) return;
    var hasDarkTop = !!document.querySelector('.hero, .page-hero');
    var lastY = window.pageYOffset;
    var ticking = false;

    function update() {
      var y = window.pageYOffset;
      if (y > 40) {
        header.classList.add('is-scrolled');
        header.classList.remove('is-dark');
      } else {
        header.classList.remove('is-scrolled');
        if (hasDarkTop) header.classList.add('is-dark');
      }
      if (y > 320 && y > lastY) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* F3 — smooth in-page anchors ------------------------------------------ */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!link) return;
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var header = $('#site-header');
      var offset = header ? header.offsetHeight + 12 : 20;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* F4 — back to top ----------------------------------------------------- */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = icon('arrow-up');
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function onScroll() {
      if (window.pageYOffset > 600) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* F5 — news filter + pagination ---------------------------------------- */
  function initNewsFilter() {
    var chips = $$('[data-filter]');
    var cards = $$('.news-card');
    if (!chips.length || !cards.length) return;

    var perPage = 6;
    var currentFilter = 'all';
    var currentPage = 1;

    var pager = $('.pagination');
    /* every button in the pager — numbered pages plus prev/next — must be wired,
       otherwise data-prev / data-next buttons silently do nothing */
    var pageButtons = pager ? $$('button', pager) : [];

    function matches(card) {
      if (currentFilter === 'all') return true;
      return (card.dataset.category || '').split(' ').indexOf(currentFilter) !== -1;
    }

    function render() {
      var visible = cards.filter(matches);
      var pages = Math.max(1, Math.ceil(visible.length / perPage));
      if (currentPage > pages) currentPage = pages;

      cards.forEach(function (card) {
        var idx = visible.indexOf(card);
        var inSlice = matches(card) && idx !== -1 &&
          idx >= (currentPage - 1) * perPage && idx < currentPage * perPage;
        card.classList.toggle('is-hidden', !inSlice);
      });

      pageButtons.forEach(function (btn) {
        /* dataset.prev / dataset.next are empty strings for value-less
           attributes, so test for attribute presence instead of truthiness */
        if (btn.hasAttribute('data-prev')) {
          btn.disabled = currentPage <= 1;
          btn.classList.remove('is-active');
          return;
        }
        if (btn.hasAttribute('data-next')) {
          btn.disabled = currentPage >= pages;
          btn.classList.remove('is-active');
          return;
        }
        var p = parseInt(btn.dataset.page, 10) || 1;
        btn.classList.toggle('is-active', p === currentPage);
        btn.disabled = p > pages;
      });

      var empty = $('[data-news-empty]');
      if (empty) empty.style.display = visible.length ? 'none' : '';
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        currentFilter = chip.dataset.filter || 'all';
        currentPage = 1;
        render();
      });
    });

    pageButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.hasAttribute('data-prev')) currentPage = Math.max(1, currentPage - 1);
        else if (btn.hasAttribute('data-next')) currentPage = Math.min(pages(), currentPage + 1);
        else currentPage = parseInt(btn.dataset.page, 10) || 1;
        render();
        var grid = $('.news-grid');
        if (grid) {
          var top = grid.getBoundingClientRect().top + window.pageYOffset - 120;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    function pages() {
      return Math.max(1, Math.ceil(cards.filter(matches).length / perPage));
    }

    render();
  }

  /* F6 — contact form validation ----------------------------------------- */
  function initFormValidation() {
    var form = $('#contact-form');
    if (!form) return;
    var message = $('[data-form-message]');

    function setError(field, text) {
      var wrap = field.closest('.field') || field.closest('.checkbox');
      if (!wrap) return;
      wrap.classList.toggle('is-invalid', !!text);
      wrap.classList.toggle('is-valid', !text && field.value.trim() !== '');
      var slot = wrap.querySelector('.field-error');
      if (slot) slot.textContent = text || '';
    }

    function validateField(field) {
      var value = (field.value || '').trim();
      if (field.type === 'checkbox') {
        if (!field.checked) { setError(field, 'Please accept the privacy policy and terms of service.'); return false; }
        setError(field, '');
        return true;
      }
      if (field.required && !value) { setError(field, 'This field is required.'); return false; }
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        setError(field, 'Please enter a valid email address.'); return false;
      }
      if (field.name === 'message' && value && value.length < 10) {
        setError(field, 'Please give us at least 10 characters of detail.'); return false;
      }
      setError(field, '');
      return true;
    }

    $$('input, textarea', form).forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var wrap = field.closest('.field') || field.closest('.checkbox');
        if (wrap && wrap.classList.contains('is-invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('input, textarea', form).forEach(function (field) {
        if (!validateField(field)) ok = false;
      });

      if (!ok) {
        if (message) {
          message.classList.add('is-visible', 'is-error');
          message.textContent = 'Please review the highlighted fields and try again.';
        }
        var firstBad = form.querySelector('.is-invalid input, .is-invalid textarea');
        if (firstBad) firstBad.focus();
        return;
      }

      if (message) {
        message.classList.remove('is-error');
        message.classList.add('is-visible');
        message.textContent = 'Thank you. Your enquiry has been recorded — our business support team will reply to you within one business day.';
      }
      form.reset();
      $$('.field, .checkbox', form).forEach(function (w) { w.classList.remove('is-valid', 'is-invalid'); });
    });
  }

  /* F7 — misc: current year fallback, image fallbacks -------------------- */
  function initImageFallbacks() {
    $$('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
        img.removeAttribute('src');
      });
    });
  }

  /* -----------------------------------------------------------------------
     BOOTSTRAP
     ----------------------------------------------------------------------- */
  function boot() {
    loadSprite().then(function () {
      buildHeader();
      buildFooter();
      hydrateMascots();
      fixHomeLinks();
    });

    applySEO();
    fixHomeLinks();
    initReveal();
    initSmoothScroll();
    initBackToTop();
    initNewsFilter();
    initFormValidation();
    initImageFallbacks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
