window.addEventListener('scroll', () => {
    const heroSection = document.getElementById('hero-section');
    const header = document.querySelector('#main-content header');

    if (heroSection.style.display === 'none') {
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
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero-section');
    const mainContent = document.getElementById('main-content');
    const viewVillasBtn = document.getElementById('view-villas-btn');
    
    const allTabs = document.querySelectorAll('[data-tab-target]');
    const allFadeInSections = document.querySelectorAll('.fade-in-section');
    
    let splideInstances = {};

    // Animação de entrada do conteúdo principal
    const revealContent = () => {
        heroSection.style.opacity = '0';
        setTimeout(() => {
            heroSection.style.display = 'none';
            mainContent.classList.remove('hidden');
            setTimeout(() => {
                mainContent.style.opacity = '1';
                // Ativa a primeira aba (Visão Geral)
                const firstTab = document.getElementById('visao-geral');
                activateTab(firstTab, false);
            }, 50);
        }, 1000);
    };

    if (viewVillasBtn) {
        viewVillasBtn.addEventListener('click', (e) => {
            e.preventDefault();
            revealContent();
        });
    }

    // Função central para mostrar páginas (abas ou detalhes)
    const activateTab = (tabToShow, shouldScroll = true) => {
        if (!tabToShow) return;
        
        // Esconde tudo
        allFadeInSections.forEach(content => content.classList.add('hidden'));
        
        // Mostra o alvo
        tabToShow.classList.remove('hidden');
        
        // Atualiza botões do menu
        allTabs.forEach(button => {
            button.classList.toggle('active', button.dataset.tabTarget === tabToShow.id);
        });
        
        // Reinicia animação de fade
        tabToShow.classList.remove('is-visible');
        void tabToShow.offsetWidth; // Trigger reflow
        tabToShow.classList.add('is-visible');
        
        // Inicializa Sliders dentro desta secção
        initializeSplideInElement(tabToShow);
        
        if (shouldScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Click nos botões do Menu Principal
    allTabs.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.tabTarget;
            activateTab(document.getElementById(targetId));
        });
    });
    
    // Click nos botões internos (Ver Plantas, Ver Detalhes, etc)
    const pageLinks = document.querySelectorAll('[data-page-link]');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(document.getElementById(link.dataset.pageLink));
        });
    });

    // --- Lógica Splide (Sliders) ---
    const initializeSplide = (selector, options) => {
        const el = document.querySelector(selector);
        // Só inicializa se existir e ainda não estiver inicializado
        if (el && !splideInstances[selector]) {
             const defaults = { 
                 type: 'loop', 
                 drag: 'free', 
                 perPage: 3, 
                 gap: '1rem', 
                 arrows: false, 
                 pagination: false,
                 autoScroll: { speed: 1 },
                 breakpoints: { 1024: { perPage: 2 }, 768: { perPage: 1 } }
             };
             const finalOptions = { ...defaults, ...options };
             
             // Remove autoScroll das opções se for false, para não causar erro
             if(options.autoScroll === false) delete finalOptions.autoScroll;
             
             const splide = new Splide(el, finalOptions);
             
             if(finalOptions.autoScroll) {
                 splide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
             } else {
                 splide.mount();
             }
             
             splideInstances[selector] = splide;
        }
    };

    const initializeSplideInElement = (element) => {
        // 1. Galerias com AutoScroll (Interiores e Localização)
        const scrollGalleries = [
            '.gallery-piso0-esq', '.gallery-piso1-esq', 
            '.gallery-piso0-dir', '.gallery-piso1-dir', 
            '.gallery-localizacao'
        ];
        scrollGalleries.forEach(sel => {
             if(element.querySelector(sel)) initializeSplide(sel, { autoScroll: { speed: 0.5 } });
        });

        // 2. Galeria Vistas Exterior (Efeito Fade, sem scroll contínuo)
        if(element.querySelector('.gallery-vista-exterior')) {
            initializeSplide('.gallery-vista-exterior', { 
                type: 'fade', 
                rewind: true, 
                autoplay: true, 
                interval: 4000, 
                autoScroll: false, 
                perPage: 1,
                arrows: true // Setas para navegar
            });
        }
    };

    // --- Lógica do Modal de Imagens ---
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalCap = document.getElementById('modal-caption');
    const closeModal = document.getElementById('close-modal');
    
    // Botões originais (Desktop - 'hidden sm:block' no HTML)
    const nextBtn = document.getElementById('next-image');
    const prevBtn = document.getElementById('prev-image');
    
    // Adicionar as variáveis para os NOVOS botões Mobile (A CORREÇÃO - Passo 1)
    const nextBtnMobile = document.getElementById('next-image-mobile');
    const prevBtnMobile = document.getElementById('prev-image-mobile');
    
    // Variáveis para navegação no modal
    let currentGalleryImages = [];
    let currentImageIndex = 0;

    const openModal = (imgElement) => {
        // Tenta encontrar a galeria pai para permitir navegação (prev/next)
        const container = imgElement.closest('.splide__list') || imgElement.closest('.grid') || document.body;
        // Seleciona todas as imagens "zoomable" dentro desse container
        currentGalleryImages = Array.from(container.querySelectorAll('.zoomable'));
        currentImageIndex = currentGalleryImages.indexOf(imgElement);

        updateModalImage();
        imageModal.classList.remove('hidden');
    };

    const updateModalImage = () => {
        if(currentImageIndex < 0) return;
        const img = currentGalleryImages[currentImageIndex];
        modalImg.src = img.src;
        modalCap.textContent = img.alt || '';
    };

    document.addEventListener('click', (e) => {
        if(e.target.matches('.zoomable')) {
            openModal(e.target);
        }
    });

    closeModal.addEventListener('click', () => imageModal.classList.add('hidden'));
    imageModal.addEventListener('click', (e) => { if(e.target === imageModal) imageModal.classList.add('hidden'); });
    
    // Ouvintes de evento para Botões Desktop
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        updateModalImage();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateModalImage();
    });

    // Ouvintes de evento para Botões Mobile (A CORREÇÃO - Passo 2)
    if (nextBtnMobile) {
        nextBtnMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
            updateModalImage();
        });
    }

    if (prevBtnMobile) {
        prevBtnMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateModalImage();
        });
    }

    // Intersection Observer para animações de scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.1 });
    allFadeInSections.forEach(section => observer.observe(section));
});