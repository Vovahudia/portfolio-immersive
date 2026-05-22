// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// Intercept anchor links for smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        // Ensure letstalk CTA (which also has href="#") doesn't scroll to top if not intended,
        // Actually, the footer-cta is for email copying, not scrolling, so we should skip it.
        if (this.id === 'copy-email-btn') return;

        if (targetId === '#') {
            lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }); // Scroll to top
        } else {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, { duration: 1.5, offset: -50, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
            }
        }
    });
});

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const cursorText = document.querySelector('.cursor-text');
const magneticElements = document.querySelectorAll('[data-magnetic]');
const projectCards = document.querySelectorAll('.project-card');

// Update cursor position
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
    });
});

// Magnetic hover effects
magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(el, {
            x: x * 0.4,
            y: y * 0.4,
            duration: 0.5,
            ease: 'power2.out'
        });
        cursor.classList.add('hover-magnetic');
    });

    el.addEventListener('mouseleave', () => {
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
        });
        cursor.classList.remove('hover-magnetic');
    });
});

// Project cards hover effect for cursor
projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        cursor.classList.add('hover-project');
        cursorText.textContent = card.getAttribute('data-cursor') || 'View';
    });
    card.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover-project');
        cursorText.textContent = '';
    });
});

// Loader & Initial GSAP Timeline
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    
    // Simulate loading
    let counter = { value: 0 };
    tl.to(counter, {
        value: 100,
        duration: 1.5,
        ease: 'power4.inOut',
        onUpdate: () => {
            document.querySelector('.loader-counter').textContent = Math.round(counter.value) + '%';
        }
    })
    .to('.loader', {
        yPercent: -100,
        duration: 1,
        ease: 'expo.inOut',
        onComplete: () => {
            document.body.classList.remove('loading');
        }
    })
    .to('.hero-headline .word', {
        y: '0%',
        duration: 1,
        ease: 'expo.out',
        stagger: 0.1
    }, "-=0.5")
    .to('.fade-in-up', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.2
    }, "-=0.8");
});

// Hero "Digital" Parallax Slice Reunion
gsap.to('.hero-headline .sliced-text', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'top -30%', // Finishes faster, before section is fully scrolled
        scrub: 1
    },
    '--slice-x1': '0px',
    '--slice-y1': '0px',
    '--slice-r1': '0deg',
    '--slice-s1': '0px',
    '--slice-c1': 'transparent',
    '--slice-x2': '0px',
    '--slice-y2': '0px',
    '--slice-r2': '0deg',
    '--slice-s2': '0px',
    '--slice-c2': 'transparent',
    ease: 'none'
});

// About Section Text Reveal
// Wait for fonts to load before splitting text to ensure correct line breaks
document.fonts.ready.then(() => {
    const splitManifesto = new SplitType('.manifesto-text', { types: 'lines, words' });
    gsap.to(splitManifesto.words, {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 80%',
            end: 'center center',
            scrub: 1
        },
        y: '0%',
        stagger: 0.1,
        ease: 'power1.out',
        duration: 1
    });
});

// Project Cards Reveal
gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out'
    });
});

// Noise Canvas Setup
const canvas = document.getElementById('noise-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function generateNoise() {
    const w = canvas.width;
    const h = canvas.height;
    const idata = ctx.createImageData(w, h);
    const buffer32 = new Uint32Array(idata.data.buffer);
    const len = buffer32.length;
    
    for (let i = 0; i < len; i++) {
        if (Math.random() < 0.5) {
            buffer32[i] = 0xff000000;
        }
    }
    ctx.putImageData(idata, 0, 0);
}
// Render static noise once to save performance
generateNoise();


// Copy to Clipboard (Email)
const copyEmailBtn = document.getElementById('copy-email-btn');
const copyFeedback = document.querySelector('.copy-feedback');

copyEmailBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = 'hudiavova@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
        copyFeedback.classList.add('show');
        setTimeout(() => {
            copyFeedback.classList.remove('show');
        }, 2000);
    });
});
