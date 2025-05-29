import { initialize } from 'next/dist/server/lib/render-server';
import { create }from 'zustand';
import { persist } from 'zustand/middleware';

//chat interface 
interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: number;
}

interface ChatSession {
    id: number;
    messages: Message[];
    title: string;
    timestamp: number;
    model : { name: string; subTxt: string; };
}

