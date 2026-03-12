// --- Smooth Scroll (Lenis) - Desktop only for performance ---
let lenis;
if (window.innerWidth > 768) {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// Handle Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            if (lenis) {
                lenis.scrollTo(targetElement);
            } else {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// --- ANIMATIONS --- //

// Integrate ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Prevent layout thrashing on mobile when address bar hides/shows
ScrollTrigger.config({ ignoreMobileResize: true });

document.addEventListener("DOMContentLoaded", () => {

    // Header Scroll Effect
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Splitting text for animation (Desktop only)
    let mmIntro = gsap.matchMedia();

    mmIntro.add("(min-width: 769px)", () => {
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
    });

    mmIntro.add("(max-width: 768px)", () => {
        // Simple reveal for mobile
        gsap.set('.hero__subtitle, .hero__actions, .hero__visual', { opacity: 0, y: 20 });
        gsap.to('.hero__subtitle, .hero__actions, .hero__visual', {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            delay: 0.5
        });
    });

    // Parallax Effect for Hero Image — Desktop only (imperceptible on mobile, saves perf)
    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        gsap.to("[data-parallax]", {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    });

});

// --- Philosophy Section (Text Scrub) ---
const philosophyTextEl = document.getElementById('scrub-text');
if (philosophyTextEl) {
    const scrubText = new SplitType('#scrub-text', { types: 'words' });
    
    gsap.to(scrubText.words, {
        backgroundPositionX: '0%',
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
            trigger: '.philosophy',
            start: window.innerWidth > 768 ? 'top 50%' : 'top 75%',
            end: window.innerWidth > 768 ? 'bottom 70%' : 'bottom 90%',
            scrub: 1,
        }
    });
}

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
// Desktop only: animate overlay entrance. Mobile: show immediately (no ScrollTrigger overhead)
let mmSolutions = gsap.matchMedia();

mmSolutions.add("(min-width: 769px)", () => {
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
});

