// Lenis Smooth Scroll Setup
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
})

// Handle Anchor Links with Lenis
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target && target !== '#') {
            lenis.scrollTo(target);
        }
    });
});

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Prevent layout thrashing on mobile when address bar hides/shows
ScrollTrigger.config({ ignoreMobileResize: true });

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// --- ANIMATIONS --- //

document.addEventListener("DOMContentLoaded", () => {

    // Header Scroll Effect
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Splitting text for animation
    const splitTypes = document.querySelectorAll('[text-split]');

    splitTypes.forEach((el) => {
        const text = new SplitType(el, { types: 'words, chars' });

        const tl = gsap.timeline();

        tl.from(text.words, {
            y: 100,
            opacity: 0,
            rotationZ: 5,
            duration: 1.2,
            stagger: 0.05,
            ease: "power4.out",
            delay: 0.2
        })
            .to('.hero__subtitle', {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out"
            }, "-=0.8")
            .to('.hero__actions', {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out"
            }, "-=0.8")
            .to('.hero__visual', {
                opacity: 1,
                duration: 1.5,
                ease: "power2.out"
            }, "-=1.2");
    });

    // Parallax Effect for Hero Image with matchMedia for performance
    let mm = gsap.matchMedia();

    mm.add({
        isDesktop: "(min-width: 769px)",
        isMobile: "(max-width: 768px)"
    }, (context) => {
        let { isMobile } = context.conditions;

        gsap.to("[data-parallax]", {
            yPercent: isMobile ? 5 : 15,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: isMobile ? 0.5 : true
            }
        });
    });

});

// --- Philosophy Section (Text Scrub) ---
const scrubText = new SplitType('#scrub-text', { types: 'words' });

gsap.to(scrubText.words, {
    backgroundPositionX: '0%',
    stagger: 0.1,
    ease: "none",
    scrollTrigger: {
        trigger: '.philosophy',
        start: 'top 50%',
        end: 'bottom 70%',
        scrub: 1,
    }
});

// --- Portfolio Section (Horizontal Scroll) ---
// Safari-safe: calculate distance from actual card elements instead of scrollWidth
const portfolioTrack = document.querySelector('.portfolio__track');

if (portfolioTrack) {
    function getScrollDistance() {
        const cards = portfolioTrack.querySelectorAll('.project-card');
        if (cards.length === 0) return 0;

        const firstCard = cards[0];
        const lastCard = cards[cards.length - 1];
        const trackRect = portfolioTrack.getBoundingClientRect();
        const lastCardRect = lastCard.getBoundingClientRect();

        const totalContentWidth = (lastCardRect.right - trackRect.left);
        const distance = totalContentWidth - window.innerWidth;

        return Math.max(0, distance);
    }

    // Use gsap.matchMedia to handle responsive behavior
    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        // Deskstop logic: GSAP horizontal scroll
        const distance = getScrollDistance();

        if (distance > 0) {
            gsap.to(portfolioTrack, {
                x: -distance,
                ease: "none",
                scrollTrigger: {
                    trigger: ".portfolio",
                    start: "top top",
                    end: "+=" + distance,
                    pin: true,
                    pinType: "transform",
                    scrub: 0.5,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    onRefresh: (self) => {
                        const newDist = getScrollDistance();
                        self.end = self.start + newDist;
                    }
                }
            });
        }

        return () => {
            // Cleanup: reset transforms when leaving desktop
            gsap.set(portfolioTrack, { x: 0 });
        };
    });

    // Force ScrollTrigger refresh on load
    window.addEventListener('load', () => {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
    });
}

// --- Solutions Section (Stacking Sticky Cards) ---
const solutionCards = gsap.utils.toArray('.solutions__card');

solutionCards.forEach((card) => {
    const overlay = card.querySelector('.solutions__overlay');

    if (overlay) {
        gsap.from(overlay, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: card,
                start: "top 60%",
                toggleActions: "play none none reverse"
            }
        });
    }
});

