import Link from "next/link";
import React from "react";

function isNone(data) {
    return typeof data === "undefined" || data === null;
}

interface ButtonsProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    btnType?: "primary" | "success" | "warning" | "danger" | "dark";
    use?: "a" | "div";
    href?: string;
    className?: string;
    type?: "button" | "submit" | "reset";
}

function isOutsideLink(link: string) {
    if (!link) {
        return false;
    }
    if (link.startsWith("http")) {
        return true;
    }
    if (link.includes("::/")) {
        return true;
    }
    return false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = (ev: React.MouseEvent<HTMLButtonElement>) => {
    return null;
};

class Buttons extends React.Component<ButtonsProps> {
    render() {
        const { btnType, use, children, className, onClick, ...props } = this.props;

        let realType = "primary";
        if (!isNone(btnType)) {
            realType = btnType;
        }

        let realOnClick = noop;
        if (typeof onClick === "function") {
            realOnClick = onClick;
        }

        const colorMapping = {
            primary: "bg-blue-500 hover:bg-blue-600",
            success: "bg-green-500 hover:bg-blue-600",
            warning: "bg-yellow-600 hover:bg-yellow-700",
            danger: "bg-red-500 hover:bg-red-600",
            dark: "bg-gray-700 hover:bg-gray-800",
        };
        const colorDisabledMapping = {
            primary: "bg-blue-400",
            success: "bg-green-400",
            warning: "bg-yellow-500",
            danger: "bg-red-400",
            dark: "bg-gray-600",
        };

        let extraClass = "";
        if (typeof className === "string") {
            extraClass += className + " ";
        }

        let colored = colorMapping[realType] || colorMapping.primary;
        if (props.disabled) {
            colored = colorDisabledMapping[realType] || colorDisabledMapping.primary;
            colored += " cursor-not-allowed";
        }

        const targetData = isOutsideLink(props.href) ? "_blank" : null;
        const rel = targetData === "_blank" ? "noopener noreferrer" : null;
        if (use === "a") {
            const restProps = props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>;
            const { href, ...properRestProps } = restProps;
            return (
                <Link href={href} passHref>
                    <a
                        {...properRestProps}
                        className={
                            "inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition rounded shadow ripple hover:shadow-lg focus:outline-none " +
                            extraClass +
                            colored
                        }
                        target={targetData}
                        rel={rel}
                    >
                        {children}
                    </a>
                </Link>
            );
        }

        const restProps = props as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>;
        return (
            <button
                {...restProps}
                onClick={(ev) => realOnClick(ev)}
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
