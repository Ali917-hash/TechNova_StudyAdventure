document.addEventListener("DOMContentLoaded", () => {

	document.addEventListener("submit", (event) => {

		const form = event.target.closest("form[data-confirm]");

		if (
			form &&
			!window.confirm(form.dataset.confirm)
		) {
			event.preventDefault();
		}

	});

	document.addEventListener("click", (event) => {

		const toggleButton =
			event.target.closest("[data-toggle-target]");

		if (toggleButton) {
			const target = document.getElementById(
				toggleButton.dataset.toggleTarget
			);

			if (target) {
				target.style.display =
					target.style.display === "none" ||
					target.style.display === ""
						? "block"
						: "none";
			}
		}

		const printButton =
			event.target.closest("[data-print-page]");

		if (printButton) {
			window.print();
		}

	});

});