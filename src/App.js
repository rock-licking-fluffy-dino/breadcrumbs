import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDoc, collection } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI9GJYMVYofjWz6cJ027zZbwi6XMOsAOU",
  authDomain: "breadcrumbs-0000.firebaseapp.com",
  projectId: "breadcrumbs-0000",
  storageBucket: "breadcrumbs-0000.firebasestorage.app",
  messagingSenderId: "933716614684",
  appId: "1:933716614684:web:a31b027b9b793841f709d9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LcUPoMsAAAAAKXBQxRYUt5UmVa135MT7V2pkHR4'),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.error('App Check initialization failed:', error);
  }
}

const DEFAULT_CATEGORIES = [
  { id: 'fruit-veg', name: 'Fruits & Vegetables', isDefault: true },
  { id: 'meat-poultry', name: 'Meat & Poultry', isDefault: true },
  { id: 'seafood', name: 'Seafood', isDefault: true },
  { id: 'dairy-eggs', name: 'Dairy & Eggs', isDefault: true },
  { id: 'bakery', name: 'Bakery', isDefault: true },
  { id: 'deli-chilled', name: 'Deli & Chilled', isDefault: true },
  { id: 'frozen', name: 'Frozen', isDefault: true },
  { id: 'breakfast-cereals', name: 'Breakfast & Cereals', isDefault: true },
  { id: 'pasta-rice-grains', name: 'Pasta, Rice & Grains', isDefault: true },
  { id: 'canned-goods', name: 'Canned Goods', isDefault: true },
  { id: 'sauces-condiments', name: 'Sauces & Condiments', isDefault: true },
  { id: 'spices-seasonings', name: 'Spices & Seasonings', isDefault: true },
  { id: 'snacks-confectionery', name: 'Snacks & Confectionery', isDefault: true },
  { id: 'beverages', name: 'Beverages', isDefault: true },
  { id: 'alcohol', name: 'Alcohol', isDefault: true },
  { id: 'household', name: 'Household', isDefault: true },
  { id: 'personal-care-health', name: 'Personal Care & Health', isDefault: true },
  { id: 'baby', name: 'Baby', isDefault: true },
  { id: 'pet-supplies', name: 'Pet Supplies', isDefault: true },
  { id: 'other', name: 'Other', isDefault: true },
];

const YELLOW = '#FACC15';

// Recipe accent colors palette
const RECIPE_ACCENT_COLORS = ['#fb923c', '#86efac', '#93c5fd', '#f9a8d4', '#fdba74', '#6ee7b7', '#c4b5fd', '#fca5a5', '#67e8f9', '#d9f99d'];

// Default store layouts with typical UK supermarket category orders
const DEFAULT_STORE_LAYOUTS = [
  {
    id: 'default',
    name: 'Default',
    isDefault: true,
    categoryOrder: ['fruit-veg', 'bakery', 'deli-chilled', 'dairy-eggs', 'meat-poultry', 'seafood', 'frozen', 'breakfast-cereals', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'snacks-confectionery', 'beverages', 'alcohol', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'other']
  },
  {
    id: 'tesco',
    name: 'Tesco',
    isDefault: true,
    categoryOrder: ['fruit-veg', 'bakery', 'deli-chilled', 'dairy-eggs', 'meat-poultry', 'seafood', 'frozen', 'breakfast-cereals', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'snacks-confectionery', 'beverages', 'alcohol', 'baby', 'personal-care-health', 'household', 'pet-supplies', 'other']
  },
  {
    id: 'sainsburys',
    name: "Sainsbury's",
    isDefault: true,
    categoryOrder: ['fruit-veg', 'bakery', 'meat-poultry', 'seafood', 'deli-chilled', 'dairy-eggs', 'frozen', 'breakfast-cereals', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'beverages', 'snacks-confectionery', 'alcohol', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'other']
  },
  {
    id: 'asda',
    name: 'Asda',
    isDefault: true,
    categoryOrder: ['fruit-veg', 'bakery', 'dairy-eggs', 'meat-poultry', 'seafood', 'deli-chilled', 'frozen', 'breakfast-cereals', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'snacks-confectionery', 'beverages', 'alcohol', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'other']
  },
  {
    id: 'morrisons',
    name: 'Morrisons',
    isDefault: true,
    categoryOrder: ['fruit-veg', 'bakery', 'deli-chilled', 'meat-poultry', 'seafood', 'dairy-eggs', 'frozen', 'breakfast-cereals', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'snacks-confectionery', 'beverages', 'alcohol', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'other']
  },
  {
    id: 'aldi',
    name: 'Aldi',
    isDefault: true,
    categoryOrder: ['bakery', 'fruit-veg', 'dairy-eggs', 'deli-chilled', 'meat-poultry', 'seafood', 'frozen', 'breakfast-cereals', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'snacks-confectionery', 'beverages', 'alcohol', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'other']
  },
  {
    id: 'lidl',
    name: 'Lidl',
    isDefault: true,
    categoryOrder: ['bakery', 'fruit-veg', 'deli-chilled', 'meat-poultry', 'seafood', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'breakfast-cereals', 'snacks-confectionery', 'beverages', 'alcohol', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'frozen', 'dairy-eggs', 'other']
  },
  {
    id: 'waitrose',
    name: 'Waitrose',
    isDefault: true,
    categoryOrder: ['fruit-veg', 'bakery', 'deli-chilled', 'dairy-eggs', 'meat-poultry', 'seafood', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'breakfast-cereals', 'snacks-confectionery', 'beverages', 'alcohol', 'frozen', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'other']
  },
  {
    id: 'mands',
    name: 'M&S Food',
    isDefault: true,
    categoryOrder: ['fruit-veg', 'bakery', 'deli-chilled', 'dairy-eggs', 'meat-poultry', 'seafood', 'frozen', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'breakfast-cereals', 'snacks-confectionery', 'beverages', 'alcohol', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'other']
  },
  {
    id: 'coop',
    name: 'Co-op',
    isDefault: true,
    categoryOrder: ['fruit-veg', 'bakery', 'deli-chilled', 'dairy-eggs', 'meat-poultry', 'seafood', 'frozen', 'breakfast-cereals', 'pasta-rice-grains', 'canned-goods', 'sauces-condiments', 'spices-seasonings', 'snacks-confectionery', 'beverages', 'alcohol', 'household', 'personal-care-health', 'baby', 'pet-supplies', 'other']
  }
];

// Category dictionary for Quick Add auto-categorization
const CATEGORY_DICTIONARY = {
  'fruit-veg': [
    'apple', 'apples', 'avocado', 'avocados', 'banana', 'bananas', 'basil',
    'bean sprouts', 'beetroot', 'bell pepper', 'bell peppers', 'blackberries',
    'blueberries', 'bok choy', 'broccoli', 'brussels sprouts', 'butternut squash',
    'cabbage', 'capsicum', 'carrot', 'carrots', 'cauliflower', 'celery',
    'cherry tomatoes', 'chilli', 'chillies', 'chives', 'cilantro', 'clementine',
    'clementines', 'coleslaw', 'collard greens', 'corn', 'corn on the cob',
    'courgette', 'courgettes', 'cranberries', 'cucumber', 'cucumbers', 'dates',
    'dill', 'edamame', 'eggplant', 'fennel', 'figs', 'fruit', 'fruit salad',
    'garlic', 'ginger', 'grapes', 'green beans', 'green onion', 'green onions',
    'green pepper', 'herbs', 'honeydew', 'jalapeño', 'jalapeños', 'kale',
    'kiwi', 'kiwis', 'leek', 'leeks', 'lemon', 'lemons', 'lemongrass',
    'lettuce', 'lime', 'limes', 'mandarin', 'mandarins', 'mango', 'mangoes',
    'melon', 'mint', 'mixed greens', 'mixed salad', 'mushroom', 'mushrooms',
    'nectarine', 'nectarines', 'okra', 'onion', 'onions', 'orange', 'oranges',
    'pak choi', 'parsley', 'parsnip', 'parsnips', 'passion fruit', 'pea pods',
    'peach', 'peaches', 'pear', 'pears', 'peas', 'pepper', 'peppers',
    'pineapple', 'plantain', 'plum', 'plums', 'pomegranate', 'potato',
    'potatoes', 'pumpkin', 'radicchio', 'radish', 'radishes', 'raspberries',
    'red cabbage', 'red onion', 'red pepper', 'rhubarb', 'rocket', 'romaine',
    'rosemary', 'runner beans', 'sage', 'salad', 'salad mix', 'satsuma',
    'satsumas', 'scallion', 'scallions', 'shallot', 'shallots', 'snow peas',
    'spinach', 'spring greens', 'spring onion', 'spring onions', 'squash',
    'strawberries', 'sugar snap peas', 'swede', 'sweet corn', 'sweet potato',
    'sweet potatoes', 'tangerine', 'tangerines', 'thyme', 'tomato', 'tomatoes',
    'turnip', 'turnips', 'vine tomatoes', 'watercress', 'watermelon',
    'yellow pepper', 'zucchini'
  ],
  'bakery': [
    'bagel', 'bagels', 'baguette', 'banana bread', 'biscuits', 'bread',
    'bread rolls', 'brioche', 'brown bread', 'bun', 'buns', 'ciabatta',
    'cinnamon rolls', 'cornbread', 'crescent rolls', 'croissant', 'croissants',
    'crumpets', 'danish', 'dinner rolls', 'donuts', 'doughnuts', 'english muffin',
    'english muffins', 'flatbread', 'focaccia', 'french bread', 'garlic bread',
    'hamburger buns', 'hot cross buns', 'hot dog buns', 'muffin', 'muffins',
    'naan', 'naan bread', 'pancakes', 'pastries', 'pastry', 'pie crust',
    'pikelets', 'pita', 'pita bread', 'pizza dough', 'pretzel', 'pretzels',
    'raisin bread', 'rolls', 'rye bread', 'scone', 'scones', 'sliced bread',
    'sourdough', 'teacakes', 'tiger bread', 'toast', 'tortilla', 'tortillas',
    'waffles', 'white bread', 'wholemeal bread', 'wraps'
  ],
  'deli-chilled': [
    'antipasto', 'baba ganoush', 'chicken breast', 'chicken pieces',
    'chicken thighs', 'chicken wings', 'chorizo', 'cooked chicken',
    'cooked ham', 'cooked meats', 'couscous', 'deli meat', 'deli meats',
    'dip', 'dips', 'falafel', 'fresh juice', 'fresh pasta', 'fresh pizza',
    'fresh ravioli', 'fresh salsa', 'fresh soup', 'guacamole', 'ham',
    'houmous', 'hummus', 'meatballs', 'mortadella', 'olives', 'pastrami',
    'pate', 'pepperoni', 'pork pie', 'prosciutto', 'quiche', 'ready meal',
    'ready meals', 'rotisserie chicken', 'salami', 'sandwich', 'sandwiches',
    'sausage rolls', 'scotch eggs', 'sliced ham', 'sliced turkey',
    'spring rolls', 'stir fry', 'stuffing', 'sub roll', 'sushi',
    'taramasalata', 'turkey slices', 'tzatziki', 'veggie burger',
    'veggie burgers'
  ],
  'dairy-eggs': [
    'almond milk', 'butter', 'buttermilk', 'cheddar', 'cheese',
    'cheese slices', 'cheese spread', 'clotted cream', 'coconut milk',
    'cottage cheese', 'cream', 'cream cheese', 'creme fraiche',
    'double cream', 'egg', 'eggs', 'feta', 'free range eggs',
    'goat cheese', 'greek yoghurt', 'greek yogurt', 'gruyere',
    'halloumi', 'heavy cream', 'margarine', 'mascarpone', 'milk',
    'mozzarella', 'oat milk', 'parmesan', 'plant milk', 'ricotta',
    'single cream', 'skimmed milk', 'sour cream', 'soya milk',
    'spread', 'whipping cream', 'whole milk', 'yoghurt', 'yogurt'
  ],
  'meat-poultry': [
    'bacon', 'beef', 'beef mince', 'chicken', 'chicken drumsticks',
    'duck', 'gammon', 'ground beef', 'ground pork', 'ground turkey',
    'ham joint', 'hot dogs', 'kebab meat', 'lamb', 'lamb chops',
    'lamb mince', 'liver', 'mince', 'minced beef', 'minced meat',
    'pork', 'pork belly', 'pork chops', 'pork loin', 'pork mince',
    'ribs', 'salami whole', 'sausage', 'sausages', 'sirloin',
    'steak', 'steaks', 'stewing beef', 'stewing steak', 'turkey',
    'turkey breast', 'turkey mince', 'veal', 'venison'
  ],
  'seafood': [
    'anchovies', 'calamari', 'clams', 'cod', 'crab', 'crab meat',
    'crab sticks', 'fish', 'fish cakes', 'fish fillets', 'fish fingers',
    'fish sticks', 'haddock', 'halibut', 'king prawns', 'lobster',
    'mackerel', 'mussels', 'oysters', 'plaice', 'pollock', 'prawns',
    'salmon', 'salmon fillets', 'sardines', 'scallops', 'sea bass',
    'seafood', 'seafood mix', 'shrimp', 'smoked mackerel', 'smoked salmon',
    'sole', 'squid', 'swordfish', 'tilapia', 'trout', 'tuna steak',
    'white fish'
  ],
  'frozen': [
    'chicken nuggets', 'chips', 'fish fingers frozen', 'frozen berries',
    'frozen chips', 'frozen fruit', 'frozen peas', 'frozen pizza',
    'frozen prawns', 'frozen spinach', 'frozen veg', 'frozen vegetables',
    'frozen yoghurt', 'ice cream', 'ice lollies', 'ice pops',
    'oven chips', 'potato waffles', 'turkey dinosaurs', 'waffles frozen'
  ],
  'breakfast-cereals': [
    'all bran', 'bran flakes', 'cereal', 'cereal bars', 'cheerios',
    'coco pops', 'corn flakes', 'cornflakes', 'frosties', 'fruit and fibre',
    'granola', 'honey', 'instant oats', 'jam', 'maple syrup', 'marmalade',
    'muesli', 'nutella', 'oatmeal', 'oats', 'peanut butter', 'porridge',
    'porridge oats', 'rice krispies', 'shreddies', 'special k',
    'syrup', 'weetabix'
  ],
  'pasta-rice-grains': [
    'arborio rice', 'basmati', 'basmati rice', 'brown rice', 'buckwheat',
    'bulgur wheat', 'couscous dry', 'egg noodles', 'farfalle', 'fusilli',
    'gnocchi', 'instant noodles', 'jasmine rice', 'lasagne', 'lasagne sheets',
    'linguine', 'macaroni', 'noodles', 'orzo', 'pasta', 'penne', 'polenta',
    'quinoa', 'ramen', 'rice', 'rice noodles', 'risotto rice', 'spaghetti',
    'stuffing mix', 'tagliatelle', 'udon noodles', 'vermicelli',
    'wholewheat pasta', 'wild rice'
  ],
  'canned-goods': [
    'baked beans', 'black beans', 'butter beans', 'cannellini beans',
    'canned tomatoes', 'canned tuna', 'chickpeas', 'chopped tomatoes',
    'coconut cream', 'coconut milk tinned', 'condensed milk', 'corn canned',
    'evaporated milk', 'green beans canned', 'kidney beans', 'lentils',
    'mixed beans', 'mushy peas', 'passata', 'peaches canned',
    'pineapple canned', 'soup', 'sweetcorn', 'tinned fruit',
    'tinned peaches', 'tinned tomatoes', 'tomato paste', 'tomato puree',
    'tuna', 'tuna tinned'
  ],
  'sauces-condiments': [
    'barbecue sauce', 'bbq sauce', 'brown sauce', 'chilli sauce',
    'chutney', 'cooking sauce', 'cranberry sauce', 'curry paste',
    'curry sauce', 'fish sauce', 'gravy', 'gravy granules', 'harissa',
    'hoisin sauce', 'horseradish', 'hot sauce', 'ketchup', 'mayo',
    'mayonnaise', 'mint sauce', 'mustard', 'olive oil', 'oyster sauce',
    'pasta sauce', 'pesto', 'pickle', 'relish', 'salad cream',
    'salad dressing', 'salsa', 'soy sauce', 'sriracha', 'stir fry sauce',
    'sweet chilli sauce', 'tabasco', 'tahini', 'tartar sauce',
    'teriyaki sauce', 'tomato ketchup', 'tomato sauce', 'vinaigrette',
    'vinegar', 'worcestershire sauce'
  ],
  'spices-seasonings': [
    'all spice', 'basil dried', 'bay leaves', 'black pepper',
    'bouillon', 'cardamom', 'cayenne pepper', 'chilli flakes',
    'chilli powder', 'chinese five spice', 'cinnamon', 'cloves',
    'coriander ground', 'cumin', 'curry powder', 'fennel seeds',
    'garam masala', 'garlic granules', 'garlic powder', 'ground ginger',
    'herbs dried', 'italian seasoning', 'mixed herbs', 'mixed spice',
    'nutmeg', 'onion powder', 'oregano', 'paprika', 'parsley dried',
    'pepper', 'peppercorns', 'rosemary dried', 'saffron', 'sage dried',
    'salt', 'sea salt', 'seasoning', 'smoked paprika', 'star anise',
    'stock cubes', 'thyme dried', 'turmeric', 'vanilla essence',
    'vanilla extract'
  ],
  'snacks-confectionery': [
    'biscuit', 'biscuits sweet', 'cake', 'candy', 'cereal bar',
    'chewing gum', 'chips snack', 'chocolate', 'chocolate bar',
    'chocolate biscuits', 'cookies', 'corn chips', 'crackers', 'crisps',
    'dark chocolate', 'digestives', 'dried fruit', 'energy bar',
    'flapjack', 'fruit snacks', 'gummy bears', 'haribo', 'hobnobs',
    'jaffa cakes', 'jelly', 'jerky', 'liquorice', 'marshmallows',
    'milk chocolate', 'mints', 'mixed nuts', 'nachos', 'nut bar',
    'nuts', 'popcorn', 'pork scratchings', 'potato chips', 'pretzels snack',
    'protein bar', 'rice cakes', 'shortbread', 'snack bar', 'sweets',
    'toffee', 'trail mix', 'wine gums'
  ],
  'beverages': [
    'apple juice', 'bottled water', 'club soda', 'coconut water', 'coffee',
    'coffee beans', 'coffee pods', 'cola', 'cordial', 'decaf coffee',
    'diet coke', 'drinking chocolate', 'energy drink', 'fizzy water',
    'fruit juice', 'ginger ale', 'ginger beer', 'green tea',
    'herbal tea', 'hot chocolate', 'iced coffee', 'iced tea', 'juice',
    'kombucha', 'lemonade', 'lucozade', 'milkshake', 'mineral water',
    'orange juice', 'pepsi', 'protein shake', 'ribena', 'smoothie',
    'soda', 'sparkling water', 'squash drink', 'tea', 'tea bags',
    'tonic water', 'water'
  ],
  'alcohol': [
    'ale', 'beer', 'bourbon', 'brandy', 'champagne', 'cider', 'gin',
    'ipa', 'lager', 'liqueur', 'merlot', 'port', 'prosecco',
    'red wine', 'rose wine', 'rosé', 'rum', 'sauvignon blanc',
    'scotch', 'sherry', 'spirits', 'stout', 'tequila', 'vermouth',
    'vodka', 'whiskey', 'whisky', 'white wine', 'wine'
  ],
  'household': [
    'air freshener', 'aluminium foil', 'batteries', 'bin bags', 'bin liners',
    'bleach', 'candles', 'cleaning spray', 'cling film', 'cloths',
    'descaler', 'dish soap', 'dishwasher salt', 'dishwasher tablets',
    'disinfectant', 'drain cleaner', 'duster', 'fabric conditioner',
    'fabric softener', 'flash', 'floor cleaner', 'foil', 'food bags',
    'freezer bags', 'furniture polish', 'glass cleaner', 'greaseproof paper',
    'hand soap', 'jay cloths', 'kitchen cleaner', 'kitchen roll',
    'kitchen towel', 'laundry detergent', 'light bulb', 'light bulbs',
    'matches', 'mop', 'napkins', 'oven cleaner', 'paper plates',
    'paper towels', 'parchment paper', 'plastic bags', 'plastic wrap',
    'rubber gloves', 'sandwich bags', 'scourer', 'scourers',
    'sponge', 'sponges', 'stain remover', 'surface cleaner', 'tin foil',
    'toilet cleaner', 'toilet roll', 'toilet tissue', 'trash bags',
    'washing liquid', 'washing powder', 'washing up liquid', 'wipes',
    'zip lock bags'
  ],
  'personal-care-health': [
    'aftershave', 'antihistamines', 'bandages', 'body lotion', 'body wash',
    'conditioner', 'condoms', 'cotton buds', 'cotton pads', 'cotton wool',
    'cough medicine', 'dental floss', 'deodorant', 'eye drops',
    'face cream', 'face wash', 'feminine hygiene', 'first aid',
    'floss', 'hair dye', 'hair gel', 'hair spray', 'hand cream',
    'hand sanitiser', 'hand sanitizer', 'ibuprofen', 'lip balm',
    'moisturiser', 'moisturizer', 'mouthwash', 'multivitamins',
    'nail polish', 'paracetamol', 'plasters', 'q-tips', 'razor',
    'razor blades', 'sanitary pads', 'shampoo', 'shaving cream',
    'shower gel', 'soap', 'suncream', 'sunscreen', 'tampons',
    'tissues', 'toilet paper', 'toothbrush', 'toothpaste', 'vitamins',
    'wet wipes'
  ],
  'baby': [
    'baby food', 'baby formula', 'baby lotion', 'baby milk',
    'baby shampoo', 'baby soap', 'baby wipes', 'diaper cream',
    'diapers', 'formula', 'nappies', 'nappy bags', 'nappy cream',
    'nappy sacks', 'sippy cup', 'teething gel'
  ],
  'pet-supplies': [
    'bird seed', 'cat food', 'cat litter', 'cat treats', 'catnip',
    'dog biscuits', 'dog food', 'dog treats', 'fish food',
    'hamster food', 'kitty litter', 'pet food', 'puppy food',
    'puppy pads', 'rabbit food'
  ],
  'other': [
    'baking powder', 'baking soda', 'bicarbonate of soda', 'brown sugar',
    'caster sugar', 'cocoa', 'cocoa powder', 'coconut flakes',
    'corn flour', 'cornstarch', 'cream of tartar', 'dark chocolate chips',
    'desiccated coconut', 'dried yeast', 'egg noodles dry', 'flour',
    'food colouring', 'gelatine', 'golden syrup', 'icing',
    'icing sugar', 'lard', 'marzipan', 'mixed peel',
    'plain flour', 'self raising flour', 'semolina', 'shortening',
    'sugar', 'sunflower oil', 'treacle', 'vegetable oil',
    'white chocolate chips', 'yeast'
  ]
};