// --- Details Section ---
// Wrapped in 'load' to ensure SplitType and all resources are ready
window.addEventListener('load', () => {
    const detailsSection = document.querySelector('.details');
    if (!detailsSection) return;

    const detailsImg = detailsSection.querySelector('.details__img');
    const detailsImageWrap = detailsSection.querySelector('.details__image-wrap');

    // --- Dramatic Image Reveal ---
    // The wrapper starts small, rotated, and with rounded corners
    gsap.set(detailsImageWrap, {
        scale: 0.4,
        opacity: 0.3,
        borderRadius: "40px",
        rotation: -3,
    });
    // The inner image starts zoomed in for parallax counter-effect
    gsap.set(detailsImg, { scale: 1.6 });

    // Wrapper: scale up, straighten, sharpen corners, fade in
    gsap.to(detailsImageWrap, {
        scale: 1,
        opacity: 1,
        borderRadius: "8px",
        rotation: 0,
        ease: "none",
        scrollTrigger: {
            trigger: detailsSection,
            start: "top 90%",
            end: "top 10%",
            scrub: 0.6,
        }
    });

    // Inner image: zoom out slowly for cinematic parallax
    gsap.to(detailsImg, {
        scale: 1,
        ease: "none",
        scrollTrigger: {
            trigger: detailsSection,
            start: "top 90%",
            end: "bottom 20%",
            scrub: 0.6,
        }
    });

    // --- Text Reveal ---
    const titleEl = detailsSection.querySelector('.details__title');
    const descEl = detailsSection.querySelector('.details__desc');

    if (titleEl && typeof SplitType !== 'undefined') {
        const split = new SplitType(titleEl, { types: 'words, chars' });

        // Set initial hidden state
        gsap.set(split.chars, { opacity: 0, y: 60, rotateZ: 8 });

        // Animate chars on scroll
        gsap.to(split.chars, {
            opacity: 1,
            y: 0,
            rotateZ: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: "power4.out",
            scrollTrigger: {
                trigger: titleEl,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }

    if (descEl) {
        gsap.set(descEl, { opacity: 0, y: 40 });

        gsap.to(descEl, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: descEl,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    }

    // Refresh ScrollTrigger to account for new elements
    setTimeout(() => ScrollTrigger.refresh(), 100);
});

// --- Reviews Section ---
window.addEventListener('load', () => {
    const reviewsSection = document.querySelector('.reviews');
    if (!reviewsSection) return;

    const reviewHeader = reviewsSection.querySelector('.reviews__header');
    const reviewCards = gsap.utils.toArray('.review-card');

    // Header: title slides up, subtitle fades in
    if (reviewHeader) {
        const reviewTitle = reviewHeader.querySelector('.section-title');
        const reviewSub = reviewHeader.querySelector('.reviews__subtitle');

        if (reviewTitle) {
            gsap.set(reviewTitle, { opacity: 0, y: 40 });
            gsap.to(reviewTitle, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: reviewsSection,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        }

        if (reviewSub) {
            gsap.set(reviewSub, { opacity: 0, y: 20 });
            gsap.to(reviewSub, {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: reviewsSection,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        }
    }

    // Cards: staggered reveal from bottom with slight rotation
    reviewCards.forEach((card, i) => {
        gsap.set(card, {
            opacity: 0,
            y: 60,
            rotateX: 8,
            scale: 0.95
        });

        gsap.to(card, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.8,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: reviewsSection,
                start: "top 65%",
                toggleActions: "play none none reverse"
            }
        });
    });
});

// --- HPL Compact Section ---
window.addEventListener('load', () => {
    const hplSection = document.querySelector('.hpl-compact');
    if (!hplSection) return;

    const hplImg = hplSection.querySelector('.hpl-compact__img');
    const hplVisual = hplSection.querySelector('.hpl-compact__visual');

    gsap.set(hplVisual, {
        scale: 0.8,
        opacity: 0,
        borderRadius: "40px"
    });
    gsap.set(hplImg, { scale: 1.4 });

    gsap.to(hplVisual, {
        scale: 1,
        opacity: 1,
        borderRadius: "8px",
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: hplSection,
            start: "top 75%",
            toggleActions: "play none none reverse"
        }
    });

    gsap.to(hplImg, {
        scale: 1,
        ease: "none",
        scrollTrigger: {
            trigger: hplSection,
            start: "top 90%",
            end: "bottom 20%",
            scrub: 1
        }
    });

    const titleEl = hplSection.querySelector('.hpl-compact__title');
    const descEl = hplSection.querySelector('.hpl-compact__desc');
    const features = gsap.utils.toArray('.hpl-compact__features li');

    if (titleEl && typeof SplitType !== 'undefined') {
        const split = new SplitType(titleEl, { types: 'words, chars' });
        gsap.set(split.chars, { opacity: 0, y: 40, rotateX: -40 });

        gsap.to(split.chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: "power4.out",
            scrollTrigger: {
                trigger: titleEl,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }

    if (descEl) {
        gsap.from(descEl, {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: descEl,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }

    if (features.length > 0) {
        gsap.from(features, {
            opacity: 0,
            x: -20,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.hpl-compact__features',
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }
});

// --- Services Section (Accordion) ---
const accordions = document.querySelectorAll('.accordion__item');

accordions.forEach(acc => {
    const header = acc.querySelector('.accordion__header');

    header.addEventListener('click', () => {
        // Close others
        accordions.forEach(otherAcc => {
            if (otherAcc !== acc && otherAcc.classList.contains('active')) {
                otherAcc.classList.remove('active');
                otherAcc.querySelector('.accordion__content').style.maxHeight = null;
            }
        });

        // Toggle current
        acc.classList.toggle('active');
        const content = acc.querySelector('.accordion__content');

        if (acc.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + 'px';
        } else {
            content.style.maxHeight = null;
        }
    });
});

// Open first accordion by default
if (accordions.length > 0) {
    accordions[0].classList.add('active');
    const firstContent = accordions[0].querySelector('.accordion__content');
    firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
}

// --- Form Handling ---
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formMessages = document.getElementById('formMessages');
            const submitBtn = document.getElementById('submitBtn');
            const originalBtnText = submitBtn.textContent;

            // Validate
            const privacyCheckbox = contactForm.querySelector('input[name="privacy"]');
            if (privacyCheckbox && !privacyCheckbox.checked) {
                formMessages.textContent = 'Необходимо согласие на обработку персональных данных.';
                formMessages.className = 'form-messages error';
                formMessages.style.display = 'block';
                return;
            }

            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            formMessages.style.display = 'block';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData
                });

                const resultText = await response.text();

                if (response.ok) {
                    formMessages.textContent = 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.';
                    formMessages.className = 'form-messages success';
                    contactForm.reset();
                } else {
                    formMessages.textContent = resultText || 'Произошла ошибка при отправке. Пожалуйста, попробуйте позже.';
                    formMessages.className = 'form-messages error';
                }
            } catch (error) {
                formMessages.textContent = 'Произошла ошибка при отправке. Проверьте подключение к интернету.';
                formMessages.className = 'form-messages error';
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;

                // Clear message after 5 seconds if success
                if (formMessages.className.includes('success')) {
                    setTimeout(() => {
                        formMessages.style.display = 'none';
                        formMessages.className = 'form-messages';
                    }, 5000);
                }
            }
        });
    }
});

// --- Promotional Banner Slider ---
document.addEventListener('DOMContentLoaded', () => {
    const bannerSlides = document.querySelectorAll('.banner-slide');
    let currentBannerSlide = 0;

    if (bannerSlides.length > 0) {
        bannerSlides[currentBannerSlide].classList.add('active');

        setInterval(() => {
            bannerSlides[currentBannerSlide].classList.remove('active');
            bannerSlides[currentBannerSlide].classList.add('prev');

            // Reset styling quickly
            setTimeout(() => {
                const prevSlideIndex = (currentBannerSlide - 1 + bannerSlides.length) % bannerSlides.length;
                bannerSlides[prevSlideIndex].classList.remove('prev');
            }, 500);

            currentBannerSlide = (currentBannerSlide + 1) % bannerSlides.length;
            bannerSlides[currentBannerSlide].classList.add('active');
        }, 4500);
    }
});

// --- Dynamic Footer Year ---
document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// --- Cookie Banner ---
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesBtn = document.getElementById('acceptCookies');

    if (cookieBanner && acceptCookiesBtn) {
        // Check if user already accepted cookies
        if (!localStorage.getItem('cookiesAccepted')) {
            // Slight delay so it doesn't pop up instantly
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 2000);
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieBanner.classList.remove('show');
        });
    }
});
