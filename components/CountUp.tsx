import React from "react";
import ReactCountUp from "react-countup";

const outQuinticEasing = function (t: number, b: number, c: number, d: number) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
};

export interface CountUpCallback {
    update: (value: number) => void;
}

interface CountUpProps {
    initialValue: number;
    onMounted: (callbacks: CountUpCallback) => void;
}

interface CountUpState {
    value: number;
}

export default class CountUp extends React.Component<CountUpProps, CountUpState> {
    // Create a proper typing
    private cRef: React.RefObject<ReactCountUp & CountUpCallback>;

    constructor(props: CountUpProps) {
        super(props);
        this.cRef = React.createRef<ReactCountUp & CountUpCallback>();
        this.updateBound = this.updateBound.bind(this);
        this.state = {
            value: this.props.initialValue,
        };
    }

    updateBound(value: number) {
        if (typeof value !== "number") {
            console.warn("Will not update value, since it's not a number");
            return;
        }
        if (this.cRef && this.cRef.current) {
            console.info(`Updating to ${value}`);
            this.cRef.current.update(value);
        }
    }

    componentDidMount() {
        const updateBound = this.updateBound;
        this.props.onMounted({
            update: (value) => updateBound(value),
        });
    }

    render() {
        const { value } = this.state;
        return (
            <ReactCountUp
                ref={this.cRef}
                start={0}
                end={value}
                duration={2}
                easingFn={outQuinticEasing}
                formattingFn={(n) => {
                    if (n < 0) {
                        return "N/A";
                    }
                    return n.toLocaleString();
                }}
                useEasing
            />
        );
    }
}
