"use client";

import { useEffect, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { DotLoader } from "@/components/gsap/dot-loader";

export type DotFlowProps = {
    items?: {
        title: string;
        frames: number[][];
        duration?: number;
        repeatCount?: number;
    }[];
    isPlaying?: boolean;
    className?: string;
};

const importing = [
    [0, 2, 4, 6, 20, 34, 48, 46, 44, 42, 28, 14, 8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47],
    [8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
    [9, 11, 15, 17, 19, 23, 25, 29, 31, 33, 37, 39],
    [16, 30, 24, 18, 32],
    [17, 23, 31, 25],
    [24],
    [17, 23, 31, 25],
    [16, 30, 24, 18, 32],
    [9, 11, 15, 17, 19, 23, 25, 29, 31, 33, 37, 39],
    [8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47],
    [0, 2, 4, 6, 20, 34, 48, 46, 44, 42, 28, 14, 8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
];

const syncing = [
    [45, 38, 31, 24, 17, 23, 25],
    [38, 31, 24, 17, 10, 16, 18],
    [31, 24, 17, 10, 3, 9, 11],
    [24, 17, 10, 3, 2, 4],
    [17, 10, 3],
    [10, 3],
    [3],
    [],
    [45],
    [45, 38, 44, 46],
    [45, 38, 31, 37, 39],
    [45, 38, 31, 24, 30, 32],
];

const searching = [
    [9, 16, 17, 15, 23],
    [10, 17, 18, 16, 24],
    [11, 18, 19, 17, 25],
    [18, 25, 26, 24, 32],
    [25, 32, 33, 31, 39],
    [32, 39, 40, 38, 46],
    [31, 38, 39, 37, 45],
    [30, 37, 38, 36, 44],
    [23, 30, 31, 29, 37],
    [31, 29, 37, 22, 24, 23, 38, 36],
    [16, 23, 24, 22, 30],
];

const generating = [
    [],
    [7, 1],
    [15, 9, 7, 1],
    [23, 17, 21, 15, 9, 3],
    [31, 25, 29, 23, 17, 11],
    [39, 33, 37, 31, 25, 19],
    [47, 41, 45, 39, 33, 27],
    [47, 41, 45, 39, 33, 27],
    [47, 41, 45, 39, 33, 27],
    [47, 41, 45, 39, 33, 27],
];

export const DotFlow = ({ 
    items = [
        {
            title: "Importing...",
            frames: importing,
            duration: 200,
            repeatCount: 1
        },
        {
            title: "Syncing...",
            frames: syncing,
            duration: 100,
            repeatCount: 1
        },
        {
            title: "Searching...",
            frames: searching,
            duration: 150,
            repeatCount: 1
        },
        {
            title: "Generating...",
            frames: generating,
            duration: 200,
            repeatCount: 1
        }
    ],
    isPlaying = true,
    className = "",
    onComplete
}: DotFlowProps & { onComplete?: () => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(0);
    const [textIndex, setTextIndex] = useState(0);
    const [allStagesComplete, setAllStagesComplete] = useState(false);
    const [currentStageCompleted, setCurrentStageCompleted] = useState(0);
    const [stageRepeatCounts, setStageRepeatCounts] = useState<number[]>(
        items.map(() => 0),
    );

    const { contextSafe } = useGSAP();

    useEffect(() => {
        if (!containerRef.current || !textRef.current) return;

        const newWidth = textRef.current.offsetWidth + 1;

        gsap.to(containerRef.current, {
            width: newWidth,
            duration: 0.5,
            ease: "power2.out",
        });
    }, [textIndex]); // Removed items from dependencies to prevent infinite loop

    useEffect(() => {
        setIndex(0);
        setTextIndex(0);
        setAllStagesComplete(false);
        setCurrentStageCompleted(0);
        // Initialize repeat counts for each stage
        setStageRepeatCounts(items.map(() => 0));
    }, [items.length]); // Only depend on length, not the entire items array

    const next = contextSafe(() => {
        if (allStagesComplete) return;
        
        const el = containerRef.current;
        if (!el) return;

        const currentItem = items[index];
        const maxRepeats = currentItem?.repeatCount ?? 1;
        
        // Check if current stage has completed its repeats
        if (stageRepeatCounts[index] >= maxRepeats) {
            // Move to next stage
            const nextIndex = (index + 1) % items.length;
            const nextTextIndex = (textIndex + 1) % items.length;
            
            // If we've completed all stages, call onComplete and stop
            if (nextIndex === 0 && index === items.length - 1) {
                setAllStagesComplete(true);
                if (onComplete) {
                    setTimeout(() => onComplete(), 100);
                }
                return;
            }
            
            // Reset repeat count for new stage
            const newStageRepeatCounts = [...stageRepeatCounts];
            newStageRepeatCounts[nextIndex] = 0;
            setStageRepeatCounts(newStageRepeatCounts);
            
            gsap.to(el, {
                y: 20,
                opacity: 0,
                filter: "blur(8px)",
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    setTextIndex(nextTextIndex);
                    setIndex(nextIndex);
                    gsap.fromTo(
                        el,
                        { y: -20, opacity: 0, filter: "blur(4px)" },
                        {
                            y: 0,
                            opacity: 1,
                            filter: "blur(0px)",
                            duration: 0.5,
                            ease: "power2.out",
                        },
                    );
                },
            });
        } else {
            // Increment repeat count for current stage
            const newStageRepeatCounts = [...stageRepeatCounts];
            newStageRepeatCounts[index] = newStageRepeatCounts[index] + 1;
            setStageRepeatCounts(newStageRepeatCounts);
        }
    });

    return (
        <div className={`flex items-center gap-3 rounded bg-[#1a1625] backdrop-blur-sm px-3 py-2 ${className}`}>
            <DotLoader
                frames={items[index]?.frames ?? []}
                onComplete={next}
                className="gap-px"
                isPlaying={isPlaying && !allStagesComplete}
                repeatCount={1}
                duration={items[index]?.duration ?? 150}
                dotClassName="bg-white/20 [&.active]:bg-purple-400 size-1"
            />
            <div ref={containerRef} className="relative">
                <div ref={textRef} className="inline-block text-md font-medium whitespace-nowrap text-gray-300">
                    {items[textIndex]?.title}
                </div>
            </div>
        </div>
    );
};
