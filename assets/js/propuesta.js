(function () {
      var nav = document.querySelector('.main-nav');
      if (!nav) {
        return;
      }

      var toggle = nav.querySelector('.nav-toggle');
      var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-links a'));
      if (!toggle) {
        return;
      }

      function closeMenu() {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
      }

      toggle.addEventListener('click', function () {
        var willOpen = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        toggle.setAttribute('aria-label', willOpen ? 'Close navigation menu' : 'Open navigation menu');
      });

      links.forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 760) {
          closeMenu();
        }
      });
    })();

(function () {
      var blocks = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window)) {
        blocks.forEach(function (el) { el.classList.add('visible'); });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      blocks.forEach(function (el) { observer.observe(el); });
    })();

    (function () {
      var heroImage = document.querySelector('.hero-main-image img');
      if (!heroImage) {
        return;
      }

      var slides = [];
      var currentIndex = 0;
      var fadeMs = 550;
      var intervalMs = 10000;
      var isTransitioning = false;
      var timer = null;

      function pushSlide(src, alt) {
        if (!src) {
          return;
        }

        for (var i = 0; i < slides.length; i++) {
          if (slides[i].src === src) {
            return;
          }
        }

        slides.push({
          src: src,
          alt: alt || 'Kitchen project by JML Cabinets'
        });
      }

      function shuffleSlides() {
        for (var i = slides.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = slides[i];
          slides[i] = slides[j];
          slides[j] = temp;
        }
      }

      function reshuffleForNewCycle() {
        if (slides.length < 2) {
          return;
        }

        var currentSrc = heroImage.getAttribute('src') || '';
        shuffleSlides();

        if (slides[0].src === currentSrc) {
          var swapIndex = 1 + Math.floor(Math.random() * (slides.length - 1));
          var first = slides[0];
          slides[0] = slides[swapIndex];
          slides[swapIndex] = first;
        }
      }

      function nextIndex() {
        if (!slides.length) {
          return 0;
        }

        var candidate = currentIndex + 1;
        if (candidate >= slides.length) {
          reshuffleForNewCycle();
          candidate = 0;
        }

        return candidate;
      }

      function goTo(index) {
        if (isTransitioning || !slides[index]) {
          return;
        }

        isTransitioning = true;

        var nextSlide = slides[index];
        var preload = new Image();

        preload.onload = function () {
          heroImage.classList.add('is-fading');

          window.setTimeout(function () {
            heroImage.src = nextSlide.src;
            heroImage.alt = nextSlide.alt;
            currentIndex = index;
            heroImage.classList.remove('is-fading');

            window.setTimeout(function () {
              isTransitioning = false;
            }, fadeMs);
          }, fadeMs);
        };

        preload.onerror = function () {
          isTransitioning = false;
        };

        preload.src = nextSlide.src;
      }

      function startTimer() {
        if (timer || slides.length < 2) {
          return;
        }

        timer = window.setInterval(function () {
          goTo(nextIndex());
        }, intervalMs);
      }

      function stopTimer() {
        if (!timer) {
          return;
        }

        window.clearInterval(timer);
        timer = null;
      }

      pushSlide(heroImage.getAttribute('src'), heroImage.getAttribute('alt'));

      var relatedImages = Array.prototype.slice.call(document.querySelectorAll('#portfolio .portfolio-item img'));
      relatedImages.forEach(function (img) {
        pushSlide(img.getAttribute('src'), img.getAttribute('alt'));
      });

      if (slides.length < 2) {
        return;
      }

      // Randomize the very first image shown on page load.
      reshuffleForNewCycle();
      heroImage.src = slides[0].src;
      heroImage.alt = slides[0].alt;
      currentIndex = 0;

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          stopTimer();
          return;
        }

        startTimer();
      });

      startTimer();
    })();

    (function () {
      var root = document.querySelector('[data-carousel="collections"]');
      if (!root) {
        return;
      }

      var track = root.querySelector('.collections-track');
      var slides = Array.prototype.slice.call(root.querySelectorAll('.collection-slide'));
      var prevBtn = root.querySelector('.collections-control.prev');
      var nextBtn = root.querySelector('.collections-control.next');
      var dotsWrap = root.querySelector('.collections-dots');
      var index = 0;

      function getPerView() {
        if (window.innerWidth <= 760) {
          return 1;
        }
        if (window.innerWidth <= 1050) {
          return 2;
        }
        return 3;
      }

      function getGap() {
        var styles = window.getComputedStyle(track);
        return parseFloat(styles.columnGap || styles.gap || 0) || 0;
      }

      function getMaxIndex() {
        return Math.max(0, slides.length - getPerView());
      }

      function buildDots() {
        if (!dotsWrap) {
          return;
        }
        dotsWrap.innerHTML = '';
        var total = getMaxIndex() + 1;
        for (var i = 0; i < total; i++) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'collections-dot';
          dot.setAttribute('aria-label', 'Go to design set ' + (i + 1));
          dot.dataset.index = String(i);
          dotsWrap.appendChild(dot);
        }
      }

      function update() {
        var maxIndex = getMaxIndex();
        if (index > maxIndex) {
          index = maxIndex;
        }

        var first = slides[0];
        if (!first) {
          return;
        }

        var offset = index * (first.getBoundingClientRect().width + getGap());
        track.style.transform = 'translateX(-' + offset + 'px)';

        if (prevBtn) {
          prevBtn.disabled = index <= 0;
        }
        if (nextBtn) {
          nextBtn.disabled = index >= maxIndex;
        }

        var dots = dotsWrap ? dotsWrap.querySelectorAll('.collections-dot') : [];
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.toggle('is-active', i === index);
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          index = Math.max(0, index - 1);
          update();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          index = Math.min(getMaxIndex(), index + 1);
          update();
        });
      }

      if (dotsWrap) {
        dotsWrap.addEventListener('click', function (event) {
          var target = event.target;
          if (!(target instanceof HTMLElement)) {
            return;
          }
          if (!target.classList.contains('collections-dot')) {
            return;
          }
          var nextIndex = parseInt(target.dataset.index || '0', 10);
          if (Number.isNaN(nextIndex)) {
            return;
          }
          index = Math.max(0, Math.min(getMaxIndex(), nextIndex));
          update();
        });
      }

      var resizeTimer;
      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          buildDots();
          update();
        }, 120);
      });

      buildDots();
      update();
    })();

    (function () {
      var modal = document.querySelector('[data-gallery-modal]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.portfolio-item[data-design]'));
      var galleries = window.PROJECT_HIGHLIGHT_GALLERIES || {};

      if (!modal || !cards.length) {
        return;
      }

      var imageEl = modal.querySelector('[data-gallery-image]');
      var titleEl = modal.querySelector('#gallery-modal-title');
      var countEl = modal.querySelector('[data-gallery-count]');
      var thumbsWrap = modal.querySelector('[data-gallery-thumbs]');
      var prevBtn = modal.querySelector('[data-gallery-prev]');
      var nextBtn = modal.querySelector('[data-gallery-next]');
      var closeBtn = modal.querySelector('.gallery-modal__close');
      var closeTargets = Array.prototype.slice.call(modal.querySelectorAll('[data-gallery-close]'));

      var currentImages = [];
      var currentIndex = 0;
      var currentTitle = '';
      var lastTrigger = null;

      function hasMultipleImages() {
        return currentImages.length > 1;
      }

      function refreshControls() {
        var many = hasMultipleImages();
        if (prevBtn) {
          prevBtn.hidden = !many;
        }
        if (nextBtn) {
          nextBtn.hidden = !many;
        }
        if (thumbsWrap) {
          thumbsWrap.hidden = !many;
        }
      }

      function updateActiveThumb() {
        if (!thumbsWrap) {
          return;
        }
        var thumbs = thumbsWrap.querySelectorAll('.gallery-modal__thumb');
        for (var i = 0; i < thumbs.length; i++) {
          thumbs[i].classList.toggle('is-active', i === currentIndex);
        }
      }

      function renderImage(nextIndex) {
        if (!currentImages.length || !imageEl) {
          return;
        }

        currentIndex = (nextIndex + currentImages.length) % currentImages.length;
        imageEl.src = currentImages[currentIndex];
        imageEl.alt = currentTitle + ' project image ' + (currentIndex + 1);

        if (countEl) {
          countEl.textContent = (currentIndex + 1) + ' / ' + currentImages.length;
        }

        updateActiveThumb();
      }

      function buildThumbs() {
        if (!thumbsWrap) {
          return;
        }

        thumbsWrap.innerHTML = '';

        for (var i = 0; i < currentImages.length; i++) {
          var thumb = document.createElement('button');
          thumb.type = 'button';
          thumb.className = 'gallery-modal__thumb';
          thumb.setAttribute('aria-label', 'Show image ' + (i + 1));
          thumb.dataset.index = String(i);

          var thumbImage = document.createElement('img');
          thumbImage.src = currentImages[i];
          thumbImage.alt = currentTitle + ' thumbnail ' + (i + 1);
          thumbImage.loading = 'lazy';
          thumbImage.decoding = 'async';

          thumb.appendChild(thumbImage);
          thumbsWrap.appendChild(thumb);
        }
      }

      function openGallery(card) {
        var design = card.getAttribute('data-design') || '';
        var gallery = galleries[design];

        if (!gallery || !gallery.images || !gallery.images.length) {
          return;
        }

        currentImages = gallery.images.slice();
        currentIndex = 0;
        currentTitle = gallery.title || 'Project gallery';
        lastTrigger = card;

        if (titleEl) {
          titleEl.textContent = currentTitle;
        }

        buildThumbs();
        refreshControls();
        renderImage(0);

        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        if (closeBtn) {
          closeBtn.focus();
        }
      }

      function closeGallery() {
        if (modal.hidden) {
          return;
        }

        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        currentImages = [];
        currentIndex = 0;

        if (imageEl) {
          imageEl.removeAttribute('src');
          imageEl.alt = '';
        }

        if (thumbsWrap) {
          thumbsWrap.innerHTML = '';
        }

        if (lastTrigger && typeof lastTrigger.focus === 'function') {
          lastTrigger.focus();
        }
      }

      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          openGallery(card);
        });

        card.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            openGallery(card);
          }
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          renderImage(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          renderImage(currentIndex + 1);
        });
      }

      if (thumbsWrap) {
        thumbsWrap.addEventListener('click', function (event) {
          var target = event.target;
          if (!(target instanceof HTMLElement)) {
            return;
          }
          while (target && target !== thumbsWrap && !target.classList.contains('gallery-modal__thumb')) {
            target = target.parentElement;
          }

          if (!target || target === thumbsWrap) {
            return;
          }

          var idx = parseInt(target.dataset.index || '0', 10);
          if (!Number.isNaN(idx)) {
            renderImage(idx);
          }
        });
      }

      closeTargets.forEach(function (target) {
        target.addEventListener('click', closeGallery);
      });

      document.addEventListener('keydown', function (event) {
        if (modal.hidden) {
          return;
        }

        if (event.key === 'Escape') {
          closeGallery();
          return;
        }

        if (!hasMultipleImages()) {
          return;
        }

        if (event.key === 'ArrowLeft') {
          renderImage(currentIndex - 1);
        }

        if (event.key === 'ArrowRight') {
          renderImage(currentIndex + 1);
        }
      });
    })();

