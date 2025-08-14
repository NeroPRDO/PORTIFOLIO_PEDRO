// Animations for the website
document.addEventListener("DOMContentLoaded", () => {
    // Fade in elements on scroll
    const fadeElements = document.querySelectorAll(".fade-in, .fade-element")

    function checkFade() {
        fadeElements.forEach((element) => {
            const elementTop = element.getBoundingClientRect().top
            const elementBottom = element.getBoundingClientRect().bottom

            // Element is partially visible
            if (elementTop < window.innerHeight - 50 && elementBottom > 0) {
                element.classList.add("active")
            }
        })
    }

    // Initial check
    setTimeout(checkFade, 100)

    // Check on scroll
    window.addEventListener("scroll", checkFade)

    // Animate skill bars on scroll
    const skillBars = document.querySelectorAll(".skill-level")
    const animatedBars = new Set() // Track which bars have been animated

    function animateSkillBars() {
        skillBars.forEach((bar) => {
            const barTop = bar.getBoundingClientRect().top

            if (barTop < window.innerHeight - 100 && !animatedBars.has(bar)) {
                const targetWidth = bar.getAttribute("data-width") || bar.style.width

                // Reset width to 0
                bar.style.width = "0"
                bar.style.transition = "none"

                // Animate to target width after a small delay
                setTimeout(() => {
                    bar.style.transition = "width 1.5s ease-in-out"
                    bar.style.width = targetWidth
                }, 100)

                // Mark this bar as animated
                animatedBars.add(bar)
            }
        })
    }

    // Initial check for skill bars
    setTimeout(animateSkillBars, 500)

    // Check on scroll for skill bars
    window.addEventListener("scroll", animateSkillBars)

    // Animate timeline items
    const timelineItems = document.querySelectorAll(".timeline-item")

    function animateTimeline() {
        timelineItems.forEach((item, index) => {
            const itemTop = item.getBoundingClientRect().top

            if (itemTop < window.innerHeight - 100) {
                setTimeout(() => {
                    item.classList.add("active")
                }, index * 300)
            }
        })
    }

    // Initial check for timeline
    setTimeout(animateTimeline, 500)

    // Check on scroll for timeline
    window.addEventListener("scroll", animateTimeline)

    // Animate project cards
    const projectCards = document.querySelectorAll(".project-card")

    function animateProjects() {
        projectCards.forEach((card, index) => {
            const cardTop = card.getBoundingClientRect().top

            if (cardTop < window.innerHeight - 100) {
                setTimeout(() => {
                    card.classList.add("active")
                }, index * 200)
            }
        })
    }

    // Initial check for projects
    setTimeout(animateProjects, 500)

    // Check on scroll for projects
    window.addEventListener("scroll", animateProjects)

    // Animate social cards
    const socialCards = document.querySelectorAll(".social-card")

    function animateSocial() {
        socialCards.forEach((card, index) => {
            const cardTop = card.getBoundingClientRect().top

            if (cardTop < window.innerHeight - 100) {
                setTimeout(() => {
                    card.classList.add("active")
                }, index * 150)
            }
        })
    }

    // Initial check for social cards
    setTimeout(animateSocial, 500)

    // Check on scroll for social cards
    window.addEventListener("scroll", animateSocial)

    // Animate hobby cards
    const hobbyCards = document.querySelectorAll(".hobby-card")

    function animateHobbies() {
        hobbyCards.forEach((card, index) => {
            const cardTop = card.getBoundingClientRect().top

            if (cardTop < window.innerHeight - 100) {
                setTimeout(() => {
                    card.classList.add("active")
                }, index * 300)
            }
        })
    }

    // Initial check for hobby cards
    setTimeout(animateHobbies, 500)

    // Check on scroll for hobby cards
    window.addEventListener("scroll", animateHobbies)

    // Animate header on scroll
    const header = document.querySelector("header")
    let lastScrollTop = 0

    window.addEventListener("scroll", () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop

        if (scrollTop > 100) {
            header.style.background = "rgba(18, 18, 18, 0.95)"
            header.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)"
        } else {
            header.style.background = "rgba(18, 18, 18, 0.9)"
            header.style.boxShadow = "none"
        }

        lastScrollTop = scrollTop
    })
})
