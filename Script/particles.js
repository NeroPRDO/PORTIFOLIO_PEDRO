document.addEventListener("DOMContentLoaded", () => {
  // Partículas principais
  const particlesContainer = document.getElementById("particles-container")
  if (particlesContainer) {
    createMainParticles(particlesContainer, 300)
  }

  // Partículas para seção de formação acadêmica
  const educationParticles = document.getElementById("education-particles-container")
  if (educationParticles) {
    createSectionParticles(educationParticles, 300, "education")
  }

  /*  // Partículas para seção de projetos
    const projectParticles = document.getElementById("project-particles-container")
    if (projectParticles) {
      createSectionParticles(projectParticles, 300, "projects")
    }
      */

  // Partículas para seção de jornada
  const journeyParticles = document.getElementById("journey-particles-container")
  if (journeyParticles) {
    createSectionParticles(journeyParticles, 300, "journey")
  }

  // Partículas para seção de hobbies
  const hobbiesParticles = document.getElementById("hobbies-particles-container")
  if (hobbiesParticles) {
    createSectionParticles(hobbiesParticles, 300, "hobbies")
  }

  function createMainParticles(container, count) {
    for (let i = 0; i < count; i++) {
      createMainParticle(container)
    }
  }

  function createMainParticle(container) {
    const particle = document.createElement("div")
    particle.className = "particle"

    const size = Math.random() * 4 + 1
    const posX = Math.random() * 100
    const delay = Math.random() * 3
    const duration = Math.random() * 10 + 5
    const opacity = Math.random() * 0.5 + 0.1

    particle.style.cssText = `
            position: absolute;
            top: -10px;
            left: ${posX}%;
            width: ${size}px;
            height: ${size}px;
            background-color: rgba(255, 255, 255, ${opacity});
            border-radius: 50%;
            box-shadow: 0 0 ${size * 2}px rgba(156, 39, 176, 0.3);
            animation: fall ${duration}s linear ${delay}s infinite;
            z-index: -1;
        `

    container.appendChild(particle)
  }

  function createSectionParticles(container, count, type) {
    for (let i = 0; i < count; i++) {
      createSectionParticle(container, type)
    }
  }

  function createSectionParticle(container, type) {
    const particle = document.createElement("div")
    particle.className = "particle"

    const size = Math.random() * 6 + 2
    const posX = Math.random() * 100
    const posY = Math.random() * 100
    const delay = Math.random() * 4

    particle.style.cssText = `
      position: absolute;
      left: ${posX}%;
      top: ${posY}%;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(156, 39, 176, 0.6) 0%, rgba(156, 39, 176, 0.1) 100%);
      border-radius: 50%;
      animation: sectionFloat 6s ease-in-out ${delay}s infinite;
      z-index: 1;
    `

    container.appendChild(particle)
  }

  // Add the animation to the stylesheet
  const style = document.createElement("style")
  style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `
  document.head.appendChild(style)
})
