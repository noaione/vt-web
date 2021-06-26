import React from "react";
import Link from "next/link";
import { platformToShortCode, PlatformType } from "../lib/vt";

interface UserCardProps {
    isLive?: boolean;
    platform: PlatformType;
    channel: {
        id: string;
        name: string;
        image: string;
        group: string;
    };
}

export default function UserCard(props: UserCardProps) {
    const {
        isLive,
        platform,
        channel: { id, name, group, image },
    } = props;

    return (
        <div className="flex lg:justify-center gap-2">
            {isLive && (
                <div className="hidden lg:flex flex-row items-center gap-1">
                    <div className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
                        <span className="w-3 h-3 inline-flex rounded-full bg-red-500" />
                    </div>
                    <span className="uppercase ml-1 text-sm font-bold tracking-wider text-red-400">Live</span>
                </div>
            )}
            <Link href={`/channel/${platformToShortCode(platform)}-${id}`} passHref>
                <a className="justify-center flex">
                    <img
                        className="rounded-full justify-center h-10 object-cover object-center hover:opacity-80 duration-150 transition-opacity ease-in-out"
                        src={image}
                        loading="lazy"
                    />
                </a>
            </Link>
            <div className="justify-start text-left">
                <div className="font-semibold">{name}</div>
                <div className="text-sm font-semibold text-gray-300 tracking-wide justify-start">{group}</div>
            </div>
            {isLive && (
                <div className="flex lg:hidden flex-row items-center gap-1 ml-2">
                    {/* Mobile version */}
                    <div className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
                        <span className="w-3 h-3 inline-flex rounded-full bg-red-500" />
                    </div>
                    <span className="uppercase ml-1 text-sm font-bold tracking-wider text-red-400">Live</span>
                </div>
            )}
        </div>
    );
}
