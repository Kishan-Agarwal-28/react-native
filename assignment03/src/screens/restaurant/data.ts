export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
};

export type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type RestaurantMenu = {
  emoji: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  description: string;
  menu: MenuSection[];
};

type RestaurantSeed = {
  id: string;
  name: string;
  cuisines: string[];
  rating: number;
  deliveryTime: string;
};

type MenuTemplate = {
  name: string;
  description: string;
  price: number;
  emoji: string;
  tags: string[];
};

const MENU_POOL: MenuTemplate[] = [
  {
    name: "Classic Smash Burger",
    description: "Double patty, cheddar, pickles, special sauce",
    price: 12.99,
    emoji: "\u{1F354}",
    tags: ["burgers", "fastfood"],
  },
  {
    name: "Spicy Crispy Chicken",
    description: "Nashville hot, slaw, honey drizzle",
    price: 13.49,
    emoji: "\u{1F357}",
    tags: ["chickenwings", "fastfood"],
  },
  {
    name: "Margherita Pizza",
    description: "San Marzano, mozzarella, basil",
    price: 11.99,
    emoji: "\u{1F355}",
    tags: ["pizza", "italian"],
  },
  {
    name: "Truffle Mushroom Pizza",
    description: "Roasted mushrooms, truffle oil, parmesan",
    price: 14.5,
    emoji: "\u{1F355}",
    tags: ["pizza", "italian", "vegetarian"],
  },
  {
    name: "Sushi Platter",
    description: "Chef selection of nigiri and rolls",
    price: 18.75,
    emoji: "\u{1F363}",
    tags: ["japanese", "sushi", "asian"],
  },
  {
    name: "Teriyaki Bowl",
    description: "Grilled chicken, rice, sesame glaze",
    price: 12.5,
    emoji: "\u{1F35A}",
    tags: ["japanese", "asian", "chickenwings"],
  },
  {
    name: "Butter Chicken",
    description: "Creamy tomato gravy, basmati rice",
    price: 13.75,
    emoji: "\u{1F35B}",
    tags: ["indian"],
  },
  {
    name: "Paneer Tikka Wrap",
    description: "Charred paneer, mint chutney, onions",
    price: 10.25,
    emoji: "\u{1F96A}",
    tags: ["indian", "vegetarian"],
  },
  {
    name: "Pad Thai",
    description: "Rice noodles, tamarind, peanuts",
    price: 12.25,
    emoji: "\u{1F35C}",
    tags: ["thai", "asian"],
  },
  {
    name: "Tacos al Pastor",
    description: "Pineapple pork, salsa verde, onion",
    price: 11.5,
    emoji: "\u{1F32E}",
    tags: ["mexican"],
  },
  {
    name: "BBQ Ribs",
    description: "Smoky glaze, house rub",
    price: 16.0,
    emoji: "\u{1F969}",
    tags: ["barbecuegrill", "steaks"],
  },
  {
    name: "Grilled Salmon",
    description: "Lemon butter, herb salad",
    price: 17.25,
    emoji: "\u{1F41F}",
    tags: ["seafood"],
  },
  {
    name: "Vegan Power Bowl",
    description: "Quinoa, roasted veg, tahini",
    price: 11.75,
    emoji: "\u{1F96C}",
    tags: ["vegan", "saladshealthy"],
  },
  {
    name: "Pasta Alfredo",
    description: "Cream sauce, parmesan, herbs",
    price: 12.5,
    emoji: "\u{1F35D}",
    tags: ["italian"],
  },
  {
    name: "Dim Sum Basket",
    description: "Steamed dumplings, chili oil",
    price: 13.0,
    emoji: "\u{1F95F}",
    tags: ["chinese", "asian"],
  },
  {
    name: "Bibimbap",
    description: "Spicy gochujang, egg, veggies",
    price: 12.9,
    emoji: "\u{1F962}",
    tags: ["korean", "asian"],
  },
  {
    name: "Breakfast Stack",
    description: "Eggs, hash browns, toast",
    price: 10.0,
    emoji: "\u{1F35F}",
    tags: ["breakfast"],
  },
  {
    name: "Waffle Stack",
    description: "Maple, berries, whipped cream",
    price: 9.5,
    emoji: "\u{1F9C7}",
    tags: ["desserts", "bakerycakes"],
  },
];

const SIDE_POOL: MenuTemplate[] = [
  {
    name: "Loaded Fries",
    description: "Cheese sauce, scallions, jalapenos",
    price: 5.5,
    emoji: "\u{1F35F}",
    tags: ["sides"],
  },
  {
    name: "Onion Rings",
    description: "Beer-battered, ranch dip",
    price: 4.99,
    emoji: "\u{1F9C5}",
    tags: ["sides"],
  },
  {
    name: "Garlic Bread",
    description: "Herb butter, toasted",
    price: 4.5,
    emoji: "\u{1F956}",
    tags: ["sides", "italian"],
  },
  {
    name: "Cucumber Salad",
    description: "Sesame dressing, chili flakes",
    price: 4.25,
    emoji: "\u{1F952}",
    tags: ["saladshealthy"],
  },
  {
    name: "Edamame",
    description: "Sea salt, chili oil",
    price: 4.75,
    emoji: "\u{1F96C}",
    tags: ["japanese", "asian"],
  },
  {
    name: "Roasted Veggies",
    description: "Seasonal herb mix",
    price: 5.25,
    emoji: "\u{1F966}",
    tags: ["vegan", "saladshealthy"],
  },
];

