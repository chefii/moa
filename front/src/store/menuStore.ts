import { create } from 'zustand';

interface MenuState {
  refreshTrigger: number;
  refreshMenu: () => void;
}

export const useMenuStore = create<MenuState>()((set) => ({
  refreshTrigger: 0,

  refreshMenu: () => {
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }));
  },
}));
