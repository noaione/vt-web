import React from "react";

export default class BadgeText extends React.Component {
    render() {
        const { className } = this.props;
        let extraClass = "";
        if (typeof className === "string") {
            extraClass = className;
        }
        return <span className={"inline-block px-2 py-1 leading-none whitespace-nowrap align-baseline rounded " + extraClass}>{this.props.children}</span>
    }
}
