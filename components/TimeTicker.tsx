import { DateTime } from "luxon";
import React from "react";

import ClockIcon from "./Icon/ClockIcon";

import { durationToText, Nullable } from "../lib/utils";

function isNumber(value: any): value is number {
    return typeof value === "number";
}

interface TimeTickerProps {
    startTime?: Nullable<number>;
    currentTimeSeconds?: Nullable<number>;
    raw?: boolean;
}

interface TimeTickerState {
    currentTime: number;
}

export default class TimeTicker extends React.Component<TimeTickerProps, TimeTickerState> {
    timerState?: NodeJS.Timeout;

    constructor(props: TimeTickerProps) {
        super(props);
        const { currentTimeSeconds } = props;
        let useTime = currentTimeSeconds;
        if (!isNumber(useTime)) {
            useTime = DateTime.utc().toSeconds();
        }
        if (isNaN(useTime)) {
            useTime = DateTime.utc().toSeconds();
        }
        this.state = {
            currentTime: useTime,
        };
    }

    componentDidMount() {
        this.timerState = setInterval(() => {
            this.setState((prev) => ({ currentTime: prev.currentTime + 1 }));
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timerState) {
            clearInterval(this.timerState);
        }
    }

    render() {
        const { startTime, raw } = this.props;
        const { currentTime } = this.state;
        if (!isNumber(startTime)) {
            return null;
        }

        if (raw) {
            return <span>{durationToText(currentTime - startTime)}</span>;
        }

        return (
            <div className="flex flex-row justify-center items-center">
                <ClockIcon />
                <span className="ml-1 text-gray-400 font-bold">Elapsed</span>
                <span className="ml-1 text-gray-400 font-medium">
                    {durationToText(currentTime - startTime)}
                </span>
            </div>
        );
    }
}
