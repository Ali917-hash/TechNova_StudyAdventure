document.getElementById("registrationForm").addEventListener("submit", function (e) {
  // Do NOT use e.preventDefault() at the top. 
  // We only want to stop submission if there are errors.

  let fname = document.getElementById("fname").value.trim();
  let lname = document.getElementById("lname").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirm-password").value;
  let dob = document.getElementById("dob").value;

  let valid = true; // Assume valid until proven false

  // Clear old messages
  document.querySelectorAll(".error").forEach(el => el.innerText = "");

  // 1. Check Names
  if (fname === "") {
    document.getElementById("fnameError").innerText = "First name required";
    valid = false;
  }
  if (lname === "") {
    document.getElementById("lnameError").innerText = "Last name required";
    valid = false;
  }

  // 2. Check Email
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById("emailError").innerText = "Invalid email";
    valid = false;
  }

  // 3. Check Password Complexity
  let passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;
  if (!passRegex.test(password)) {
    document.getElementById("passwordError").innerText =
      "Password must contain capital, small letter & number";
    valid = false;
  }

  // 4. Check Match
  if (password !== confirmPassword) {
    document.getElementById("confirmPasswordError").innerText = "Passwords do not match";
    valid = false;
  }

  // 5. Check DOB
  if (dob === "") {
    document.getElementById("dobError").innerText = "Select date of birth";
    valid = false;
  }

  // FINAL DECISION
  if (!valid) {
    // If invalid, STOP the form from going to PHP
    e.preventDefault();
  }
  // If valid, the code finishes, and the form sends data to 'register.php' automatically.
});