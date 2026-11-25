import { Button } from "react-bootstrap";
import { useState } from "react";

function ThemeToggle() {
    const [dark, setDark] =
        useState(false);

    const toggleTheme = () => {
        document.body.classList.toggle(
            "bg-dark"
        );

        document.body.classList.toggle(
            "text-white"
        );

        setDark(!dark);
    };

    return (
        <Button
            variant={
                dark
                    ? "light"
                    : "dark"
            }
            onClick={toggleTheme}
        >
            {dark
                ? "☀"
                : "🌙"}
        </Button>
    );
}

export default ThemeToggle;