// --- Details Section ---
// Wrapped in 'load' to ensure SplitType and all resources are ready
window.addEventListener('load', () => {
    const detailsSection = document.querySelector('.details');
    if (!detailsSection) return;

    const detailsImg = detailsSection.querySelector('.details__img');
    const detailsImageWrap = detailsSection.querySelector('.details__image-wrap');

    // --- Dramatic Image Reveal ---
    // The wrapper starts small
    gsap.set(detailsImageWrap, {
        scale: 0.8,
        opacity: 0.3,
        borderRadius: "8px"
    });
    // The inner image starts zoomed in for parallax counter-effect
    gsap.set(detailsImg, { scale: 1.3 });

    // Wrapper: scale up and fade in only (hardware accelerated)
    gsap.to(detailsImageWrap, {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
            trigger: detailsSection,
            start: "top 90%",
            end: "top 10%",
            scrub: window.innerWidth > 768 ? 0.6 : false,
            toggleActions: window.innerWidth <= 768 ? "play none none reverse" : undefined
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
            scrub: window.innerWidth > 768 ? 0.6 : false,
            toggleActions: window.innerWidth <= 768 ? "play none none reverse" : undefined
        }
    });

    // --- Text Reveal ---
    const titleEl = detailsSection.querySelector('.details__title');
    const descEl = detailsSection.querySelector('.details__desc');

    if (titleEl && typeof SplitType !== 'undefined') {
        if (window.innerWidth > 768) {
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
        } else {
            // Simple fade in for mobile
            gsap.from(titleEl, {
                opacity: 0,
                y: 30,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: titleEl,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        }
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
        borderRadius: "8px"
    });
    gsap.set(hplImg, { scale: 1.4 });

    gsap.to(hplVisual, {
        scale: 1,
        opacity: 1,
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
            scrub: window.innerWidth > 768 ? 1 : false,
            toggleActions: window.innerWidth <= 768 ? "play none none reverse" : undefined
        }
    });

    const titleEl = hplSection.querySelector('.hpl-compact__title');
    const descEl = hplSection.querySelector('.hpl-compact__desc');
    const features = gsap.utils.toArray('.hpl-compact__features li');

    if (titleEl && typeof SplitType !== 'undefined') {
        if (window.innerWidth > 768) {
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
        } else {
            // Simple fade in for mobile
            gsap.from(titleEl, {
                opacity: 0,
                y: 30,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: titleEl,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        }
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
const servicesSection = document.querySelector('.services');
const accordion = document.getElementById('services-accordion');
const accordions = document.querySelectorAll('.accordion__item');

if (servicesSection && accordion && accordions.length > 0) {
    // Function to open an item
    const openItem = (item) => {
        const content = item.querySelector('.accordion__content');
        if (!content) return;
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
    };

    // Function to close an item
    const closeItem = (item) => {
        const content = item.querySelector('.accordion__content');
        if (!content) return;
        item.classList.remove('active');
        content.style.maxHeight = null;
    };

    // Click behavior (available on all devices)
    accordions.forEach(acc => {
        const header = acc.querySelector('.accordion__header');
        header.addEventListener('click', () => {
            const isActive = acc.classList.contains('active');
            
            // Close others
            accordions.forEach(otherAcc => {
                if (otherAcc !== acc) closeItem(otherAcc);
            });

            // Toggle current if it's already active (close it), or open it
            if (isActive) closeItem(acc);
            else openItem(acc);
        });
    });

    // Scroll behavior (Desktop only)
    let mmAccordion = gsap.matchMedia();
    mmAccordion.add("(min-width: 769px)", () => {
        // Timeline that animations transition between items
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".services",
                start: "top 10%",
                end: "+=200%", // Longer for more natural feel
                pin: true,
                scrub: 1,
                // markers: true,
            }
        });

        // Initialize state
        openItem(accordions[0]);

        // Sequential expansion logic
        accordions.forEach((item, index) => {
            if (index === 0) return;

            tl.to({}, { 
                duration: 1,
                onStart: () => {
                    accordions.forEach((acc, idx) => {
                        if (idx === index) openItem(acc);
                        else closeItem(acc);
                    });
                },
                onReverseComplete: () => {
                    accordions.forEach((acc, idx) => {
                        if (idx === index - 1) openItem(acc);
                        else closeItem(acc);
                    });
                }
            }, "+=0.1"); // Add slight gap between items
        });

        tl.to({}, { duration: 0.5 }); // Final pause

        return () => {
            // Cleanup logic when screen becomes mobile
            accordions.forEach(acc => closeItem(acc));
            openItem(accordions[0]);
        };
    });

    // Mobile/Initial set
    if (window.innerWidth <= 768) {
        openItem(accordions[0]);
    }
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

// --- Contact Socials Animation ---
window.addEventListener('load', () => {
    const socialBlock = document.querySelector('.contact-socials');
    if (!socialBlock) return;

    const socialItems = gsap.utils.toArray('.social-item');
    const socialText = socialBlock.querySelector('.contact-socials__text');

    if (socialText) {
        gsap.set(socialText, { opacity: 0, y: 20 });
        gsap.to(socialText, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: socialBlock,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }

    if (socialItems.length > 0) {
        gsap.set(socialItems, {
            opacity: 0,
            y: 30,
            scale: 0.9
        });

        gsap.to(socialItems, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: ".contact-socials__list",
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    }
});

// --- Promotional Banner Slider with Intersection Observer for Performance ---
document.addEventListener('DOMContentLoaded', () => {
    const bannerSection = document.querySelector('.banner-section');
    const bannerSlides = document.querySelectorAll('.banner-slide');
    let currentBannerSlide = 0;
    let bannerInterval;

    if (bannerSlides.length > 0) {
        bannerSlides[currentBannerSlide].classList.add('active');

        const startBannerSlider = () => {
            if (bannerInterval) return;
            bannerInterval = setInterval(() => {
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
        };

        const stopBannerSlider = () => {
            clearInterval(bannerInterval);
            bannerInterval = null;
        };

        // Pause animation when banner is not visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startBannerSlider();
                } else {
                    stopBannerSlider();
                }
            });
        }, { threshold: 0.1 });

        if (bannerSection) {
            observer.observe(bannerSection);
        }
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
// --- Category Variants Animation ---
window.addEventListener('load', () => {
    const variantCards = gsap.utils.toArray('.variant-card');
    if (variantCards.length > 0) {
        // Set initial state via GSAP instead of CSS for robustness
        gsap.set(variantCards, { opacity: 0, y: 30 });

        gsap.to(variantCards, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".category-grid",
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    }
});
