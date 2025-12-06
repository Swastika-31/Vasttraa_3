// script.js — small helpers (no critical JS required)
// Currently adds the current year to the footer.

document.addEventListener('DOMContentLoaded', function(){
  var y = new Date().getFullYear();
  var el = document.getElementById('year');
  if(el) el.textContent = y;
});

/* If you'd like a JS-powered mobile menu instead of the CSS checkbox hack,
   I can add a small toggle script. For now the layout is CSS-only. */

/* Smooth scroll for in-page navigation links that have [data-scroll] */
(function(){
  document.querySelectorAll('a[data-scroll]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var href = a.getAttribute('href');
      if(!href) return;
      try{ var target = document.querySelector(href); if(target) target.scrollIntoView({behavior:'smooth', block:'start'}); }catch(err){}
    });
  });
})();

/* (Typewriter now handled in CSS; removed JS block) */

/* Get Inspired carousel: auto-slide + manual horizontal scroll */
(function(){
  var carousel = document.getElementById('inspiredCarousel');
  var prevBtn = document.getElementById('inspiredPrev');
  var nextBtn = document.getElementById('inspiredNext');
  if(!carousel) return;

  var isHover = false; var timer = null; var interval = 3000;

  function getGap(){
    try{ return parseInt(getComputedStyle(carousel).gap) || 18; }catch(e){ return 18; }
  }

  function getStep(){
    var card = carousel.querySelector('.inspire-card');
    if(!card) return carousel.clientWidth;
    var gap = getGap();
    return card.offsetWidth + gap;
  }

  function autoSlide(){
    if(isHover) return;
    var step = getStep();
    // smooth advance
    carousel.scrollBy({left: step, behavior: 'smooth'});
    // if we've reached (or passed) the end, reset to start after transition
    setTimeout(function(){
      if(carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2){
        carousel.scrollTo({left:0});
      }
    }, 600);
  }

  function start(){ stop(); timer = setInterval(autoSlide, interval); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  // hover pause/resume
  carousel.addEventListener('mouseenter', function(){ isHover = true; });
  carousel.addEventListener('mouseleave', function(){ isHover = false; });

  // nav buttons
  if(prevBtn) prevBtn.addEventListener('click', function(){ carousel.scrollBy({left: -getStep(), behavior:'smooth'}); start(); });
  if(nextBtn) nextBtn.addEventListener('click', function(){ carousel.scrollBy({left: getStep(), behavior:'smooth'}); start(); });

  // pointer drag for desktop (progressive enhancement)
  var isDown = false, startX = 0, scrollLeft = 0;
  carousel.addEventListener('pointerdown', function(e){ isDown = true; startX = e.clientX; scrollLeft = carousel.scrollLeft; carousel.classList.add('dragging'); carousel.setPointerCapture(e.pointerId); stop(); });
  carousel.addEventListener('pointermove', function(e){ if(!isDown) return; var x = e.clientX; var walk = (startX - x); carousel.scrollLeft = scrollLeft + walk; });
  carousel.addEventListener('pointerup', function(e){ if(!isDown) return; isDown = false; carousel.classList.remove('dragging'); try{ carousel.releasePointerCapture(e.pointerId); }catch(_){} start(); });
  carousel.addEventListener('pointercancel', function(){ isDown = false; carousel.classList.remove('dragging'); start(); });

  // keyboard support
  carousel.addEventListener('keydown', function(e){ if(e.key === 'ArrowLeft'){ e.preventDefault(); if(prevBtn) prevBtn.click(); } if(e.key === 'ArrowRight'){ e.preventDefault(); if(nextBtn) nextBtn.click(); } });

  // make focusable for keyboard navigation
  carousel.setAttribute('tabindex','0');

  // start autoplay
  start();
})();

/* Catalogue Slideshow: Horizontal slide animation (Denim, Jackets) */
(function(){
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var sliders = document.querySelectorAll('.catalogue-slider');

  sliders.forEach(function(slider){
    var viewport = slider.querySelector('.slider-viewport');
    var track = slider.querySelector('.slider-track');
    var leftBtn = slider.querySelector('.slider-btn.left');
    var rightBtn = slider.querySelector('.slider-btn.right');
    var folder = slider.getAttribute('data-folder');
    var imageCount = parseInt(slider.getAttribute('data-count')) || 4;

    var currentIndex = 0;
    var timer = null;
    var isHovering = false;
    var interactTimer = null;
    var isTouch = false;
    var touchStart = 0;

    // Dynamically load images
    for(var i = 1; i <= imageCount; i++){
      var img = document.createElement('img');
      img.src = 'assets/' + folder + '/' + i + '.jpg';
      img.alt = folder.charAt(0).toUpperCase() + folder.slice(1) + ' ' + i;
      img.setAttribute('loading', 'lazy');
      track.appendChild(img);
    }

    var images = Array.from(track.querySelectorAll('img'));

    function updateSlide(){
      if(!prefersReduced){
        track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      }
    }

    function next(){
      currentIndex = (currentIndex + 1) % imageCount;
      updateSlide();
      resetAutoAdvance();
    }

    function prev(){
      currentIndex = (currentIndex - 1 + imageCount) % imageCount;
      updateSlide();
      resetAutoAdvance();
    }

    function autoAdvance(){
      if(!isHovering && !prefersReduced){
        next();
      }
    }

    function startAutoAdvance(){
      if(prefersReduced) return;
      if(timer) clearInterval(timer);
      timer = setInterval(autoAdvance, 4000);
    }

    function stopAutoAdvance(){
      if(timer){
        clearInterval(timer);
        timer = null;
      }
    }

    function resetAutoAdvance(){
      stopAutoAdvance();
      if(interactTimer) clearTimeout(interactTimer);
      interactTimer = setTimeout(function(){
        startAutoAdvance();
      }, 1500);
    }

    // Button handlers
    if(leftBtn) leftBtn.addEventListener('click', prev);
    if(rightBtn) rightBtn.addEventListener('click', next);

    // Hover pause/resume
    slider.addEventListener('mouseenter', function(){
      isHovering = true;
      stopAutoAdvance();
    });
    slider.addEventListener('mouseleave', function(){
      isHovering = false;
      resetAutoAdvance();
    });

    // Touch swipe
    viewport.addEventListener('touchstart', function(e){
      isTouch = true;
      touchStart = e.touches[0].clientX;
      stopAutoAdvance();
    }, {passive:true});

    viewport.addEventListener('touchend', function(e){
      if(!isTouch) return;
      var touchEnd = e.changedTouches[0].clientX;
      var diff = touchStart - touchEnd;
      if(Math.abs(diff) > 50){
        if(diff > 0) next();
        else prev();
      }
      isTouch = false;
      resetAutoAdvance();
    }, {passive:true});

    // Keyboard navigation
    slider.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){
        e.preventDefault();
        prev();
      } else if(e.key === 'ArrowRight'){
        e.preventDefault();
        next();
      }
    });

    slider.setAttribute('tabindex', '0');

    // Start autoplay
    startAutoAdvance();
  });
})();

