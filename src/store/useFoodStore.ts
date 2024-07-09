// src/store/useFoodStore.ts
import { StateCreator, create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

interface Measure {
  weight: number;
}

interface Nutrients {
  ENERC_KCAL: number;
  PROCNT: number;
  CHOCDF: number;
  FAT: number;
}

interface Food {
  foodId: string;
  label: string;
  knownAs?: string; // Added this property
  image?: string;
  nutrients: Nutrients;
  measures?: [];
}

export interface SelectedFoodItem {
  food: Food;
  measures: Measure[];
}

interface FoodStoreState {
  selectedFoodItems: {
    [date: string]: {
      [meal: string]: SelectedFoodItem[];
    };
  };
  addFoodItem: (date: string, meal: string, foodItem: SelectedFoodItem) => void;
  removeFoodItem: (date: string, meal: string, index: number) => void;
}

type MyPersist = (
  config: StateCreator<FoodStoreState>,
  options: PersistOptions<FoodStoreState>
) => StateCreator<FoodStoreState>;

const useFoodStore = create<FoodStoreState>(
  (persist as MyPersist)(
    (set) => ({
      selectedFoodItems: {},

      addFoodItem: (date, meal, foodItem) => {
        set((state) => {
          const newItems = { ...state.selectedFoodItems };
          if (!newItems[date]) {
            newItems[date] = {};
          }
          if (!newItems[date][meal]) {
            newItems[date][meal] = [];
          }
          newItems[date][meal].push(foodItem);
          return { selectedFoodItems: newItems };
        });
      },

      removeFoodItem: (date, meal, index) => {
        set((state) => {
          const newItems = { ...state.selectedFoodItems };
          if (newItems[date] && newItems[date][meal]) {
            newItems[date][meal].splice(index, 1);
            if (newItems[date][meal].length === 0) {
              delete newItems[date][meal];
              if (Object.keys(newItems[date]).length === 0) {
                delete newItems[date];
              }
            }
          }
          return { selectedFoodItems: newItems };
        });
      },
    }),
    { name: "food-store" }
  )
);

export default useFoodStore;
