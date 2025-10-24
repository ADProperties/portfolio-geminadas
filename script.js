window.addEventListener('scroll', () => {
    const heroSection = document.getElementById('hero-section');
    const header = document.querySelector('#main-content header');
    const contactBar = document.getElementById('contact-bar'); // (Se tiver a barra de contacto)

    if (heroSection.style.display === 'none') {
        if (contactBar) {
            contactBar.classList.remove('contact-bar-hidden');
        }

        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        document.getElementById('scroll-progress').style.width = progress + '%';

        if (scrollTop > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }

    } else {
        document.getElementById('scroll-progress').style.width = '0%';
        header.classList.remove('header-scrolled');
        if (contactBar) {
            contactBar.classList.add('contact-bar-hidden');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero-section');
    const mainContent = document.getElementById('main-content');
    const viewVillasBtn = document.getElementById('view-villas-btn');
    
    // === LÓGICA DE NAVEGAÇÃO ATUALIZADA ===
    
    const allTabs = document.querySelectorAll('.tab-button');
    const allMainContents = document.querySelectorAll('.main-tab-content');
    const allPageContents = document.querySelectorAll('.house-page-content');
    const allFadeInSections = document.querySelectorAll('.fade-in-section');
    
    let splideInstances = {}; // Guarda as instâncias Splide

    const revealContent = () => {
        heroSection.style.opacity = '0';
        setTimeout(() => {
            heroSection.style.display = 'none';
            mainContent.classList.remove('hidden');
            setTimeout(() => {
                mainContent.style.opacity = '1';
                // Mostra a primeira aba principal (Visão Geral)
                activateTab(allMainContents[0], false);
            }, 50);
        }, 1000);
    };

    viewVillasBtn.addEventListener('click', (e) => {
        e.preventDefault();
        revealContent();
    });

    // Função para mostrar uma PÁGINA (Moradia ou Plantas)
    const showPage = (pageToShow, shouldScroll = true) => {
        if (!pageToShow) return;

        // Esconde TODO o conteúdo
        allFadeInSections.forEach(content => {
            content.classList.add('hidden');
        });
        
        // Remove 'active' de TODAS as abas principais
        allTabs.forEach(button => {
            button.classList.remove('active');
        });

        // Mostra a página pedida
        pageToShow.classList.remove('hidden');
        pageToShow.classList.remove('is-visible');
        void pageToShow.offsetWidth;
        pageToShow.classList.add('is-visible');
        
        initializeSplideInElement(pageToShow);
        
        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Função para ativar uma ABA PRINCIPAL (Visão Geral, Acabamentos, etc.)
    const activateTab = (tabToShow, shouldScroll = true) => {
        if (!tabToShow) return;

        // Esconde TODO o conteúdo
        allFadeInSections.forEach(content => {
            content.classList.add('hidden');
        });
        
        // Mostra o conteúdo da aba pedida
        tabToShow.classList.remove('hidden');

        // Sincroniza os botões das abas
        allTabs.forEach(button => {
            button.classList.toggle('active', button.dataset.tabTarget === tabToShow.id);
        });
        
        tabToShow.classList.remove('is-visible');
        void tabToShow.offsetWidth;
        tabToShow.classList.add('is-visible');
        
        initializeSplideInElement(tabToShow);
        
        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Listener para as ABAS PRINCIPAIS
    allTabs.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.tabTarget;
            const targetContent = document.getElementById(targetId);
            activateTab(targetContent);
        });
    });

    // Listener para os LINKS DE PÁGINA (Cartões e Botões Internos)
    const pageLinks = document.querySelectorAll('[data-page-link]');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.pageLink;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                showPage(targetContent, true);
            }
        });
    });
    
    // === FIM DA LÓGICA DE NAVEGAÇÃO ===


    // --- Lógica do Modal (Sem alterações) ---
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const closeModalBtn = document.getElementById('close-modal');
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    let currentGallery = [];
    let currentIndex = 0;

    const showModal = (clickedImage) => {
        const splideSlide = clickedImage.closest('.splide__slide');
        const splideRoot = splideSlide ? splideSlide.closest('.splide') : null;
        let targetGalleryImages = [];

        if (splideRoot) {
            const allImagesInThisSplide = Array.from(splideRoot.querySelectorAll('.zoomable'));
            const uniqueImageSources = new Set();
            targetGalleryImages = allImagesInThisSplide.filter(img => {
                if (!uniqueImageSources.has(img.src)) {
                    uniqueImageSources.add(img.src);
                    return true;
                }
                return false;
            });
        } else {
            const activeGalleryContainer = clickedImage.closest('.fade-in-section');
            if (activeGalleryContainer) {
                targetGalleryImages = Array.from(activeGalleryContainer.querySelectorAll('.gallery-item .zoomable'));
            }
        }

        if (targetGalleryImages.length > 0) {
            currentGallery = targetGalleryImages;
            currentIndex = currentGallery.findIndex(img => img.src === clickedImage.src);
            if (currentIndex === -1) currentIndex = 0;
            updateModalContent();
            imageModal.classList.remove('hidden');
        } else {
             console.error("Não foi possível determinar a galeria para o modal.");
        }
    };

    const updateModalContent = () => {
        if (currentGallery.length === 0) return;
        const img = currentGallery[currentIndex];
        modalImage.src = img.src;
        modalCaption.textContent = img.alt || '';
        const showButtons = currentGallery.length > 1;
        prevBtn.style.display = showButtons ? 'block' : 'none';
        nextBtn.style.display = showButtons ? 'block' : 'none';

    };

    const hideModal = () => imageModal.classList.add('hidden');

    const showPrev = (e) => {
        e.stopPropagation();
        if (currentGallery.length > 0) {
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = currentGallery.length - 1; // Volta para a última
            }
            updateModalContent();
        }
    };

    const showNext = (e) => {
        e.stopPropagation();
        if (currentGallery.length > 0) {
            currentIndex++;
            if (currentIndex >= currentGallery.length) {
                currentIndex = 0; // Volta para a primeira
            }
            updateModalContent();
        }
    };

    document.addEventListener('click', (e) => {
         if (e.target.matches('.zoomable')) {
            showModal(e.target);
         }
    });

    closeModalBtn.addEventListener('click', hideModal);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    imageModal.addEventListener('click', (e) => { if (e.target === imageModal) hideModal(); });

    document.addEventListener('keydown', (e) => {
        if (imageModal.classList.contains('hidden')) return;
        if (e.key === 'Escape') hideModal();
        if (e.key === 'ArrowLeft') {
             if (currentGallery.length > 0) {
                currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length; // Modulo para loop
                updateModalContent();
            }
        }
        if (e.key === 'ArrowRight') {
             if (currentGallery.length > 0) {
                currentIndex = (currentIndex + 1) % currentGallery.length; // Modulo para loop
                updateModalContent();
            }
        }
    });
    // --- Fim da Lógica do Modal ---

    // --- Intersection Observer ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.1 });
    allFadeInSections.forEach(section => observer.observe(section));
    // --- Fim Intersection Observer ---

    // --- Função para adicionar captions/overlays (Sem alterações) ---
    const addImageCaptions = () => {
        document.querySelectorAll('.gallery-item img[alt]').forEach(img => {
            const parent = img.parentNode;
            if (parent && !parent.querySelector('.image-caption-overlay')) {
                const captionText = img.alt;
                if (captionText) {
                    const overlay = document.createElement('div');
                    overlay.classList.add('image-caption-overlay');
                    overlay.innerHTML = `<p class="image-caption-text text-center text-xs sm:text-sm font-semibold uppercase truncate">${captionText}</p>`;
                    parent.appendChild(overlay);
                }
            }
        });
    };
    // --- Fim addImageCaptions ---

    // --- Lógica Splide (Sem alterações) ---
    const initializeSplide = (selector, options) => {
        try {
            const splideElement = document.querySelector(selector);
            if (splideElement && !splideInstances[selector]) {
                console.log(`Inicializando Splide para ${selector}...`);
                const defaultOptions = {
                    type         : 'loop',
                    drag         : 'free',
                    focus        : 1,
                    perPage      : 3,
                    gap          : '0.5rem',
                    pagination   : false,
                    arrows       : false,
                    autoScroll   : {
                        pauseOnHover : false,
                        pauseOnFocus : false,
                        rewind       : false,
                        speed        : 1
                    },
                    breakpoints: {
                         1024: { perPage: 2, gap: '0.5rem' },
                         768: { perPage: 1, gap: '0.5rem' },
                    }
                };
                const finalOptions = { ...defaultOptions, ...options, autoScroll: { ...defaultOptions.autoScroll, ...(options.autoScroll || {}) } };
                const splideInstance = new Splide(splideElement, finalOptions);
                splideInstance.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
                splideInstances[selector] = splideInstance;
                console.log(`Splide para ${selector} inicializado.`);
            } else if (!splideElement) {
                 console.warn(`Elemento Splide ${selector} não encontrado.`);
            }
        } catch (error) {
            console.error(`ERRO ao inicializar Splide para ${selector}:`, error);
        }
    };

     const initializeSplideInElement = (element) => {
        console.log(`Procurando Splides dentro de #${element.id}`);
        const selectors = [
            '.gallery-piso0-esq', '.gallery-piso1-esq',
            '.gallery-piso0-dir', '.gallery-piso1-dir',
            '.gallery-localizacao'
        ];
        const optionsMap = {
            '.gallery-piso0-esq': { autoScroll: { speed: 0.3 } },
            '.gallery-piso1-esq': { autoScroll: { speed: 0.3 } },
            '.gallery-piso0-dir': { autoScroll: { speed: 0.3 } },
            '.gallery-piso1-dir': { autoScroll: { speed: 0.3 } },
            '.gallery-localizacao': { autoScroll: { speed: 0.3 } }
        };
        selectors.forEach(selector => {
            if (element.querySelector(selector)) {
                initializeSplide(selector, optionsMap[selector] || {});
            }
        });
     };

    addImageCaptions();
    const initialTab = document.querySelector('#main-content .fade-in-section:not(.hidden)') || document.getElementById('visao-geral');
    if (initialTab) {
        initializeSplideInElement(initialTab);
    } else {
        console.error("Não foi possível encontrar a tab inicial para inicializar o Splide.");
    }
    // --- Fim Lógica Splide ---

}); // Fim do DOMContentLoaded