/* Denim & Jackets sliders (same logic as Jewels) */
(function(){
  var sliders = ['.denim-slider', '.jackets-slider'];
  sliders.forEach(function(selector){
    var slider = document.querySelector(selector);
    if(!slider) return;
    var track = slider.querySelector('.slider-track');
    var leftNav = slider.querySelector('.slider-nav.left');
    var rightNav = slider.querySelector('.slider-nav.right');
    var folder = selector === '.denim-slider' ? 'denim' : 'jackets';
    var total = 9;
    var idx = 0;
    var interval = 2500;
    var timer = null;
    var isHover = false;
    for(var i=1;i<=total;i++){
      var img = document.createElement('img');
      img.className = 'slider-item';
      img.src = 'assets/'+folder+'/'+i+'.jpg';
      img.alt = folder.charAt(0).toUpperCase()+folder.slice(1)+' '+i;
      if(i===1) img.classList.add('is-active');
      track.appendChild(img);
    }
    var slides = Array.prototype.slice.call(track.querySelectorAll('.slider-item'));
    function show(n){
      slides.forEach(function(s, i){ s.classList.toggle('is-active', i === n); });
      idx = (n + total) % total;
    }
    function next(){ show((idx+1)%total); }
    function prev(){ show((idx-1+total)%total); }
    function start(){ if(timer) clearInterval(timer); timer = setInterval(function(){ if(!isHover) next(); }, interval); }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    slider.addEventListener('mouseenter', function(){ isHover = true; });
    slider.addEventListener('mouseleave', function(){ isHover = false; });
    if(leftNav) leftNav.addEventListener('click', function(){ prev(); start(); });
    if(rightNav) rightNav.addEventListener('click', function(){ next(); start(); });
    var pointerDown = false, startX=0, deltaX=0;
    slider.addEventListener('pointerdown', function(e){ pointerDown = true; startX = e.clientX; slider.classList.add('dragging'); });
    window.addEventListener('pointermove', function(e){ if(!pointerDown) return; deltaX = e.clientX - startX; });
    window.addEventListener('pointerup', function(e){ if(!pointerDown) return; pointerDown = false; slider.classList.remove('dragging'); if(Math.abs(deltaX) > 40){ if(deltaX < 0) next(); else prev(); start(); } deltaX = 0; });
    slider.addEventListener('keydown', function(e){ if(e.key === 'ArrowLeft'){ prev(); start(); } if(e.key === 'ArrowRight'){ next(); start(); } });
    slider.setAttribute('tabindex','0');
    start();
  });
})();

