"use client";
import { useSyncExternalStore } from "react";
import { createSessionStore } from "@/domain/session";
// No browser APIs are read during SSR or module evaluation.
const store = createSessionStore(()=>window.localStorage);
export function useQuizSession() {
 const view = useSyncExternalStore(store.subscribe,store.getSnapshot,store.getServerSnapshot);
 return {...view,dispatch:store.dispatch};
}