// Pre-sort longest-first at module level so matching is fast at runtime
const SORTED_DICTIONARY = Object.entries(CATEGORY_DICTIONARY)
  .flatMap(([categoryId, keywords]) => keywords.map(kw => ({ keyword: kw.toLowerCase(), categoryId })))
  .sort((a, b) => b.keyword.length - a.keyword.length);

const findCategoryForItem = (itemName) => {
  const normalised = itemName.toLowerCase().trim();
  if (!normalised) return null;

  // 1. Check localStorage corrections
  try {
    const saved = localStorage.getItem('breadcrumbs-category-mappings');
    if (saved) {
      const corrections = JSON.parse(saved);
      if (corrections[normalised]) {
        return { categoryId: corrections[normalised], source: 'correction' };
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // 2. Check keyword dictionary (longest match wins, already sorted)
  for (const entry of SORTED_DICTIONARY) {
    if (normalised.includes(entry.keyword)) {
      return { categoryId: entry.categoryId, source: 'dictionary' };
    }
  }

  return null;
};

const saveCategoryCorrection = (itemName, categoryId) => {
  try {
    const saved = localStorage.getItem('breadcrumbs-category-mappings');
    const corrections = saved ? JSON.parse(saved) : {};
    corrections[itemName.toLowerCase().trim()] = categoryId;
    localStorage.setItem('breadcrumbs-category-mappings', JSON.stringify(corrections));
  } catch (e) {
    // Ignore localStorage errors
  }
};

// Theme colors
const themes = {
  light: {
    bg: '#fafaf9',
    bgGradient: 'linear-gradient(160deg, #fafaf9 0%, #f5f0eb 100%)',
    bgSecondary: '#fff',
    bgTertiary: '#f5f5f4',
    text: '#292524',
    textSecondary: '#78716c',
    textTertiary: '#a8a29e',
    border: '#e7e5e4',
    borderLight: '#f5f5f4',
    codePillBg: '#f5f5f4',
    cardShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    yellowGlow: '0 4px 20px rgba(250,204,21,0.35)',
    yellowGlowSubtle: '0 2px 12px rgba(250,204,21,0.25)',
    yellowGlowActive: '0 2px 8px rgba(250,204,21,0.5)',
  },
  dark: {
    bg: '#1c1917',
    bgGradient: 'linear-gradient(160deg, #1c1917 0%, #292524 100%)',
    bgSecondary: '#292524',
    bgTertiary: '#3f3f46',
    text: '#fafaf9',
    textSecondary: '#a8a29e',
    textTertiary: '#78716c',
    border: '#3f3f46',
    borderLight: '#3f3f46',
    codePillBg: '#3f3f46',
    cardShadow: '0 2px 12px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15)',
    yellowGlow: '0 4px 20px rgba(250,204,21,0.25)',
    yellowGlowSubtle: '0 2px 12px rgba(250,204,21,0.18)',
    yellowGlowActive: '0 2px 8px rgba(250,204,21,0.4)',
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateListCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

const triggerHaptic = (style = 'light') => {
  if (navigator.vibrate) {
    navigator.vibrate(style === 'success' ? [10, 50, 20] : style === 'light' ? 10 : 5);
  }
};

// Onboarding Modal Component
const OnboardingModal = ({ listCode, onComplete, theme }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const isDark = theme.bg === '#1c1917';

  const cards = [
    {
      isWelcome: true,
      title: 'Welcome to Breadcrumbs',
      description: 'Never get lost in the aisles again.',
    },
    {
      emoji: '⚡',
      title: 'Quick add',
      description: 'Tap the yellow button and type anything. Breadcrumbs drops it into the right category automatically — no fussing around.',
    },
    {
      emoji: '🗂️',
      title: 'Organised like a real shop',
      description: 'Items are sorted by aisle automatically — Dairy, Bakery, Frozen and more. Switch to your store and the order updates to match.',
    },
    {
      emoji: '🔗',
      title: 'Shop together',
      description: 'Share your 6-character code with anyone. They join instantly — no account needed — and your list updates for everyone in real time.',
      showCode: true,
    },
    {
      emoji: '👨‍🍳',
      title: 'Recipes',
      description: 'Save your favourite meals and add every ingredient to your list in one tap.',
    },
    {
      emoji: '🎛️',
      title: 'Make it yours',
      description: "Hide categories you don't need, reorder them to match your store, or create your own. Dark mode and auto-remove completed items are in Settings.",
    },
    {
      emoji: '🏪',
      title: 'Shop by store',
      description: "Save a layout for every supermarket you visit. Switch stores and your list reorders itself to match that store's aisles.",
    },
  ];

  const isLastCard = currentCard === cards.length - 1;
  const card = cards[currentCard];

  const goNext = () => {
    if (!isLastCard) {
      setCurrentCard(c => c + 1);
      triggerHaptic('light');
    } else {
      onComplete();
    }
  };

  const skip = () => {
    triggerHaptic('light');
    onComplete();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) goNext();
    else if (diff < -50 && currentCard > 0) {
      setCurrentCard(c => c - 1);
      triggerHaptic('light');
    }
    touchStartX.current = null;
  };

  const circleBg = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(255, 248, 204, 0.75)';
  const ctaLabel = currentCard === 0 ? 'Get started' : isLastCard ? 'Start Shopping' : 'Next';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end select-none"
      style={{ backgroundColor: 'rgba(0,0,0,0.15)', fontFamily: 'Inter, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full flex flex-col"
        style={{
          backgroundColor: theme.bg,
          borderRadius: '24px 24px 0 0',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center"
          style={{ marginTop: 12, marginBottom: 12 }}
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => { if (touchStartY.current !== null && e.changedTouches[0].clientY - touchStartY.current > 60) skip(); touchStartY.current = null; }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: theme.border }} />
        </div>

        {/* Top area — emoji / welcome hero */}
        <div className="flex items-center justify-center" style={{ height: 180 }}>
          {card.isWelcome ? (
            <div
              key="welcome-hero"
              className="flex items-center gap-4"
              style={{ animation: 'onboardSlideIn 0.65s ease-out' }}
            >
              <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: YELLOW }} />
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
            </div>
          ) : (
            <div
              key={`circle-${currentCard}`}
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                backgroundColor: circleBg,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 8px 32px rgba(250, 204, 21, 0.12), 0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'onboardSlideIn 0.65s ease-out',
              }}
            >
              <span style={{ fontSize: 44, lineHeight: 1, display: 'block' }}>{card.emoji}</span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div
          className="flex flex-col"
          style={{
            paddingLeft: 32,
            paddingRight: 32,
            paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom, 0px) + 24px))',
          }}
        >
        {/* Card text */}
        <div
          key={`text-${currentCard}`}
          className="text-center"
          style={{ animation: 'onboardSlideIn 0.65s ease-out', minHeight: 130 }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: theme.text,
              marginBottom: 10,
              lineHeight: 1.3,
            }}
          >
            {card.title}
          </h2>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: theme.textSecondary,
              margin: 0,
            }}
          >
            {card.description}
          </p>
          {card.subtitle && (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: theme.textSecondary,
                margin: '4px 0 0',
              }}
            >
              {card.subtitle}
            </p>
          )}
          {card.showCode && (
              <div className="flex justify-center mt-4">
                <div
                  className="font-mono tracking-widest"
                  style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 9999,
                    border: `1.5px solid ${YELLOW}`,
                    color: theme.text,
                  }}
                >
                  {listCode || 'ABC123'}
                </div>
              </div>
            )}
        </div>

        {/* Push bottom controls to the bottom */}
        <div style={{ flex: 1 }} />

        {/* Skip link — hidden on last card but always occupies space */}
        <div className="text-center" style={{ marginBottom: 12, visibility: isLastCard ? 'hidden' : 'visible' }}>
          <button
            onClick={skip}
            style={{
              fontSize: 13,
              color: '#a8a29e',
              background: 'none',
              border: 'none',
              cursor: isLastCard ? 'default' : 'pointer',
              padding: '4px 8px',
            }}
          >
            Skip
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center" style={{ gap: 8, marginBottom: 16 }}>
          {cards.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: i === currentCard ? YELLOW : '#e7e5e4',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={goNext}
          className="w-full font-semibold transition-all active:scale-[0.97]"
          style={{
            height: 52,
            borderRadius: 9999,
            background: 'linear-gradient(135deg, #FDE047 0%, #FACC15 100%)',
            color: '#292524',
            fontSize: 16,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(250, 204, 21, 0.4)',
          }}
        >
          {ctaLabel}
        </button>
        </div>

        <style>{`
          @keyframes onboardSlideIn {
            from { opacity: 0; transform: translateX(20px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

// Quick Add Onboarding Modal
const QuickAddOnboardingModal = ({ onComplete, theme }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const isDark = theme.bg === '#1c1917';

  const cards = [
    {
      heroType: 'dots',
      title: 'Quick Add (Beta)',
      description: 'A faster way to build your list. Type what you need and we figure out the category. No hunting around.',
      showSkip: true,
    },
    {
      heroType: 'input-fab',
      title: 'One button to add anything',
      description: 'Tap the yellow button at the bottom of your list. Type any item and hit Add. It will land in the right category automatically.',
    },
    {
      heroType: 'item-tag',
      title: 'We will tell you where it went',
      description: 'A small label appears on the item so you can see which category it landed in. It fades away on its own after a moment.',
    },
    {
      heroType: 'chips',
      title: 'Not sure? You pick',
      description: 'If we cannot figure out the category, we will ask you to choose. We remember your answer, so you will never be asked twice for the same item.',
    },
    {
      heroType: 'move',
      title: 'Easy to fix mistakes',
      description: 'Got it wrong? Long-press any item to move it to a different category. We will remember that correction too.',
    },
  ];

  const isLastCard = currentCard === cards.length - 1;
  const card = cards[currentCard];

  const goNext = () => {
    if (!isLastCard) {
      setCurrentCard(c => c + 1);
      triggerHaptic('light');
    } else {
      onComplete();
    }
  };

  const skip = () => {
    triggerHaptic('light');
    onComplete();
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) goNext();
    else if (diff < -50 && currentCard > 0) { setCurrentCard(c => c - 1); triggerHaptic('light'); }
    touchStartX.current = null;
  };

  const renderHero = () => {
    if (card.heroType === 'dots') {
      return (
        <div key="qa-dots" className="flex items-center gap-4" style={{ animation: 'onboardSlideIn 0.65s ease-out' }}>
          <div className="breathe-1 rounded-full" style={{ width: 80, height: 80, backgroundColor: YELLOW }} />
          <div className="breathe-2 rounded-full" style={{ width: 56, height: 56, backgroundColor: YELLOW, opacity: 0.6 }} />
          <div className="breathe-3 rounded-full" style={{ width: 40, height: 40, backgroundColor: YELLOW, opacity: 0.3 }} />
        </div>
      );
    }
    if (card.heroType === 'input-fab') {
      return (
        <div key="qa-input-fab" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, animation: 'onboardSlideIn 0.65s ease-out' }}>
          <div style={{ backgroundColor: isDark ? '#292524' : '#fff', borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 248, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: isDark ? '1px solid #3f3f46' : '1px solid #f5f5f4' }}>
            <span style={{ fontSize: 13, color: '#a8a29e' }}>What do you need?</span>
            <div style={{ backgroundColor: YELLOW, borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#292524' }}>Add</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(250,204,21,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>
      );
    }
    if (card.heroType === 'item-tag') {
      return (
        <div key="qa-item-tag" style={{ backgroundColor: isDark ? '#292524' : '#fff', borderRadius: 16, padding: '12px 16px', width: 248, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: isDark ? '1px solid #3f3f46' : '1px solid #f5f5f4', animation: 'onboardSlideIn 0.65s ease-out' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#78716c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dairy &amp; Eggs</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, opacity: 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: YELLOW, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#78716c', textDecoration: 'line-through' }}>Oat milk</span>
            </div>
            <div style={{ backgroundColor: '#fef9c3', borderRadius: 9999, padding: '2px 8px', fontSize: 10, color: '#854d0e', marginLeft: 8, flexShrink: 0 }}>Dairy &amp; Eggs</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #d6d3d1', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: isDark ? '#e7e5e4' : '#292524' }}>Eggs</span>
          </div>
        </div>
      );
    }
    if (card.heroType === 'chips') {
      return (
        <div key="qa-chips" style={{ backgroundColor: isDark ? '#292524' : '#fff', borderRadius: 16, padding: '12px 16px', width: 248, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: isDark ? '1px solid #3f3f46' : '1px solid #f5f5f4', animation: 'onboardSlideIn 0.65s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: isDark ? '#e7e5e4' : '#292524' }}>Kimchi</span>
            <div style={{ borderRadius: 9999, padding: '3px 10px', fontSize: 11, border: '1px solid #d6d3d1', color: '#a8a29e' }}>Add</div>
          </div>
          <p style={{ fontSize: 11, color: '#a8a29e', marginBottom: 8 }}>Which category?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['Canned Goods', 'Deli & Chilled', 'Sauces', 'Other'].map(cat => (
              <div key={cat} style={{ borderRadius: 9999, padding: '4px 10px', fontSize: 11, backgroundColor: cat === 'Deli & Chilled' ? YELLOW : (isDark ? '#3f3f46' : '#f5f5f4'), color: cat === 'Deli & Chilled' ? '#292524' : '#78716c' }}>{cat}</div>
            ))}
          </div>
        </div>
      );
    }
    if (card.heroType === 'move') {
      return (
        <div key="qa-move" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animation: 'onboardSlideIn 0.65s ease-out' }}>
          <div style={{ backgroundColor: isDark ? '#292524' : '#fff', borderRadius: 12, padding: '8px 14px', width: 220, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', border: isDark ? '1px solid #3f3f46' : '1px solid #f5f5f4' }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: '#78716c', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bakery</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: isDark ? '#e7e5e4' : '#292524' }}>Chicken breast</span>
              <div style={{ fontSize: 9, backgroundColor: isDark ? '#3f3f46' : '#f5f5f4', borderRadius: 9999, padding: '2px 6px', color: '#a8a29e' }}>hold</div>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
          <div style={{ backgroundColor: isDark ? '#292524' : '#fff', borderRadius: 12, padding: '8px 14px', width: 220, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', border: isDark ? '1px solid #3f3f46' : '1px solid #f5f5f4' }}>
            <p style={{ fontSize: 9, color: '#a8a29e', marginBottom: 4 }}>Move to...</p>
            {[['Meat & Poultry', true], ['Seafood', false], ['Deli & Chilled', false]].map(([cat, checked], i, arr) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: i > 0 ? 5 : 0, paddingBottom: i < arr.length - 1 ? 5 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? '#3f3f46' : '#f5f5f4'}` : 'none' }}>
                <span style={{ fontSize: 12, color: isDark ? '#e7e5e4' : '#292524' }}>{cat}</span>
                {checked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end select-none"
      style={{ backgroundColor: 'rgba(0,0,0,0.15)', fontFamily: 'Inter, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full flex flex-col"
        style={{ backgroundColor: theme.bg, borderRadius: '24px 24px 0 0', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Drag handle — drag down to dismiss */}
        <div
          className="flex justify-center"
          style={{ marginTop: 12, marginBottom: 12 }}
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => { if (touchStartY.current !== null && e.changedTouches[0].clientY - touchStartY.current > 60) skip(); touchStartY.current = null; }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: theme.border }} />
        </div>

        {/* Hero area */}
        <div className="flex items-center justify-center" style={{ height: 180 }}>
          {renderHero()}
        </div>

        {/* Content area */}
        <div className="flex flex-col" style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom, 0px) + 24px))' }}>
          {/* Card text */}
          <div key={`qa-text-${currentCard}`} className="text-center" style={{ animation: 'onboardSlideIn 0.65s ease-out', minHeight: 130 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: theme.text, marginBottom: 10, lineHeight: 1.3 }}>{card.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: theme.textSecondary, margin: 0 }}>{card.description}</p>
          </div>

          <div style={{ flex: 1 }} />

          {/* Skip — only card 1 */}
          <div className="text-center" style={{ marginBottom: 12, visibility: card.showSkip ? 'visible' : 'hidden' }}>
            <button onClick={skip} style={{ fontSize: 13, color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>Skip</button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center" style={{ gap: 8, marginBottom: 16 }}>
            {cards.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: i === currentCard ? YELLOW : '#e7e5e4', transition: 'background-color 0.3s' }} />
            ))}
          </div>

          {/* CTA button */}
          <button
            onClick={goNext}
            className="w-full font-semibold transition-all active:scale-[0.97]"
            style={{ height: 52, borderRadius: 9999, background: 'linear-gradient(135deg, #FDE047 0%, #FACC15 100%)', color: '#292524', fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(250,204,21,0.4)' }}
          >
            {isLastCard ? 'Got it' : 'Next'}
          </button>
        </div>

        <style>{`
          @keyframes onboardSlideIn {
            from { opacity: 0; transform: translateX(20px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

// Toast Component
const Toast = ({ message, visible, theme }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-20 left-4 right-4 flex justify-center z-50 fade-in">
      <div className="px-4 py-3 rounded-full shadow-lg text-sm font-medium" style={{ backgroundColor: theme.text, color: theme.bg }}>
        {message}
      </div>
    </div>
  );
};

// Bottom Navigation Component
const BottomNav = ({ activeTab, onTabChange, theme }) => {
  const tabs = [
    { 
      id: 'list', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      )
    },
    { 
      id: 'recipes', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/>
          <line x1="6" y1="17" x2="18" y2="17"/>
        </svg>
      )
    },
    { 
      id: 'settings', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      )
    }
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-6 py-3"
      style={{ 
        backgroundColor: theme.bg,
        borderTop: `1px solid ${theme.border}`,
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => { triggerHaptic('light'); onTabChange(tab.id); }}
          className="flex flex-col items-center gap-1.5 py-1 px-4 transition-all active:scale-95"
        >
          <div style={{ color: '#78716c' }}>
            {tab.icon}
          </div>
          {activeTab === tab.id && (
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: YELLOW }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [listId, setListId] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-current-list');
    return saved ? JSON.parse(saved).listId : null;
  });
  const [listName, setListName] = useState('');
  const [editingListName, setEditingListName] = useState('');
  const [items, setItems] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [addingTo, setAddingTo] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [settingsTab, setSettingsTab] = useState('general');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [hiddenCategories, setHiddenCategories] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-hidden-categories');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default: hide Baby and Alcohol for new users
    return ['baby', 'alcohol'];
  });
  const [createAnim, setCreateAnim] = useState(false);
  const [checkingItems, setCheckingItems] = useState(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showQuickAddOnboarding, setShowQuickAddOnboarding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [appearanceMode, setAppearanceMode] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-appearance-mode');
    return saved || 'system'; // 'light', 'system', or 'dark'
  });
  const [systemDarkMode, setSystemDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [editingQuantityId, setEditingQuantityId] = useState(null);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  const [isWide, setIsWide] = useState(() => window.innerWidth >= 1200);

  // Recipe state
  const [recipes, setRecipes] = useState([]);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState([]);
  const [recipeAddingTo, setRecipeAddingTo] = useState(null);
  const [newRecipeItemText, setNewRecipeItemText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [addingRecipeId, setAddingRecipeId] = useState(null);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  
  // Store layout state
  const [storeLayouts, setStoreLayouts] = useState(DEFAULT_STORE_LAYOUTS);
  const [activeStoreLayoutId, setActiveStoreLayoutId] = useState('default');
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [editingStoreLayout, setEditingStoreLayout] = useState(null);
  const [editingStoreLayoutData, setEditingStoreLayoutData] = useState(null);
  
  // Navigation and UI state
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'recipes', 'settings'
  const [hideCompleted, setHideCompleted] = useState(false);
  const [completedBehavior, setCompletedBehavior] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-completed-behavior');
    return saved || 'nothing'; // 'nothing', 'auto-hide', 'auto-remove'
  });
  const [pendingDeletes, setPendingDeletes] = useState([]); // [{id, name, timeoutId}]

  // Quick Add state
  const [addMode, setAddMode] = useState(() => {
    return localStorage.getItem('breadcrumbs-add-mode') || 'classic';
  });
  const [hasUsedQuickAdd, setHasUsedQuickAdd] = useState(() => !!localStorage.getItem('breadcrumbs-has-used-quick-add'));
  const [fabOpen, setFabOpen] = useState(false);
  const [fabInput, setFabInput] = useState('');
  const [fabNoMatchMode, setFabNoMatchMode] = useState(false);
  const [showingCategoryTag, setShowingCategoryTag] = useState(new Set());
  const [longPressItem, setLongPressItem] = useState(null);
  const longPressTimerRef = useRef(null);
  const fabInputRef = useRef(null);

  const inputRef = useRef(null);
  const recipeInputRef = useRef(null);
  const listNameInputRef = useRef(null);
  const isSavingRef = useRef(false); // Track when we're saving items to prevent snapshot overwrite

  // Derive actual dark mode from appearance setting
  const darkMode = appearanceMode === 'dark' || (appearanceMode === 'system' && systemDarkMode);
  const theme = darkMode ? themes.dark : themes.light;

  // Show toast helper
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Save appearance mode preference
  useEffect(() => {
    localStorage.setItem('breadcrumbs-appearance-mode', appearanceMode);
  }, [appearanceMode]);

  // Save completed behavior preference
  useEffect(() => {
    localStorage.setItem('breadcrumbs-completed-behavior', completedBehavior);
  }, [completedBehavior]);

  // Persist add mode preference
  useEffect(() => {
    localStorage.setItem('breadcrumbs-add-mode', addMode);
  }, [addMode]);

  // Focus fab input when opened
  useEffect(() => {
    if (fabOpen && fabInputRef.current) {
      setTimeout(() => fabInputRef.current.focus(), 50);
    }
  }, [fabOpen]);

  // Close fab when switching tabs
  useEffect(() => {
    setFabOpen(false);
    setFabInput('');
    setFabNoMatchMode(false);
  }, [activeTab]);

  // Load list name from localStorage when listId changes
  useEffect(() => {
    if (listId) {
      const savedName = localStorage.getItem(`breadcrumbs-list-name-${listId}`);
      setListName(savedName || '');
      setEditingListName(savedName || '');
    }
  }, [listId]);

  // Save list name to localStorage
  const saveListName = (name) => {
    const trimmedName = name.trim();
    setListName(trimmedName);
    if (trimmedName) {
      localStorage.setItem(`breadcrumbs-list-name-${listId}`, trimmedName);
    } else {
      localStorage.removeItem(`breadcrumbs-list-name-${listId}`);
    }
    triggerHaptic('success');
  };

  // Get active store layout
  const activeStoreLayout = storeLayouts.find(s => s.id === activeStoreLayoutId) || storeLayouts[0];
  
  // Sort categories based on active store layout, then filter hidden ones
  const visibleCategories = (() => {
    const categoryOrder = activeStoreLayout?.categoryOrder || [];
    const sortedCategories = [...categories].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.id);
      const bIndex = categoryOrder.indexOf(b.id);
      // If not in layout, put at end
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    return sortedCategories.filter(cat => !hiddenCategories.includes(cat.id));
  })();

  const checkOnboarding = useCallback(() => {
    const hasSeenOnboarding = localStorage.getItem('breadcrumbs-has-seen-onboarding');
    if (!hasSeenOnboarding) setShowOnboarding(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('breadcrumbs-has-seen-onboarding', 'true');
    setShowOnboarding(false);
    triggerHaptic('success');
  };

  const completeQuickAddOnboarding = () => {
    localStorage.setItem('breadcrumbs-has-seen-quick-add-onboarding', 'true');
    setShowQuickAddOnboarding(false);
    triggerHaptic('success');
  };

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    const interval = setInterval(updateOnlineStatus, 3000);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  // Listen for device theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 1200);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (!listId) return;
    setSyncing(true);
    const unsubscribe = onSnapshot(
      doc(db, 'lists', listId),
      async (docSnap) => {
        // Skip incoming updates while we're in the middle of saving
        if (isSavingRef.current) {
          setSyncing(false);
          return;
        }
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Check for 90-day inactivity - fully reset list if stale
          if (data.updatedAt) {
            const lastUpdate = new Date(data.updatedAt);
            const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceUpdate > 90) {
              console.log(`List ${listId} inactive for ${Math.floor(daysSinceUpdate)} days, resetting...`);
              await setDoc(doc(db, 'lists', listId), {
                items: [],
                recipes: [],
                updatedAt: new Date().toISOString()
              });
              // Also reset categories doc
              await setDoc(doc(db, 'lists', listId, 'meta', 'categories'), {
                categories: DEFAULT_CATEGORIES,
                storeLayouts: DEFAULT_STORE_LAYOUTS,
                activeStoreLayoutId: 'default',
                updatedAt: new Date().toISOString()
              });
              setItems([]);
              setRecipes([]);
              setCategories(DEFAULT_CATEGORIES);
              setStoreLayouts(DEFAULT_STORE_LAYOUTS);
              setActiveStoreLayoutId('default');
              setSyncing(false);
              return;
            }
          }
          
          // Only update items and recipes from the main document
          setItems(data.items || []);
          if (data.recipes) setRecipes(data.recipes);
        }
        setSyncing(false);
      },
      (error) => {
        console.error('Error listening to list:', error);
        setSyncing(false);
      }
    );
    return () => unsubscribe();
  }, [listId]);

  // Separate listener for categories/store layouts (lives at lists/{listId}/meta/categories)
  useEffect(() => {
    if (!listId) return;
    const unsubscribe = onSnapshot(
      doc(db, 'lists', listId, 'meta', 'categories'),
      { includeMetadataChanges: true },
      (docSnap) => {
        // Skip updates that originated from this device's own write (local cache echo)
        // hasPendingWrites = true means this is our own write echoing back, not another device
        if (docSnap.metadata.hasPendingWrites) return;
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.categories) setCategories(data.categories);
          if (data.storeLayouts) {
            const storedLayouts = data.storeLayouts;
            const defaultLayoutIds = DEFAULT_STORE_LAYOUTS.map(l => l.id);
            // Merge stored categoryOrder into default layouts so user reordering is preserved
            const mergedDefaultLayouts = DEFAULT_STORE_LAYOUTS.map(defaultLayout => {
              const stored = storedLayouts.find(l => l.id === defaultLayout.id);
              return stored ? { ...defaultLayout, categoryOrder: stored.categoryOrder } : defaultLayout;
            });
            const customLayouts = storedLayouts.filter(l => !defaultLayoutIds.includes(l.id) && l.isDefault === false);
            setStoreLayouts([...mergedDefaultLayouts, ...customLayouts]);
          }
          if (data.activeStoreLayoutId) setActiveStoreLayoutId(data.activeStoreLayoutId);
        }
      },
      (error) => {
        console.error('Error listening to categories:', error);
      }
    );
    return () => unsubscribe();
  }, [listId]);

  // Save items and recipes to the main list document
  const saveList = useCallback(async (newItems, newRecipes = recipes) => {
    if (!listId) return;
    isSavingRef.current = true;
    try {
      await setDoc(doc(db, 'lists', listId), {
        items: newItems,
        recipes: newRecipes,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving list:', error);
      setToastMessage('Failed to save changes');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } finally {
      setTimeout(() => { isSavingRef.current = false; }, 500);
    }
  }, [listId, recipes]);

  // Save categories and store layouts to a separate document so they never conflict with item syncing
  const saveCategories = async (newCategories, newStoreLayouts, newActiveStoreLayoutId) => {
    if (!listId) return;
    try {
      await setDoc(doc(db, 'lists', listId, 'meta', 'categories'), {
        categories: newCategories,
        storeLayouts: newStoreLayouts,
        activeStoreLayoutId: newActiveStoreLayoutId,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving categories:', error);
      setToastMessage('Failed to save category changes');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const saveHiddenCategories = (hidden) => {
    localStorage.setItem('breadcrumbs-hidden-categories', JSON.stringify(hidden));
    setHiddenCategories(hidden);
  };

  const toggleCategoryVisibility = async (categoryId) => {
    triggerHaptic('light');
    const isCurrentlyHidden = hiddenCategories.includes(categoryId);
    if (isCurrentlyHidden) {
      saveHiddenCategories(hiddenCategories.filter(id => id !== categoryId));
    } else {
      saveHiddenCategories([...hiddenCategories, categoryId]);
      const newItems = items.filter(item => item.category !== categoryId);
      if (newItems.length !== items.length) {
        setItems(newItems);
        await saveList(newItems);
      }
    }
  };

  const addCustomCategory = async () => {
    if (!newCategoryName.trim()) return;
    triggerHaptic('success');
    const newCategory = {
      id: `custom-${generateId()}`,
      name: newCategoryName.trim(),
      isDefault: false
    };
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    await saveCategories(newCategories, storeLayouts, activeStoreLayoutId);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const deleteCustomCategory = async (categoryId) => {
    triggerHaptic('light');
    const newCategories = categories.filter(cat => cat.id !== categoryId);
    const newItems = items.filter(item => item.category !== categoryId);
    setCategories(newCategories);
    setItems(newItems);
    await saveCategories(newCategories, storeLayouts, activeStoreLayoutId);
    await saveList(newItems);
  };

  // Store layout functions
  const switchStoreLayout = async (layoutId) => {
    triggerHaptic('success');
    setActiveStoreLayoutId(layoutId);
    setShowStorePicker(false);
    await saveCategories(categories, storeLayouts, layoutId);
    const layout = storeLayouts.find(s => s.id === layoutId);
    showToastMessage(`Switched to ${layout?.name || 'layout'}`);
  };

  const updateStoreLayoutOrder = async (layoutId, newCategoryOrder) => {
    const newLayouts = storeLayouts.map(layout => 
      layout.id === layoutId 
        ? { ...layout, categoryOrder: newCategoryOrder }
        : layout
    );
    setStoreLayouts(newLayouts);
    await saveCategories(categories, newLayouts, activeStoreLayoutId);
  };

  const createCustomStoreLayout = async (name) => {
    triggerHaptic('success');
    const newLayout = {
      id: `custom-${generateId()}`,
      name: name.trim(),
      isDefault: false,
      categoryOrder: activeStoreLayout?.categoryOrder || DEFAULT_STORE_LAYOUTS[0].categoryOrder
    };
    const newLayouts = [...storeLayouts, newLayout];
    setStoreLayouts(newLayouts);
    await saveCategories(categories, newLayouts, activeStoreLayoutId);
    return newLayout;
  };

  const deleteStoreLayout = async (layoutId) => {
    triggerHaptic('light');
    const newLayouts = storeLayouts.filter(s => s.id !== layoutId);
    const newActiveId = activeStoreLayoutId === layoutId ? 'default' : activeStoreLayoutId;
    setStoreLayouts(newLayouts);
    setActiveStoreLayoutId(newActiveId);
    await saveCategories(categories, newLayouts, newActiveId);
  };

  const resetStoreLayoutToDefault = async (layoutId) => {
    const defaultLayout = DEFAULT_STORE_LAYOUTS.find(s => s.id === layoutId);
    if (defaultLayout) {
      const newLayouts = storeLayouts.map(layout => 
        layout.id === layoutId 
          ? { ...layout, categoryOrder: defaultLayout.categoryOrder }
          : layout
      );
      setStoreLayouts(newLayouts);
      await saveCategories(categories, newLayouts, activeStoreLayoutId);
      showToastMessage('Layout reset to default');
    }
  };

  useEffect(() => {
    if (addingTo && inputRef.current) inputRef.current.focus();
  }, [addingTo]);

  useEffect(() => {
    if (recipeAddingTo && recipeInputRef.current) recipeInputRef.current.focus();
  }, [recipeAddingTo]);

  const createNewList = async () => {
    setCreateAnim(true);
    triggerHaptic('success');
    setTimeout(async () => {
      const code = generateListCode();
      setListId(code);
      setItems([]);
      setCategories(DEFAULT_CATEGORIES);
      setRecipes([]);
      setStoreLayouts(DEFAULT_STORE_LAYOUTS);
      setActiveStoreLayoutId('default');
      setListName('');
      setEditingListName('');
      checkOnboarding();
      // Main document: items and recipes only
      await setDoc(doc(db, 'lists', code), {
        items: [],
        recipes: [],
        updatedAt: new Date().toISOString()
      });
      // Categories subcollection document
      await setDoc(doc(db, 'lists', code, 'meta', 'categories'), {
        categories: DEFAULT_CATEGORIES,
        storeLayouts: DEFAULT_STORE_LAYOUTS,
        activeStoreLayoutId: 'default',
        updatedAt: new Date().toISOString()
      });
      localStorage.setItem('breadcrumbs-current-list', JSON.stringify({ listId: code }));
      setCreateAnim(false);
    }, 400);
  };

  const joinList = async () => {
    if (!joinCode.trim()) return;
    triggerHaptic('light');
    const code = joinCode.trim().toUpperCase();
    try {
      const docSnap = await getDoc(doc(db, 'lists', code));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setListId(code);
        setItems(data.items || []);
        setRecipes(data.recipes || []);
        checkOnboarding();

        // Load categories from the subcollection
        const catSnap = await getDoc(doc(db, 'lists', code, 'meta', 'categories'));
        if (catSnap.exists()) {
          const catData = catSnap.data();
          if (catData.categories) setCategories(catData.categories);
          if (catData.storeLayouts) {
            const storedLayouts = catData.storeLayouts;
            const defaultLayoutIds = DEFAULT_STORE_LAYOUTS.map(l => l.id);
            const customLayouts = storedLayouts.filter(l => !defaultLayoutIds.includes(l.id) && l.isDefault === false);
            setStoreLayouts([...DEFAULT_STORE_LAYOUTS, ...customLayouts]);
          }
          const activeId = catData.activeStoreLayoutId;
          if (activeId) setActiveStoreLayoutId(activeId);
        } else {
          // No categories doc yet (old list) — use defaults and write them now
          setCategories(DEFAULT_CATEGORIES);
          setStoreLayouts(DEFAULT_STORE_LAYOUTS);
          setActiveStoreLayoutId('default');
          await setDoc(doc(db, 'lists', code, 'meta', 'categories'), {
            categories: DEFAULT_CATEGORIES,
            storeLayouts: DEFAULT_STORE_LAYOUTS,
            activeStoreLayoutId: 'default',
            updatedAt: new Date().toISOString()
          });
        }

        setJoinCode('');
        localStorage.setItem('breadcrumbs-current-list', JSON.stringify({ listId: code }));
      } else {
        alert('List not found. Check the code and try again.');
      }
    } catch (error) {
      console.error('Error joining list:', error);
      alert('Could not join list. Please try again.');
    }
  };

  const confirmLeaveList = () => {
    triggerHaptic('light');
    setShowLeaveConfirm(false);
    setListId(null);
    setItems([]);
    setCategories(DEFAULT_CATEGORIES);
    setRecipes([]);
    setListName('');
    setEditingListName('');
    localStorage.removeItem('breadcrumbs-current-list');
  };

  const clearAllItems = async () => {
    triggerHaptic('success');
    setItems([]);
    await saveList([]);
    setShowClearAllConfirm(false);
  };

  const startAdding = (categoryId) => {
    triggerHaptic('light');
    setAddingTo(categoryId);
    setNewItemText('');
  };

  const addItem = async () => {
    if (!newItemText.trim() || !addingTo) return;
    triggerHaptic('success');
    
    // Check for duplicate (same name and category)
    const existingItem = items.find(i => 
      i.name.toLowerCase() === newItemText.trim().toLowerCase() && 
      i.category === addingTo &&
      !i.checked
    );
    
    let newItems;
    if (existingItem) {
      // Increase quantity
      newItems = items.map(i => 
        i.id === existingItem.id 
          ? { ...i, quantity: (i.quantity || 1) + 1 }
          : i
      );
    } else {
      // Add new item
      const item = { 
        id: generateId(), 
        name: newItemText.trim(), 
        category: addingTo, 
        checked: false, 
        quantity: 1,
        addedAt: Date.now() 
      };
      newItems = [...items, item];
    }
    
    setItems(newItems);
    setNewItemText('');
    await saveList(newItems);
  };

  const cancelAdding = () => {
    triggerHaptic('light');
    setAddingTo(null);
    setNewItemText('');
  };

  // Quick Add functions
  const handleFabAdd = async () => {
    if (!fabInput.trim()) return;
    const itemName = fabInput.trim();
    const result = findCategoryForItem(itemName);

    if (result) {
      // Match found - add directly
      triggerHaptic('success');
      const existingItem = items.find(i =>
        i.name.toLowerCase() === itemName.toLowerCase() &&
        i.category === result.categoryId &&
        !i.checked
      );

      let newItems;
      let newItemId;
      if (existingItem) {
        newItemId = existingItem.id;
        newItems = items.map(i =>
          i.id === existingItem.id
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      } else {
        newItemId = generateId();
        const item = {
          id: newItemId,
          name: itemName,
          category: result.categoryId,
          checked: false,
          quantity: 1,
          addedAt: Date.now()
        };
        newItems = [...items, item];
      }

      setItems(newItems);
      setFabInput('');
      setFabNoMatchMode(false);
      await saveList(newItems);

      // Show category tag
      setShowingCategoryTag(prev => new Set([...prev, newItemId]));
      setTimeout(() => {
        setShowingCategoryTag(prev => {
          const next = new Set(prev);
          next.delete(newItemId);
          return next;
        });
      }, 2000);
    } else {
      // No match - show chip picker
      setFabNoMatchMode(true);
    }
  };

  const handleChipSelect = async (categoryId) => {
    if (!fabInput.trim()) return;
    const itemName = fabInput.trim();
    triggerHaptic('success');

    const existingItem = items.find(i =>
      i.name.toLowerCase() === itemName.toLowerCase() &&
      i.category === categoryId &&
      !i.checked
    );

    let newItems;
    let newItemId;
    if (existingItem) {
      newItemId = existingItem.id;
      newItems = items.map(i =>
        i.id === existingItem.id
          ? { ...i, quantity: (i.quantity || 1) + 1 }
          : i
      );
    } else {
      newItemId = generateId();
      const item = {
        id: newItemId,
        name: itemName,
        category: categoryId,
        checked: false,
        quantity: 1,
        addedAt: Date.now()
      };
      newItems = [...items, item];
    }

    setItems(newItems);
    saveCategoryCorrection(itemName, categoryId);
    setFabInput('');
    setFabNoMatchMode(false);
    await saveList(newItems);

    // Show category tag
    setShowingCategoryTag(prev => new Set([...prev, newItemId]));
    setTimeout(() => {
      setShowingCategoryTag(prev => {
        const next = new Set(prev);
        next.delete(newItemId);
        return next;
      });
    }, 2000);

    // Refocus input
    if (fabInputRef.current) fabInputRef.current.focus();
  };

  const handleLongPressReassign = async (item, newCategoryId) => {
    triggerHaptic('success');
    const newItems = items.map(i =>
      i.id === item.id ? { ...i, category: newCategoryId } : i
    );
    setItems(newItems);
    saveCategoryCorrection(item.name, newCategoryId);
    setLongPressItem(null);
    await saveList(newItems);
  };

  const toggleItem = async (id) => {
    const item = items.find(i => i.id === id);
    const willCheck = !item.checked;
    triggerHaptic(willCheck ? 'success' : 'light');
    
    if (willCheck) {
      setCheckingItems(prev => new Set([...prev, id]));
      setTimeout(() => {
        setCheckingItems(prev => { const next = new Set(prev); next.delete(id); return next; });
      }, 500);
      
      // Handle auto-hide behavior
      if (completedBehavior === 'auto-hide') {
        // Item stays in list but hideCompleted will filter it out
        setHideCompleted(true);
      }
      
      // Handle auto-remove behavior
      if (completedBehavior === 'auto-remove') {
        const timeoutId = setTimeout(async () => {
          // Remove from pending deletes
          setPendingDeletes(prev => prev.filter(p => p.id !== id));
          // Delete the item
          const updatedItems = items.filter(i => i.id !== id);
          setItems(updatedItems);
          await saveList(updatedItems);
        }, 3000);

        // Add to pending deletes for undo capability
        setPendingDeletes(prev => [...prev, { id, name: item.name, timeoutId }]);
      }
    }
    
    const newItems = items.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    setItems(newItems);
    await saveList(newItems);
  };

  const undoPendingDelete = (id) => {
    triggerHaptic('light');
    const pending = pendingDeletes.find(p => p.id === id);
    if (pending) {
      clearTimeout(pending.timeoutId);
      setPendingDeletes(prev => prev.filter(p => p.id !== id));
      // Uncheck the item
      const newItems = items.map(i => i.id === id ? { ...i, checked: false } : i);
      setItems(newItems);
      saveList(newItems);
    }
  };

  const deleteItem = async (id) => {
    triggerHaptic('light');
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    await saveList(newItems);
  };

  const updateQuantity = async (id, delta) => {
    triggerHaptic('light');
    const item = items.find(i => i.id === id);
    const newQuantity = (item.quantity || 1) + delta;
    
    if (newQuantity <= 0) {
      // Delete item if quantity reaches 0
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      setEditingQuantityId(null);
      await saveList(newItems);
    } else {
      const newItems = items.map(i => 
        i.id === id ? { ...i, quantity: newQuantity } : i
      );
      setItems(newItems);
      await saveList(newItems);
    }
  };

  const startEdit = (item) => { setEditingId(item.id); setEditText(item.name); };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    const newItems = items.map(i => i.id === editingId ? { ...i, name: editText.trim() } : i);
    setItems(newItems);
    setEditingId(null);
    setEditText('');
    await saveList(newItems);
  };

  const setAppearanceModeTo = (mode) => {
    triggerHaptic('light');
    setAppearanceMode(mode);
  };

  // Recipe functions
  const startRecipeAdding = (categoryId) => {
    triggerHaptic('light');
    setRecipeAddingTo(categoryId);
    setNewRecipeItemText('');
  };

  const addRecipeIngredient = () => {
    if (!newRecipeItemText.trim() || !recipeAddingTo) return;
    triggerHaptic('success');
    
    // Check for duplicate in current recipe
    const existingIdx = newRecipeIngredients.findIndex(i => 
      i.name.toLowerCase() === newRecipeItemText.trim().toLowerCase() && 
      i.category === recipeAddingTo
    );
    
    if (existingIdx >= 0) {
      // Increase quantity
      const updated = [...newRecipeIngredients];
      updated[existingIdx] = { ...updated[existingIdx], quantity: (updated[existingIdx].quantity || 1) + 1 };
      setNewRecipeIngredients(updated);
    } else {
      const ingredient = {
        id: generateId(),
        name: newRecipeItemText.trim(),
        category: recipeAddingTo,
        quantity: 1
      };
      setNewRecipeIngredients([...newRecipeIngredients, ingredient]);
    }
    setNewRecipeItemText('');
  };

  const removeRecipeIngredient = (id) => {
    triggerHaptic('light');
    setNewRecipeIngredients(newRecipeIngredients.filter(i => i.id !== id));
  };

  const updateRecipeIngredientQuantity = (id, delta) => {
    triggerHaptic('light');
    const ingredient = newRecipeIngredients.find(i => i.id === id);
    const newQuantity = (ingredient.quantity || 1) + delta;
    
    if (newQuantity <= 0) {
      setNewRecipeIngredients(newRecipeIngredients.filter(i => i.id !== id));
    } else {
      setNewRecipeIngredients(newRecipeIngredients.map(i => 
        i.id === id ? { ...i, quantity: newQuantity } : i
      ));
    }
  };

  const cancelRecipeAdding = () => {
    triggerHaptic('light');
    setRecipeAddingTo(null);
    setNewRecipeItemText('');
  };

  const saveRecipe = async () => {
    if (!newRecipeName.trim() || newRecipeIngredients.length === 0 || savingRecipe) return;
    
    setSavingRecipe(true);
    triggerHaptic('success');
    
    let newRecipes;
    
    if (editingRecipeId) {
      // Update existing recipe
      newRecipes = recipes.map(r => 
        r.id === editingRecipeId 
          ? { ...r, name: newRecipeName.trim(), ingredients: newRecipeIngredients }
          : r
      );
    } else {
      // Create new recipe
      const recipe = {
        id: generateId(),
        name: newRecipeName.trim(),
        ingredients: newRecipeIngredients,
        createdAt: Date.now()
      };
      newRecipes = [...recipes, recipe];
    }
    
    setRecipes(newRecipes);
    await saveList(items, newRecipes);
    
    setNewRecipeName('');
    setNewRecipeIngredients([]);
    setShowCreateRecipe(false);
    setEditingRecipeId(null);
    setSavingRecipe(false);
    showToastMessage(editingRecipeId ? 'Recipe updated!' : 'Recipe saved!');
  };

  const cancelCreateRecipe = () => {
    triggerHaptic('light');
    setNewRecipeName('');
    setNewRecipeIngredients([]);
    setRecipeAddingTo(null);
    setShowCreateRecipe(false);
    setEditingRecipeId(null);
  };

  const startEditRecipe = (recipe) => {
    triggerHaptic('light');
    setEditingRecipeId(recipe.id);
    setNewRecipeName(recipe.name);
    setNewRecipeIngredients([...recipe.ingredients]);
    setShowCreateRecipe(true);
  };

  const addRecipeToList = async (recipe) => {
    triggerHaptic('success');
    setAddingRecipeId(recipe.id);
    
    let newItems = [...items];
    let addedCount = 0;
    
    for (const ingredient of recipe.ingredients) {
      const existingItem = newItems.find(i => 
        i.name.toLowerCase() === ingredient.name.toLowerCase() && 
        i.category === ingredient.category &&
        !i.checked
      );
      
      if (existingItem) {
        // Increase quantity
        newItems = newItems.map(i => 
          i.id === existingItem.id 
            ? { ...i, quantity: (i.quantity || 1) + (ingredient.quantity || 1) }
            : i
        );
      } else {
        // Add new item
        newItems.push({
          id: generateId(),
          name: ingredient.name,
          category: ingredient.category,
          checked: false,
          quantity: ingredient.quantity || 1,
          addedAt: Date.now()
        });
      }
      addedCount += ingredient.quantity || 1;
    }
    
    setItems(newItems);
    await saveList(newItems);
    
    setTimeout(() => {
      setAddingRecipeId(null);
      showToastMessage(`Added ${recipe.ingredients.length} items to your list`);
    }, 300);
  };

  const confirmDeleteRecipe = async () => {
    if (!deletingRecipeId) return;
    triggerHaptic('success');
    const newRecipes = recipes.filter(r => r.id !== deletingRecipeId);
    setRecipes(newRecipes);
    await saveList(items, newRecipes);
    setDeletingRecipeId(null);
    showToastMessage('Recipe deleted');
  };

  const totalItems = items.length;
  const checkedCount = items.filter(i => i.checked).length;

  const styles = `
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes breathe {
      0%   { transform: translateY(0px) scale(1); }
      40%  { transform: translateY(-10px) scale(1.08); }
      100% { transform: translateY(0px) scale(1); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes buttonPop {
      0% { transform: scale(1); background-color: #292524; }
      50% { transform: scale(1.02); background-color: ${YELLOW}; }
      100% { transform: scale(1); background-color: ${YELLOW}; }
    }
    @keyframes recipePop {
      0% { transform: scale(1); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
    @keyframes checkPop { 0% { transform: scale(1); } 25% { transform: scale(1.3); } 50% { transform: scale(0.95); } 75% { transform: scale(1.1); } 100% { transform: scale(1); } }
    @keyframes fillCheck {
      0% { background-color: transparent; border-color: #d6d3d1; }
      50% { background-color: ${YELLOW}; border-color: ${YELLOW}; transform: scale(1.2); }
      100% { background-color: ${YELLOW}; border-color: ${YELLOW}; transform: scale(1); }
    }
    @keyframes drawCheck { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
    .fade-in { animation: fadeIn 0.2s ease-out; }
    .fade-up-1 { animation: fadeUp 0.6s ease-out 0.1s both; }
    .fade-up-2 { animation: fadeUp 0.6s ease-out 0.25s both; }
    .fade-up-3 { animation: fadeUp 0.6s ease-out 0.4s both; }
    .fade-up-4 { animation: fadeUp 0.6s ease-out 0.55s both; }
    .sync-pulse { animation: pulse 1.5s ease-in-out infinite; }
    .btn-pop { animation: buttonPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .recipe-pop { animation: recipePop 0.3s ease-out; }
    .check-pop { animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .fill-check { animation: fillCheck 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .draw-check { stroke-dasharray: 24; stroke-dashoffset: 24; animation: drawCheck 0.3s ease-out 0.15s forwards; }
    .item-row { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .breathe-1 { animation: breathe 2.8s ease-in-out infinite; }
    .breathe-2 { animation: breathe 3.2s ease-in-out infinite; animation-delay: 0.35s; }
    .breathe-3 { animation: breathe 3.6s ease-in-out infinite; animation-delay: 0.7s; }
    input { font-size: 16px !important; }
    .code-input::placeholder { color: #d6d3d1; letter-spacing: 0.15em; }
    @keyframes fabSlideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fabSlideDown {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(100%); opacity: 0; }
    }
  `;

  // Desktop sidebar (shared across list, recipes, and settings views)
  const navTabs = [
    {
      id: 'list',
      label: 'List',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
    },
    {
      id: 'recipes',
      label: 'Recipes',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/>
          <line x1="6" y1="17" x2="18" y2="17"/>
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
    },
  ];

  const desktopSidebar = isDesktop && (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 88,
        backgroundColor: theme.bg,
        borderRight: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 24,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: YELLOW }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
        <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {navTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { triggerHaptic('light'); setActiveTab(tab.id); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#78716c',
              padding: 0,
            }}
          >
            {tab.icon}
            <span style={{ fontSize: 11, color: activeTab === tab.id ? theme.text : theme.textSecondary, fontWeight: activeTab === tab.id ? 500 : 400 }}>{tab.label}</span>
            {activeTab === tab.id && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: YELLOW }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Per-category renderer (used in both single-column and two-column layouts)
  const renderCategory = (category) => {
    const categoryItems = items.filter(item => item.category === category.id);
    const uncheckedCount = categoryItems.filter(i => !i.checked).length;
    const hasItems = categoryItems.length > 0;
    const isAdding = addingTo === category.id;
    return (
      <div key={category.id} className="mb-1">
        <div
          className="flex items-center justify-between py-3 px-4 rounded-2xl transition-all"
          style={{
            backgroundColor: hasItems ? theme.bgSecondary : (darkMode ? 'rgba(63,63,70,0.3)' : 'rgba(245,245,244,0.5)'),
            boxShadow: hasItems ? theme.cardShadow : 'none'
          }}
        >
          <span className="text-sm" style={{ color: hasItems ? theme.text : theme.textTertiary, fontWeight: hasItems ? 600 : 500 }}>
            {category.name}
            {hasItems && <span className="ml-2" style={{ color: theme.textTertiary, fontWeight: 300 }}>{uncheckedCount}</span>}
          </span>
          {addMode === 'classic' && (
          <button
            onClick={() => isAdding ? cancelAdding() : startAdding(category.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 adding-input-area"
            style={{
              backgroundColor: isAdding ? theme.text : 'transparent',
              border: isAdding ? 'none' : `1.5px solid ${darkMode ? '#57534e' : '#d6d3d1'}`,
              color: isAdding ? theme.bg : theme.textTertiary
            }}
          >
            <span className="text-base leading-none transition-transform duration-200" style={{ transform: isAdding ? 'rotate(45deg)' : 'none', fontWeight: 300 }}>+</span>
          </button>
          )}
        </div>
        {addMode === 'classic' && isAdding && (
          <div className="mt-1 ml-4 mr-4 fade-in adding-input-area">
            <div className="flex items-center gap-3">
              <input ref={inputRef} type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') cancelAdding(); }}
                placeholder={`Add to ${category.name}...`}
                className="flex-1 py-2 text-sm focus:outline-none bg-transparent"
                style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }} />
              <button onClick={addItem} disabled={!newItemText.trim()}
                className="px-4 py-1.5 text-sm font-medium rounded-full transition-all active:scale-95"
                style={{ backgroundColor: newItemText.trim() ? YELLOW : 'transparent', color: '#292524', opacity: newItemText.trim() ? 1 : 0.3 }}>
                Add
              </button>
            </div>
          </div>
        )}
        {hasItems && (
          <div className="mt-1 ml-4 mr-4" style={isDesktop ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' } : { display: 'flex', flexDirection: 'column' }}>
            {categoryItems
              .filter(item => !hideCompleted || !item.checked)
              .map(item => {
              const isChecking = checkingItems.has(item.id);
              const isEditingQty = editingQuantityId === item.id;
              const quantity = item.quantity || 1;
              const isPendingDelete = pendingDeletes.some(p => p.id === item.id);

              // Don't render items that are pending deletion
              if (isPendingDelete) return null;

              return (
                <div key={item.id} className="flex items-center gap-3 py-3 item-row fade-in" style={{ borderBottom: `1px solid ${theme.borderLight}`, opacity: item.checked ? 0.5 : 1, transition: 'opacity 0.3s ease' }}
                  onTouchStart={() => {
                    if (addMode === 'quick-add' && !item.checked) {
                      longPressTimerRef.current = setTimeout(() => {
                        triggerHaptic('light');
                        setLongPressItem(item);
                      }, 500);
                    }
                  }}
                  onTouchEnd={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                  onTouchMove={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                >
                  <button onClick={() => toggleItem(item.id)}
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${isChecking ? 'fill-check check-pop' : ''}`}
                    style={{ border: `2px solid ${item.checked || isChecking ? YELLOW : theme.border}`, backgroundColor: item.checked || isChecking ? YELLOW : 'transparent' }}>
                    {(item.checked || isChecking) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path className={isChecking ? 'draw-check' : ''} d="M4 12l6 6L20 6"/>
                      </svg>
                    )}
                  </button>
                  {editingId === item.id ? (
                    <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)}
                      onBlur={saveEdit} onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      className="flex-1 text-sm py-1 px-2 rounded-lg focus:outline-none" style={{ backgroundColor: theme.bgTertiary, color: theme.text }} autoFocus />
                  ) : (
                    <span className={`flex-1 text-sm transition-all ${item.checked ? 'line-through' : ''}`}
                      style={{ color: item.checked ? theme.textTertiary : theme.text }}
                      onClick={() => !item.checked && startEdit(item)}>
                      {item.name}
                      {showingCategoryTag.has(item.id) && (
                        <span style={{ fontSize: 11, color: theme.textSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 9999, padding: '2px 8px', marginLeft: 6, display: 'inline-block', animation: 'fadeIn 0.2s ease-out', transition: 'opacity 0.5s', whiteSpace: 'nowrap' }}>
                          {categories.find(c => c.id === item.category)?.name || item.category}
                        </span>
                      )}
                    </span>
                  )}

                  {/* Quantity badge - always show for unchecked items */}
                  {!item.checked && !isEditingQty && (
                    <button
                      onClick={() => setEditingQuantityId(item.id)}
                      className="text-xs font-medium px-2 py-0.5 rounded-full transition-all active:scale-95"
                      style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary, backgroundColor: 'transparent' }}
                    >
                      ×{quantity}
                    </button>
                  )}

                  {/* Quantity controls */}
                  {isEditingQty && (
                    <div className="flex items-center gap-1 fade-in quantity-editor">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ backgroundColor: theme.bgTertiary, color: theme.text }}
                      >
                        <span className="text-sm">−</span>
                      </button>
                      <span className="text-sm font-medium w-6 text-center" style={{ color: theme.text }}>{quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ backgroundColor: theme.bgTertiary, color: theme.text }}
                      >
                        <span className="text-sm">+</span>
                      </button>
                      <button
                        onClick={() => setEditingQuantityId(null)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ml-1"
                        style={{ backgroundColor: YELLOW, color: '#292524' }}
                      >
                        <span className="text-xs">✓</span>
                      </button>
                    </div>
                  )}

                  {!isEditingQty && (
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                      style={{ color: '#a8a29e' }}
                    >
                      <span className="text-lg font-light">×</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Recipes Screen
  if (activeTab === 'recipes' && listId) {
    return (
      <div
        className="min-h-screen"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          background: theme.bgGradient,
          backgroundAttachment: 'fixed',
          paddingLeft: isDesktop ? 88 : 0,
          paddingBottom: isDesktop ? 0 : 80,
        }}
        onClick={(e) => {
          // Close recipe input if clicking outside input area
          if (recipeAddingTo && !e.target.closest('.recipe-input-area')) {
            cancelRecipeAdding();
          }
        }}
      >
        <style>{styles}</style>
        {desktopSidebar}
        <Toast message={toastMessage} visible={showToast} theme={theme} />
        
        <div className="sticky top-0 z-40" style={{ backgroundColor: darkMode ? theme.bg : 'rgba(250,249,248,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.border}` }}>
          <div className="px-5 py-4 flex items-center justify-between">
            {showCreateRecipe ? (
              <button 
                onClick={() => { setShowCreateRecipe(false); setEditingRecipeId(null); setNewRecipeName(''); setNewRecipeIngredients([]); }} 
                className="text-sm font-medium flex items-center gap-2 transition-all" 
                style={{ color: theme.text }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
            ) : (
              <div className="w-14"></div>
            )}
            <h1 className="text-base font-semibold" style={{ color: theme.text }}>
              {showCreateRecipe ? (editingRecipeId ? 'Edit Recipe' : 'New Recipe') : 'Recipes'}
            </h1>
            <div className="w-14"></div>
          </div>
        </div>

        <div className="px-5 py-6" style={{ paddingBottom: isDesktop ? 24 : 112 }}>
          {showCreateRecipe ? (
            // Create Recipe Form
            <div className="fade-in">
              <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
                <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>Recipe Name</label>
                <input
                  type="text"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  placeholder="e.g. Sunday Roast, Pasta Bolognese..."
                  className="w-full py-2 text-sm focus:outline-none bg-transparent"
                  style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}
                  autoFocus
                />
              </div>

              <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.textSecondary }}>Ingredients</h2>
              
              {/* Category-based ingredient adding */}
              {visibleCategories.map(category => {
                const categoryIngredients = newRecipeIngredients.filter(i => i.category === category.id);
                const hasIngredients = categoryIngredients.length > 0;
                const isAdding = recipeAddingTo === category.id;
                
                return (
                  <div key={category.id} className="mb-3">
                    <div className="flex items-center justify-between py-3 px-4 rounded-2xl transition-all" style={{ backgroundColor: hasIngredients ? theme.bgSecondary : 'transparent', boxShadow: hasIngredients ? theme.cardShadow : 'none' }}>
                      <span className="text-sm font-medium" style={{ color: hasIngredients ? theme.text : theme.textTertiary }}>
                        {category.name}
                        {hasIngredients && <span className="ml-2 font-normal" style={{ color: theme.textTertiary }}>{categoryIngredients.length}</span>}
                      </span>
                      <button onClick={() => isAdding ? cancelRecipeAdding() : startRecipeAdding(category.id)} className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 recipe-input-area" style={{ backgroundColor: isAdding ? theme.text : theme.bgTertiary, color: isAdding ? theme.bg : theme.textSecondary }}>
                        <span className="text-lg leading-none transition-transform duration-200" style={{ transform: isAdding ? 'rotate(45deg)' : 'none' }}>+</span>
                      </button>
                    </div>
                    
                    {isAdding && (
                      <div className="mt-1 ml-4 mr-4 fade-in recipe-input-area">
                        <div className="flex items-center gap-3">
                          <input 
                            ref={recipeInputRef}
                            type="text" 
                            value={newRecipeItemText} 
                            onChange={(e) => setNewRecipeItemText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addRecipeIngredient(); if (e.key === 'Escape') cancelRecipeAdding(); }}
                            placeholder={`Add to ${category.name}...`}
                            className="flex-1 py-2 text-sm focus:outline-none bg-transparent"
                            style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }} 
                          />
                          <button onClick={addRecipeIngredient} disabled={!newRecipeItemText.trim()}
                            className="px-4 py-1.5 text-sm font-medium rounded-full transition-all active:scale-95"
                            style={{ backgroundColor: newRecipeItemText.trim() ? YELLOW : 'transparent', color: '#292524', opacity: newRecipeItemText.trim() ? 1 : 0.3 }}>
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {hasIngredients && (
                      <div className="mt-1 ml-4 mr-4">
                        {categoryIngredients.map(ingredient => (
                          <div key={ingredient.id} className="flex items-center gap-3 py-3 fade-in" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                            <span className="flex-1 text-sm" style={{ color: theme.text }}>
                              {ingredient.name}
                            </span>
                            <button 
                              onClick={() => updateRecipeIngredientQuantity(ingredient.id, -1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                              style={{ backgroundColor: theme.bgTertiary, color: theme.text }}
                            >
                              <span className="text-sm">−</span>
                            </button>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary }}>
                              ×{ingredient.quantity || 1}
                            </span>
                            <button 
                              onClick={() => updateRecipeIngredientQuantity(ingredient.id, 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                              style={{ backgroundColor: theme.bgTertiary, color: theme.text }}
                            >
                              <span className="text-sm">+</span>
                            </button>
                            <button onClick={() => removeRecipeIngredient(ingredient.id)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90" style={{ color: '#a8a29e' }}>
                              <span className="text-base font-light">×</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Recipe List
            <>
              <button
                onClick={() => setShowCreateRecipe(true)}
                className="w-full py-3 text-sm font-medium rounded-full mb-6 transition-all active:scale-[0.98]"
                style={{ border: `1.5px dashed ${YELLOW}`, color: theme.text }}
              >
                📖 Create New Recipe
              </button>

              {recipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📖</div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>No recipes yet</h3>
                  <p className="text-sm" style={{ color: theme.textSecondary, fontWeight: 300 }}>
                    Save your favourite meals and add all ingredients to your list in one tap!
                  </p>
                </div>
              ) : (
                <div className={isDesktop ? '' : 'space-y-3'} style={isDesktop ? { display: 'grid', gridTemplateColumns: isWide ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 16 } : {}}>
                  {recipes.map((recipe, index) => {
                    // Generate ingredient preview
                    const ingredientNames = recipe.ingredients.map(i => i.name.toLowerCase());
                    const previewIngredients = ingredientNames.slice(0, 3);
                    const ingredientPreview = previewIngredients.join(', ') + (ingredientNames.length > 3 ? '...' : '');
                    
                    return (
                    <div 
                      key={recipe.id} 
                      className={`rounded-2xl relative overflow-hidden ${addingRecipeId === recipe.id ? 'recipe-pop' : ''}`}
                      style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}
                    >
                      {/* Bookmark shape */}
                      <div 
                        className="absolute left-3 top-0"
                        style={{ 
                          width: '24px',
                          height: '44px',
                        }}
                      >
                        <svg width="24" height="44" viewBox="0 0 24 44" fill="none">
                          <path 
                            d="M0 0H24V40L12 34L0 40V0Z" 
                            fill={RECIPE_ACCENT_COLORS[index % RECIPE_ACCENT_COLORS.length]}
                          />
                        </svg>
                      </div>
                      <div className="p-4 pl-12">
                        {/* Top row: title (left) + delete button and item count (right) */}
                        <div className="flex items-start justify-between mb-1">
                          <h3 style={{ color: theme.text, fontWeight: 600, fontSize: '15px' }}>{recipe.name}</h3>
                          <div className="flex items-center gap-2">
                            <span style={{ color: theme.textTertiary, fontWeight: 300, fontSize: '12px' }}>{recipe.ingredients.length} items</span>
                            <button
                              onClick={() => { triggerHaptic('light'); setDeletingRecipeId(recipe.id); }}
                              className="w-6 h-6 flex items-center justify-center transition-all active:scale-90"
                              style={{ color: '#a8a29e' }}
                            >
                              <span className="text-base font-light">×</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Ingredient preview */}
                        {ingredientPreview && (
                          <p className="text-xs mb-3" style={{ color: '#a8a29e' }}>{ingredientPreview}</p>
                        )}
                        
                        {/* Bottom row: Edit (left) + Add to List (right) */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => startEditRecipe(recipe)}
                            className="transition-all active:scale-95"
                            style={{ color: '#78716c', fontWeight: 400, fontSize: '14px', background: 'none', border: 'none', padding: 0 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => addRecipeToList(recipe)}
                            className="px-5 py-2 text-sm font-medium rounded-full transition-all active:scale-95"
                            style={{ backgroundColor: YELLOW, color: '#292524', boxShadow: theme.yellowGlow }}
                          >
                            Add to List
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky Save/Cancel footer for recipe creation */}
        {showCreateRecipe && (
          <div className="fixed bottom-0 left-0 right-0 p-4 border-t z-40" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
            <div className="flex gap-3 max-w-lg mx-auto">
              <button 
                onClick={cancelCreateRecipe} 
                disabled={savingRecipe}
                className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" 
                style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary, opacity: savingRecipe ? 0.5 : 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={saveRecipe} 
                disabled={!newRecipeName.trim() || newRecipeIngredients.length === 0 || savingRecipe}
                className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.97]"
                style={{ 
                  backgroundColor: (newRecipeName.trim() && newRecipeIngredients.length > 0 && !savingRecipe) ? YELLOW : theme.border, 
                  color: '#292524',
                  opacity: (newRecipeName.trim() && newRecipeIngredients.length > 0 && !savingRecipe) ? 1 : 0.5,
                  boxShadow: (newRecipeName.trim() && newRecipeIngredients.length > 0 && !savingRecipe) ? theme.yellowGlow : 'none'
                }}
              >
                {savingRecipe ? 'Saving...' : (editingRecipeId ? `Update Recipe (${newRecipeIngredients.length} items)` : `Save Recipe (${newRecipeIngredients.length} items)`)}
              </button>
            </div>
          </div>
        )}

        {/* Delete Recipe Confirmation Modal */}
        {deletingRecipeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full max-w-xs rounded-2xl p-6 text-center" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
              <div className="text-4xl mb-4">🗑️</div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Delete recipe?</h2>
              <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
                This will permanently delete "{recipes.find(r => r.id === deletingRecipeId)?.name}".
              </p>
              <p className="text-xs mb-6 px-2 py-2 rounded-lg" style={{ backgroundColor: darkMode ? '#3f3f46' : '#fef3c7', color: darkMode ? '#fcd34d' : '#92400e' }}>
                ⚠️ This affects everyone sharing this list
              </p>
              <div className="flex gap-3">
                <button onClick={() => { triggerHaptic('light'); setDeletingRecipeId(null); }} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary }}>Cancel</button>
                <button onClick={confirmDeleteRecipe} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" style={{ backgroundColor: '#ef4444', color: '#fff' }}>Delete</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Navigation */}
        {!isDesktop && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />}
      </div>
    );
  }

  // Settings Page
  if (activeTab === 'settings' && listId) {
    return (
      <div
        className="min-h-screen"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          background: theme.bgGradient,
          backgroundAttachment: 'fixed',
          paddingLeft: isDesktop ? 88 : 0,
          paddingBottom: isDesktop ? 0 : 80,
        }}
      >
        <style>{styles}</style>
        {desktopSidebar}
        <Toast message={toastMessage} visible={showToast} theme={theme} />
        <div className="sticky top-0 z-40" style={{ backgroundColor: darkMode ? theme.bg : 'rgba(250,249,248,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.border}` }}>
          <div className="px-5 py-4 flex items-center justify-center">
            <h1 className="text-base font-semibold" style={{ color: theme.text }}>Settings</h1>
          </div>
          
          {/* Tabs */}
          <div className="flex px-5 gap-2 pb-3">
            {[
              { id: 'general', label: 'General' },
              { id: 'stores', label: 'Stores' },
              { id: 'categories', label: 'Categories' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setSettingsTab(tab.id); triggerHaptic('light'); }}
                className="flex-1 py-2.5 text-sm rounded-full transition-all"
                style={{
                  backgroundColor: settingsTab === tab.id ? YELLOW : theme.bgTertiary,
                  color: settingsTab === tab.id ? '#292524' : theme.text,
                  fontWeight: settingsTab === tab.id ? 600 : 400,
                  boxShadow: settingsTab === tab.id ? theme.yellowGlowSubtle : 'none',
                  border: settingsTab === tab.id ? 'none' : `1.5px solid ${theme.border}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-6 pb-24">
          {/* General Tab */}
          {settingsTab === 'general' && (() => {
            const cardShadow = isDesktop ? '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)' : theme.cardShadow;
            const shareCodeCard = (
              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.bgSecondary, boxShadow: cardShadow }}>
                <label className="text-xs font-medium mb-3 block" style={{ color: theme.textSecondary }}>Share Code</label>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono tracking-widest" style={{ color: theme.text }}>{listId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(listId);
                      triggerHaptic('success');
                      showToastMessage('Code copied!');
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-full transition-all active:scale-95"
                    style={{ backgroundColor: theme.bgTertiary, color: theme.text }}
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs mt-3" style={{ color: theme.textTertiary, fontWeight: 300 }}>Share this code so others can join your list</p>
              </div>
            );
            const listNameCard = (
              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.bgSecondary, boxShadow: cardShadow }}>
                <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>List Name</label>
                <input
                  ref={listNameInputRef}
                  type="text"
                  value={editingListName}
                  onChange={(e) => setEditingListName(e.target.value)}
                  onBlur={() => saveListName(editingListName)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { saveListName(editingListName); e.target.blur(); } }}
                  placeholder="e.g. Weekly Shop, Party Supplies..."
                  className="w-full py-2 text-sm focus:outline-none bg-transparent"
                  style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}
                />
                <p className="text-xs mt-2" style={{ color: theme.textTertiary, fontWeight: 300 }}>Give your list a name to easily identify it. Saved on this device only.</p>
              </div>
            );
            const appearanceCard = (
              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.bgSecondary, boxShadow: cardShadow }}>
                <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>Appearance</label>
                <div className="flex gap-1 p-1 rounded-full" style={{ backgroundColor: theme.bgTertiary }}>
                  {[
                    { id: 'light', label: 'Light' },
                    { id: 'system', label: 'System' },
                    { id: 'dark', label: 'Dark' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setAppearanceModeTo(option.id)}
                      className="flex-1 py-2 text-xs font-medium rounded-full transition-all"
                      style={{
                        backgroundColor: appearanceMode === option.id ? YELLOW : 'transparent',
                        color: appearanceMode === option.id ? '#292524' : theme.textSecondary,
                        boxShadow: appearanceMode === option.id ? theme.yellowGlowSubtle : 'none'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: theme.textTertiary, fontWeight: 300 }}>
                  {appearanceMode === 'system' ? 'Follows your device theme' : appearanceMode === 'dark' ? 'Always use dark theme' : 'Always use light theme'}
                </p>
              </div>
            );
            const completedCard = (
              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.bgSecondary, boxShadow: cardShadow }}>
                <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>When items are completed</label>
                <div className="flex gap-1 p-1 rounded-full" style={{ backgroundColor: theme.bgTertiary }}>
                  {[
                    { id: 'nothing', label: 'Nothing' },
                    { id: 'auto-hide', label: 'Auto-hide' },
                    { id: 'auto-remove', label: 'Auto-remove' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => { setCompletedBehavior(option.id); triggerHaptic('light'); }}
                      className="flex-1 py-2 text-xs font-medium rounded-full transition-all"
                      style={{
                        backgroundColor: completedBehavior === option.id ? YELLOW : 'transparent',
                        color: completedBehavior === option.id ? '#292524' : theme.textSecondary,
                        boxShadow: completedBehavior === option.id ? theme.yellowGlowSubtle : 'none'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: theme.textTertiary, fontWeight: 300 }}>
                  {completedBehavior === 'nothing' ? 'Completed items stay visible in your list' :
                   completedBehavior === 'auto-hide' ? 'Completed items are hidden automatically' :
                   'Completed items are removed after a short delay (with undo)'}
                </p>
              </div>
            );
            const inactivityCard = (
              <div className="rounded-2xl p-4 mb-3 flex items-start gap-3" style={{ backgroundColor: darkMode ? '#3f3f46' : '#fefce8' }}>
                <span className="text-lg">💤</span>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>Inactivity Policy</p>
                  <p className="text-xs" style={{ color: theme.textSecondary, fontWeight: 300 }}>Lists inactive for 90 days are automatically reset. Items, recipes, custom categories, and settings will be cleared.</p>
                </div>
              </div>
            );
            const dangerZone = (
              <>
                <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.textTertiary }}>⚠️ Danger Zone</h2>
                <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(239,68,68,0.03)' }}>
                  <button
                    onClick={() => { triggerHaptic('light'); setActiveTab('list'); setTimeout(() => setShowClearAllConfirm(true), 100); }}
                    disabled={items.length === 0}
                    className="w-full py-2 text-xs font-medium rounded-full active:scale-[0.98] transition-all mb-2"
                    style={{
                      border: '1.5px solid #ef4444',
                      color: items.length === 0 ? theme.textTertiary : '#ef4444',
                      opacity: items.length === 0 ? 0.5 : 1
                    }}
                  >
                    Clear all items {items.length > 0 && `(${items.length})`}
                  </button>
                  <button onClick={() => { triggerHaptic('light'); setActiveTab('list'); setTimeout(() => setShowLeaveConfirm(true), 100); }} className="w-full py-2 text-xs font-medium rounded-full active:scale-[0.98] transition-all" style={{ border: '1.5px solid #ef4444', color: '#ef4444' }}>
                    Leave this list
                  </button>
                </div>
              </>
            );
            const addModeCard = (
              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.bgSecondary, boxShadow: cardShadow }}>
                <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>Adding items</label>
                <div className="flex gap-1 p-1 rounded-full" style={{ backgroundColor: theme.bgTertiary }}>
                  {[
                    { id: 'classic', label: 'Classic' },
                    { id: 'quick-add', label: 'Quick Add (Beta)' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        triggerHaptic('light');
                        setAddMode(option.id);
                        localStorage.setItem('breadcrumbs-add-mode', option.id);
                        if (option.id === 'quick-add') {
                          if (!localStorage.getItem('breadcrumbs-has-used-quick-add')) {
                            localStorage.setItem('breadcrumbs-has-used-quick-add', 'true');
                            setHasUsedQuickAdd(true);
                          }
                          if (!localStorage.getItem('breadcrumbs-has-seen-quick-add-onboarding')) {
                            setTimeout(() => setShowQuickAddOnboarding(true), 150);
                          }
                        }
                      }}
                      className="flex-1 py-2 text-xs font-medium rounded-full transition-all"
                      style={{
                        backgroundColor: addMode === option.id ? YELLOW : 'transparent',
                        color: addMode === option.id ? '#292524' : theme.textSecondary,
                        boxShadow: addMode === option.id ? theme.yellowGlowSubtle : 'none'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: theme.textTertiary, fontWeight: 300 }}>
                  {addMode === 'classic' ? 'Per-category add buttons appear on your list' : 'One button adds anything — category assigned automatically'}
                </p>
              </div>
            );

            const helpSection = (
              <>
                <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.textTertiary }}>Help</h2>
                <div className="rounded-2xl mb-3" style={{ backgroundColor: theme.bgSecondary, boxShadow: cardShadow, overflow: 'hidden' }}>
                  <button
                    onClick={() => { localStorage.removeItem('breadcrumbs-has-seen-onboarding'); setShowOnboarding(true); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-all active:opacity-70"
                    style={{ borderBottom: `1px solid ${theme.border}`, background: 'none', border: 'none', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: theme.text }}>App intro</p>
                      <p className="text-xs" style={{ color: theme.textSecondary, fontWeight: 300 }}>Replay the welcome walkthrough</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (!hasUsedQuickAdd) return;
                      localStorage.removeItem('breadcrumbs-has-seen-quick-add-onboarding');
                      setShowQuickAddOnboarding(true);
                    }}
                    style={{ background: 'none', border: 'none', cursor: hasUsedQuickAdd ? 'pointer' : 'default', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', opacity: hasUsedQuickAdd ? 1 : 0.4 }}
                    className="transition-all active:opacity-70"
                  >
                    <div>
                      <p className="text-sm font-medium text-left" style={{ color: theme.text }}>Quick Add guide</p>
                      <p className="text-xs text-left" style={{ color: theme.textSecondary, fontWeight: 300 }}>Replay the Quick Add walkthrough</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </>
            );

            return isDesktop ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                <div>{shareCodeCard}{inactivityCard}{dangerZone}{helpSection}</div>
                <div>{listNameCard}{appearanceCard}{completedCard}{addModeCard}</div>
              </div>
            ) : (
              <>{shareCodeCard}{listNameCard}{appearanceCard}{completedCard}{addModeCard}{inactivityCard}{dangerZone}{helpSection}</>
            );
          })()}

          {/* Stores Tab */}
          {settingsTab === 'stores' && (
            <>
              <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
                Choose a store layout to reorder categories based on how that store is organised. Your items stay the same — only the order changes.
              </p>

              {/* Current store indicator */}
              <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: theme.textSecondary }}>Current Layout</p>
                    <p className="text-lg font-semibold" style={{ color: theme.text }}>{activeStoreLayout?.name || 'Default'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: YELLOW }}>
                    <span className="text-lg">🏪</span>
                  </div>
                </div>
              </div>

              {/* Store layouts list */}
              <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.textTertiary }}>Available Layouts</h3>
              <div className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
                {storeLayouts.map((layout, idx) => {
                  const isActive = layout.id === activeStoreLayoutId;
                  return (
                    <div 
                      key={layout.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: idx < storeLayouts.length - 1 ? `1px solid ${theme.borderLight}` : 'none' }}
                    >
                      <button
                        onClick={() => switchStoreLayout(layout.id)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                          style={{ 
                            border: `2px solid ${isActive ? YELLOW : theme.border}`,
                            backgroundColor: isActive ? YELLOW : 'transparent'
                          }}
                        >
                          {isActive && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 12l6 6L20 6"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium" style={{ color: theme.text }}>{layout.name}</span>
                          {!layout.isDefault && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: darkMode ? '#3f3f46' : '#fefce8', color: darkMode ? '#fcd34d' : '#a16207' }}>Custom</span>
                          )}
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {/* Edit button */}
                        <button
                          onClick={() => { setEditingStoreLayout(layout.id); setEditingStoreLayoutData(storeLayouts.find(s => s.id === layout.id)); }}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                          style={{ backgroundColor: theme.bgTertiary }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        
                        {/* Delete button - only for custom layouts */}
                        {!layout.isDefault && (
                          <button
                            onClick={() => deleteStoreLayout(layout.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ color: '#a8a29e' }}
                          >
                            <span className="text-lg font-light">×</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Create custom layout */}
              <button
                onClick={async () => {
                  const name = prompt('Enter a name for your custom layout:');
                  if (name && name.trim()) {
                    const newLayout = await createCustomStoreLayout(name);
                    setEditingStoreLayout(newLayout.id);
                    setEditingStoreLayoutData(newLayout);
                  }
                }}
                className="w-full py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]"
                style={{ border: `1.5px dashed ${YELLOW}`, color: theme.text }}
              >
                + Create Custom Layout
              </button>
            </>
          )}

          {/* Edit Store Layout Modal */}
          {editingStoreLayout && (
            <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div 
                className="w-full max-h-[85vh] rounded-t-3xl overflow-hidden flex flex-col"
                style={{ backgroundColor: theme.bg }}
              >
                {/* Header */}
                <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: theme.border }}>
                  <button
                    onClick={async () => {
                      if (editingStoreLayoutData) {
                        await updateStoreLayoutOrder(editingStoreLayout, editingStoreLayoutData.categoryOrder);
                      }
                      setEditingStoreLayout(null);
                      setEditingStoreLayoutData(null);
                    }}
                    className="text-sm font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    Done
                  </button>
                  <h2 className="text-base font-semibold" style={{ color: theme.text }}>
                    Edit {editingStoreLayoutData?.name}
                  </h2>
                  <button
                    onClick={() => {
                      const defaultLayout = DEFAULT_STORE_LAYOUTS.find(s => s.id === editingStoreLayout);
                      if (defaultLayout && editingStoreLayoutData) {
                        setEditingStoreLayoutData({ ...editingStoreLayoutData, categoryOrder: defaultLayout.categoryOrder });
                        showToastMessage('Layout reset to default');
                      }
                    }}
                    className="text-sm font-medium"
                    style={{ color: editingStoreLayoutData?.isDefault ? YELLOW : theme.textTertiary }}
                    disabled={!editingStoreLayoutData?.isDefault}
                  >
                    Reset
                  </button>
                </div>
                
                <p className="px-5 py-3 text-sm" style={{ color: theme.textSecondary }}>
                  Drag categories to match your store's layout.
                </p>

                {/* Category reorder list */}
                <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
                  <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
                    {(() => {
                      const layout = editingStoreLayoutData;
                      // Use DEFAULT_CATEGORIES as primary source for category names
                      // This ensures all 20 categories appear even if user's categories differ
                      const allCategories = [...DEFAULT_CATEGORIES, ...categories.filter(c => !DEFAULT_CATEGORIES.find(d => d.id === c.id))];
                      const orderedCategories = layout?.categoryOrder
                        .map(id => allCategories.find(c => c.id === id))
                        .filter(Boolean) || [];
                      
                      return orderedCategories.map((cat, idx) => {
                        const isHidden = hiddenCategories.includes(cat.id);
                        const isFirst = idx === 0;
                        const isLast = idx === orderedCategories.length - 1;
                        
                        return (
                          <div 
                            key={cat.id}
                            className="flex items-center gap-3 px-4 py-3"
                            style={{ 
                              borderBottom: idx < orderedCategories.length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                              opacity: isHidden ? 0.4 : 1
                            }}
                          >
                            {/* UP arrow */}
                            <button
                              onClick={() => {
                                if (!isFirst) {
                                  triggerHaptic('light');
                                  const newOrder = [...editingStoreLayoutData.categoryOrder];
                                  const catIdx = newOrder.indexOf(cat.id);
                                  [newOrder[catIdx - 1], newOrder[catIdx]] = [newOrder[catIdx], newOrder[catIdx - 1]];
                                  setEditingStoreLayoutData({ ...editingStoreLayoutData, categoryOrder: newOrder });
                                }
                              }}
                              disabled={isFirst}
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                              style={{ 
                                color: isFirst ? theme.border : theme.text,
                                backgroundColor: isFirst ? 'transparent' : theme.bgTertiary
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 15l-6-6-6 6"/>
                              </svg>
                            </button>

                            <span className="flex-1 text-sm" style={{ color: theme.text }}>{cat.name}</span>

                            {/* DOWN arrow */}
                            <button
                              onClick={() => {
                                if (!isLast) {
                                  triggerHaptic('light');
                                  const newOrder = [...editingStoreLayoutData.categoryOrder];
                                  const catIdx = newOrder.indexOf(cat.id);
                                  [newOrder[catIdx], newOrder[catIdx + 1]] = [newOrder[catIdx + 1], newOrder[catIdx]];
                                  setEditingStoreLayoutData({ ...editingStoreLayoutData, categoryOrder: newOrder });
                                }
                              }}
                              disabled={isLast}
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                              style={{ 
                                color: isLast ? theme.border : theme.text,
                                backgroundColor: isLast ? 'transparent' : theme.bgTertiary
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9l6 6 6-6"/>
                              </svg>
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab - Show/hide and custom categories only */}
          {settingsTab === 'categories' && (
            <>
              <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
                Toggle categories on or off. Hidden categories won't appear in your list. To reorder categories, use the Stores tab.
              </p>

              {/* Add Custom Category Button */}
              {showAddCategory ? (
                <div className="rounded-2xl p-4 mb-4 fade-in" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCustomCategory(); if (e.key === 'Escape') { setShowAddCategory(false); setNewCategoryName(''); } }}
                    placeholder="Category name..."
                    className="w-full py-2 text-sm focus:outline-none bg-transparent mb-3"
                    style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
                      className="flex-1 py-2 text-sm font-medium rounded-full"
                      style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addCustomCategory}
                      disabled={!newCategoryName.trim()}
                      className="flex-1 py-2 text-sm font-medium rounded-full transition-all"
                      style={{ backgroundColor: newCategoryName.trim() ? YELLOW : theme.border, color: '#292524' }}
                    >
                      Create
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="w-full py-3 text-sm font-medium rounded-full mb-4 transition-all active:scale-[0.98]"
                  style={{ border: `1.5px dashed ${YELLOW}`, color: theme.text }}
                >
                  + Add Custom Category
                </button>
              )}

              {/* Category list with visibility toggles */}
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
                {categories.map((cat, idx) => {
                  const isHidden = hiddenCategories.includes(cat.id);
                  const itemCount = items.filter(i => i.category === cat.id).length;
                  const isCustom = cat.isDefault === false;
                  
                  return (
                    <div 
                      key={cat.id} 
                      className="flex items-center gap-3 px-4 py-3 transition-all"
                      style={{ 
                        borderBottom: idx < categories.length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                        opacity: isHidden ? 0.5 : 1
                      }}
                    >
                      {/* Category name and info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate" style={{ color: theme.text }}>{cat.name}</span>
                          {isCustom && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: darkMode ? '#3f3f46' : '#fefce8', color: darkMode ? '#fcd34d' : '#a16207' }}>Custom</span>
                          )}
                        </div>
                        {itemCount > 0 && !isHidden && (
                          <span className="text-xs" style={{ color: theme.textTertiary }}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        )}
                      </div>

                      {/* Delete button for custom categories */}
                      {isCustom && (
                        <button
                          onClick={() => deleteCustomCategory(cat.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                          style={{ color: '#a8a29e' }}
                        >
                          <span className="text-lg font-light">×</span>
                        </button>
                      )}

                      {/* Visibility toggle */}
                      <button
                        onClick={() => toggleCategoryVisibility(cat.id)}
                        className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
                        style={{ backgroundColor: isHidden ? theme.border : YELLOW, boxShadow: isHidden ? 'none' : theme.yellowGlowSubtle }}
                      >
                        <div
                          className="absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-sm"
                          style={{ backgroundColor: '#fff', left: isHidden ? '2px' : 'calc(100% - 22px)' }}
                        ></div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        {/* Bottom Navigation */}
        {!isDesktop && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />}
      </div>
    );
  }

  // Welcome Screen
  if (!listId) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" 
        style={{ fontFamily: 'Inter, system-ui, sans-serif', background: theme.bgGradient, backgroundAttachment: 'fixed' }}
      >
        <style>{styles}</style>
        
        <div className="w-full max-w-sm relative" style={{ zIndex: 1 }}>
          {/* Hero section with breathing dots */}
          <div className="flex flex-col items-center mb-12 fade-up-1">
            {/* Big breathing dots */}
            <div className="flex items-center gap-6 mb-9">
              <div 
                className="breathe-1 rounded-full"
                style={{ 
                  width: 72, 
                  height: 72, 
                  backgroundColor: YELLOW,
                }}
              />
              <div 
                className="breathe-2 rounded-full"
                style={{ 
                  width: 52, 
                  height: 52, 
                  backgroundColor: YELLOW,
                  opacity: 0.6,
                }}
              />
              <div 
                className="breathe-3 rounded-full"
                style={{ 
                  width: 36, 
                  height: 36, 
                  backgroundColor: YELLOW,
                  opacity: 0.3,
                }}
              />
            </div>

            {/* Wordmark */}
            <h1 
              style={{ 
                fontSize: 40, 
                fontWeight: 800, 
                letterSpacing: '-0.01em', 
                color: theme.text,
                margin: 0,
                lineHeight: 1,
              }}
            >
              Breadcrumbs
            </h1>

          </div>

          {/* CTA card */}
          <div 
            className="fade-up-3 rounded-3xl p-5"
            style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow, overflow: 'hidden' }}
          >
            {/* Create button */}
            <button 
              onClick={createNewList} 
              className={`w-full py-4 text-sm font-medium rounded-full transition-all mb-5 ${createAnim ? 'btn-pop' : ''}`}
              style={{ 
                backgroundColor: createAnim ? YELLOW : (darkMode ? '#fafaf9' : '#1c1917'), 
                color: createAnim ? '#292524' : (darkMode ? '#1c1917' : '#fff'),
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              }}
            >
              Create new list
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ backgroundColor: darkMode ? theme.border : '#f0eeec' }}></div>
              <span 
                style={{ 
                  fontSize: 11, 
                  fontWeight: 500, 
                  letterSpacing: '0.12em', 
                  color: darkMode ? theme.textTertiary : '#c4bfbb',
                  textTransform: 'uppercase',
                }}
              >
                or join
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: darkMode ? theme.border : '#f0eeec' }}></div>
            </div>

            {/* Code input + join row */}
            <div className="flex gap-2" style={{ minWidth: 0 }}>
              <input 
                type="text" 
                value={joinCode} 
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
                placeholder="ABC123" 
                maxLength={6}
                className="code-input py-3.5 text-center text-sm tracking-widest uppercase font-medium focus:outline-none transition-all rounded-full"
                style={{ 
                  flex: '1 1 auto',
                  minWidth: 0,
                  border: `1.5px solid ${darkMode ? theme.border : '#f0eeec'}`, 
                  backgroundColor: theme.bgTertiary, 
                  color: theme.text,
                  letterSpacing: '0.15em',
                }}
                onFocus={(e) => e.target.style.borderColor = darkMode ? theme.textTertiary : '#d6d3d1'}
                onBlur={(e) => e.target.style.borderColor = darkMode ? theme.border : '#f0eeec'} 
              />
              <button 
                onClick={joinList} 
                className="px-5 py-3.5 text-sm font-medium rounded-full transition-all active:scale-[0.97] flex-shrink-0"
                style={{ 
                  border: `1.5px solid ${theme.border}`, 
                  backgroundColor: 'transparent',
                  color: theme.text,
                }}
              >
                Join
              </button>
            </div>
          </div>

          {/* Footer hint */}
          <p 
            className="fade-up-4 text-center mt-4"
            style={{ fontSize: 12, color: darkMode ? theme.textTertiary : '#d6d3d1', fontWeight: 300 }}
          >
            Share your code to shop together
          </p>
        </div>
      </div>
    );
  }

  // Main List
  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        background: theme.bgGradient,
        backgroundAttachment: 'fixed',
        paddingLeft: isDesktop ? 88 : 0,
      }}
      onClick={(e) => {
        // Close adding input if clicking outside input area
        if (addingTo && !e.target.closest('.adding-input-area')) {
          cancelAdding();
        }
        // Close quantity editor if clicking outside
        if (editingQuantityId && !e.target.closest('.quantity-editor')) {
          setEditingQuantityId(null);
        }
        // Close fab input bar if clicking outside
        if (fabOpen && !e.target.closest('.fab-area')) {
          setFabOpen(false);
          setFabInput('');
          setFabNoMatchMode(false);
        }
      }}
    >
      <style>{styles}</style>
      {desktopSidebar}
      <Toast message={toastMessage} visible={showToast} theme={theme} />
      
      {showOnboarding && <OnboardingModal listCode={listId} onComplete={completeOnboarding} theme={theme} />}
      {showQuickAddOnboarding && <QuickAddOnboardingModal onComplete={completeQuickAddOnboarding} theme={theme} />}
      
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-xs rounded-2xl p-6 text-center" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
            <div className="text-4xl mb-4">🧹</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Clear completed items?</h2>
            <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
              This will remove {checkedCount} ticked {checkedCount === 1 ? 'item' : 'items'} from the list.
            </p>
            <p className="text-xs mb-6 px-2 py-2 rounded-lg" style={{ backgroundColor: darkMode ? '#3f3f46' : '#fef3c7', color: darkMode ? '#fcd34d' : '#92400e' }}>
              ⚠️ This affects everyone sharing this list
            </p>
            <div className="flex gap-3">
              <button onClick={() => { triggerHaptic('light'); setShowClearConfirm(false); }} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary }}>Cancel</button>
              <button onClick={async () => { triggerHaptic('success'); const newItems = items.filter(i => !i.checked); setItems(newItems); await saveList(newItems); setShowClearConfirm(false); }} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.97]" style={{ backgroundColor: YELLOW, color: '#292524', boxShadow: theme.yellowGlow }}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-xs rounded-2xl p-6 text-center" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
            <div className="text-4xl mb-4">🗑️</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Clear all items?</h2>
            <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
              This will remove all {items.length} {items.length === 1 ? 'item' : 'items'} from the list — both ticked and unticked.
            </p>
            <p className="text-xs mb-6 px-2 py-2 rounded-lg" style={{ backgroundColor: darkMode ? '#3f3f46' : '#fef3c7', color: darkMode ? '#fcd34d' : '#92400e' }}>
              ⚠️ This affects everyone sharing this list
            </p>
            <div className="flex gap-3">
              <button onClick={() => { triggerHaptic('light'); setShowClearAllConfirm(false); }} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary }}>Cancel</button>
              <button onClick={clearAllItems} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" style={{ backgroundColor: '#ef4444', color: '#fff' }}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-xs rounded-2xl p-6 text-center" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
            <div className="text-4xl mb-4">👋</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Leave this list?</h2>
            <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
              You'll be removed from this list on your device.
            </p>
            <p className="text-xs mb-6 px-3 py-2 rounded-lg" style={{ backgroundColor: darkMode ? '#3f3f46' : '#f0fdf4', color: darkMode ? '#86efac' : '#166534' }}>
              💡 You can rejoin anytime with the code: <span className="font-mono font-medium">{listId}</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => { triggerHaptic('light'); setShowLeaveConfirm(false); }} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary }}>Stay</button>
              <button onClick={confirmLeaveList} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" style={{ backgroundColor: '#ef4444', color: '#fff' }}>Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* Store Picker Modal */}
      {showStorePicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowStorePicker(false)}>
          <div
            className="w-full max-h-[75vh] rounded-t-3xl overflow-hidden flex flex-col"
            style={{ backgroundColor: theme.bg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: theme.border }}>
              <h2 className="text-base font-semibold" style={{ color: theme.text }}>Switch Store</h2>
              <button
                onClick={() => setShowStorePicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.bgTertiary }}
              >
                <span style={{ color: theme.textSecondary }}>✕</span>
              </button>
            </div>
            <div className="overflow-y-auto p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
              {storeLayouts.map((layout) => {
                const isActive = layout.id === activeStoreLayoutId;
                return (
                  <button
                    key={layout.id}
                    onClick={() => switchStoreLayout(layout.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all active:scale-[0.98]"
                    style={{ 
                      backgroundColor: isActive ? (darkMode ? '#3f3f46' : '#fefce8') : theme.bgSecondary,
                      border: isActive ? `1.5px solid ${YELLOW}` : `1.5px solid transparent`
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isActive ? YELLOW : theme.bgTertiary }}
                    >
                      <span className="text-lg">🏪</span>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium" style={{ color: theme.text }}>{layout.name}</span>
                      {!layout.isDefault && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: darkMode ? '#3f3f46' : '#f5f5f4', color: theme.textSecondary }}>Custom</span>
                      )}
                    </div>
                    {isActive && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12l6 6L20 6"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {!isOnline && (
        <div className="px-4 py-2 text-center text-xs font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>You're offline. Changes will sync when you reconnect.</div>
      )}
      
      <div className="sticky top-0 z-40" style={{ backgroundColor: darkMode ? theme.bg : 'rgba(250,249,248,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.border}` }}>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo, title, and store pill */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {!isDesktop && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: YELLOW }}></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.6 }}></div>
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.3 }}></div>
                </div>
              )}
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-lg font-semibold tracking-tight" style={{ color: theme.text }}>
                  {listName || 'Breadcrumbs'}
                </h1>
                {/* Store pill - inline next to title */}
                <button
                  onClick={() => { triggerHaptic('light'); setShowStorePicker(true); }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full transition-all active:scale-95"
                  style={{ border: `1.5px solid ${theme.border}`, backgroundColor: 'transparent' }}
                >
                  <span className="text-xs" style={{ color: theme.textSecondary }}>{activeStoreLayout?.name}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Right side - Sync status pill */}
            <div className="flex items-center flex-shrink-0">
              <div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                style={{ border: '1.5px solid #e7e5e4', backgroundColor: 'transparent' }}
              >
                <span 
                  className={`w-1.5 h-1.5 rounded-full ${syncing ? 'sync-pulse' : ''}`} 
                  style={{ backgroundColor: isOnline && !syncing ? '#22c55e' : '#f59e0b' }}
                ></span>
                <span className="text-xs" style={{ color: '#78716c' }}>
                  {syncing ? 'Syncing' : isOnline ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress bar with hide/clear controls */}
          {totalItems > 0 && completedBehavior !== 'auto-remove' && (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(checkedCount / totalItems) * 100}%`, backgroundColor: YELLOW }} />
              </div>
              <span className="text-xs font-medium tabular-nums" style={{ color: theme.textSecondary }}>{checkedCount}/{totalItems}</span>
              {checkedCount > 0 && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { triggerHaptic('light'); setHideCompleted(!hideCompleted); }}
                    className="text-xs transition-all"
                    style={{ color: theme.textTertiary }}
                  >
                    {hideCompleted ? `Show ${checkedCount}` : `Hide ${checkedCount}`}
                  </button>
                  <span style={{ color: theme.border }}>·</span>
                  <button 
                    onClick={() => { triggerHaptic('light'); setShowClearConfirm(true); }}
                    className="text-xs transition-all"
                    style={{ color: theme.textTertiary }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 py-3" style={{ paddingBottom: isDesktop ? 24 : 96 }}>
        {isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div>{visibleCategories.filter((_, i) => i % 2 === 0).map(renderCategory)}</div>
            <div>{visibleCategories.filter((_, i) => i % 2 === 1).map(renderCategory)}</div>
          </div>
        ) : (
          visibleCategories.map(renderCategory)
        )}
      </div>

      {/* NOTE: the old per-category inline map below has been replaced by renderCategory above */}
      {false && visibleCategories.map((category, categoryIndex) => {
          const categoryItems = items.filter(item => item.category === category.id);
          const uncheckedCount = categoryItems.filter(i => !i.checked).length;
          const hasItems = categoryItems.length > 0;
          const isAdding = addingTo === category.id;
          return (
            <div key={category.id} className="mb-1">
              <div
                className="flex items-center justify-between py-3 px-4 rounded-2xl transition-all"
                style={{
                  backgroundColor: hasItems ? theme.bgSecondary : (darkMode ? 'rgba(63,63,70,0.3)' : 'rgba(245,245,244,0.5)'),
                  boxShadow: hasItems ? theme.cardShadow : 'none'
                }}
              >
                <span className="text-sm" style={{ color: hasItems ? theme.text : theme.textTertiary, fontWeight: hasItems ? 600 : 500 }}>
                  {category.name}
                  {hasItems && <span className="ml-2" style={{ color: theme.textTertiary, fontWeight: 300 }}>{uncheckedCount}</span>}
                </span>
                <button
                  onClick={() => isAdding ? cancelAdding() : startAdding(category.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 adding-input-area"
                  style={{
                    backgroundColor: isAdding ? theme.text : 'transparent',
                    border: isAdding ? 'none' : `1.5px solid ${darkMode ? '#57534e' : '#d6d3d1'}`,
                    color: isAdding ? theme.bg : theme.textTertiary
                  }}
                >
                  <span className="text-base leading-none transition-transform duration-200" style={{ transform: isAdding ? 'rotate(45deg)' : 'none', fontWeight: 300 }}>+</span>
                </button>
              </div>
              {isAdding && (
                <div className="mt-1 ml-4 mr-4 fade-in adding-input-area">
                  <div className="flex items-center gap-3">
                    <input ref={inputRef} type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') cancelAdding(); }}
                      placeholder={`Add to ${category.name}...`}
                      className="flex-1 py-2 text-sm focus:outline-none bg-transparent"
                      style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }} />
                    <button onClick={addItem} disabled={!newItemText.trim()}
                      className="px-4 py-1.5 text-sm font-medium rounded-full transition-all active:scale-95"
                      style={{ backgroundColor: newItemText.trim() ? YELLOW : 'transparent', color: '#292524', opacity: newItemText.trim() ? 1 : 0.3 }}>
                      Add
                    </button>
                  </div>
                </div>
              )}
              {hasItems && (
                <div className="mt-1 ml-4 mr-4">
                  {categoryItems
                    .filter(item => !hideCompleted || !item.checked)
                    .map(item => {
                    const isChecking = checkingItems.has(item.id);
                    const isEditingQty = editingQuantityId === item.id;
                    const quantity = item.quantity || 1;
                    const isPendingDelete = pendingDeletes.some(p => p.id === item.id);

                    // Don't render items that are pending deletion
                    if (isPendingDelete) return null;

                    return (
                      <div key={item.id} className="flex items-center gap-3 py-3 item-row fade-in" style={{ borderBottom: `1px solid ${theme.borderLight}`, opacity: item.checked ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
                        <button onClick={() => toggleItem(item.id)}
                          className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${isChecking ? 'fill-check check-pop' : ''}`}
                          style={{ border: `2px solid ${item.checked || isChecking ? YELLOW : theme.border}`, backgroundColor: item.checked || isChecking ? YELLOW : 'transparent' }}>
                          {(item.checked || isChecking) && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path className={isChecking ? 'draw-check' : ''} d="M4 12l6 6L20 6"/>
                            </svg>
                          )}
                        </button>
                        {editingId === item.id ? (
                          <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)}
                            onBlur={saveEdit} onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            className="flex-1 text-sm py-1 px-2 rounded-lg focus:outline-none" style={{ backgroundColor: theme.bgTertiary, color: theme.text }} autoFocus />
                        ) : (
                          <span className={`flex-1 text-sm transition-all ${item.checked ? 'line-through' : ''}`}
                            style={{ color: item.checked ? theme.textTertiary : theme.text }}
                            onClick={() => !item.checked && startEdit(item)}>
                            {item.name}
                          </span>
                        )}

                        {/* Quantity badge - always show for unchecked items */}
                        {!item.checked && !isEditingQty && (
                          <button
                            onClick={() => setEditingQuantityId(item.id)}
                            className="text-xs font-medium px-2 py-0.5 rounded-full transition-all active:scale-95"
                            style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary, backgroundColor: 'transparent' }}
                          >
                            ×{quantity}
                          </button>
                        )}

                        {/* Quantity controls */}
                        {isEditingQty && (
                          <div className="flex items-center gap-1 fade-in quantity-editor">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                              style={{ backgroundColor: theme.bgTertiary, color: theme.text }}
                            >
                              <span className="text-sm">−</span>
                            </button>
                            <span className="text-sm font-medium w-6 text-center" style={{ color: theme.text }}>{quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                              style={{ backgroundColor: theme.bgTertiary, color: theme.text }}
                            >
                              <span className="text-sm">+</span>
                            </button>
                            <button
                              onClick={() => setEditingQuantityId(null)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ml-1"
                              style={{ backgroundColor: YELLOW, color: '#292524' }}
                            >
                              <span className="text-xs">✓</span>
                            </button>
                          </div>
                        )}
                        
                        {!isEditingQty && (
                          <button 
                            onClick={() => deleteItem(item.id)} 
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90" 
                            style={{ color: '#a8a29e' }}
                          >
                            <span className="text-lg font-light">×</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      {/* Pending delete undo toasts */}
      {pendingDeletes.map((pending, index) => (
        <div 
          key={pending.id}
          className="fixed left-4 right-4 flex justify-center fade-in z-40"
          style={{ bottom: `${80 + index * 50}px` }}
        >
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-full shadow-lg"
            style={{
              backgroundColor: darkMode ? theme.bgSecondary : theme.text,
              color: darkMode ? theme.text : theme.bg,
              border: darkMode ? `1px solid ${theme.border}` : 'none',
            }}
          >
            <span className="text-sm">Removing "{pending.name}"</span>
            <button 
              onClick={() => undoPendingDelete(pending.id)}
              className="text-sm font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: YELLOW, color: '#292524' }}
            >
              Undo
            </button>
          </div>
        </div>
      ))}

      {/* Quick Add FAB — hidden while input bar is open */}
      {addMode === 'quick-add' && activeTab === 'list' && listId && !fabOpen && (
        <button
          onClick={() => { triggerHaptic('light'); setFabOpen(true); }}
          style={{
            position: 'fixed',
            bottom: isDesktop ? 24 : 88,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: YELLOW,
            border: 'none',
            boxShadow: theme.yellowGlow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            cursor: 'pointer',
            transition: 'transform 0.1s',
            padding: 0,
            lineHeight: 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      )}

      {/* Quick Add Input Bar */}
      {fabOpen && addMode === 'quick-add' && (
        <div
          className="fab-area"
          style={{
            position: 'fixed',
            bottom: isDesktop ? 0 : 64,
            left: isDesktop ? 88 : 0,
            right: 0,
            backgroundColor: theme.bg,
            borderTop: `1px solid ${theme.border}`,
            paddingTop: 8,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: isDesktop ? 12 : 'calc(12px + env(safe-area-inset-bottom, 0px))',
            zIndex: 45,
            animation: 'fabSlideUp 250ms ease-out',
          }}
        >
          {/* Dismiss row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button
              onClick={() => { setFabOpen(false); setFabInput(''); setFabNoMatchMode(false); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.textSecondary,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          {/* Input row */}
          <div className="flex items-center gap-3" style={{ marginBottom: fabNoMatchMode ? 0 : 4 }}>
            <input
              ref={fabInputRef}
              type="text"
              value={fabInput}
              onChange={(e) => { setFabInput(e.target.value); setFabNoMatchMode(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleFabAdd(); if (e.key === 'Escape') { setFabOpen(false); setFabInput(''); setFabNoMatchMode(false); } }}
              placeholder="What do you need?"
              className="flex-1 py-2 text-sm focus:outline-none bg-transparent"
              style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}
            />
            <button
              onClick={handleFabAdd}
              disabled={!fabInput.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-full transition-all active:scale-95"
              style={{ backgroundColor: fabInput.trim() ? YELLOW : 'transparent', color: '#292524', opacity: fabInput.trim() ? 1 : 0.3 }}
            >
              Add
            </button>
          </div>
          {/* Category chip picker for no-match */}
          {fabNoMatchMode && (
            <div className="fade-in" style={{ marginTop: 10, overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
              {visibleCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleChipSelect(cat.id)}
                  className="transition-all active:scale-95"
                  style={{
                    display: 'inline-block',
                    backgroundColor: theme.bgTertiary,
                    color: theme.text,
                    fontSize: 12,
                    borderRadius: 9999,
                    padding: '6px 14px',
                    border: `1.5px solid ${theme.border}`,
                    marginRight: 8,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Long-press reassign bottom sheet */}
      {longPressItem && addMode === 'quick-add' && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setLongPressItem(null)}>
          <div
            className="w-full max-h-[75vh] rounded-t-3xl overflow-hidden flex flex-col"
            style={{ backgroundColor: theme.bg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center" style={{ marginTop: 12, marginBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: theme.border }} />
            </div>
            <div className="px-5 py-3 border-b flex-shrink-0" style={{ borderColor: theme.border }}>
              <h2 className="text-base font-semibold" style={{ color: theme.text }}>Move to...</h2>
            </div>
            <div className="overflow-y-auto p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
              {visibleCategories.map((cat) => {
                const isCurrent = cat.id === longPressItem.category;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleLongPressReassign(longPressItem, cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all active:scale-[0.98]"
                    style={{
                      backgroundColor: isCurrent ? (darkMode ? '#3f3f46' : '#fefce8') : theme.bgSecondary,
                      border: isCurrent ? `1.5px solid ${YELLOW}` : '1.5px solid transparent'
                    }}
                  >
                    <span className="flex-1 text-left text-sm font-medium" style={{ color: theme.text }}>{cat.name}</span>
                    {isCurrent && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12l6 6L20 6"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {!isDesktop && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />}
    </div>
  );
}
