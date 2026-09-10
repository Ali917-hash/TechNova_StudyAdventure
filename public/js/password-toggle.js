document.addEventListener("click", event => {
    const button = event.target.closest("[data-password-toggle]");

    if (!button) {
        return;
    }

    const input = document.getElementById(
        button.dataset.passwordToggle
    );
    const icon = button.querySelector("i");

    if (!input || !icon) {
        return;
    }

    const isVisible = input.type === "text";

    input.type = isVisible ? "password" : "text";
    button.setAttribute("aria-pressed", String(!isVisible));
    button.setAttribute(
        "aria-label",
        isVisible ? "Show password" : "Hide password"
    );
    icon.classList.toggle("fa-eye", isVisible);
    icon.classList.toggle("fa-eye-slash", !isVisible);
});
