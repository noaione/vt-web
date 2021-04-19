import React from "react";

export default class BadgeText extends React.Component {
    render() {
        const { className } = this.props;
        let extraClass = "";
        if (typeof className === "string") {
            extraClass = className;
        }
        return <span className={"inline-block px-3 py-1 items-center justify-center rounded " + extraClass}>{this.props.children}</span>
    }
}
