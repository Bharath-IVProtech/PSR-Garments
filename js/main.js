/* PSR Garments – site scripts */
(function () {
  'use strict';

  // WhatsApp number used for the WhatsApp buttons / fallback (country code + number, digits only)
  var WHATSAPP_NUMBER = '919490000123';

  // ===== Enquiry email settings (Web3Forms) =====
  // Get a free access key at https://web3forms.com by entering the email address that
  // should RECEIVE enquiries (bharath79966@gmail.com). Paste the key below.
  var WEB3FORMS_ACCESS_KEY = '7df4dfca-3d36-4626-b5a9-5f0be95bae1e';
  var WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');

  // ---------- Mobile menu ----------
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // ---------- Header shadow on scroll ----------
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Highlight current section in nav ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    links.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) observer.observe(section);
    });
  }

  // ---------- "Enquire" buttons on product cards pre-select the product ----------
  var productSelect = document.getElementById('w-product');
  function selectProduct(wanted) {
    Array.prototype.forEach.call(productSelect.options, function (opt) {
      if (opt.text === wanted) productSelect.value = opt.value;
    });
  }
  document.querySelectorAll('[data-product]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectProduct(btn.getAttribute('data-product'));
    });
  });

  // ---------- Gallery filters ----------
  var chips = Array.prototype.slice.call(document.querySelectorAll('.gallery__filters .chip'));
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));

  function applyFilter(category) {
    chips.forEach(function (chip) {
      var active = chip.getAttribute('data-filter') === category;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    galleryItems.forEach(function (item) {
      item.hidden = category !== 'all' && item.getAttribute('data-category') !== category;
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter')); });
  });

  // "View designs" links on product cards open the gallery pre-filtered
  document.querySelectorAll('.product__link[data-filter]').forEach(function (link) {
    link.addEventListener('click', function () { applyFilter(link.getAttribute('data-filter')); });
  });

  // ---------- Gallery lightbox ----------
  var CATEGORY_PRODUCT = {
    inskirts: "Ladies' Inskirts",
    nightwear: "Ladies' Nightwear",
    kurtis: "Ladies' Kurtis",
    ethnic: 'Ethnic Gowns & Anarkalis'
  };
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox && lightbox.querySelector('.lightbox__img');
  var lbCaption = lightbox && lightbox.querySelector('.lightbox__caption');
  var lbIndex = 0;

  function visibleItems() {
    return galleryItems.filter(function (item) { return !item.hidden; });
  }

  function showItem(index) {
    var items = visibleItems();
    if (!items.length) return;
    lbIndex = (index + items.length) % items.length;
    var item = items[lbIndex];
    var img = item.querySelector('img');
    lbImg.src = item.querySelector('a').getAttribute('href');
    lbImg.alt = img.alt;
    lbCaption.textContent = item.querySelector('strong').textContent;
  }

  if (lightbox && typeof lightbox.showModal === 'function') {
    galleryItems.forEach(function (item) {
      item.querySelector('a').addEventListener('click', function (e) {
        e.preventDefault();
        showItem(visibleItems().indexOf(item));
        lightbox.showModal();
      });
    });

    lightbox.addEventListener('click', function (e) {
      var action = e.target.closest('[data-lb]');
      action = action ? action.getAttribute('data-lb') : (e.target === lightbox ? 'close' : null);
      if (action === 'prev') showItem(lbIndex - 1);
      if (action === 'next') showItem(lbIndex + 1);
      if (action === 'close') lightbox.close();
      if (action === 'enquire') {
        var item = visibleItems()[lbIndex];
        selectProduct(CATEGORY_PRODUCT[item.getAttribute('data-category')]);
        var message = document.getElementById('w-message');
        message.value = 'Design: ' + lbCaption.textContent + (message.value ? '\n' + message.value : '');
        lightbox.close();
      }
    });

    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showItem(lbIndex - 1);
      if (e.key === 'ArrowRight') showItem(lbIndex + 1);
    });

    // Basic swipe support on touch screens
    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) showItem(lbIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  // ---------- Enquiry forms → email (via Web3Forms) ----------
  var MESSAGES = {
    required: 'This field is required.',
    name: 'Please enter at least 2 letters.',
    phone: 'Please enter a valid 10-digit mobile number.',
    email: 'Please enter a valid email address (e.g. name@example.com).',
    quantity: 'Please include a number, e.g. 500 pieces.',
    tooShort: 'Please enter at least {n} characters.',
    tooLong: 'Please keep this under {n} characters.'
  };

  function setError(field, message) {
    var wrap = field.closest('.field');
    if (!wrap) return;
    var existing = wrap.querySelector('.field__error');
    if (existing) existing.remove();
    wrap.classList.toggle('has-error', !!message);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) {
      var el = document.createElement('span');
      el.className = 'field__error';
      el.id = field.id + '-error';
      el.textContent = message;
      wrap.appendChild(el);
      field.setAttribute('aria-describedby', el.id);
    } else {
      field.removeAttribute('aria-describedby');
    }
  }

  function normalisePhone(value) {
    return value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  }

  function checkField(field) {
    var value = field.value.trim();
    if (!value) return field.required ? MESSAGES.required : '';

    if (field.type === 'tel' && !/^[6-9]\d{9}$/.test(normalisePhone(value))) return MESSAGES.phone;
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) return MESSAGES.email;
    if (field.autocomplete === 'name' && !/\p{L}.*\p{L}/u.test(value)) return MESSAGES.name;
    if (field.getAttribute('data-rule') === 'quantity' && !/\d/.test(value)) return MESSAGES.quantity;
    if (field.minLength > 0 && value.length < field.minLength) return MESSAGES.tooShort.replace('{n}', field.minLength);
    if (field.maxLength > 0 && value.length > field.maxLength) return MESSAGES.tooLong.replace('{n}', field.maxLength);
    return '';
  }

  function userFields(form) {
    return Array.prototype.filter.call(form.elements, function (el) {
      return el.closest('.field') && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
    });
  }

  function validate(form) {
    var firstInvalid = null;
    userFields(form).forEach(function (field) {
      var message = checkField(field);
      setError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function collect(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit') return;
      data[el.name] = el.value.trim();
    });
    if (data.Phone) data.Phone = '+91 ' + normalisePhone(data.Phone);
    if (!data.email) delete data.email; // Web3Forms uses "email" as the reply-to address
    data.from_name = 'PSR Garments Website';
    data['Submitted on'] = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    data['Page'] = window.location.href.split('#')[0];
    return data;
  }

  function whatsappLink(data) {
    var skip = /^(_|subject$|from_name$|botcheck$|access_key$|Page$|Submitted on$)/;
    var text = '*' + (data.Form || 'Enquiry') + ' – PSR Garments*\n\n' + Object.keys(data)
      .filter(function (k) { return !skip.test(k) && k !== 'Form' && data[k]; })
      .map(function (k) { return (k === 'email' ? 'Email' : k) + ': ' + data[k]; })
      .join('\n');
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  function showStatus(status, type, html) {
    status.className = 'form-status is-' + type;
    status.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  var SUCCESS_HTML = function (name) {
    var firstName = (name || '').split(' ')[0];
    return '<strong>Thank you' + (firstName ? ', ' + escapeHtml(firstName) : '') + '!</strong> ' +
      'Your enquiry has been sent successfully. Our team will contact you within one working day.';
  };

  // Plain (non-AJAX) POST to Web3Forms; it redirects back here with ?enquiry=sent
  function submitNatively(data, formId) {
    var back = window.location.origin + window.location.pathname + '?enquiry=sent&form=' + formId + '#' + formId;
    var fallback = document.createElement('form');
    fallback.method = 'POST';
    fallback.action = WEB3FORMS_ENDPOINT;
    fallback.style.display = 'none';
    var payload = Object.assign({}, data, { redirect: back });
    Object.keys(payload).forEach(function (key) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = payload[key];
      fallback.appendChild(input);
    });
    document.body.appendChild(fallback);
    HTMLFormElement.prototype.submit.call(fallback);
  }

  // Show the thank-you message after returning from a plain POST
  (function showReturnedSuccess() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('enquiry') !== 'sent') return;
    var form = document.getElementById(params.get('form'));
    var status = form && form.querySelector('.form-status');
    if (status) showStatus(status, 'success', SUCCESS_HTML(''));
    if (window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  })();

  function bindForm(id) {
    var form = document.getElementById(id);
    if (!form) return;
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    var buttonText = button.textContent;
    var sending = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      if (!validate(form)) {
        showStatus(status, 'error', 'Please correct the highlighted fields.');
        return;
      }

      var data = collect(form);

      // Bot filled the hidden trap field: pretend success, send nothing.
      if (data.botcheck) {
        form.reset();
        showStatus(status, 'success', 'Thank you! Your enquiry has been sent.');
        return;
      }
      delete data.botcheck;

      if (!/^[0-9a-f-]{36}$/i.test(WEB3FORMS_ACCESS_KEY)) {
        if (window.console) console.error('Enquiry form: WEB3FORMS_ACCESS_KEY is not set in js/main.js');
        showStatus(status, 'error',
          'Online enquiries are not set up yet. Please <a href="' + whatsappLink(data) + '" target="_blank" rel="noopener">send your enquiry on WhatsApp</a> ' +
          'or call <a href="tel:+919490000123">94900 00123</a>.');
        return;
      }
      data.access_key = WEB3FORMS_ACCESS_KEY;

      sending = true;
      button.disabled = true;
      button.classList.add('is-loading');
      button.textContent = 'Sending…';
      showStatus(status, 'info', 'Sending your enquiry, please wait…');

      var controller = 'AbortController' in window ? new AbortController() : null;
      var timer = controller && setTimeout(function () { controller.abort(); }, 20000);

      fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok || String(body.success) !== 'true') {
              throw new Error(body.message || ('HTTP ' + res.status));
            }
          });
        })
        .then(function () {
          form.reset();
          showStatus(status, 'success', SUCCESS_HTML(data.Name));
        })
        .catch(function (err) {
          var reason = (err && err.message) || '';
          if (window.console) console.warn('Enquiry form error:', reason);

          // The background request could not reach the server (network/browser restriction):
          // fall back to a normal form POST, which Web3Forms redirects back to this page.
          if (err && err.name === 'TypeError' && /^https?:$/.test(window.location.protocol)) {
            showStatus(status, 'info', 'Sending your enquiry, please wait…');
            submitNatively(data, id);
            return;
          }

          var hint = '';
          if (window.location.protocol === 'file:') {
            hint = '<br><em>Note: please test the form on the live website (or a local web server), not a file opened directly on this computer.</em>';
          }
          showStatus(status, 'error',
            'Sorry, we could not send your enquiry right now. Please try again, or ' +
            '<a href="' + whatsappLink(data) + '" target="_blank" rel="noopener">send it on WhatsApp</a> / ' +
            'call <a href="tel:+919490000123">94900 00123</a>.' + hint);
        })
        .then(function () {
          if (timer) clearTimeout(timer);
          sending = false;
          button.disabled = false;
          button.classList.remove('is-loading');
          button.textContent = buttonText;
        });
    });

    // Re-check a field when the visitor leaves it or corrects it
    form.addEventListener('focusout', function (e) {
      if (e.target.closest('.field') && e.target.value.trim()) setError(e.target, checkField(e.target));
    });
    form.addEventListener('input', function (e) {
      if (e.target.closest('.field.has-error')) setError(e.target, checkField(e.target));
    });
  }

  bindForm('wholesaleForm');
  bindForm('contactForm');

  // ---------- Footer year ----------
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
