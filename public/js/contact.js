// // /* Mobile Menu Toggle */
// document.addEventListener('DOMContentLoaded', () => {
//   const menuBtn = document.getElementById('menu-btn');
//   const navLinks = document.getElementById('nav-links');

//   if (menuBtn && navLinks) {
//     // 1. Toggle Menu on Button Click
//     menuBtn.addEventListener('click', (e) => {
//       e.preventDefault(); // Stop any default button behavior
//       navLinks.classList.toggle('active');
      
//       // Optional: Change icon from ☰ to X
//       if (navLinks.classList.contains('active')) {
//           menuBtn.innerHTML = '✕'; // Show X
//       } else {
//           menuBtn.innerHTML = '&#9776;'; // Show Hamburger
//       }
//     });

//     // 2. Close menu when a link is clicked (Good UX)
//     navLinks.querySelectorAll('a').forEach(link => {
//       link.addEventListener('click', () => {
//         navLinks.classList.remove('active');
//         menuBtn.innerHTML = '&#9776;'; // Reset icon to Hamburger
//       });
//     });
//   }
// });

//   document.getElementById('contactForm').addEventListener('submit', function(e) {
//     e.preventDefault();

//     // Get form values
//     const name = document.getElementById('name').value;
//     const email = document.getElementById('email').value;
//     alert(`Thank you, ${name}! Your message has been sent successfully.`);
//     this.reset();
// });

// // This script makes the cards interactive
// document.querySelectorAll('.faq-card').forEach(card => {
//     card.addEventListener('click', () => {
//         console.log("FAQ clicked!");
//     });
// });

// ===============================
// Mobile Menu Toggle
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");

    if (menuBtn && navLinks) {

        menuBtn.addEventListener("click", () => {

            navLinks.classList.toggle("active");

            if (navLinks.classList.contains("active")) {
                menuBtn.innerHTML = "✕";
            } else {
                menuBtn.innerHTML = "☰";
            }

        });

        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");
                menuBtn.innerHTML = "☰";

            });

        });

    }


    // ===============================
    // Contact Form Validation
    // ===============================

    const form = document.getElementById("contactForm");

    if (form) {

        form.addEventListener("submit", function (e) {

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("message").value.trim();

            if (
                name === "" ||
                email === "" ||
                phone === "" ||
                subject === "" ||
                message === ""
            ) {

                e.preventDefault();

                alert("Please fill all required fields.");

                return;
            }

            // No e.preventDefault() here.
            // Express will receive the POST request.

        });

    }


    // ===============================
    // FAQ Cards
    // ===============================

    document.querySelectorAll(".faq-card").forEach(card => {

        card.addEventListener("click", () => {

            console.log("FAQ Clicked");

        });

    });

});