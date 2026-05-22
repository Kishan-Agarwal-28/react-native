import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { RESTAURANTS as LIST_RESTAURANTS } from "@/lib/data";
import {
  buildRestaurantMenu,
  type RestaurantMenu,
} from "@/src/screens/restaurant/data";

type CartMap = Record<string, number>;

export type Restaurant = (typeof LIST_RESTAURANTS)[number] & RestaurantMenu;

type RestaurantContextType = {
  restaurants: Restaurant[];
  getRestaurantById: (id: string) => Restaurant | undefined;
  cart: CartMap;
  activeRestaurantId: string | null;
  cartCount: number;
  addToCart: (restaurantId: string, itemId: string) => void;
  updateCartItem: (itemId: string, delta: number) => void;
  clearCart: () => void;
};

const RestaurantContext = createContext<RestaurantContextType>({
  restaurants: [],
  getRestaurantById: () => undefined,
  cart: {},
  activeRestaurantId: null,
  cartCount: 0,
  addToCart: () => {},
  updateCartItem: () => {},
  clearCart: () => {},
});

export const RestaurantProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cart, setCart] = useState<CartMap>({});
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(
    null,
  );

  const restaurants = useMemo<Restaurant[]>(() => {
    return LIST_RESTAURANTS.map((restaurant) => ({
      ...restaurant,
      ...buildRestaurantMenu({
        id: restaurant.id,
        name: restaurant.name,
        cuisines: restaurant.cuisines,
        rating: restaurant.rating,
        deliveryTime: restaurant.deliveryTime,
      }),
    }));
  }, []);

  const getRestaurantById = (id: string) =>
    restaurants.find((restaurant) => restaurant.id === id);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    [cart],
  );

  const addToCart = (restaurantId: string, itemId: string) => {
    const shouldReset =
      activeRestaurantId && activeRestaurantId !== restaurantId;

    setCart((prev) => {
      if (shouldReset) {
        return { [itemId]: 1 };
      }

      return { ...prev, [itemId]: (prev[itemId] ?? 0) + 1 };
    });

    setActiveRestaurantId(restaurantId);
  };

  const updateCartItem = (itemId: string, delta: number) => {
    setCart((prev) => {
      const nextQty = (prev[itemId] ?? 0) + delta;
      if (nextQty <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [itemId]: nextQty };
    });
  };

  const clearCart = () => {
    setCart({});
    setActiveRestaurantId(null);
  };

  useEffect(() => {
    if (Object.keys(cart).length === 0) {
      setActiveRestaurantId(null);
    }
  }, [cart]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        getRestaurantById,
        cart,
        activeRestaurantId,
        cartCount,
        addToCart,
        updateCartItem,
        clearCart,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => useContext(RestaurantContext);
