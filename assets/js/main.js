/* ГраалЬ — интерактив без зависимостей */
(function () {
  "use strict";

  var PHONE_PETUSHKI = "79646990016";
  var PHONE_POKROV = "79056180414";

  /* ---------- Шапка: тень при прокрутке ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("is-locked");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
      document.body.classList.toggle("is-locked", isOpen);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        burger.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  /* ---------- Фильтр каталога ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-card"));

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-filter");

      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      cards.forEach(function (card) {
        var match = value === "all" || card.getAttribute("data-category") === value;
        card.hidden = !match;
      });
    });
  });

  /* ---------- «Узнать цену» — подставить модель в форму ---------- */
  var commentField = document.getElementById("f-comment");
  var nameField = document.getElementById("f-name");

  Array.prototype.forEach.call(document.querySelectorAll("[data-product]"), function (btn) {
    btn.addEventListener("click", function () {
      var product = btn.getAttribute("data-product");
      if (commentField) {
        commentField.value = "Здравствуйте! Интересует «" + product + "». Подскажите, пожалуйста, стоимость.";
      }
      var request = document.getElementById("request");
      if (request && request.scrollIntoView) {
        request.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (nameField) window.setTimeout(function () { nameField.focus({ preventScroll: true }); }, 600);
    });
  });

  /* ---------- Форма: валидация и отправка в WhatsApp ---------- */
  var form = document.getElementById("request-form");
  var status = document.getElementById("formStatus");

  function digits(value) {
    return (value || "").replace(/\D/g, "");
  }

  function showError(field, message) {
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");
    if (status) {
      status.textContent = message;
      status.className = "form-status is-visible is-error";
    }
  }

  function clearError(field) {
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
  }

  if (form) {
    var nameInput = form.querySelector('[name="name"]');
    var phoneInput = form.querySelector('[name="phone"]');
    var placeSelect = form.querySelector('[name="place"]');
    var consent = form.querySelector('[name="consent"]') || document.getElementById("f-consent");

    [nameInput, phoneInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () { clearError(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (nameInput.value || "").trim();
      var phone = digits(phoneInput.value);
      var place = placeSelect ? placeSelect.value : "petushki";
      var comment = (commentField.value || "").trim();
      var placeLabel = place === "pokrov" ? "Покров" : place === "other" ? "другой район" : "Петушки";

      if (name.length < 2) {
        showError(nameInput, "Укажите имя — хотя бы два символа.");
        nameInput.focus();
        return;
      }
      if (phone.length < 10) {
        showError(phoneInput, "Проверьте номер телефона — не хватает цифр.");
        phoneInput.focus();
        return;
      }
      if (consent && !consent.checked) {
        if (status) {
          status.textContent = "Нужно согласие на обработку персональных данных.";
          status.className = "form-status is-visible is-error";
        }
        consent.focus();
        return;
      }

      var phoneFormatted = phone.charAt(0) === "8" ? "7" + phone.slice(1) : phone;
      if (phoneFormatted.charAt(0) !== "7") phoneFormatted = "7" + phoneFormatted;

      var text = "Здравствуйте! Меня зовут " + name + ".\n" +
        "Кладбище: " + placeLabel + ".\n" +
        "Интересует: " + (comment || "памятник из гранита") + ".\n" +
        "Телефон: +" + phoneFormatted;

      var target = place === "pokrov" ? PHONE_POKROV : PHONE_PETUSHKI;
      var url = "https://wa.me/" + target + "?text=" + encodeURIComponent(text);

      if (status) {
        status.textContent = "Открываем WhatsApp… Если окно не открылось, позвоните: " +
          (place === "pokrov" ? "+7 (905) 618-04-14" : "+7 (964) 699-00-16");
        status.className = "form-status is-visible";
      }

      var opened = window.open(url, "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        // Браузер заблокировал всплывающее окно — открываем в текущей вкладке.
        window.location.href = url;
      }
    });
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  var revealSelectors = [
    ".section-head",
    ".services-grid",
    ".catalog-grid",
    ".promo-inner",
    ".steps",
    ".prices-head, .price-table-wrap",
    ".faq-grid",
    ".contact-grid",
    ".contacts-map"
  ].join(", ");

  /* ---------- Яндекс Карта: переключение адресов ---------- */
  var mapFrame = document.getElementById("yandexMap");
  var mapCaption = document.getElementById("mapCaption");
  var mapLink = document.getElementById("mapLink");
  var mapTabs = Array.prototype.slice.call(document.querySelectorAll(".map-tab"));
  var MAPS = {
    petushki: {
      src: "https://yandex.ru/map-widget/v1/?ll=39.4675%2C55.9314&z=16&pt=39.4675%2C55.9314%2Cpm2rdm&l=map",
      caption: "Петушки, ул. Ленина, д.\u00a09",
      href: "https://yandex.ru/maps/?text=%D0%9F%D0%B5%D1%82%D1%83%D1%88%D0%BA%D0%B8%2C%20%D1%83%D0%BB.%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%209"
    },
    pokrov: {
      src: "https://yandex.ru/map-widget/v1/?ll=39.1689%2C55.9200&z=16&pt=39.1689%2C55.9200%2Cpm2rdm&l=map",
      caption: "Покров, ул. 3-го Интернационала, д.\u00a064В — гаражи напротив старого кладбища",
      href: "https://yandex.ru/maps/?text=%D0%9F%D0%BE%D0%BA%D1%80%D0%BE%D0%B2%2C%20%D1%83%D0%BB.%203-%D0%B3%D0%BE%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D0%BD%D0%B0%D1%86%D0%B8%D0%BE%D0%BD%D0%B0%D0%BB%D0%B0%2064%D0%92"
    }
  };
  function setMap(key) {
    var cfg = MAPS[key];
    if (!cfg || !mapFrame) return;
    if (mapFrame.getAttribute("src") !== cfg.src) mapFrame.setAttribute("src", cfg.src);
    if (mapCaption) mapCaption.innerHTML = key === "petushki" ? "Петушки, ул. Ленина, д.&nbsp;9" : "Покров, ул. 3-го Интернационала, д.&nbsp;64В — гаражи напротив старого кладбища";
    if (mapLink) mapLink.setAttribute("href", cfg.href);
    mapTabs.forEach(function (b) {
      var active = b.getAttribute("data-map") === key;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
  }
  mapTabs.forEach(function (btn) {
    btn.addEventListener("click", function () { setMap(btn.getAttribute("data-map")); });
  });
  // клик по адресу в карточках — подсветить нужный таб
  Array.prototype.forEach.call(document.querySelectorAll(".contact-card a[href*='yandex.ru/maps']"), function (a) {
    a.addEventListener("click", function () {
      var href = a.getAttribute("href") || "";
      if (href.indexOf("Петушки") !== -1) setMap("petushki");
      else if (href.indexOf("Покров") !== -1) setMap("pokrov");
    });
  });

  var blocks = Array.prototype.slice.call(document.querySelectorAll(revealSelectors));

  if ("IntersectionObserver" in window && blocks.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    blocks.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  } else {
    blocks.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Год в подвале ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
