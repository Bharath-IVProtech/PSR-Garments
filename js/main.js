/* PSR Garments – site scripts */
(function () {
  'use strict';

  // WhatsApp number that receives enquiries (country code + number, digits only)
  var WHATSAPP_NUMBER = '919490000123';

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
  document.querySelectorAll('[data-product]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wanted = btn.getAttribute('data-product');
      Array.prototype.forEach.call(productSelect.options, function (opt) {
        if (opt.text === wanted) productSelect.value = opt.value;
      });
    });
  });

  // ---------- Forms → WhatsApp ----------
  function setError(field, message) {
    var wrap = field.closest('.field');
    var existing = wrap.querySelector('.field__error');
    if (existing) existing.remove();
    wrap.classList.toggle('has-error', !!message);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) {
      var el = document.createElement('span');
      el.className = 'field__error';
      el.textContent = message;
      wrap.appendChild(el);
    }
  }

  function validate(form) {
    var firstInvalid = null;
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      var value = field.value.trim();
      var message = '';
      if (field.required && !value) {
        message = 'This field is required.';
      } else if (field.type === 'tel' && value) {
        var digits = value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
        if (!/^[6-9]\d{9}$/.test(digits)) message = 'Please enter a valid 10-digit mobile number.';
      }
      setError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function sendToWhatsApp(title, rows) {
    var text = '*' + title + '*\n\n' + rows
      .filter(function (r) { return r[1]; })
      .map(function (r) { return r[0] + ': ' + r[1]; })
      .join('\n');
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }

  function bindForm(id, title, fields) {
    var form = document.getElementById(id);
    if (!form) return;
    var status = form.querySelector('.form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      if (!validate(form)) {
        status.textContent = 'Please correct the highlighted fields.';
        status.classList.add('is-error');
        return;
      }
      var rows = fields.map(function (f) {
        return [f[1], form.elements[f[0]].value.trim()];
      });
      sendToWhatsApp(title, rows);
      status.textContent = 'Thank you! WhatsApp has opened with your enquiry – please press Send to deliver it.';
      status.classList.add('is-success');
      form.reset();
    });

    form.addEventListener('input', function (e) {
      if (e.target.closest('.field.has-error')) setError(e.target, '');
    });
  }

  bindForm('wholesaleForm', 'Wholesale Enquiry – PSR Garments', [
    ['name', 'Name'],
    ['company', 'Company'],
    ['phone', 'Phone'],
    ['product', 'Product'],
    ['quantity', 'Quantity'],
    ['message', 'Message']
  ]);

  bindForm('contactForm', 'Website Enquiry – PSR Garments', [
    ['name', 'Name'],
    ['phone', 'Phone'],
    ['message', 'Message']
  ]);

  // ---------- Footer year ----------
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