/* Shop auto-scroll row: fast continuous auto-scroll with manual override */
(function(){
  var sc = document.getElementById('shopScroll');
  if(!sc) return;

  // duplicate children for seamless loop
  var children = Array.from(sc.children);
  var totalChildren = children.length;
  if(totalChildren === 0) return;

  children.forEach(function(c){ sc.appendChild(c.cloneNode(true)); });

  var contentWidth = sc.scrollWidth / 2; // original width
  var duration = 5500; // ms for full original width (5.5s)
  var paused = false;
  var userInteracting = false;
  var rafId = null;
  var lastTs = null;

  // speed in px per ms
  function speed(){ return contentWidth / duration; }

  function step(ts){
    if(lastTs === null) lastTs = ts;
    var delta = ts - lastTs;
    lastTs = ts;
    if(!paused && !userInteracting){
      sc.scrollLeft += speed() * delta;
      if(sc.scrollLeft >= contentWidth){ sc.scrollLeft -= contentWidth; }
    }
    rafId = requestAnimationFrame(step);
  }

  // start RAF
  rafId = requestAnimationFrame(step);

  // Pause on hover
  sc.addEventListener('mouseenter', function(){ paused = true; });
  sc.addEventListener('mouseleave', function(){ paused = false; lastTs = null; });

  // Manual interaction detection
  var interactTimer = null;
  function userStart(){ userInteracting = true; if(rafId) lastTs = null; if(interactTimer) clearTimeout(interactTimer); }
  function userEnd(){ if(interactTimer) clearTimeout(interactTimer); interactTimer = setTimeout(function(){ userInteracting = false; lastTs = null; }, 1500); }

  // pointer events
  sc.addEventListener('pointerdown', function(e){ userStart(); sc.setPointerCapture(e.pointerId); sc.classList.add('dragging'); startX = e.clientX; startScroll = sc.scrollLeft; });
  sc.addEventListener('pointermove', function(e){ if(e.pressure === 0 && !e.buttons) return; if(userInteracting){ var dx = e.clientX - (window.startX||0); /* not used */ } });
  sc.addEventListener('pointerup', function(e){ try{ sc.releasePointerCapture(e.pointerId); }catch(_){} sc.classList.remove('dragging'); userEnd(); });

  // wheel / touch scrolling
  sc.addEventListener('scroll', function(){ userStart(); userEnd(); });

  // cleanup on page hide
  document.addEventListener('visibilitychange', function(){ if(document.hidden){ if(rafId) cancelAnimationFrame(rafId); } else { lastTs = null; rafId = requestAnimationFrame(step); } });

})();

