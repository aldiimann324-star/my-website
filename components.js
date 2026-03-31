// js/components.js - Mobile Menu & Component Loader

/**
 * Memuat komponen HTML eksternal (header/footer) ke dalam placeholder
 */
async function loadComponent(selector, file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const placeholder = document.querySelector(selector);
        
        if (placeholder) {
            placeholder.innerHTML = html;
            
            // Trigger event setelah komponen dimuat
            const event = new CustomEvent('componentLoaded', {
                detail: { selector, file }
            });
            document.dispatchEvent(event);
            
            return true;
        }
    } catch (error) {
        console.error(`Error loading component ${file}:`, error);
        
        // Fallback content
        const placeholder = document.querySelector(selector);
        if (placeholder && selector === '#header-placeholder') {
            placeholder.innerHTML = `
                <header class="site-header">
                    <div class="container">
                        <div class="logo">
                            <a href="home.html">
                                <img src="img/logo.png" alt="PT Langgeng Jaya Service">
                                <div class="logo-text">
                                    <span class="logo-title">PT Langgeng Jaya</span>
                                    <span class="logo-subtitle">Service</span>
                                </div>
                            </a>
                        </div>
                        <div class="menu-toggle">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <nav class="main-nav">
                            <ul>
                                <li><a href="home.html">Beranda</a></li>
                                <li><a href="about.html">Tentang</a></li>
                                <li><a href="service.html">Layanan</a></li>
                                <li><a href="documentation.html">Dokumentasi</a></li>
                                <li><a href="contact.html">Kontak</a></li>
                            </ul>
                            <div class="nav-cta">
                                <a href="contact.html" class="cta-button">Konsultasi</a>
                            </div>
                        </nav>
                    </div>
                </header>
            `;
        }
        
        if (placeholder && selector === '#footer-placeholder') {
            placeholder.innerHTML = `
                <footer class="site-footer">
                    <div class="container">
                        <p>&copy; 2025 PT Langgeng Jaya Service. All rights reserved.</p>
                    </div>
                </footer>
            `;
        }
        
        // Re-initialize mobile menu setelah fallback
        initMobileMenu();
        setActiveNavLink();
    }
    return false;
}

/**
 * Inisialisasi mobile menu
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    const body = document.body;

    if (menuToggle && nav) {
        // Remove existing listener to avoid duplicate
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newToggle, menuToggle);
        const finalToggle = document.querySelector('.menu-toggle');
        
        finalToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            finalToggle.classList.toggle('active');
            nav.classList.toggle('active');
            body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });

        // Tutup menu saat klik link di dalam menu
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                finalToggle.classList.remove('active');
                nav.classList.remove('active');
                body.style.overflow = '';
            });
        });

        // Tutup menu saat klik di luar
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !finalToggle.contains(e.target)) {
                finalToggle.classList.remove('active');
                nav.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Tutup menu saat resize ke desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                finalToggle.classList.remove('active');
                nav.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }
}

/**
 * Set active navigation link berdasarkan halaman saat ini
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'home.html') ||
            (currentPage === 'index.html' && linkHref === 'home.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize semua komponen
 */
async function initializeComponents() {
    try {
        // Load header dan footer secara paralel
        await Promise.all([
            loadComponent('#header-placeholder', 'header.html'),
            loadComponent('#footer-placeholder', 'footer.html')
        ]);

        // Tunggu sebentar untuk memastikan DOM sudah ter-render
        setTimeout(() => {
            initMobileMenu();
            setActiveNavLink();
            
            // Trigger event bahwa semua komponen sudah dimuat
            window.dispatchEvent(new Event('headerFooterLoaded'));
        }, 100);

    } catch (error) {
        console.error('Error initializing components:', error);
    }
}

// Jalankan setelah DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
    initializeComponents();
}

// Export functions untuk penggunaan global
window.ComponentManager = {
    loadComponent,
    initMobileMenu,
    setActiveNavLink,
    initializeComponents
};