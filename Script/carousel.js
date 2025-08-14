document.addEventListener("DOMContentLoaded", () => {
  // Inicializar carrosséis para todos os hobbies
  const carousels = document.querySelectorAll(".hobby-carousel")

  carousels.forEach((carousel) => {
    initializeCarousel(carousel)
  })

  function initializeCarousel(carouselElement) {
    const slides = carouselElement.querySelectorAll(".carousel-slide")
    const indicators = carouselElement.querySelectorAll(".indicator")
    let currentSlide = 0
    let intervalId

    // Função para mostrar slide específico
    function showSlide(index) {
      // Remover classe active de todos os slides e indicadores
      slides.forEach((slide) => slide.classList.remove("active"))
      indicators.forEach((indicator) => indicator.classList.remove("active"))

      // Adicionar classe active ao slide e indicador atual
      if (slides[index]) {
        slides[index].classList.add("active")
      }
      if (indicators[index]) {
        indicators[index].classList.add("active")
      }

      currentSlide = index
    }

    // Função para próximo slide
    function nextSlide() {
      const nextIndex = (currentSlide + 1) % slides.length
      showSlide(nextIndex)
    }

    // Iniciar rotação automática
    function startAutoRotation() {
      stopAutoRotation()
      intervalId = setInterval(nextSlide, 4000) // 4 segundos
    }

    // Parar rotação automática
    function stopAutoRotation() {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    // Event listeners para indicadores
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        showSlide(index)
        startAutoRotation() // Reiniciar timer após clique manual
      })
    })

    // Pausar no hover
    carouselElement.addEventListener("mouseenter", stopAutoRotation)
    carouselElement.addEventListener("mouseleave", startAutoRotation)

    // Inicializar
    showSlide(0)
    startAutoRotation()
  }
})
