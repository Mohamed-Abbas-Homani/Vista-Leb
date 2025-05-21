// store/notificationStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "./types/user";

type Store = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
};

const useStore = create<Store>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        setUser: (user: User | null) => set({ user }),
        setToken: (token: string) => set({ token }),
      }),
      { name: "vista-store" }
    )
  )
);

export default useStore;
