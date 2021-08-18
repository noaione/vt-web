import React from "react";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import FilterSkeleton from "./FilterSkeleton";

function SkeletonCard({ isTwitch }: { isTwitch?: boolean }) {
    return (
        <div className="flex rounded-lg">
            <div className="m-auto shadow-md rounded-lg w-full">
                <div className="relative rounded-lg flex-start aspect-w-1 aspect-h-1">
                    <Skeleton className="h-full" />
                </div>
                <div className="px-4 py-4 text-gray-200 bg-gray-900">
                    <p className="mt-1 uppercase text-sm tracking-wide font-bold text-center">
                        <Skeleton width={100} />
                    </p>
                    <p className="mt-2 text-white text-lg font-semibold text-center">
                        <Skeleton />
                    </p>
                </div>
                <div
                    className={`px-4 py-4 text-gray-200 bg-gray-900 border-t ${
                        isTwitch ? "border-twitch" : "border-youtube"
                    }`}
                >
                    <Skeleton height={25} />
                </div>
                <div
                    className={`px-4 py-4 text-gray-200 bg-gray-900 border-t ${
                        isTwitch ? "border-twitch" : "border-youtube"
                    }`}
                >
                    <Skeleton height={25} />
                </div>
                <div
                    className={`rounded-b-lg px-4 py-4 text-gray-200 bg-gray-900 text-center flex flex-row gap-2 justify-center border-t ${
                        isTwitch ? "border-twitch" : "border-youtube"
                    }`}
                >
                    <Skeleton width={90} height={40} />
                    <Skeleton width={70} height={40} />
                </div>
            </div>
        </div>
    );
}

export default function ChannelsPagesSkeleton() {
    return (
        <SkeletonTheme color="#404040" highlightColor="#525252">
            <FilterSkeleton />
            <div className="pb-3 vtubers-group skeleton">
                <h2 className="text-white py-3 text-3xl font-bold mb-2">
                    <Skeleton width={120} height={40} />
                    <Skeleton width={40} height={40} className="ml-2" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                    <SkeletonCard isTwitch />
                </div>
            </div>
        </SkeletonTheme>
    );
}
