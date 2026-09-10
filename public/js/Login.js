document.getElementById("loginForm").addEventListener("submit", function (e) {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value;
  let valid = true;

  document.getElementById("loginEmailError").innerText = "";
  document.getElementById("loginPassError").innerText = "";

  // Email check
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById("loginEmailError").innerText = "Invalid email";
    valid = false;
  }

  // Password check
  if (password === "") {
    document.getElementById("loginPassError").innerText = "Password required";
    valid = false;
  }

  // If invalid, stop submission. If valid, let PHP handle it.
  if (!valid) {
    e.preventDefault();
  }
});