document.addEventListener(
    "DOMContentLoaded",
    () => {

        const counters =
            document.querySelectorAll(
                ".stat-number"
            );


        counters.forEach(counter => {

            const target =
                Number(
                    counter.dataset.target || 0
                );


            let current = 0;

            const increment =
                target > 0
                    ? Math.max(
                        1,
                        Math.ceil(
                            target / 50
                        )
                    )
                    : 0;


            const update = () => {

                if (current < target) {

                    current += increment;

                    if (current > target) {
                        current = target;
                    }

                    counter.textContent =
                        current;

                    requestAnimationFrame(
                        update
                    );

                } else {

                    counter.textContent =
                        target;

                }

            };


            update();

        });

    }
);