const DRINK_POOL: MenuTemplate[] = [
  {
    name: "Craft Soda",
    description: "Citrus, ginger, or berry",
    price: 3.5,
    emoji: "\u{1F964}",
    tags: ["beverages"],
  },
  {
    name: "Iced Latte",
    description: "Cold brew, oat milk",
    price: 4.5,
    emoji: "\u{1F9CB}",
    tags: ["coffeetea"],
  },
  {
    name: "Mango Lassi",
    description: "Yogurt, mango, cardamom",
    price: 4.25,
    emoji: "\u{1F95B}",
    tags: ["indian", "beverages"],
  },
  {
    name: "Green Tea",
    description: "Jasmine infusion",
    price: 3.0,
    emoji: "\u2615",
    tags: ["coffeetea"],
  },
];

const CUISINE_EMOJI: Record<string, string> = {
  burgers: "\u{1F354}",
  pizza: "\u{1F355}",
  japanese: "\u{1F363}",
  sushi: "\u{1F363}",
  indian: "\u{1F35B}",
  chinese: "\u{1F962}",
  mexican: "\u{1F32E}",
  desserts: "\u{1F370}",
  bakerycakes: "\u{1F9C1}",
  coffeetea: "\u2615",
  barbecuegrill: "\u{1F969}",
  seafood: "\u{1F990}",
  saladshealthy: "\u{1F957}",
  vegan: "\u{1F96C}",
  fastfood: "\u{1F35F}",
  breakfast: "\u{1F95E}",
  steaks: "\u{1F969}",
  korean: "\u{1F962}",
  thai: "\u{1F35C}",
  italian: "\u{1F35D}",
  vegetarian: "\u{1F96C}",
};

const DESCRIPTION_TEMPLATES = [
  (name: string, cuisine: string) =>
    `Signature ${cuisine} favorites handcrafted at ${name}.`,
  (name: string, cuisine: string) =>
    `Fresh ${cuisine} classics with bold flavors and local ingredients.`,
  (name: string, cuisine: string) =>
    `Chef-driven ${cuisine} menu with daily specials at ${name}.`,
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

const hash = (value: string) =>
  value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const seededShuffle = <T>(items: T[], seed: number) => {
  const copy = [...items];
  let currentSeed = seed;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const rand = currentSeed / 233280;
    const j = Math.floor(rand * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickTemplates = (
  templates: MenuTemplate[],
  cuisines: string[],
  count: number,
  seed: number,
) => {
  const matches = templates.filter((template) =>
    template.tags.some((tag) => cuisines.includes(tag)),
  );
  const pool = matches.length >= count ? matches : templates;
  return seededShuffle(pool, seed).slice(0, count);
};

const buildItems = (
  templates: MenuTemplate[],
  idPrefix: string,
  startIndex: number,
) =>
  templates.map((template, index) => ({
    id: `${idPrefix}-${startIndex + index}`,
    name: template.name,
    description: template.description,
    price: template.price,
    emoji: template.emoji,
  }));

export const buildRestaurantMenu = (
  restaurant: RestaurantSeed,
): RestaurantMenu => {
  const cuisineTags = restaurant.cuisines.map(normalize);
  const seed = hash(restaurant.id);
  const primaryCuisine = cuisineTags[0] ?? "chef";
  const emoji = CUISINE_EMOJI[primaryCuisine] ?? "\u{1F37D}";

  const signatureItem: MenuItem = {
    id: `${restaurant.id}-signature`,
    name: `Signature ${restaurant.name}`,
    description: `Chef's special inspired by ${restaurant.cuisines[0] ?? "house"} flavors.`,
    price: 14.75 + (seed % 3),
    emoji,
  };

  const popularTemplates = pickTemplates(MENU_POOL, cuisineTags, 2, seed);
  const sideTemplates = pickTemplates(SIDE_POOL, cuisineTags, 2, seed + 7);
  const drinkTemplates = pickTemplates(DRINK_POOL, cuisineTags, 1, seed + 13);

  const popularItems = [
    signatureItem,
    ...buildItems(popularTemplates, `${restaurant.id}-popular`, 0),
  ];
  const sideItems = buildItems(
    [...sideTemplates, ...drinkTemplates],
    `${restaurant.id}-side`,
    0,
  );

  const descriptionTemplate =
    DESCRIPTION_TEMPLATES[seed % DESCRIPTION_TEMPLATES.length];
  const description = descriptionTemplate(
    restaurant.name,
    restaurant.cuisines[0] ?? "chef",
  );

  const deliveryFee = Number((2.49 + (seed % 4) * 0.5).toFixed(2));

  return {
    emoji,
    rating: restaurant.rating,
    deliveryTime: restaurant.deliveryTime,
    deliveryFee,
    description,
    menu: [
      {
        id: `${restaurant.id}-section-1`,
        title: "Popular Items",
        items: popularItems,
      },
      {
        id: `${restaurant.id}-section-2`,
        title: "Sides & Drinks",
        items: sideItems,
      },
    ],
  };
};
