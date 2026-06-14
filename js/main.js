document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 3. Scroll Reveal Animation (3D depth)
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-3d');
    const revealOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const siblings = entry.target.parentElement.querySelectorAll(
                '.reveal-up, .reveal-left, .reveal-right, .reveal-3d'
            );
            let delay = 0;
            siblings.forEach((el, idx) => { if (el === entry.target) delay = idx * 80; });
            setTimeout(() => entry.target.classList.add('active'), delay);
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    setTimeout(() => {
        revealElements.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
        });
    }, 100);

    // 4. Project Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0 && projectCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filterValue = btn.getAttribute('data-filter');
                projectCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        card.classList.remove('active');
                        setTimeout(() => card.classList.add('active'), 50);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. 3D Card Tilt (Holographic hover)
    // ─────────────────────────────────────────────────────────────────────────────
    if (window.innerWidth >= 768) {
        const tiltTargets = document.querySelectorAll('.project-card, .exp-project-card, .bento-card');

        tiltTargets.forEach(card => {
            card.classList.add('tilt-card');
            const shine = document.createElement('div');
            shine.className = 'tilt-shine';
            card.appendChild(shine);

            const LIMIT = card.classList.contains('bento-card') ? 6 : 12;

            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
                const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);

                card.style.setProperty('--shine-x', ((e.clientX - rect.left) / rect.width  * 100) + '%');
                card.style.setProperty('--shine-y', ((e.clientY - rect.top)  / rect.height * 100) + '%');

                card.style.transform =
                    `perspective(800px) rotateX(${-dy * LIMIT}deg) rotateY(${dx * LIMIT}deg) scale3d(1.02,1.02,1.02)`;
                card.style.boxShadow =
                    `0 ${8 + dy * 4}px ${20 + Math.abs(dy) * 12}px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. Hero Avatar Mouse Parallax
    // ─────────────────────────────────────────────────────────────────────────────
    const heroSection  = document.getElementById('home');
    const avatarWrapper = document.querySelector('.avatar-wrapper');

    if (heroSection && avatarWrapper && window.innerWidth >= 768) {
        let heroMX = 0, heroMY = 0, curHX = 0, curHY = 0, heroRaf;

        heroSection.addEventListener('mousemove', e => {
            const rect = heroSection.getBoundingClientRect();
            heroMX = (e.clientX - rect.left) / rect.width  * 2 - 1;
            heroMY = (e.clientY - rect.top)  / rect.height * 2 - 1;
        });

        heroSection.addEventListener('mouseenter', () => {
            const tick = () => {
                curHX += (heroMX - curHX) * 0.08;
                curHY += (heroMY - curHY) * 0.08;
                avatarWrapper.style.transform =
                    `perspective(600px) rotateY(${curHX * 8}deg) rotateX(${-curHY * 6}deg)`;
                heroRaf = requestAnimationFrame(tick);
            };
            tick();
        });

        heroSection.addEventListener('mouseleave', () => {
            cancelAnimationFrame(heroRaf);
            avatarWrapper.style.transform = '';
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 7. Scroll Z-depth parallax for cards
    // ─────────────────────────────────────────────────────────────────────────────
    if (window.innerWidth >= 768) {
        const parallaxEls = document.querySelectorAll('.bento-card, .project-card, .timeline-content');
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    parallaxEls.forEach((el, i) => {
                        const rect   = el.getBoundingClientRect();
                        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
                        const factor = [0.012, 0.008, 0.015][i % 3];
                        const z      = Math.max(-18, Math.min(8, -center * factor));
                        if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
                            el.style.setProperty('--parallax-z', z + 'px');
                        }
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 8. Scroll-spy — Active nav link glow
    // ─────────────────────────────────────────────────────────────────────────────
    const sections   = document.querySelectorAll('main section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    const spyObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navAnchors.forEach(a => {
                    a.classList.toggle('active-link', a.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(sec => spyObserver.observe(sec));
});
