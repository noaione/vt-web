import React from "react";

function isNone(data) {
    return typeof data === "undefined" || data === null;
}

interface ButtonsProps {
    btnType?: "primary" | "success" | "warning" | "danger" | "dark";
    use?: "a" | "div" | string;
    href?: string;
    className?: string;
    type?: "button" | "submit" | "reset";
}

class Buttons extends React.Component<ButtonsProps> {
    render() {
        const { btnType, use, children, className, ...props } = this.props;

        let realType = "primary";
        if (!isNone(btnType)) {
            realType = btnType;
        }

        let isA = false;
        if (use === "a") {
            isA = true;
        }

        const colorMapping = {
            primary: "bg-blue-500 hover:bg-blue-600",
            success: "bg-green-500 hover:bg-blue-600",
            warning: "bg-yellow-500 hover:bg-yellow-600",
            danger: "bg-red-500 hover:bg-red-600",
            dark: "bg-gray-700 hover:bg-gray-800",
        };

        let extraClass = "";
        if (typeof className === "string") {
            extraClass += className + " ";
        }

        const colored = colorMapping[realType] || colorMapping["primary"];

        if (isA) {
            return (
                <a
                    {...props}
                    className={
                        "inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition rounded shadow ripple hover:shadow-lg focus:outline-none " +
                        extraClass +
                        colored
                    }
                >
                    {children}
                </a>
            );
        }
        return (
            <button
                {...props}
                className={
                    "inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition rounded shadow ripple hover:shadow-lg focus:outline-none " +
                    extraClass +
                    colored
                }
            >
                {children}
            </button>
        );
    }
}

export default Buttons;
