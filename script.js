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

/* Get Inspired: drag-to-scroll + next-button */
(function(){
  var scroll = document.getElementById('inspiredScroll');
  var btn = document.getElementById('inspiredNext');
  if(!scroll) return;

  var isDown = false, startX = 0, scrollLeft = 0;
  scroll.addEventListener('pointerdown', function(e){
    isDown = true; scroll.setPointerCapture(e.pointerId);
    startX = e.clientX; scrollLeft = scroll.scrollLeft;
    scroll.classList.add('is-dragging');
  });
  scroll.addEventListener('pointermove', function(e){ if(!isDown) return; var x = e.clientX; var walk = (startX - x); scroll.scrollLeft = scrollLeft + walk; });
  scroll.addEventListener('pointerup', function(e){ isDown = false; try{ scroll.releasePointerCapture(e.pointerId); }catch(_){} scroll.classList.remove('is-dragging'); });
  scroll.addEventListener('pointerleave', function(){ isDown = false; scroll.classList.remove('is-dragging'); });

  if(btn){
    btn.addEventListener('click', function(){
      var card = scroll.querySelector('.inspired-card'); if(!card) return;
      var gap = 18; // fallback
      try{ gap = parseInt(getComputedStyle(scroll).gap) || gap; }catch(e){}
      var step = card.offsetWidth + gap;
      scroll.scrollBy({left: step, behavior: 'smooth'});
    });
  }

  // keyboard support
  scroll.addEventListener('keydown', function(e){ if(e.key === 'ArrowRight'){ e.preventDefault(); if(btn) btn.click(); } });
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
