window.addEventListener('scroll', () => {
  const heroSection = document.getElementById('hero-section');
  if (heroSection.style.display === 'none') {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    document.getElementById('scroll-progress').style.width = progress + '%';
  } else {
    document.getElementById('scroll-progress').style.width = '0%';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('hero-section');
  const mainContent = document.getElementById('main-content');
  const viewVillasBtn = document.getElementById('view-villas-btn');
  const allTabs = document.querySelectorAll('.tab-button');
  const allTabContents = document.querySelectorAll('.fade-in-section');

  const revealContent = () => {
    heroSection.style.opacity = '0';
    setTimeout(() => {
      heroSection.style.display = 'none';
      mainContent.classList.remove('hidden');
      setTimeout(() => {
        mainContent.style.opacity = '1';
        activateTab(allTabContents[0], false);
      }, 50);
    }, 1000);
  };

  viewVillasBtn.addEventListener('click', (e) => {
    e.preventDefault();
    revealContent();
  });

  const activateTab = (tabToShow, shouldScroll = true) => {
    allTabContents.forEach(content => {
      content.classList.toggle('hidden', content !== tabToShow);
    });
    allTabs.forEach(button => {
      button.classList.toggle('active', button.dataset.tabTarget === tabToShow.id);
    });
    if (tabToShow) {
      tabToShow.classList.remove('is-visible');
      void tabToShow.offsetWidth; // Force reflow to restart animation/transition
      tabToShow.classList.add('is-visible');
    }
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  allTabs.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetId = e.currentTarget.dataset.tabTarget;
      const targetContent = document.getElementById(targetId);
      activateTab(targetContent);
    });
  });

  const imageModal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalCaption = document.getElementById('modal-caption');
  const closeModalBtn = document.getElementById('close-modal');
  const prevBtn = document.getElementById('prev-image');
  const nextBtn = document.getElementById('next-image');

  let currentGallery = [];
  let currentIndex = 0;

  const showModal = (clickedImage) => {
    const activeGalleryContainer = clickedImage.closest('.fade-in-section'); // Find gallery within the current visible tab
    if (activeGalleryContainer) {
       // Find *all* zoomable images within that specific container (original + duplicate, if any)
      const allImagesInContainer = Array.from(activeGalleryContainer.querySelectorAll('.zoomable'));
      // Filter out duplicates based on src to show only unique images in modal navigation
      const uniqueImageSources = new Set();
      currentGallery = allImagesInContainer.filter(img => {
          if (!uniqueImageSources.has(img.src)) {
              uniqueImageSources.add(img.src);
              return true;
          }
          return false;
      });

      // Find the index based on the unique list
      currentIndex = currentGallery.findIndex(img => img.src === clickedImage.src);
      if (currentIndex === -1) currentIndex = 0; // Fallback if something goes wrong

      updateModalContent();
      imageModal.classList.remove('hidden');
    }
  };

  const updateModalContent = () => {
    if (currentGallery.length === 0) return;
    const img = currentGallery[currentIndex];
    modalImage.src = img.src;
    modalCaption.textContent = img.alt || '';
    prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
    nextBtn.style.display = currentIndex === currentGallery.length - 1 ? 'none' : 'block';
  };

  const hideModal = () => imageModal.classList.add('hidden');
  const showPrev = (e) => { e.stopPropagation(); if (currentIndex > 0) { currentIndex--; updateModalContent(); } };
  const showNext = (e) => { e.stopPropagation(); if (currentIndex < currentGallery.length - 1) { currentIndex++; updateModalContent(); } };

  // Event listener for clicking zoomable images
  document.addEventListener('click', (e) => {
    // Only trigger modal if the clicked element itself has the zoomable class
     if (e.target.matches('.zoomable')) {
        showModal(e.target);
     }
  });

  closeModalBtn.addEventListener('click', hideModal);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);
  imageModal.addEventListener('click', (e) => { if (e.target === imageModal) hideModal(); }); // Close on backdrop click

  document.addEventListener('keydown', (e) => {
    if (imageModal.classList.contains('hidden')) return;
    if (e.key === 'Escape') hideModal();
    if (e.key === 'ArrowLeft') { if (currentIndex > 0) { currentIndex--; updateModalContent(); } }
    if (e.key === 'ArrowRight') { if (currentIndex < currentGallery.length - 1) { currentIndex++; updateModalContent(); } }
  });

  // Intersection Observer for fade-in effect
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.1 });

  allTabContents.forEach(section => observer.observe(section));

// --- INÍCIO CÓDIGO SPLIDE COM AUTOSCROLL ---
  try {
    console.log("Tentando encontrar .gallery-piso0-esq...");
    const splideElement = document.querySelector('.gallery-piso0-esq');

    if (splideElement) {
      console.log("Elemento encontrado! Inicializando Splide com AutoScroll...");
      const splideInstance = new Splide(splideElement, {
          // Opções com AutoScroll:
          type         : 'loop',     // Obrigatório para autoScroll contínuo
          drag         : 'free',     // Permite arrastar livremente
          focus        : 'center',   // Opcional: centra o slide ativo
          perPage      : 3,        // Ajusta conforme necessário (quantos vês ao mesmo tempo)
          gap          : '0.5rem',     // <-- *** VALOR AJUSTADO AQUI *** (Experimenta 1rem, 0.5rem, etc.)
          pagination   : true,    // Esconde as bolinhas
          arrows       : false,    // Esconde as setas
          autoScroll   : {
              pauseOnHover : false,   // Pausa ao passar o rato
              pauseOnFocus : true,  // Não pausa ao clicar/focar
              rewind       : false,  // Não volta ao início (continua o loop)
              speed        : 0.5     // Velocidade (0.5 é mais rápido que 1. Ajusta!)
          },
          breakpoints: {           // Ajustes para ecrãs menores
              1024: { perPage: 2, focus: 'center' },
              768: { perPage: 1, focus: 'center' },
          }
      });

      // Monta o Splide E a extensão AutoScroll
      splideInstance.mount( window.splide.Extensions );

      console.log("Splide com AutoScroll inicializado com sucesso!");

    } else {
      console.error("ERRO: Elemento .gallery-piso0-esq NÃO encontrado!");
    }

  } catch (error) {
    console.error("ERRO ao inicializar Splide com AutoScroll:", error);
  }
  // --- FIM CÓDIGO SPLIDE COM AUTOSCROLL ---

}); // Fim do DOMContentLoaded
