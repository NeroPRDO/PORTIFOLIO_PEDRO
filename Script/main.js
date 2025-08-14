// Main JavaScript file for the portfolio

document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  document.getElementById("currentYear").textContent = new Date().getFullYear()

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle")
  const navLinks = document.querySelector(".nav-links")

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active")
      const icon = menuToggle.querySelector("i")
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars")
        icon.classList.add("fa-times")
      } else {
        icon.classList.remove("fa-times")
        icon.classList.add("fa-bars")
      }
    })
  }

  // Close mobile menu when clicking on a link
  const navItems = document.querySelectorAll(".nav-links a")
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active")
        const icon = menuToggle.querySelector("i")
        icon.classList.remove("fa-times")
        icon.classList.add("fa-bars")
      }
    })
  })

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        })
      }
    })
  })

  // Typewriter effect
  const typewriterElement = document.querySelector(".typewriter")
  if (typewriterElement) {
    const text = typewriterElement.textContent
    typewriterElement.textContent = ""
    let i = 0

    function typeWriter() {
      if (i < text.length) {
        typewriterElement.textContent += text.charAt(i)
        i++
        setTimeout(typeWriter, 100)
      }
    }

    setTimeout(typeWriter, 1000)
  }

  // Language switcher
  const ptButton = document.getElementById("pt-br")
  const enButton = document.getElementById("en")

  // Translations object
  const translations = {
    "pt-br": {
      home: "Início",
      about: "Sobre",
      projects: "Projetos",
      contact: "Contato",
      "hero-title": "Olá, eu sou",
      "hero-description": "Apaixonado por criar experiências incríveis.",
      "about-title": "Sobre Mim",
      "about-description": "Sou um desenvolvedor com experiência em...",
      "projects-title": "Meus Projetos",
      "contact-title": "Entre em Contato",
    },
    en: {
      home: "Home",
      about: "About",
      projects: "Projects",
      contact: "Contact",
      "hero-title": "Hello, I am",
      "hero-description": "Passionate about creating amazing experiences.",
      "about-title": "About Me",
      "about-description": "I am a developer with experience in...",
      "projects-title": "My Projects",
      "contact-title": "Contact Me",
    },
  }

  function updateLanguage(language) {
    // Update active button
    if (language === "pt-br") {
      ptButton.classList.add("active")
      enButton.classList.remove("active")
    } else {
      enButton.classList.add("active")
      ptButton.classList.remove("active")
    }

    // Get all translatable elements
    const translatableElements = document.querySelectorAll("[data-translate]")

    // Update all translatable elements
    translatableElements.forEach((element) => {
      const key = element.getAttribute("data-translate")
      if (translations[language] && translations[language][key]) {
        element.textContent = translations[language][key]
      }
    })

    // Save language preference
    localStorage.setItem("language", language)
  }

  // Set initial language when page loads
  const currentLanguage = localStorage.getItem("language") || "pt-br"
  updateLanguage(currentLanguage)

  // Add event listeners to language buttons
  if (ptButton) {
    ptButton.addEventListener("click", () => {
      updateLanguage("pt-br")
    })
  }

  if (enButton) {
    enButton.addEventListener("click", () => {
      updateLanguage("en")
    })
  }

  const vikingIndicator = document.getElementById("viking-scroll-indicator")
  if (vikingIndicator) {
    window.addEventListener("scroll", () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      const rotation = scrollPercent * 3.6 // Full rotation every 100% scroll
      const brightness = 1 + (scrollPercent / 100) * 0.5 // Increase brightness as we scroll

      vikingIndicator.style.transform = `translateY(-50%) rotate(${rotation}deg)`
      vikingIndicator.style.filter = `brightness(${brightness}) drop-shadow(0 0 ${5 + scrollPercent / 10}px rgba(156, 39, 176, 0.7))`

      // Move vertically based on scroll position
      const verticalOffset = (scrollPercent / 100) * 200 - 100 // Move up and down
      vikingIndicator.style.top = `calc(50% + ${verticalOffset}px)`
    })
  }
})