/* Jewels slideshow: auto-fade + manual drag/arrow navigation */
(function(){
  var slider = document.querySelector('.jewels-slider');
  if(!slider) return;

  var track = slider.querySelector('.slider-track');
  var leftNav = slider.querySelector('.slider-nav.left');
  var rightNav = slider.querySelector('.slider-nav.right');

  var total = 9;
  var idx = 0;
  var interval = 2500;
  var timer = null;
  var isHover = false;

  // create slides
  for(var i=1;i<=total;i++){
    var img = document.createElement('img');
    img.className = 'slider-item';
    img.src = 'assets/jewels/' + i + '.jpg';
    img.alt = 'Jewels '+i;
    if(i===1) img.classList.add('is-active');
    track.appendChild(img);
  }

  var slides = Array.prototype.slice.call(track.querySelectorAll('.slider-item'));

  function show(n){
    slides.forEach(function(s, i){ s.classList.toggle('is-active', i === n); });
    idx = (n + total) % total;
  }

  function next(){ show((idx+1)%total); }
  function prev(){ show((idx-1+total)%total); }

  function start(){ if(timer) clearInterval(timer); timer = setInterval(function(){ if(!isHover) next(); }, interval); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  // hover pause
  slider.addEventListener('mouseenter', function(){ isHover = true; document.querySelectorAll('.denim-slider, .jackets-slider, .jewels-slider').forEach(function(s){ s.dataset.paused = 'true'; }); });
  slider.addEventListener('mouseleave', function(){ isHover = false; document.querySelectorAll('.denim-slider, .jackets-slider, .jewels-slider').forEach(function(s){ s.dataset.paused = 'false'; }); });

  // nav clicks
  if(leftNav) leftNav.addEventListener('click', function(){ prev(); start(); });
  if(rightNav) rightNav.addEventListener('click', function(){ next(); start(); });

  // pointer drag (swipe) to change slide
  var pointerDown = false, startX=0, deltaX=0;
  slider.addEventListener('pointerdown', function(e){ pointerDown = true; startX = e.clientX; slider.classList.add('dragging'); });
  window.addEventListener('pointermove', function(e){ if(!pointerDown) return; deltaX = e.clientX - startX; });
  window.addEventListener('pointerup', function(e){ if(!pointerDown) return; pointerDown = false; slider.classList.remove('dragging'); if(Math.abs(deltaX) > 40){ if(deltaX < 0) next(); else prev(); start(); } deltaX = 0; });

  // keyboard navigation
  slider.addEventListener('keydown', function(e){ if(e.key === 'ArrowLeft'){ prev(); start(); } if(e.key === 'ArrowRight'){ next(); start(); } });

  // ensure focusable for keyboard
  slider.setAttribute('tabindex','0');

  // start autoplay
  start();
})();

/* Denim & Jackets sliders (same logic as Jewels, with synced pause/resume) */
(function(){
  var sliders = ['.denim-slider', '.jackets-slider'];
  sliders.forEach(function(selector){
    var slider = document.querySelector(selector);
    if(!slider) return;
    var track = slider.querySelector('.slider-track');
    var leftNav = slider.querySelector('.slider-nav.left');
    var rightNav = slider.querySelector('.slider-nav.right');
    var folder = selector === '.denim-slider' ? 'denim' : 'jackets';
    var total = 4;
    var idx = 0;
    var interval = 2500;
    var timer = null;
    var isHover = false;
    for(var i=1;i<=total;i++){
      var img = document.createElement('img');
      img.className = 'slider-item';
      img.src = 'assets/'+folder+'/'+i+'.jpg';
      img.alt = folder.charAt(0).toUpperCase()+folder.slice(1)+' '+i;
      if(i===1) img.classList.add('is-active');
      track.appendChild(img);
    }
    var slides = Array.prototype.slice.call(track.querySelectorAll('.slider-item'));
    function show(n){
      slides.forEach(function(s, i){ s.classList.toggle('is-active', i === n); });
      idx = (n + total) % total;
    }
    function next(){ show((idx+1)%total); }
    function prev(){ show((idx-1+total)%total); }
    function start(){ if(timer) clearInterval(timer); timer = setInterval(function(){ if(!isHover && !slider.dataset.paused) next(); }, interval); }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    slider.addEventListener('mouseenter', function(){ isHover = true; document.querySelectorAll('.denim-slider, .jackets-slider, .jewels-slider').forEach(function(s){ s.dataset.paused = 'true'; }); });
    slider.addEventListener('mouseleave', function(){ isHover = false; document.querySelectorAll('.denim-slider, .jackets-slider, .jewels-slider').forEach(function(s){ s.dataset.paused = 'false'; }); });
    if(leftNav) leftNav.addEventListener('click', function(){ prev(); start(); });
    if(rightNav) rightNav.addEventListener('click', function(){ next(); start(); });
    var pointerDown = false, startX=0, deltaX=0;
    slider.addEventListener('pointerdown', function(e){ pointerDown = true; startX = e.clientX; slider.classList.add('dragging'); });
    window.addEventListener('pointermove', function(e){ if(!pointerDown) return; deltaX = e.clientX - startX; });
    window.addEventListener('pointerup', function(e){ if(!pointerDown) return; pointerDown = false; slider.classList.remove('dragging'); if(Math.abs(deltaX) > 40){ if(deltaX < 0) next(); else prev(); start(); } deltaX = 0; });
    slider.addEventListener('keydown', function(e){ if(e.key === 'ArrowLeft'){ prev(); start(); } if(e.key === 'ArrowRight'){ next(); start(); } });
    slider.setAttribute('tabindex','0');
    start();
  });
})();

/* Owners page: modal interactions (delegated) */
(function(){
  var modal = document.getElementById('founder-modal');
  if(!modal) return; // only on owners.html

  var modalImg = modal.querySelector('#modal-img');
  var modalName = modal.querySelector('#modal-name');
  var modalRole = modal.querySelector('#modal-role');
  var modalBio = modal.querySelector('#modal-bio');
  var closeBtn = modal.querySelector('.modal-close');

  function openModal(data){
    modalImg.src = data.img; modalImg.alt = data.name;
    modalName.textContent = data.name; modalRole.textContent = data.role; modalBio.textContent = data.bio;
    modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }

  document.querySelectorAll('.modal-trigger').forEach(function(el){
    el.addEventListener('click', function(){
      var data = { name: el.getAttribute('data-name'), role: el.getAttribute('data-role'), bio: el.getAttribute('data-bio'), img: el.getAttribute('data-img') };
      openModal(data);
    });
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
})();

/* Socials carousel controls */
(function(){
  var wrap = document.getElementById('socials-carousel');
  if(!wrap) return;
  var prev = document.querySelector('.carousel-btn.prev');
  var next = document.querySelector('.carousel-btn.next');
  if(!prev || !next) return;
  var step = 220;
  prev.addEventListener('click', function(){ wrap.scrollBy({left:-step,behavior:'smooth'}); });
  next.addEventListener('click', function(){ wrap.scrollBy({left:step,behavior:'smooth'}); });
})();

/* Hero slideshow module
   - Pure JS crossfade slideshow
   - Images: assets/hero.jpg, assets/hero2.jpg, assets/hero3.jpg
   - Uses CSS opacity transitions for smooth fades
   - Respects prefers-reduced-motion and pauses on page hide
*/
(function(){
  'use strict';

  var images = ['assets/hero.jpg','assets/hero2.jpg','assets/hero3.jpg'];
  var interval = 4500; // ms between slides
  var fadeMs = 1000;   // should match CSS --hero-fade-duration

  var hero = document.querySelector('.hero');
  if(!hero) return;

  // Preload images
  var loaded = 0;
  var preloads = images.map(function(src){
    var i = new Image(); i.src = src; i.onload = function(){ loaded++; };
    i.onerror = function(){ loaded++; };
    return i;
  });

  // Create slide elements and insert before overlay so overlay/content stay on top
  var overlay = hero.querySelector('.hero-overlay');
  var slides = images.map(function(src){
    var d = document.createElement('div');
    d.className = 'hero-slide';
    d.style.backgroundImage = 'url("'+src+'")';
    if(overlay) hero.insertBefore(d, overlay); else hero.appendChild(d);
    return d;
  });

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;
  var timer = null;

  function showInitial(){
    slides.forEach(function(s, i){ s.classList.remove('is-active'); });
    slides[0].classList.add('is-active');
    current = 0;
  }

  function start(){
    if(prefersReduced) { showInitial(); return; }
    showInitial();
    timer = setInterval(next, interval);
  }

  function next(){
    var nextIndex = (current + 1) % slides.length;
    slides[nextIndex].classList.add('is-active');
    // after fade duration, remove old active
    setTimeout(function(){
      slides[current].classList.remove('is-active');
      current = nextIndex;
    }, fadeMs + 20);
  }

  // start when first image has at least begun loading, fallback to short timeout
  var startTimeout = setTimeout(start, 300);
  if(preloads[0] && preloads[0].complete) { clearTimeout(startTimeout); start(); }
  else if(preloads[0]) preloads[0].onload = function(){ clearTimeout(startTimeout); start(); };

  // Pause on page hide and resume when visible
  document.addEventListener('visibilitychange', function(){
    if(document.hidden){ if(timer){ clearInterval(timer); timer = null; } }
    else { if(!timer && !prefersReduced) timer = setInterval(next, interval); }
  });

})();
