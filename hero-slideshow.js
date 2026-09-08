(() => {
    const container = document.querySelector('.hero-slideshow');
    if (!container || !Element.prototype.animate) return;
    const slides = [...container.querySelectorAll('.hero-slide')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const interval = 9000;
    const fade = 2000;
    let current = 0, direction = 1, elapsed = 0, last = 0, frame = 0;
    let visible = true, ready = false;
    const active = new Set();
    function animate(el, frames, duration) {
        const animation = el.animate(frames, { duration, fill: 'forwards', easing: 'linear' });
        active.add(animation);
        animation.onfinish = () => {
            // Keep final styles but release completed animation objects.
            const end = frames[frames.length - 1];
            Object.assign(el.style, end);
            animation.cancel();
            active.delete(animation);
        };
    }
    function pan(el) {
        const start = direction > 0 ? '-4%' : '4%';
        const end = direction > 0 ? '4%' : '-4%';
        animate(el, [{ transform: `translateX(${start})` }, { transform: `translateX(${end})` }], interval + fade);
        direction *= -1;
    }
    function next() {
        const previous = slides[current];
        current = (current + 1) % slides.length;
        const incoming = slides[current];
        previous.setAttribute('aria-hidden', 'true');
        incoming.removeAttribute('aria-hidden');
        animate(previous, [{ opacity: 1 }, { opacity: 0 }], fade);
        animate(incoming, [{ opacity: 0 }, { opacity: 1 }], fade);
        pan(incoming);
    }
    function tick(time) {
        if (last) elapsed += time - last;
        last = time;
        if (elapsed >= interval) { elapsed %= interval; next(); }
        frame = requestAnimationFrame(tick);
    }
    function sync() {
        cancelAnimationFrame(frame);
        last = 0;
        const running = ready && visible && !document.hidden && !reduced.matches;
        active.forEach(animation => running ? animation.play() : animation.pause());
        if (running) frame = requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', () => {
        if (reduced.matches) {
            active.forEach(animation => animation.cancel());
            active.clear();
            slides.forEach((slide, index) => {
                slide.style.opacity = index === current ? '1' : '0';
                slide.style.transform = 'none';
            });
            elapsed = 0;
        } else if (ready) {
            pan(slides[current]);
        }
        sync();
    });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(container);
    }
    // Decode before starting so a slow connection never produces an empty frame.
    Promise.all(slides.map(img => {
        if (img.dataset.src) img.src = img.dataset.src;
        return img.decode();
    })).then(() => { ready = true; pan(slides[0]); sync(); }).catch(() => {
        // The first, eagerly loaded image remains a usable static fallback.
    });
})();
