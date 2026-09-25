import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, getDoc, collection, getDocs } from 'firebase/firestore';
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

// ── Responsive breakpoints ──
// Desktop is a real canvas (sidebar + multi-column grids); anything narrower
// keeps the phone layout untouched. Detected with matchMedia, same as the
// system dark-mode preference above it.
const DESKTOP_QUERY = '(min-width: 1024px)';
const WIDE_QUERY = '(min-width: 1440px)';
const SIDEBAR_WIDTH = 264;

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
    'aubergine', 'aubergines', 'dill', 'edamame', 'eggplant', 'fennel', 'figs', 'fruit', 'fruit salad',
    'garlic', 'ginger', 'grapes', 'green beans', 'green onion', 'green onions',
    'green pepper', 'herbs', 'honeydew', 'jalapeño', 'jalapeños', 'kale',
    'kiwi', 'kiwis', 'leek', 'leeks', 'lemon', 'lemons', 'lemongrass',
    'lemon juice', 'lettuce', 'lime', 'lime juice', 'limes', 'mandarin', 'mandarins', 'mango', 'mangoes',
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
    'antipasto', 'baba ganoush', 'chorizo', 'cooked chicken',
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
    'bacon', 'beef', 'beef mince', 'chicken', 'chicken breast',
    'chicken drumsticks', 'chicken pieces', 'chicken thighs', 'chicken wings',
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
    'mixed beans', 'mushy peas', 'passata', 'tomato purée', 'peaches canned',
    'pineapple canned', 'soup', 'sweetcorn', 'tinned fruit',
    'tinned peaches', 'tinned tomatoes', 'tomato paste', 'tomato puree',
    'tuna', 'tuna tinned'
  ],
  'sauces-condiments': [
    'barbecue sauce', 'bbq sauce', 'beef stock', 'bouillon', 'broth',
    'brown sauce', 'chicken stock', 'chilli sauce',
    'chutney', 'cooking sauce', 'cranberry sauce', 'curry paste',
    'curry sauce', 'fish sauce', 'gravy', 'gravy granules', 'harissa',
    'hoisin sauce', 'horseradish', 'hot sauce', 'ketchup', 'mayo',
    'mayonnaise', 'mint sauce', 'mustard', 'olive oil', 'oyster sauce',
    'pasta sauce', 'pesto', 'pickle', 'relish', 'salad cream',
    'salad dressing', 'salsa', 'soy sauce', 'sriracha', 'stir fry sauce',
    'fish stock', 'stock', 'stock cube', 'stock cubes', 'stock pot', 'stock pots',
    'vegetable stock',
    'sweet chilli sauce', 'tabasco', 'tahini', 'tartar sauce',
    'teriyaki sauce', 'tomato ketchup', 'tomato sauce', 'vinaigrette',
    'vinegar', 'worcestershire sauce'
  ],
  'spices-seasonings': [
    'all spice', 'basil dried', 'bay leaves', 'black pepper', 'cardamom', 'cayenne pepper', 'chilli flakes',
    'chilli powder', 'chinese five spice', 'cinnamon', 'cloves',
    'coriander ground', 'cumin', 'curry powder', 'fennel seeds',
    'garam masala', 'garlic granules', 'garlic powder', 'ground ginger',
    'herbs dried', 'italian seasoning', 'mixed herbs', 'mixed spice',
    'nutmeg', 'onion powder', 'oregano', 'paprika', 'parsley dried',
    'pepper', 'peppercorns', 'rosemary dried', 'saffron', 'sage dried',
    'salt', 'sea salt', 'seasoning', 'smoked paprika', 'star anise',
    'thyme dried', 'turmeric', 'vanilla essence',
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

// Lowercase and strip accents (NFD, then drop the combining marks), so
// "purée" and "puree" are the same word to the matcher.
const normaliseForMatch = (text) => String(text || '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .trim();

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Pre-sort longest-first at module level so matching is fast at runtime.
// Each keyword matches as a whole word — bounded by the ends of the text or a
// non-letter, with an optional plural "s" or "es" — so "aubergine" no longer
// contains "gin" and lands in Alcohol.
const SORTED_DICTIONARY = Object.entries(CATEGORY_DICTIONARY)
  .flatMap(([categoryId, keywords]) => keywords.map(kw => {
    const keyword = normaliseForMatch(kw);
    return {
      keyword,
      categoryId,
      pattern: new RegExp(`(?:^|[^a-z])${escapeRegExp(keyword)}(?:s|es)?(?=$|[^a-z])`)
    };
  }))
  .sort((a, b) => b.keyword.length - a.keyword.length);

// Dictionary step only: no per-device corrections, so it stays pure.
const matchDictionary = (text) => {
  const normalised = normaliseForMatch(text);
  if (!normalised) return null;
  return SORTED_DICTIONARY.find(entry => entry.pattern.test(normalised)) || null;
};

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

  // 2. Check keyword dictionary (longest whole-word match wins, already sorted)
  const entry = matchDictionary(normalised);
  if (entry) return { categoryId: entry.categoryId, source: 'dictionary' };

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

// ── Ingredient lines ──────────────────────────────────────────────────────
// One line of a recipe — typed by hand, or scraped from a recipe site — is
// split into the thing you'd buy, how many to buy (the ×N), and a note that
// keeps the amount, unit, size and preparation for reference. Notes never
// reach the shopping list.
const UNICODE_FRACTIONS = { '½': 1 / 2, '¼': 1 / 4, '¾': 3 / 4, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 1 / 8 };
const FRACTION_CHARS = Object.keys(UNICODE_FRACTIONS).join('');
// 1½ · 1 ½ · 1 1/2 · 1/2 · 1.5 · 2 · ½
const NUMBER_SRC = `(?:\\d+(?:\\.\\d+)?\\s?[${FRACTION_CHARS}]|\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|[${FRACTION_CHARS}])`;
// An amount, optionally a range: 2-3 · 2–3 · 2 to 3. Group 1 is the low end,
// group 2 the separator as typed, group 3 the high end.
const AMOUNT_RE = new RegExp(`^(${NUMBER_SRC})(?:(\\s*[-–—]\\s*|\\s+to\\s+)(${NUMBER_SRC}))?`, 'i');

const byLengthDesc = (words) => [...words].sort((a, b) => b.length - a.length).join('|');
const MEASURE_UNITS = byLengthDesc([
  'g', 'kg', 'mg', 'ml', 'l', 'litre', 'litres', 'liter', 'liters', 'cl',
  'tsp', 'tsps', 'tbsp', 'tbsps', 'teaspoon', 'teaspoons', 'tablespoon', 'tablespoons',
  'cup', 'cups', 'oz', 'lb', 'lbs', 'pint', 'pints'
]);
const PACK_UNITS = byLengthDesc([
  'tin', 'tins', 'can', 'cans', 'jar', 'jars', 'pack', 'packs', 'packet', 'packets',
  'bag', 'bags', 'bottle', 'bottles', 'carton', 'cartons', 'pot', 'pots'
]);
const SIZE_WORDS = 'large|medium|small|heaped';
// Straight after the amount: an optional size word, then a unit. Glued units
// ("400g") count, and a unit is never the start of a longer word ("large").
const UNIT_AFTER_AMOUNT_RE = new RegExp(`^\\s*(?:(?:${SIZE_WORDS})\\s+)?(?:(${MEASURE_UNITS})|(${PACK_UNITS}))\\.?(?![a-z])`, 'i');
const PACK_AFTER_MEASURE_RE = new RegExp(`^\\s+(?:${PACK_UNITS})(?![a-z])`, 'i');
// "400g tins" in a note is the size of the pack, not an amount to scale.
const PACK_SIZE_NOTE_RE = new RegExp(`^\\s*(?:${MEASURE_UNITS})\\.?\\s+(?:${PACK_UNITS})(?![a-z])`, 'i');
const SIZE_BEFORE_NAME_RE = new RegExp(`^(${SIZE_WORDS})\\s+`, 'i');
// Measuring part of something: "3 garlic cloves" is one bulb of garlic.
const PART_OF_RE = /(?:\b(an?)\s+)?\b(cloves?|sprigs?|rashers?|slices?|sticks?|leaf|leaves|sheets?|pinch(?:es)?|dash(?:es)?|handfuls?|bunch(?:es)?|knobs?|drizzle|splash)\b(?:\s+of\b)?/i;
const SERVING_PHRASES_RE = /\b(to taste|optional|to serve|for frying)\b/gi;
const LEADING_PHRASE_RE = /^(zest and juice of|juice and zest of|juice of|zest of)\s+/i;
const MULTIPLIER_RE = /^(\d+)\s*[x×](?:\s+|(?=\d))/i;

const parseAmountValue = (text) => {
  const s = String(text || '').trim();
  let m = s.match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s?([${FRACTION_CHARS}])$`));
  if (m) return parseFloat(m[1]) + UNICODE_FRACTIONS[m[2]];
  m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) + (Number(m[3]) ? Number(m[2]) / Number(m[3]) : 0);
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return Number(m[2]) ? Number(m[1]) / Number(m[2]) : 0;
  if (UNICODE_FRACTIONS[s] !== undefined) return UNICODE_FRACTIONS[s];
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const tidySpaces = (text) => String(text || '').replace(/\s+/g, ' ').trim();
const capitaliseFirst = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

// Index of the first comma that isn't inside brackets, or -1.
const firstTopLevelComma = (text) => {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) return i;
  }
  return -1;
};

const parseIngredientLine = (text) => {
  const original = tidySpaces(text);
  if (!original) return { name: '', quantity: 1, note: '' };
  const fallback = { name: capitaliseFirst(original), quantity: 1, note: '' };

  let rest = original;
  const leadParts = [];
  const noteParts = [];

  // "Juice of 1 lemon" — the lemon is what you buy.
  let m = rest.match(LEADING_PHRASE_RE);
  if (m) {
    leadParts.push(m[1].toLowerCase());
    rest = rest.slice(m[0].length);
  }

  // "2 x 400g tins": the multiplier is the ×N, the rest is the note.
  let multiplier = null;
  m = rest.match(MULTIPLIER_RE);
  if (m) {
    multiplier = clampNum(1, parseInt(m[1], 10), 20);
    rest = rest.slice(m[0].length);
  }

  // Preparation after the first comma is kept whole.
  const commaAt = firstTopLevelComma(rest);
  let head = commaAt >= 0 ? rest.slice(0, commaAt) : rest;
  const preparation = commaAt >= 0 ? tidySpaces(rest.slice(commaAt + 1)) : '';

  // Leading amount, its unit, a pack word after a weight ("400g tin"), and
  // a bracket straight after the unit ("100g (3½oz)").
  let amountText = '';
  let amountValue = null;
  let hasUnit = false;
  m = head.match(AMOUNT_RE);
  if (m) {
    amountValue = parseAmountValue(m[3] || m[1]);
    let consumed = m[0];
    const unit = head.slice(consumed.length).match(UNIT_AFTER_AMOUNT_RE);
    if (unit) {
      hasUnit = true;
      consumed += unit[0];
      if (unit[1]) {
        const pack = head.slice(consumed.length).match(PACK_AFTER_MEASURE_RE);
        if (pack) consumed += pack[0];
      }
      const bracket = head.slice(consumed.length).match(/^\s*\([^)]*\)/);
      if (bracket) consumed += bracket[0];
    }
    amountText = tidySpaces(consumed);
    head = head.slice(consumed.length);
  }

  // "2 large eggs": the size goes to the note, the eggs are what you buy.
  head = head.trimStart();
  let sizeWord = '';
  m = head.match(SIZE_BEFORE_NAME_RE);
  if (m) {
    sizeWord = m[1].toLowerCase();
    head = head.slice(m[0].length);
  }

  // Anything else in brackets, and the serving phrases, are notes too.
  const bracketParts = [];
  head = head.replace(/\(([^)]*)\)/g, (_, inner) => {
    if (tidySpaces(inner)) bracketParts.push(tidySpaces(inner));
    return ' ';
  });
  const phraseParts = [];
  head = head.replace(SERVING_PHRASES_RE, (phrase) => {
    phraseParts.push(phrase.toLowerCase());
    return ' ';
  });

  // Part-of words. The word stays in the name when taking it out would
  // leave nothing, or would stop the name matching an aisle it matches
  // with the word in ("bay leaves", "cloves").
  let partOf = false;
  let partWordText = '';
  let partMerged = false;
  m = head.match(PART_OF_RE);
  if (m) {
    partOf = true;
    const stripped = tidySpaces(head.slice(0, m.index) + ' ' + head.slice(m.index + m[0].length));
    const keepWord = !stripped || (!matchDictionary(stripped) && matchDictionary(head));
    if (!keepWord) {
      head = stripped;
      const word = m[2].toLowerCase();
      if (amountText && !hasUnit && multiplier === null) {
        amountText = `${amountText} ${word}`;
        partMerged = true;
      } else if (!amountText && m[1]) {
        partWordText = `${m[1].toLowerCase()} ${word}`;
      } else {
        partWordText = word;
      }
    }
  }

  let name = tidySpaces(head).replace(/^of\s+/i, '').replace(/^[\s,.;:–—-]+|[\s,.;:–—-]+$/g, '');
  if (!name) return fallback;
  name = capitaliseFirst(name);

  let quantity = 1;
  if (multiplier !== null) quantity = multiplier;
  else if (partOf || hasUnit) quantity = 1;
  else if (amountValue !== null) quantity = clampNum(1, Math.ceil(amountValue - 1e-9), 20);

  // A plain count is the ×N, so it only reaches the note when a unit, a
  // part-of word or a multiplier says it measures something.
  const amountInNote = amountText && (hasUnit || partMerged || multiplier !== null || partOf);
  noteParts.push(...leadParts);
  if (amountInNote) noteParts.push(amountText);
  if (sizeWord) noteParts.push(sizeWord);
  if (partWordText) noteParts.push(partWordText);
  noteParts.push(...bracketParts, ...phraseParts);
  if (preparation) noteParts.push(preparation);

  return { name, quantity, note: noteParts.join(', ') };
};

// ── Serving scaler ────────────────────────────────────────────────────────
// ×N always rounds up: nobody buys 1.5 onions. The small epsilon stops
// float noise (3 × 7/3 = 7.000000001) from buying one too many.
const scaleIngredientQuantity = (quantity, factor = 1) =>
  Math.max(1, Math.ceil((Number(quantity) || 1) * factor - 1e-9));

// Below ten, to the nearest quarter; ten and above, to the whole number.
const formatScaledAmount = (value) => {
  if (value >= 10) return String(Math.round(value));
  const quarters = Math.max(1, Math.round(value * 4));
  const whole = Math.floor(quarters / 4);
  const fraction = ['', '¼', '½', '¾'][quarters % 4];
  return whole ? `${whole}${fraction}` : fraction;
};

// Scales only the first amount at the start of a note (both ends of a
// range), leaving the rest as typed. A pack size ("400g tins") is not an
// amount — the count of tins is already in ×N.
const scaleIngredientNote = (note, factor = 1) => {
  const text = String(note || '');
  if (!text || factor === 1) return text;
  const m = text.match(AMOUNT_RE);
  if (!m) return text;
  const after = text.slice(m[0].length);
  if (PACK_SIZE_NOTE_RE.test(after)) return text;
  const low = formatScaledAmount(parseAmountValue(m[1]) * factor);
  const scaled = m[3] ? `${low}${m[2]}${formatScaledAmount(parseAmountValue(m[3]) * factor)}` : low;
  return scaled + after;
};

// A recipe's saved servings, or null when it has none (or something invalid).
const recipeServings = (recipe) => {
  const servings = recipe?.servings;
  return Number.isInteger(servings) && servings >= 1 && servings <= 50 ? servings : null;
};

// ─────────────────────────────────────────────────────────────
// Morning Paper theme — light and dark variants of the same
// stone palette. Yellow keeps its three jobs in both: signal,
// primary action, progress. `ink` is the strong foreground and
// flips to near-paper in dark; anything sitting ON yellow stays
// literal #1c1917 (yellow is a light surface in both themes).
// ─────────────────────────────────────────────────────────────
const INK = '#1c1917';
const PAPER = '#fafaf9';
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const THEMES = {
  light: {
    bg: PAPER,
    bgSecondary: '#fff',
    bgTertiary: '#f5f5f4',
    ink: INK,
    text: '#292524',
    textSecondary: '#78716c',
    textTertiary: '#a8a29e',
    border: '#e7e5e4',
    borderLight: '#f5f5f4',
    accentOnInk: '#FACC15',
    overlay: 'rgba(28,25,23,0.5)',
    cardShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    yellowGlow: '0 4px 20px rgba(250,204,21,0.35)',
  },
  dark: {
    bg: '#161312',
    bgSecondary: '#221e1c',
    bgTertiary: '#2b2624',
    ink: '#f5f4f2',
    text: '#d6d3d1',
    textSecondary: '#a8a29e',
    textTertiary: '#78716c',
    border: '#352f2c',
    borderLight: '#2b2624',
    accentOnInk: '#1c1917',
    overlay: 'rgba(0,0,0,0.6)',
    cardShadow: '0 2px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
    yellowGlow: '0 4px 20px rgba(250,204,21,0.2)',
  },
};

const generateId = () => Math.random().toString(36).substr(2, 9);
// Math.random().toString(36).substr(2, 6) can return fewer than 6 characters
// (some fractions have a short base-36 representation), silently shrinking
// the keyspace and producing shorter, inconsistent-looking codes. Sample
// exactly 6 characters from a fixed alphabet instead so every code is full
// length and every character is uniformly likely.
const LIST_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateListCode = () => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += LIST_CODE_CHARS[Math.floor(Math.random() * LIST_CODE_CHARS.length)];
  }
  return code;
};

// ── Completed shops (trips) ───────────────────────────────────────────────
// Every finished shop is written once to lists/{listId}/trips/{tripId}.
// Trips are append-only: the rules allow create and deny update/delete, so a
// record can never be clobbered by a later write from another phone.

// 32-bit FNV-1a. Deterministic across devices — two phones finishing the
// same shop must derive the same trip ID, so the second create is denied
// rather than producing a duplicate record of one shop.
const fnv1a32 = (str) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // hash * 16777619, kept in 32-bit unsigned range
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
};

// trip_<YYYYMMDDHHmm>_<base36 hash of the ticked item ids>
// The timestamp is truncated to the minute (not rounded) so two devices a
// few seconds apart still agree.
const buildTripId = (finishedAtIso, tickedItems) => {
  const minute = finishedAtIso.slice(0, 16).replace(/[-:T]/g, '');
  const fingerprint = tickedItems.map((i) => String(i.id)).sort().join('|');
  return `trip_${minute}_${fnv1a32(fingerprint).toString(36)}`;
};

// Counts are validated as `int` by the rules, which is a different type from
// `float` in Firestore — anything non-integer or non-finite is coerced here
// rather than being rejected at write time.
const asInt = (value, fallback = 0) => {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) ? n : fallback;
};

// Build the trip document from the items that are ticked right now.
// `categoryName` is snapshotted on purpose: renaming or deleting an aisle
// later must not rewrite the history of shops already done.
const buildTrip = (tickedItems, categories, finishedAtIso, durationMinutes, storeLayout) => {
  const categoryNames = new Map((categories || []).map((c) => [c.id, c.name]));
  const lines = tickedItems.map((item) => {
    const categoryId = String(item.category || '');
    return {
      name: String(item.name || ''),
      categoryId,
      categoryName: String(categoryNames.get(categoryId) || categoryId || 'Other'),
      quantity: Math.max(1, asInt(item.quantity, 1))
    };
  });

  const trip = {
    finishedAt: finishedAtIso,
    itemCount: Math.min(5000, lines.reduce((sum, line) => sum + line.quantity, 0)),
    lineCount: lines.length,
    aisleCount: Math.min(50, new Set(lines.map((l) => l.categoryId)).size),
    lines
  };

  // Optional fields are omitted rather than written as null/undefined —
  // the rules only type-check them when present.
  if (Number.isFinite(durationMinutes)) trip.durationMinutes = Math.max(0, asInt(durationMinutes));
  if (storeLayout?.id) trip.storeLayoutId = String(storeLayout.id);
  if (storeLayout?.name) trip.storeName = String(storeLayout.name);

  return trip;
};

// How long we give the server to confirm the trip write before falling back
// to Firestore's local acknowledgement. Offline (a supermarket basement is
// the normal case, not an edge case) the promise stays pending until the
// device reconnects, and blocking the list clear behind it would wedge the
// UI mid-shop.
const TRIP_SERVER_ACK_MS = 4000;

const triggerHaptic = (style = 'light') => {
  if (navigator.vibrate) {
    navigator.vibrate(style === 'success' ? [10, 50, 20] : style === 'light' ? 10 : 5);
  }
};

// Viewport predicate as a subscription rather than a resize listener, so a
// breakpoint crossing re-renders once instead of on every resize frame.
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const handler = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

// ─────────────────────────────────────────────────────────────
// First-run walkthrough
//
// A fullscreen layer with three fixed regions: header, viewport,
// footer. Only the track inside the viewport moves, so the slide
// animates instead of jumping. Every card teaches with a real
// fragment of the interface rather than an illustration of one,
// which is why the specimens below reuse TrailHome, FinishGlyph,
// StatCard and SyncPill instead of redrawing them.
// ─────────────────────────────────────────────────────────────

// A specimen is a fixed picture of a piece of the app. Nothing here is
// interactive and nothing reads live state: the copy beside it does the
// explaining, so the whole thing is hidden from assistive technology.
const ObSpecimen = ({ children }) => (
  <div
    className="bc-ob-specimen"
    aria-hidden="true"
    style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
  >
    {children}
  </div>
);

// The app's own card: secondary paper, hairline border, soft shadow.
const ObCard = ({ t, children, style }) => (
  <div
    style={{
      width: 300, maxWidth: '100%', boxSizing: 'border-box', textAlign: 'left',
      backgroundColor: t.bgSecondary, border: `1.5px solid ${t.border}`,
      borderRadius: 20, boxShadow: t.cardShadow, padding: 18,
      ...style
    }}
  >
    {children}
  </div>
);

const ObTick = ({ color, size = 15, width = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l6 6L20 6" />
  </svg>
);

const ObCaption = ({ t, weight = 600, children }) => (
  <p style={{ fontSize: 12.5, fontWeight: weight, lineHeight: 1.4, color: t.textSecondary, margin: '14px 0 0', textAlign: 'center' }}>
    {children}
  </p>
);

const obEyebrow = (t) => ({
  fontSize: 11, fontWeight: 700, letterSpacing: '0.13em',
  textTransform: 'uppercase', color: t.textSecondary
});

// An unticked item ring, at the size the aisle list draws it.
const ObRing = ({ t, size = 18 }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box', border: `2px solid ${t.ink}` }} />
);

// Crumbs plus the house that closes them. The house is unlit here on
// purpose: an unfinished trail has an unlit house, which is what TrailHome
// draws when lit is false.
const ObTrail = ({ t, dots, size = 13, houseSize = 30 }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    {dots.map((filled, i) => (
      <span
        key={i}
        style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
          backgroundColor: filled ? YELLOW : 'transparent',
          border: filled ? '2px solid transparent' : `2px solid ${t.textTertiary}`
        }}
      />
    ))}
    <span style={{ display: 'flex', marginLeft: 4 }}><TrailHome lit={false} t={t} size={houseSize} /></span>
  </span>
);

// Card 19 is the one place the opposite theme's tokens are used
// deliberately, because it has to show both palettes at once.
const ObPaletteSnapshot = ({ palette, label }) => (
  <div style={{ width: 130, borderRadius: 18, padding: 14, backgroundColor: palette.bg, border: `1.5px solid ${palette.border}`, boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: YELLOW }} />
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '-0.01em', color: palette.ink, marginLeft: 3 }}>Breadcrumbs</span>
    </div>
    <div style={{ height: 7, borderRadius: 9999, backgroundColor: palette.bgTertiary, marginBottom: 7 }} />
    <div style={{ height: 7, width: '70%', borderRadius: 9999, backgroundColor: palette.bgTertiary, marginBottom: 14 }} />
    <div style={{ height: 24, borderRadius: 9999, backgroundColor: YELLOW }} />
    <div style={{ ...obEyebrow(palette), textAlign: 'center', marginTop: 12 }}>{label}</div>
  </div>
);

// The twenty cards. Copy only: the picture beside each one is chosen by
// index in ObSpecimenFor below.
const OB_CARDS = [
  {
    kicker: 'Welcome',
    title: 'Breadcrumbs',
    hero: true,
    lede: 'Never get lost in the aisles again.',
    body: 'A shopping list that sorts itself into aisles, keeps everyone in the house on the same list, and remembers every shop you finish. Give this two minutes and you will know where all of it lives.'
  },
  {
    kicker: 'The list',
    title: 'Add it the moment you think of it',
    body: 'Tap the yellow button, type what you need, and it lands on the list. No picking a category, no second screen. Add the same thing twice and it counts up rather than appearing twice.'
  },
  {
    kicker: 'The list',
    title: 'Every item finds its aisle',
    body: 'Breadcrumbs recognises around nine hundred grocery words, so milk goes to Dairy and coriander goes to Fruits and Vegetables without you saying so. Twenty aisles, in the order a supermarket actually runs.'
  },
  {
    kicker: 'The list',
    title: 'Correct it once and it stays corrected',
    body: 'Something in the wrong aisle? Hold your finger on it and choose where it belongs. Breadcrumbs remembers that choice, so the next time you add it the fix is already in place.'
  },
  {
    kicker: 'The list',
    title: 'Two of something, not two lines',
    body: 'Tap the number beside an item to change how many you need. Quantities carry through to your aisle totals and into your history, so a big shop reads as a big shop.'
  },
  {
    kicker: 'The list',
    title: 'Tidy the list as you go',
    body: 'Tap the eye to hide everything already in the trolley. What is left is all you really want to see when you are halfway round the shop.'
  },
  {
    kicker: 'Together',
    title: 'One list, everyone in the house',
    body: 'Every list has a six character code. Share it with whoever shops with you and they are in, with no account and no sign up. Add bread at home and it appears in their hand in the shop.'
  },
  {
    kicker: 'Together',
    title: 'No signal, no problem',
    body: 'Breadcrumbs keeps working in the far corner of the shop where your phone gives up. Tick things off, add things, carry on. The pill at the top reads Live or Offline, and everything you did syncs the moment you are back.'
  },
  {
    kicker: 'Your shops',
    title: 'A layout for every shop you use',
    body: 'Aisles run in a different order in every supermarket. Ten layouts are here already, from Tesco to Waitrose to Aldi. Pick the shop you are standing in and the whole list reorders to match the route you walk.'
  },
  {
    kicker: 'Your shops',
    title: 'Meals, not ingredients',
    body: 'Save a recipe once with everything it needs, then send the lot to your list in a single tap. There is a notes field too, for where the recipe actually lives, like page 74 of the yellow cookbook.'
  },
  {
    kicker: 'The trail',
    title: 'The trail is the whole idea',
    body: 'Above your list is a row of crumbs, one for every item. Solid yellow means still to get. Each one hollows out as you tick it off, and when the last one goes the house at the end lights up. That is the shop done.'
  },
  {
    kicker: 'The trail',
    title: 'Tap the trail. There is more behind it.',
    body: 'The crumbs are a door, and almost nobody finds it. Behind them sits everything Breadcrumbs has quietly kept: what you buy, when you shop, and how today compared with last time.'
  },
  {
    kicker: 'Finishing',
    title: 'Finish the shop, not just the list',
    body: 'Once you are past halfway, the add button becomes Finish shop. Press it on the way to the car and Breadcrumbs writes that shop down: what you carried home, how many aisles, and how long you were in there.'
  },
  {
    kicker: 'Finishing',
    title: 'Home stocked',
    body: 'Every finished shop gets a screen of its own. Items, aisles, minutes in store, and one plain line comparing it with last time. Three seconds and it steps out of your way.'
  },
  {
    kicker: 'Your history',
    title: 'Where it all goes',
    body: 'Choose a week, a month or a year and Breadcrumbs says it in plain English. Three shops last month, and a hundred and twelve items carried home. Under that, the aisles you feed most and the day your shop really happens.'
  },
  {
    kicker: 'Your history',
    title: 'Every shop this year, in dots',
    body: 'Twelve columns, one for each month, and a crumb for every shop you finished. Tap any dot to open that shop again and see exactly what came home.'
  },
  {
    kicker: 'Your history',
    title: 'Milestones that arrive on their own',
    body: 'Fifty items carried home, then a hundred, then a thousand. Ten shops, then twenty five. They turn up when you finish the shop that crosses one, and the ones still ahead tell you how far you have to go.'
  },
  {
    kicker: 'The list',
    title: 'It learns what you usually buy',
    body: 'After a handful of shops, Breadcrumbs starts offering your usuals when the list is nearly empty. It leans on what you bought on this day of the week, because Thursday you and Saturday you buy different things.'
  },
  {
    kicker: 'Settings',
    title: 'Light, dark, or whatever your phone is doing',
    body: 'There is a full dark version of everything here. Choose light, choose dark, or let it follow your phone.'
  },
  {
    kicker: 'Ready',
    title: 'That is everything',
    lede: 'Start with one thing you need and let the trail take care of the rest.',
    body: '',
    note: 'You can walk through this again any time from Settings.'
  }
];

const OB_STORES = ["Tesco", "Sainsbury's", 'Aldi', 'Waitrose', 'Lidl', 'Co-op'];
const OB_WEEKDAY_SHADES = [1, 2, 1, 0, 1, 2, 1];
const OB_YEAR_COUNTS = [2, 1, 3, 2, 4, 2, 1, 3, 2, 2, 1, 3];

const ObSpecimenFor = ({ index, t, listCode }) => {
  switch (index) {
    // 1. The logo alone, still breathing.
    case 0:
      return (
        <ObSpecimen>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="breathe-1" style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: YELLOW }} />
            <div className="breathe-2" style={{ width: 54, height: 54, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
            <div className="breathe-3" style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
          </div>
        </ObSpecimen>
      );

    // 2. Quick add, and the aisle it landed in.
    case 1:
      return (
        <ObSpecimen>
          <div style={{ width: 300, maxWidth: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 7px 7px 15px', borderRadius: 9999, border: `1.5px solid ${t.border}`, backgroundColor: t.bgSecondary }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: t.ink }}>oat milk</span>
              <span style={{ padding: '9px 17px', borderRadius: 9999, backgroundColor: YELLOW, color: '#1c1917', fontSize: 13, fontWeight: 700 }}>Add</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 16 }}>
              <span style={obEyebrow(t)}>Dairy &amp; Eggs</span>
              <ObTick color={YELLOW} size={13} />
            </div>
          </div>
        </ObSpecimen>
      );

    // 3. Three aisles, sorted without being asked.
    case 2: {
      const aisles = [
        ['Fruits & Vegetables', ['Spinach', 'Lemons']],
        ['Bakery', ['Sourdough']],
        ['Dairy & Eggs', ['Butter']]
      ];
      return (
        <ObSpecimen>
          <ObCard t={t}>
            {aisles.map(([name, entries], i) => (
              <div key={name} style={{ marginTop: i === 0 ? 0 : 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ ...obEyebrow(t), whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ flex: 1, height: 1.5, backgroundColor: t.borderLight }} />
                </div>
                {entries.map((entry) => (
                  <div key={entry} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0 0' }}>
                    <ObRing t={t} />
                    <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: t.ink }}>{entry}</span>
                  </div>
                ))}
              </div>
            ))}
          </ObCard>
        </ObSpecimen>
      );
    }

    // 4. The long press sheet, top portion only.
    case 3: {
      const rows = [
        ['Sauces & Condiments', false],
        ['Spices & Seasonings', true],
        ['Snacks & Confectionery', false]
      ];
      return (
        <ObSpecimen>
          <ObCard t={t} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: `1.5px solid ${t.border}` }}>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.015em', color: t.ink }}>Move "bay leaves" to</span>
            </div>
            <div style={{ padding: '2px 18px 14px' }}>
              {rows.map(([name, current]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: `1.5px solid ${t.borderLight}` }}>
                  <span style={{ fontSize: 15, fontWeight: current ? 700 : 600, color: t.ink }}>{name}</span>
                  {current && <ObTick color={YELLOW} size={17} />}
                </div>
              ))}
            </div>
          </ObCard>
        </ObSpecimen>
      );
    }

    // 5. The quantity editor, open, exactly as the aisle row draws it.
    case 4:
      return (
        <ObSpecimen>
          <ObCard t={t}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box', border: `2.5px solid ${t.ink}` }} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap', color: t.ink }}>Tinned soup</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: t.bgTertiary, color: t.ink, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</span>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, width: 24, textAlign: 'center', color: t.ink }}>3</span>
                <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: t.bgTertiary, color: t.ink, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</span>
                <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: YELLOW, marginLeft: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ObTick color="#1c1917" size={13} width={3.4} />
                </span>
              </span>
            </div>
          </ObCard>
          <ObCaption t={t}>At rest it is just <span style={{ fontFamily: MONO, fontWeight: 700 }}>&times;3</span></ObCaption>
        </ObSpecimen>
      );

    // 6. Hide done: off, then on.
    case 5:
      return (
        <ObSpecimen>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: t.bgTertiary, color: t.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <span style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: t.ink, color: t.accentOnInk, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </span>
          </div>
        </ObSpecimen>
      );

    // 7. The share code.
    case 6:
      return (
        <ObSpecimen>
          <div style={{ padding: '12px 26px', borderRadius: 9999, border: `2px solid ${t.ink}`, color: t.ink, fontFamily: MONO, fontSize: 24, fontWeight: 700, letterSpacing: '0.16em' }}>
            {listCode || 'ABC123'}
          </div>
          <ObCaption t={t}>Two people on this list</ObCaption>
        </ObSpecimen>
      );

    // 8. The real sync pill, both states.
    case 7:
      return (
        <ObSpecimen>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SyncPill isOnline t={t} />
            <SyncPill isOnline={false} t={t} />
          </div>
        </ObSpecimen>
      );

    // 9. Store layouts.
    case 8:
      return (
        <ObSpecimen>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 300 }}>
            {OB_STORES.map((store, i) => (
              <span
                key={store}
                style={{
                  padding: '10px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 700,
                  backgroundColor: i === 0 ? YELLOW : t.bgTertiary,
                  color: i === 0 ? '#1c1917' : t.textSecondary,
                  boxShadow: i === 0 ? t.yellowGlow : 'none'
                }}
              >
                {store}
              </span>
            ))}
          </div>
        </ObSpecimen>
      );

    // 10. A saved recipe.
    case 9:
      return (
        <ObSpecimen>
          <ObCard t={t}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: t.ink }}>Sunday Roast</span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: t.ink }}>11</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: t.textSecondary, margin: '6px 0 14px' }}>pg 74, yellow cookbook</p>
            <div style={{ height: 44, borderRadius: 9999, backgroundColor: YELLOW, color: '#1c1917', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Add all to list
            </div>
          </ObCard>
        </ObSpecimen>
      );

    // 11. The trail itself, four ticked off.
    case 10:
      return (
        <ObSpecimen>
          <ObTrail t={t} dots={[false, false, false, false, true, true, true, true, true]} />
          <ObCaption t={t}>Five of nine still to get</ObCaption>
        </ObSpecimen>
      );

    // 12. The same trail as a door.
    case 11:
      return (
        <ObSpecimen>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 20, backgroundColor: t.bgSecondary, border: `1.5px solid ${YELLOW}`, boxShadow: t.yellowGlow }}>
            <ObTrail t={t} dots={[false, false, true, true, true, true]} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <ObCaption t={t} weight={700}>Tap</ObCaption>
        </ObSpecimen>
      );

    // 13. The add button once it has become Finish shop.
    case 12:
      return (
        <ObSpecimen>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, padding: '0 26px', borderRadius: 9999, backgroundColor: YELLOW, color: '#1c1917', boxShadow: t.yellowGlow }}>
            <FinishGlyph finishing color="#1c1917" />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Finish shop</span>
          </div>
          <ObCaption t={t}>Appears once you are past halfway</ObCaption>
        </ObSpecimen>
      );

    // 14. The house lit, and the shop written down.
    case 13:
      return (
        <ObSpecimen>
          <TrailHome lit t={t} size={62} />
          <div style={{ display: 'flex', gap: 8, width: 300, maxWidth: '100%', marginTop: 18 }}>
            <StatCard value="24" label="items" t={t} />
            <StatCard value="7" label="aisles" t={t} />
            <StatCard value="38m" label="in store" t={t} />
          </div>
          <ObCaption t={t}>Three fewer items than last shop, and six minutes quicker.</ObCaption>
        </ObSpecimen>
      );

    // 15. The two figures from the stats sheet.
    case 14: {
      const leaders = [['Dairy & Eggs', 10, 34], ['Fruits & Veg', 7, 24], ['Bakery', 4, 12]];
      return (
        <ObSpecimen>
          <ObCard t={t} style={{ padding: '16px 18px' }}>
            <h3 style={{ ...obEyebrow(t), fontSize: 11.5, margin: '0 0 10px' }}>Where it goes</h3>
            {leaders.map(([name, filled, count]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0' }}>
                <span style={{ width: 96, flexShrink: 0, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', color: t.ink }}>{name}</span>
                <span style={{ display: 'flex', gap: 3, flex: 1, minWidth: 0 }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, backgroundColor: i < filled ? YELLOW : t.border }} />
                  ))}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 600, color: t.textSecondary, minWidth: 24, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              {WEEKDAY_NAMES.map((day, i) => (
                <span key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.textTertiary }}>{day.charAt(0)}</span>
                  <span
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      backgroundColor: OB_WEEKDAY_SHADES[i] === 0 ? YELLOW : OB_WEEKDAY_SHADES[i] === 1 ? t.border : 'rgba(250,204,21,0.45)'
                    }}
                  />
                </span>
              ))}
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5, color: t.textSecondary, margin: '14px 0 0' }}>
              Thursday is your shop. Two thirds of everything lands then.
            </p>
          </ObCard>
        </ObSpecimen>
      );
    }

    // 16. The year, one crumb per shop.
    case 15:
      return (
        <ObSpecimen>
          <div style={{ display: 'flex', gap: 3, width: 300, maxWidth: '100%' }}>
            {MONTH_INITIALS.map((initial, m) => (
              <div key={m} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: t.textTertiary, marginBottom: 8 }}>{initial}</span>
                {Array.from({ length: 4 }).map((_, r) => (
                  <span
                    key={r}
                    style={{ width: 8, height: 8, borderRadius: '50%', marginBottom: 9, backgroundColor: r < OB_YEAR_COUNTS[m] ? YELLOW : t.bgTertiary }}
                  />
                ))}
              </div>
            ))}
          </div>
          <ObCaption t={t}>Twenty six shops so far. Tap a dot to open that one.</ObCaption>
        </ObSpecimen>
      );

    // 17. Two rungs of the milestone ladder.
    case 16: {
      const rungs = [
        { threshold: 100, achieved: true, detail: '14 March 2026' },
        { threshold: 250, achieved: false, detail: 'Sixty one items to go' }
      ];
      return (
        <ObSpecimen>
          <ObCard t={t}>
            {rungs.map((rung) => (
              <div key={rung.threshold} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0' }}>
                <span
                  style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: MONO, fontSize: 13, fontWeight: 600,
                    backgroundColor: rung.achieved ? YELLOW : t.bgTertiary,
                    color: rung.achieved ? '#1c1917' : t.textSecondary
                  }}
                >
                  {rung.threshold}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: rung.achieved ? t.ink : t.textSecondary }}>
                    {milestoneName('items', rung.threshold)}
                  </span>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.textSecondary, marginTop: 2 }}>{rung.detail}</span>
                </span>
              </div>
            ))}
          </ObCard>
        </ObSpecimen>
      );
    }

    // 18. Your usuals, offered back.
    case 17:
      return (
        <ObSpecimen>
          <ObCard t={t}>
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: t.ink, margin: 0 }}>You usually buy these</h3>
            <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5, color: t.textSecondary, margin: '6px 0 14px' }}>
              Milk has been on three of your last four Thursday shops.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {['Milk', 'Bananas', 'Coffee', 'Bin bags', 'Cheddar'].map((name) => (
                <span key={name} style={{ padding: '8px 14px', borderRadius: 9999, border: `2px dashed ${t.textTertiary}`, fontSize: 13, fontWeight: 600, color: t.text }}>
                  {name}
                </span>
              ))}
            </div>
          </ObCard>
        </ObSpecimen>
      );

    // 19. Both palettes at once.
    case 18:
      return (
        <ObSpecimen>
          <div style={{ display: 'flex', gap: 14 }}>
            <ObPaletteSnapshot palette={THEMES.light} label="Light" />
            <ObPaletteSnapshot palette={THEMES.dark} label="Dark" />
          </div>
        </ObSpecimen>
      );

    // 20. Done. Not the house: a lit house means a finished shop.
    default:
      return (
        <ObSpecimen>
          <div style={{ width: 118, height: 118, borderRadius: '50%', backgroundColor: 'rgba(250,204,21,0.18)', border: `1.5px solid ${YELLOW}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5l5.5 5.5L20 6" />
            </svg>
          </div>
        </ObSpecimen>
      );
  }
};

const OnboardingModal = ({ listCode, onComplete, t }) => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const total = OB_CARDS.length;
  const isLast = index === total - 1;

  const step = useCallback((delta) => {
    setIndex((i) => {
      const next = Math.min(total - 1, Math.max(0, i + delta));
      if (next !== i) triggerHaptic('light');
      return next;
    });
  }, [total]);

  const goNext = () => { if (isLast) onComplete(); else step(1); };
  const goBack = () => step(-1);
  const skip = () => { triggerHaptic('light'); onComplete(); };

  // Left and right walk the deck. Modifier combinations belong to the
  // browser, so they are left alone.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  // The list behind is still mounted, so hold it still while the layer is up.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) step(1);
    else if (diff < -50) step(-1);
    touchStartX.current = null;
  };

  return (
    <div
      role="region"
      aria-label="Welcome to Breadcrumbs"
      className="select-none"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: t.bg, fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex', flexDirection: 'column'
      }}
    >
      <style>{`
        .bc-ob-viewport { flex: 1 1 auto; min-height: 0; overflow: hidden; }
        .bc-ob-track { display: flex; height: 100%; width: 100%; transition: transform 320ms cubic-bezier(.2,.7,.3,1); }
        .bc-ob-screen { flex: 0 0 100%; min-width: 0; height: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 12px 22px; }
        .bc-ob-inner { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; width: 100%; max-width: 1000px; margin: auto; text-align: center; }
        .bc-ob-text { flex: 0 0 auto; min-width: 0; }
        .bc-ob-kicker { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.13em; color: ${t.textSecondary}; margin: 0 0 10px; }
        .bc-ob-title { font-size: clamp(28px, 7vw, 30px); font-weight: 800; line-height: 1.05; letter-spacing: -0.035em; color: ${t.ink}; margin: 0; }
        .bc-ob-title-hero { font-size: 40px; line-height: 1.02; letter-spacing: -0.02em; }
        .bc-ob-lede { font-size: 15px; font-weight: 700; color: ${t.text}; margin: 14px 0 0; }
        .bc-ob-body { font-size: 15px; font-weight: 500; line-height: 1.6; color: ${t.text}; max-width: 40ch; margin: 14px auto 0; }
        .bc-ob-note { font-size: 12.5px; font-weight: 500; line-height: 1.5; color: ${t.textSecondary}; max-width: 40ch; margin: 16px auto 0; }
        @media (min-width: 768px) {
          .bc-ob-inner { flex-direction: row; flex-wrap: wrap; gap: clamp(26px, 4vw, 60px); text-align: left; }
          /* Only once the columns sit side by side does the basis apply
             to the width; in the phone's column it would set a height. */
          .bc-ob-text { flex: 1 1 340px; }
          .bc-ob-title { font-size: clamp(30px, 5vw, 46px); }
          .bc-ob-title-hero { font-size: clamp(40px, 6vw, 56px); }
          .bc-ob-lede { font-size: 17px; }
          .bc-ob-body { font-size: 18px; max-width: 52ch; margin-left: 0; margin-right: 0; }
          .bc-ob-note { margin-left: 0; margin-right: 0; }
        }
        /* A phone on its side has no vertical room, so the ramp and the
           specimen come down rather than the screen scrolling. The shrink is
           zoom rather than a transform because it has to take the specimen's
           layout box down with it, not just its pixels. */
        @media (max-height: 520px) {
          .bc-ob-screen { padding: 10px 20px; }
          .bc-ob-inner { gap: 16px; }
          .bc-ob-kicker { margin-bottom: 6px; }
          .bc-ob-title, .bc-ob-title-hero { font-size: clamp(24px, 5vw, 30px); }
          .bc-ob-lede { font-size: 14px; margin-top: 8px; }
          .bc-ob-body { font-size: 13.5px; line-height: 1.5; margin-top: 8px; }
          .bc-ob-note { margin-top: 10px; }
          .bc-ob-specimen { zoom: 0.62; }
        }
        /* Below this there is no room for a picture at all: the words win. */
        @media (max-height: 420px) {
          .bc-ob-specimen { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bc-ob-track { transition: none; }
        }
      `}</style>

      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 'max(14px, env(safe-area-inset-top, 0px)) 22px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: YELLOW }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: YELLOW }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: YELLOW }} />
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em', color: t.ink }}>Breadcrumbs</span>
        </div>
        <button
          onClick={skip}
          className="bc-press"
          style={{
            height: 44, padding: '0 4px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, color: t.textSecondary,
            textDecoration: 'underline', textUnderlineOffset: 3,
            visibility: isLast ? 'hidden' : 'visible'
          }}
        >
          Skip
        </button>
      </div>

      <div className="bc-ob-viewport" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="bc-ob-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {OB_CARDS.map((card, i) => (
            <div
              key={card.title}
              className="bc-ob-screen"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
            >
              <div className="bc-ob-inner">
                <ObSpecimenFor index={i} t={t} listCode={listCode} />
                <div className="bc-ob-text">
                  <p className="bc-ob-kicker">{card.kicker}</p>
                  <h2 className={card.hero ? 'bc-ob-title bc-ob-title-hero' : 'bc-ob-title'}>{card.title}</h2>
                  {card.lede && <p className="bc-ob-lede">{card.lede}</p>}
                  {card.body && <p className="bc-ob-body">{card.body}</p>}
                  {card.note && <p className="bc-ob-note">{card.note}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: '0 0 auto', padding: '0 22px max(28px, calc(env(safe-area-inset-bottom, 0px) + 24px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
            {OB_CARDS.map((card, i) => (
              <span
                key={card.title}
                style={{
                  height: 6, width: i === index ? 22 : 8, borderRadius: 9999, flexShrink: 0,
                  backgroundColor: i === index ? YELLOW : t.border,
                  transition: 'width 200ms ease, background-color 200ms ease'
                }}
              />
            ))}
          </div>
          <span aria-live="polite" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: t.textTertiary, flexShrink: 0 }}>
            {index + 1} of {total}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={goBack}
            disabled={index === 0}
            className="bc-press"
            style={{
              flex: '0 1 112px', height: 54, borderRadius: 9999,
              border: `1.5px solid ${t.border}`, backgroundColor: 'transparent',
              fontSize: 13.5, fontWeight: 700, color: t.textSecondary,
              opacity: index === 0 ? 0.45 : 1
            }}
          >
            Back
          </button>
          <button
            onClick={goNext}
            className="bc-press bc-cta"
            style={{
              flexGrow: 1, height: 54, borderRadius: 9999, border: 'none',
              backgroundColor: YELLOW, color: '#1c1917', fontSize: 15, fontWeight: 700, cursor: 'pointer'
            }}
          >
            {isLast ? 'Start shopping' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Component
const Toast = ({ message, visible, t }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-6 left-4 right-4 flex justify-center z-50 fade-in">
      <div className="px-5 py-3 rounded-full text-sm font-semibold" style={{ backgroundColor: t.ink, color: t.bg, boxShadow: '0 8px 28px rgba(0,0,0,0.25)' }}>
        {message}
      </div>
    </div>
  );
};

// Bottom Navigation — full-width paper bar, a crumb above the active label
const BottomNav = ({ activeTab, onTabChange, t }) => {
  const tabs = [
    { id: 'list', label: 'List' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ backgroundColor: t.bg, borderTop: `1.5px solid ${t.border}` }}
    >
      <div style={{ display: 'flex', paddingTop: 11, paddingBottom: 'max(34px, calc(env(safe-area-inset-bottom, 0px) + 8px))' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { triggerHaptic('light'); onTabChange(tab.id); }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: isActive ? YELLOW : 'transparent', transition: 'background-color 0.2s ease' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? t.ink : t.textTertiary, transition: 'color 0.2s ease' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Nav glyphs — desktop only. The bottom bar keeps its crumb-and-label
// treatment untouched; a 264px rail has room for icons, the phone bar doesn't.
const NAV_ICON_PATHS = {
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M3.5 6l1.4 1.4L7.5 4.8" /><path d="M3.5 12l1.4 1.4 2.6-2.6" /><path d="M3.5 18l1.4 1.4 2.6-2.6" /></>,
  recipes: <><path d="M4 4.5A1.5 1.5 0 015.5 3H20v15.5H5.5A1.5 1.5 0 004 20V4.5z" /><path d="M4 17.5h16" /><path d="M9 7.5h6" /></>,
  settings: <><path d="M4 21v-6M4 11V3M12 21v-9M12 8V3M20 21v-4M20 13V3" /><path d="M1.5 15h5M9.5 8h5M17.5 17h5" /></>,
};

const NavIcon = ({ id, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'stroke 0.2s ease' }}>
    {NAV_ICON_PATHS[id]}
  </svg>
);

// Sync status — this is where the loose yellow dot from the old header ends
// up: a live indicator sitting next to the word it explains.
const SyncPill = ({ isOnline, t }) => (
  <div
    className="bc-sync-pill"
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '7px 12px', borderRadius: 9999,
      border: `1.5px solid ${t.border}`, backgroundColor: t.bgSecondary,
    }}
  >
    <span
      className={isOnline ? 'sync-pulse' : ''}
      style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: isOnline ? YELLOW : t.textTertiary, flexShrink: 0 }}
    />
    <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', color: isOnline ? t.text : t.textSecondary }}>
      {isOnline ? 'Live' : 'Offline'}
    </span>
  </div>
);

// ── Desktop sidebar ──
// Everything you need to orient yourself without a trip into Settings:
// what list you're on, its share code, where you are, and which store
// layout is sorting the aisles.
const DesktopSidebar = ({
  activeTab, onTabChange, t, ink, paper,
  listId, listName, remainingCount, recipeCount, isOnline,
  storeLayouts, activeStoreLayoutId, onSwitchStore, onCopyCode, codeCopied,
}) => {
  const [storesOpen, setStoresOpen] = useState(false);
  const activeStore = storeLayouts.find(s => s.id === activeStoreLayoutId) || storeLayouts[0];
  const tabs = [
    { id: 'list', label: 'List', badge: remainingCount || null },
    { id: 'recipes', label: 'Recipes', badge: recipeCount || null },
    { id: 'settings', label: 'Settings', badge: null },
  ];

  return (
    <aside
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH,
        backgroundColor: paper, borderRight: `1.5px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', zIndex: 50, overflowY: 'auto',
      }}
    >
      {/* Wordmark — the three crumbs finally have something to label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '24px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div className="breathe-1" style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: YELLOW }} />
          <div className="breathe-2" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
          <div className="breathe-3" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.025em', color: ink }}>Breadcrumbs</span>
      </div>

      {/* The list you're on, and the code that shares it */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ borderRadius: 16, border: `1.5px solid ${t.border}`, backgroundColor: t.bgSecondary, padding: '13px 14px', boxShadow: t.cardShadow }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.textTertiary, margin: '0 0 5px' }}>Current list</p>
          <p className="truncate" style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.015em', color: ink, margin: '0 0 11px' }}>
            {listName || 'Breadcrumbs'}
          </p>
          <button
            onClick={onCopyCode}
            className="bc-hover-row"
            title="Copy share code"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              padding: '7px 10px', borderRadius: 10, border: `1.5px solid ${t.borderLight}`,
              backgroundColor: t.bgTertiary, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 700, fontFamily: MONO, letterSpacing: '0.13em', color: ink }}>{listId}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: codeCopied ? ink : t.textTertiary, flexShrink: 0 }}>
              {codeCopied ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { triggerHaptic('light'); onTabChange(tab.id); }}
              className="bc-nav-item"
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, width: '100%',
                padding: '11px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
                backgroundColor: isActive ? t.bgTertiary : 'transparent',
                transition: 'background-color 0.18s ease',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, backgroundColor: isActive ? YELLOW : 'transparent', transition: 'background-color 0.2s ease' }} />
              <NavIcon id={tab.id} color={isActive ? ink : t.textTertiary} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: isActive ? 700 : 600, color: isActive ? ink : t.textSecondary, transition: 'color 0.2s ease' }}>{tab.label}</span>
              {tab.badge != null && (
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: isActive ? ink : t.textTertiary, backgroundColor: isActive ? YELLOW : t.bgTertiary, borderRadius: 9999, padding: '1px 8px', flexShrink: 0 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Store layout — switchable without a trip through Settings */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.textTertiary, margin: '0 0 8px', paddingLeft: 4 }}>Store layout</p>
        <button
          onClick={() => setStoresOpen(o => !o)}
          className="bc-hover-row"
          aria-expanded={storesOpen}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${t.border}`,
            backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          }}
        >
          <span className="truncate" style={{ fontSize: 13.5, fontWeight: 700, color: ink }}>{activeStore?.name || 'Default'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: storesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {storesOpen && (
          <div className="fade-in" style={{ marginTop: 6, maxHeight: 208, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {storeLayouts.map(layout => {
              const isActive = layout.id === activeStoreLayoutId;
              return (
                <button
                  key={layout.id}
                  onClick={() => { onSwitchStore(layout.id); setStoresOpen(false); }}
                  className="bc-hover-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                    padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left',
                    backgroundColor: isActive ? t.bgTertiary : 'transparent',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, backgroundColor: isActive ? YELLOW : t.border }} />
                  <span className="truncate" style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, color: isActive ? ink : t.textSecondary }}>{layout.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 24 }} />

      <div style={{ padding: '16px 20px 22px', borderTop: `1.5px solid ${t.borderLight}` }}>
        <SyncPill isOnline={isOnline} t={t} />
      </div>
    </aside>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Trail, celebration and stats — everything built on the trip records.
// Nothing in this section writes to Firestore. Trips are read once per list
// and every number below is derived from that array in the browser.
// ══════════════════════════════════════════════════════════════════════════

const MS_DAY = 86400000;
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const SMALL_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_WORDS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

// Counts in prose read as words, not digits — "Nine shops last month", not
// "9 shops". Past ninety-nine the word form stops helping, so fall back to
// the numeral rather than spelling out three-hundred-and-eighty-two.
const numberWord = (n) => {
  const v = Math.abs(Math.round(Number(n) || 0));
  if (v < 20) return SMALL_WORDS[v];
  if (v < 100) {
    const tens = TENS_WORDS[Math.floor(v / 10)];
    const ones = v % 10;
    return ones ? `${tens}-${SMALL_WORDS[ones]}` : tens;
  }
  return String(v);
};
const capitalise = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const plural = (n, one, many) => (Math.abs(n) === 1 ? one : many);
const clampNum = (min, value, max) => Math.min(max, Math.max(min, value));

// Monday-first weekday index, which is how the rhythm strip reads.
const weekdayIndex = (date) => (date.getDay() + 6) % 7;

const timeOfDay = (date) => {
  const h = date.getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

// Trip documents come back as plain data. Normalise once on load so every
// consumer below can assume numbers are numbers and `ts` is sortable.
const normaliseTrip = (id, data) => {
  if (!data || typeof data.finishedAt !== 'string') return null;
  const ts = Date.parse(data.finishedAt);
  if (!Number.isFinite(ts)) return null;
  const lines = Array.isArray(data.lines) ? data.lines : [];
  return {
    id,
    ts,
    finishedAt: data.finishedAt,
    itemCount: asInt(data.itemCount, 0),
    lineCount: asInt(data.lineCount, lines.length),
    aisleCount: asInt(data.aisleCount, 0),
    durationMinutes: Number.isFinite(Number(data.durationMinutes)) && data.durationMinutes !== undefined
      ? asInt(data.durationMinutes, 0)
      : null,
    storeName: typeof data.storeName === 'string' ? data.storeName : '',
    storeLayoutId: typeof data.storeLayoutId === 'string' ? data.storeLayoutId : '',
    lines: lines.map((l) => ({
      name: String(l?.name || ''),
      categoryId: String(l?.categoryId || ''),
      categoryName: String(l?.categoryName || 'Other'),
      quantity: Math.max(1, asInt(l?.quantity, 1))
    }))
  };
};

// ── The trail ─────────────────────────────────────────────────────────────
// One dot per item, always — never aggregated. The dot and the gap shrink
// together so a three-item list and an eighty-item list both read as a trail
// rather than as a progress bar.
const trailMetrics = (availableWidth, itemCount) => {
  const width = Math.max(40, availableWidth);
  const measure = (count) => {
    const slot = width / Math.max(1, count);
    return {
      slot,
      dot: clampNum(4, slot * 0.62, 11),
      gap: clampNum(2, slot - clampNum(4, slot * 0.62, 11), 14)
    };
  };
  const single = measure(itemCount);
  // Past roughly fifty items a single line stops being legible. Wrap onto a
  // second line and recompute with half the count — and stop there. A third
  // line would eat the header.
  if (single.slot >= 6 || itemCount < 4) return { ...single, rows: 1, perRow: itemCount };
  const perRow = Math.ceil(itemCount / 2);
  return { ...measure(perRow), rows: 2, perRow };
};

const useElementWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
};

// Crumb-trail home — accent stroke over a soft accent fill once the last
// item is ticked, text-tertiary until then.
const TrailHome = ({ lit, t, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={lit ? 'rgba(250,204,21,0.22)' : 'none'} stroke={lit ? YELLOW : t.textTertiary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'stroke 0.3s ease, fill 0.3s ease' }}>
    <path d="M4 11l8-7 8 7" /><path d="M6 9.5V20h12V9.5" />
  </svg>
);

// The house closes the trail, so the width it occupies comes out of the
// space the dots are laid into.
const HOUSE_SLOT = 48;

const CrumbTrail = ({ items, t, onOpen }) => {
  const [ref, width] = useElementWidth();
  const total = items.length;
  const remaining = items.filter((i) => !i.checked).length;
  const complete = total > 0 && remaining === 0;
  const { dot, gap, rows, perRow } = trailMetrics((width || 300) - HOUSE_SLOT, total);
  const rowItems = rows === 2 ? [items.slice(0, perRow), items.slice(perRow)] : [items];

  return (
    <button
      ref={ref}
      onClick={onOpen}
      className="bc-press"
      aria-label={`${remaining} of ${total} ${plural(total, 'item', 'items')} still to get. Open your trail.`}
      style={{ display: 'flex', alignItems: 'center', width: '100%', minHeight: 44, background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer' }}
    >
      <div aria-hidden="true" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {rowItems.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', alignItems: 'center', gap }}>
            {row.map((item) => (
              <span
                key={item.id}
                style={{
                  width: dot, height: dot, borderRadius: '50%', boxSizing: 'border-box', flexShrink: 0,
                  backgroundColor: item.checked ? 'transparent' : YELLOW,
                  border: `1.5px solid ${item.checked ? t.border : 'transparent'}`,
                  transition: 'background-color 0.25s ease, border-color 0.25s ease'
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <span aria-hidden="true" style={{ display: 'flex', marginLeft: 10, flexShrink: 0 }}>
        <TrailHome lit={complete} t={t} size={26} />
      </span>
    </button>
  );
};

// ── The finish glyph ──────────────────────────────────────────────────────
// The + and the chequered flag live on top of each other and swap by
// rotating: the + retracts as the flag draws in. The movement is the point —
// it stops a thumb on autopilot finishing a shop by accident.
const FinishGlyph = ({ finishing, color }) => (
  <span style={{ position: 'relative', width: 24, height: 24, display: 'block' }}>
    <svg
      className="bc-glyph" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
      style={{ position: 'absolute', inset: 0, opacity: finishing ? 0 : 1, transform: finishing ? 'rotate(90deg) scale(0.35)' : 'rotate(0deg) scale(1)' }}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
    <svg
      className="bc-glyph" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', inset: 0, opacity: finishing ? 1 : 0, transform: finishing ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.35)' }}
    >
      <path d="M5 21V3" />
      <rect x="5" y="4" width="15" height="9" />
      <rect x="5" y="4" width="5" height="3" fill={color} stroke="none" />
      <rect x="15" y="4" width="5" height="3" fill={color} stroke="none" />
      <rect x="10" y="7" width="5" height="3" fill={color} stroke="none" />
      <rect x="5" y="10" width="5" height="3" fill={color} stroke="none" />
      <rect x="15" y="10" width="5" height="3" fill={color} stroke="none" />
    </svg>
  </span>
);

// ── Milestones ────────────────────────────────────────────────────────────
// Two ladders, because one goes quiet after a year. Nothing is persisted:
// a milestone is a fact about the totals, so it is recomputed from the trips
// every time rather than stored as a "celebrated" flag.
const ITEM_MILESTONES = [50, 100, 250, 500, 750, 1000, 1500, 2000, 2500];
const SHOP_MILESTONES = [10, 25, 50, 100, 150, 200, 250];

const crossedThreshold = (ladder, before, after) =>
  ladder.filter((threshold) => before < threshold && threshold <= after).pop() || null;

// The highest threshold crossed by this shop. Items win a tie: carrying the
// thousandth item home is the bigger moment.
const detectMilestone = (previousTrips, newTrip) => {
  const itemsBefore = previousTrips.reduce((sum, t) => sum + t.itemCount, 0);
  const shopsBefore = previousTrips.length;
  const itemsAfter = itemsBefore + newTrip.itemCount;
  const shopsAfter = shopsBefore + 1;

  const items = crossedThreshold(ITEM_MILESTONES, itemsBefore, itemsAfter);
  if (items) return { kind: 'items', threshold: items, items: itemsAfter, shops: shopsAfter };
  const shops = crossedThreshold(SHOP_MILESTONES, shopsBefore, shopsAfter);
  if (shops) return { kind: 'shops', threshold: shops, items: itemsAfter, shops: shopsAfter };
  return null;
};

// Walk the trips in order and note the date each threshold was passed.
// Used by the year trail's milestone list.
const milestoneLadder = (trips) => {
  const sorted = [...trips].sort((a, b) => a.ts - b.ts);
  const reached = [];
  const pendingItems = [...ITEM_MILESTONES];
  const pendingShops = [...SHOP_MILESTONES];
  let items = 0;
  let shops = 0;
  sorted.forEach((trip) => {
    items += trip.itemCount;
    shops += 1;
    while (pendingItems.length && pendingItems[0] <= items) {
      reached.push({ kind: 'items', threshold: pendingItems.shift(), ts: trip.ts });
    }
    while (pendingShops.length && pendingShops[0] <= shops) {
      reached.push({ kind: 'shops', threshold: pendingShops.shift(), ts: trip.ts });
    }
  });
  const upcoming = [];
  if (pendingItems.length) upcoming.push({ kind: 'items', threshold: pendingItems[0], toGo: pendingItems[0] - items });
  if (pendingShops.length) upcoming.push({ kind: 'shops', threshold: pendingShops[0], toGo: pendingShops[0] - shops });
  upcoming.sort((a, b) => a.toGo - b.toGo);
  return { reached, upcoming: upcoming.slice(0, 2) };
};

const milestoneName = (kind, threshold) =>
  kind === 'items' ? `${threshold} items carried home` : `${threshold} shops`;

// "items carried home since December" — the month the first trip landed in.
const sinceMonth = (trips) => {
  if (!trips.length) return '';
  const first = trips.reduce((earliest, t) => (t.ts < earliest.ts ? t : earliest), trips[0]);
  return MONTH_NAMES[new Date(first.ts).getMonth()];
};

const monthsOfHistory = (trips) => {
  if (!trips.length) return 0;
  const first = trips.reduce((earliest, t) => (t.ts < earliest.ts ? t : earliest), trips[0]);
  return Math.max(1, Math.round((Date.now() - first.ts) / (MS_DAY * 30.44)));
};

// ── Range statistics ──────────────────────────────────────────────────────
const RANGES = [
  { id: '7D', days: 7, phrase: 'in the last week' },
  { id: '1M', days: 30, phrase: 'last month' },
  { id: '3M', days: 91, phrase: 'in the last three months' },
  { id: '6M', days: 182, phrase: 'in the last six months' },
  { id: '1Y', days: 365, phrase: 'in the last year' }
];

const computeRangeStats = (trips, days) => {
  const since = Date.now() - days * MS_DAY;
  const inRange = trips.filter((t) => t.ts >= since);
  const items = inRange.reduce((sum, t) => sum + t.itemCount, 0);
  const shops = inRange.length;

  const byCategory = new Map();
  inRange.forEach((trip) => {
    trip.lines.forEach((line) => {
      const key = line.categoryName || 'Other';
      byCategory.set(key, (byCategory.get(key) || 0) + line.quantity);
    });
  });
  const leaderboard = [...byCategory.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);

  const weekdays = [0, 0, 0, 0, 0, 0, 0];
  inRange.forEach((trip) => { weekdays[weekdayIndex(new Date(trip.ts))] += 1; });

  return {
    trips: inRange,
    items,
    shops,
    average: shops ? Math.round(items / shops) : 0,
    leaderboard,
    weekdays
  };
};

// Plain English for a proportion. No percentages in prose — "two thirds"
// is how someone would say it out loud.
const sharePhrase = (share) => {
  if (share >= 0.85) return 'Almost everything';
  if (share >= 0.7) return 'Three quarters of everything';
  if (share >= 0.58) return 'Two thirds of everything';
  if (share >= 0.45) return 'About half of everything';
  if (share >= 0.28) return 'About a third of everything';
  return 'Most of it';
};

const rhythmSentence = (weekdays, shops) => {
  if (!shops) return '';
  const best = weekdays.indexOf(Math.max(...weekdays));
  const share = weekdays[best] / shops;
  if (share < 0.28) return 'No day really owns it — you shop when you need to.';
  return `${WEEKDAY_NAMES[best]} is your shop. ${sharePhrase(share)} lands then.`;
};

const recapSentence = (stats, range) => {
  if (!stats.shops) return `No shops ${range.phrase}.`;
  const opening = `${capitalise(numberWord(stats.shops))} ${plural(stats.shops, 'shop', 'shops')} ${range.phrase}, and ${stats.items} ${plural(stats.items, 'item', 'items')} carried home.`;
  if (!stats.leaderboard.length) return opening;
  return `${opening} ${stats.leaderboard[0].name} led again.`;
};

// The one comparison line on the complete screen. A sentence, not a set of
// deltas — and omitted entirely on the first ever shop.
const comparisonSentence = (trip, previous) => {
  if (!previous) return '';
  const itemDelta = trip.itemCount - previous.itemCount;
  let first;
  if (itemDelta === 0) {
    first = 'The same number of items as last shop';
  } else {
    first = `${capitalise(numberWord(Math.abs(itemDelta)))} ${itemDelta > 0 ? 'more' : 'fewer'} ${plural(itemDelta, 'item', 'items')} than last shop`;
  }
  if (trip.durationMinutes === null || previous.durationMinutes === null) return `${first}.`;
  const timeDelta = trip.durationMinutes - previous.durationMinutes;
  if (timeDelta === 0) return `${first}, and exactly as quick.`;
  return `${first}, and ${numberWord(Math.abs(timeDelta))} ${plural(timeDelta, 'minute', 'minutes')} ${timeDelta < 0 ? 'quicker' : 'longer'}.`;
};

// ── Usuals ────────────────────────────────────────────────────────────────
// Score each distinct name across the last twelve trips by how often it
// appears, weighted up when it appears on the same weekday as today.
// Names are matched case-insensitively and trimmed, so "Milk" and "milk "
// are one item.
const normaliseName = (name) => String(name || '').trim().toLowerCase();

const buildUsuals = (trips, currentItems) => {
  if (trips.length < 4) return null;
  const recent = [...trips].sort((a, b) => b.ts - a.ts).slice(0, 12);
  const today = weekdayIndex(new Date());
  const onList = new Set(currentItems.map((i) => normaliseName(i.name)));
  const sameWeekdayTrips = recent.filter((t) => weekdayIndex(new Date(t.ts)) === today).length;

  const scores = new Map();
  recent.forEach((trip) => {
    const sameWeekday = weekdayIndex(new Date(trip.ts)) === today;
    // One trip counts once per name, however many lines carry it.
    const seen = new Set();
    trip.lines.forEach((line) => {
      const key = normaliseName(line.name);
      if (!key || seen.has(key)) return;
      seen.add(key);
      const entry = scores.get(key) || { key, label: line.name.trim(), trips: 0, sameWeekday: 0, score: 0, categories: new Map() };
      entry.trips += 1;
      entry.score += sameWeekday ? 1.6 : 1;
      if (sameWeekday) entry.sameWeekday += 1;
      if (line.categoryId) entry.categories.set(line.categoryId, (entry.categories.get(line.categoryId) || 0) + 1);
      scores.set(key, entry);
    });
  });

  const suggestions = [...scores.values()]
    .filter((entry) => !onList.has(entry.key) && entry.trips > 1)
    .sort((a, b) => b.score - a.score || b.trips - a.trips)
    .slice(0, 5)
    .map((entry) => ({
      key: entry.key,
      name: entry.label,
      categoryId: [...entry.categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''
    }));

  if (!suggestions.length) return null;

  const top = scores.get(suggestions[0].key);
  const context = sameWeekdayTrips >= 3 && top.sameWeekday >= 2
    ? `${suggestions[0].name} has been on ${numberWord(top.sameWeekday)} of your last ${numberWord(sameWeekdayTrips)} ${WEEKDAY_NAMES[today]} shops.`
    : `${suggestions[0].name} has been on ${numberWord(top.trips)} of your last ${numberWord(recent.length)} shops.`;

  return { suggestions, context };
};

// ── Shared furniture ──────────────────────────────────────────────────────
const StatCard = ({ value, label, t, quiet }) => (
  <div
    style={{
      flex: 1, minWidth: 0, textAlign: 'center', borderRadius: 20, padding: quiet ? '15px 8px' : '17px 10px',
      backgroundColor: quiet ? t.bgTertiary : t.bgSecondary,
      border: quiet ? 'none' : `1.5px solid ${t.border}`,
      boxShadow: quiet ? 'none' : t.cardShadow
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: quiet ? 24 : 26, fontWeight: 700, letterSpacing: '-0.02em', color: t.ink, fontFeatureSettings: '"tnum"' }}>{value}</div>
    <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: t.textSecondary, marginTop: 6 }}>{label}</div>
  </div>
);

// Bottom sheet — grabber, drag down or tap outside to dismiss.
const BottomSheet = ({ onClose, t, children, labelledBy }) => {
  const [dragY, setDragY] = useState(0);
  const startY = useRef(null);

  const onTouchStart = (e) => { startY.current = e.touches[0].clientY; };
  const onTouchMove = (e) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, e.touches[0].clientY - startY.current));
  };
  const onTouchEnd = () => {
    startY.current = null;
    if (dragY > 110) onClose();
    setDragY(0);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 210, backgroundColor: t.overlay, display: 'flex', alignItems: 'flex-end', animation: 'fadeIn 0.2s ease-out' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={{
          width: '100%', marginTop: 54, maxHeight: 'calc(100% - 54px)', display: 'flex', flexDirection: 'column',
          backgroundColor: t.bgSecondary, border: `1.5px solid ${t.border}`, borderBottom: 'none',
          borderRadius: '28px 28px 0 0', boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          transform: `translateY(${dragY}px)`, transition: dragY ? 'none' : 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
          animation: 'bcSheetUp 0.32s cubic-bezier(0.22,1,0.36,1)'
        }}
      >
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ padding: '10px 0 2px', display: 'flex', justifyContent: 'center', flexShrink: 0, touchAction: 'none' }}>
          <span aria-hidden="true" style={{ width: 44, height: 5, borderRadius: 9999, backgroundColor: t.border }} />
        </div>
        <div style={{ overflowY: 'auto', padding: '10px 22px calc(28px + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ── The shop complete screen ──────────────────────────────────────────────
// Shown the moment a shop is finished by either route, and reused without
// its buttons as the per-shop summary behind a year-trail dot.
const ShopCompleteScreen = ({ trip, previousTrip, milestone, t, onDismiss, onOpenStats, summary, totals }) => {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setArrived(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Never block the list: three seconds and it steps aside on its own.
  // The timer is armed once, on mount. `onDismiss` is a fresh closure on
  // every parent render, so depending on it would restart the countdown —
  // and re-fire the haptic — each time the list behind this screen changed.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  useEffect(() => {
    if (summary) return undefined;
    triggerHaptic('success');
    const timer = setTimeout(() => dismissRef.current(), 3000);
    return () => clearTimeout(timer);
  }, [summary]);

  const finishedAt = new Date(trip.ts || Date.parse(trip.finishedAt));
  const when = `${WEEKDAY_NAMES[weekdayIndex(finishedAt)]} ${timeOfDay(finishedAt)}`;
  const subtitle = trip.storeName ? `${trip.storeName} · ${when}` : when;
  const comparison = summary ? '' : comparisonSentence(trip, previousTrip);

  const cards = milestone
    ? [
      { value: milestone.shops, label: 'shops' },
      { value: Math.round(milestone.items / Math.max(1, milestone.shops)), label: 'items per shop' },
      { value: totals?.months || 1, label: plural(totals?.months || 1, 'month', 'months') }
    ]
    : [
      { value: trip.itemCount, label: 'items' },
      { value: trip.aisleCount, label: 'aisles' },
      ...(trip.durationMinutes === null || trip.durationMinutes === undefined
        ? []
        : [{ value: `${trip.durationMinutes}m`, label: 'in store' }])
    ];

  // The crumbs run into the house as the screen enters. Capped at a dozen —
  // past that they stop reading as individual crumbs anyway.
  const crumbCount = Math.min(12, Math.max(3, trip.lineCount || trip.itemCount || 3));

  const content = (
    <>
      {milestone && (
        <div
          className="bc-fu1"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9999, backgroundColor: t.ink, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', marginBottom: 26 }}
        >
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: YELLOW }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: t.bg }}>Milestone</span>
        </div>
      )}

      <div style={{ position: 'relative', width: 140, height: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 7 }}>
          {Array.from({ length: crumbCount }).map((_, i) => (
            <span
              key={i}
              className="bc-crumb-home"
              style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: YELLOW, animationDelay: `${i * 0.045}s` }}
            />
          ))}
        </div>
        <svg
          width="120" height="120" viewBox="0 0 24 24"
          fill={milestone ? YELLOW : (arrived ? 'rgba(250,204,21,0.18)' : 'transparent')}
          stroke={YELLOW} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'fill 0.45s ease 0.3s' }}
        >
          <path d="M4 11l8-7 8 7" /><path d="M6 9.5V20h12V9.5" />
        </svg>
      </div>

      {milestone ? (
        <>
          <div className="bc-fu2" style={{ fontFamily: MONO, fontSize: 72, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: t.ink, marginTop: 6 }}>
            {milestone.threshold}
          </div>
          <p className="bc-fu2" style={{ fontSize: 16, fontWeight: 500, color: t.textSecondary, margin: '14px 0 0', textAlign: 'center' }}>
            {milestone.kind === 'items'
              ? `items carried home${totals?.since ? ` since ${totals.since}` : ''}`
              : `shops finished${totals?.since ? ` since ${totals.since}` : ''}`}
          </p>
        </>
      ) : (
        <>
          <h1 className="bc-fu2" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: t.ink, margin: '6px 0 0' }}>
            Home stocked
          </h1>
          <p className="bc-fu2" style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, margin: '10px 0 0' }}>{subtitle}</p>
        </>
      )}

      <div className="bc-fu3" style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 380, marginTop: 30 }}>
        {cards.map((card) => (
          <StatCard key={card.label} value={card.value} label={card.label} t={t} />
        ))}
      </div>

      {comparison && (
        <p className="bc-fu3" style={{ fontSize: 14, fontWeight: 500, color: t.text, margin: '22px 0 0', maxWidth: 330, lineHeight: 1.55, textAlign: 'center' }}>
          {comparison}
        </p>
      )}

      {!summary && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenStats(); }}
            className="bc-press bc-cta bc-fu4"
            style={{ marginTop: 30, height: 54, width: '100%', maxWidth: 330, borderRadius: 9999, border: 'none', backgroundColor: YELLOW, color: INK, fontSize: 13.5, fontWeight: 700, letterSpacing: '0.01em', cursor: 'pointer' }}
          >
            See the trail
          </button>
          <p className="bc-fu4" style={{ fontSize: 13.5, fontWeight: 700, color: t.textTertiary, margin: '16px 0 0' }}>Tap anywhere to carry on</p>
        </>
      )}
    </>
  );

  if (summary) return content;

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 220, backgroundColor: t.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 26px', textAlign: 'center', animation: 'fadeIn 0.25s ease-out'
      }}
    >
      {content}
    </div>
  );
};

// ── The stats sheet ───────────────────────────────────────────────────────
// Opens from the trail, and from the complete screen's button. Every number
// here is computed in the browser from the trips read once when it opened.
const StatsSheet = ({ trips, t, onClose, onOpenYear }) => {
  // Read once on open: the sheet works from the snapshot it was given, so
  // nothing shifts under the user while they change the range.
  const [snapshot] = useState(() => trips);
  const [rangeId, setRangeId] = useState('1M');
  const range = RANGES.find((r) => r.id === rangeId) || RANGES[1];
  const stats = computeRangeStats(snapshot, range.days);
  const thin = snapshot.length < 3;
  const leader = stats.leaderboard[0]?.count || 0;
  const busiestDay = Math.max(...stats.weekdays, 0);

  return (
    <BottomSheet onClose={onClose} t={t} labelledBy="bc-stats-heading">
      <h2 id="bc-stats-heading" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', color: t.ink, margin: '4px 0 16px' }}>Your trail</h2>

      {snapshot.length === 0 ? (
        <p style={{ fontSize: 16, fontWeight: 500, color: t.textSecondary, margin: '0 0 12px', lineHeight: 1.55 }}>
          No finished shops yet. Tick your way to the house and the first one lands here.
        </p>
      ) : (
        <>
          <div role="group" aria-label="Range" style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {RANGES.map((r) => {
              const active = r.id === rangeId;
              return (
                <button
                  key={r.id}
                  aria-pressed={active}
                  onClick={() => { triggerHaptic('light'); setRangeId(r.id); }}
                  className="bc-press"
                  style={{
                    flex: 1, minWidth: 0, height: 44, borderRadius: 9999, cursor: 'pointer',
                    fontSize: 13.5, fontWeight: 700, fontFamily: MONO,
                    backgroundColor: active ? YELLOW : 'transparent',
                    color: active ? INK : t.textSecondary,
                    border: active ? '2px solid transparent' : `2px solid ${t.border}`,
                    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  {r.id}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: 16, fontWeight: 500, color: t.text, margin: '0 0 18px', lineHeight: 1.55 }}>
            {recapSentence(stats, range)}
          </p>

          {/* Three zeroes say nothing. When the range is empty the recap
              sentence has already said so — the pills are how you widen it. */}
          {stats.shops > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <StatCard quiet t={t} value={stats.items} label="items" />
              <StatCard quiet t={t} value={stats.shops} label="shops" />
              <StatCard quiet t={t} value={stats.average} label="per shop" />
            </div>
          )}

          {/* Fewer than three shops and there is nothing true to say about
              aisles or rhythm yet — so nothing is said. */}
          {!thin && stats.leaderboard.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <h3 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: t.textSecondary, margin: '0 0 14px' }}>Where it goes</h3>
              {stats.leaderboard.map((row) => {
                const filled = leader ? Math.max(1, Math.round((row.count / leader) * 10)) : 0;
                return (
                  <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                    <span className="truncate" style={{ width: 96, flexShrink: 0, fontSize: 13.5, fontWeight: 700, color: t.ink }}>{row.name}</span>
                    <span aria-hidden="true" style={{ display: 'flex', gap: 4, flex: 1, minWidth: 0 }}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: i < filled ? YELLOW : t.border }} />
                      ))}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: t.textSecondary, minWidth: 30, textAlign: 'right', fontFeatureSettings: '"tnum"' }}>{row.count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {!thin && stats.shops > 0 && (
            <div style={{ marginBottom: 26 }}>
              <h3 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: t.textSecondary, margin: '0 0 14px' }}>When you shop</h3>
              <div aria-hidden="true" style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {stats.weekdays.map((count, i) => {
                  const shade = count === 0
                    ? t.border
                    : count === busiestDay ? YELLOW : 'rgba(250,204,21,0.45)';
                  return (
                    <span key={WEEKDAY_NAMES[i]} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: shade }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.textTertiary }}>{WEEKDAY_NAMES[i].charAt(0)}</span>
                    </span>
                  );
                })}
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, margin: '14px 0 0', lineHeight: 1.5 }}>
                {rhythmSentence(stats.weekdays, stats.shops)}
              </p>
            </div>
          )}

          <button
            onClick={onOpenYear}
            className="bc-press bc-cta"
            style={{ width: '100%', height: 54, borderRadius: 9999, border: 'none', backgroundColor: YELLOW, color: INK, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Every shop this year
          </button>
        </>
      )}
    </BottomSheet>
  );
};

// ── Recipe flags ──────────────────────────────────────────────────────────
// Outline when off, filled yellow when on. Used as the sheet's toggles and,
// small and always filled, as the read-only marks beside a recipe's name.
const RECIPE_FLAG_PATHS = {
  favourite: 'M12 2.8l2.85 5.95 6.55.8-4.83 4.5 1.24 6.5L12 17.4l-5.81 3.15 1.24-6.5-4.83-4.5 6.55-.8L12 2.8z',
  wantToCook: 'M6.5 3h11a.5.5 0 01.5.5V21l-6-4.3L6 21V3.5a.5.5 0 01.5-.5z'
};

const RecipeFlagIcon = ({ flag, on, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={on ? YELLOW : 'none'} stroke={on ? YELLOW : color} strokeWidth="2" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
    <path d={RECIPE_FLAG_PATHS[flag]} />
  </svg>
);

const RecipeFlagMarks = ({ recipe, size = 13 }) => (
  (recipe.favourite === true || recipe.wantToCook === true) ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
      {recipe.favourite === true && <span role="img" aria-label="Favourite" style={{ display: 'flex' }}><RecipeFlagIcon flag="favourite" on size={size} /></span>}
      {recipe.wantToCook === true && <span role="img" aria-label="Want to cook" style={{ display: 'flex' }}><RecipeFlagIcon flag="wantToCook" on size={size} /></span>}
    </span>
  ) : null
);

// A 28px round stepper button, the same as the ingredient steppers.
const stepperButtonStyle = (t) => ({
  width: 28, height: 28, borderRadius: '50%', backgroundColor: t.bgTertiary, color: t.ink,
  border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: 0
});

// ── The recipe sheet ──────────────────────────────────────────────────────
// Read-only. The serving scaler is view-only too: it starts at the saved
// servings every time the sheet opens and never writes to the recipe.
const RecipeSheet = ({ recipe, groups, t, added, onClose, onToggleFlag, onAdd, onEdit }) => {
  const servings = recipeServings(recipe);
  const [target, setTarget] = useState(servings);
  const factor = servings && target ? target / servings : 1;
  const step = (delta) => {
    triggerHaptic('light');
    setTarget((current) => clampNum(1, (current || servings) + delta, 50));
  };
  const flagButton = (flag, label) => {
    const on = recipe[flag] === true;
    return (
      <button
        onClick={() => onToggleFlag(recipe.id, flag)}
        aria-label={label}
        aria-pressed={on}
        title={label}
        className="bc-press bc-icon-btn"
        style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${on ? YELLOW : t.border}`, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', flexShrink: 0 }}
      >
        <RecipeFlagIcon flag={flag} on={on} size={19} color={t.textSecondary} />
      </button>
    );
  };

  return (
    <BottomSheet onClose={onClose} t={t} labelledBy="bc-recipe-heading">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '4px 0 18px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 id="bc-recipe-heading" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', color: t.ink, margin: 0, lineHeight: 1.2 }}>{recipe.name}</h2>
          {recipe.notes && (
            <p style={{ fontSize: 13.5, fontStyle: 'italic', color: t.textTertiary, margin: '6px 0 0', lineHeight: 1.4 }}>{recipe.notes}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {flagButton('favourite', 'Favourite')}
          {flagButton('wantToCook', 'Want to cook')}
        </div>
      </div>

      {servings && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 16, backgroundColor: t.bgTertiary, marginBottom: 20 }}>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: t.textSecondary }}>Serves</span>
          <button onClick={() => step(-1)} disabled={target <= 1} aria-label="Fewer servings" className="bc-press" style={{ ...stepperButtonStyle(t), backgroundColor: t.bgSecondary, opacity: target <= 1 ? 0.4 : 1 }}>−</button>
          <span aria-live="polite" style={{ fontSize: 15, fontWeight: 700, fontFamily: MONO, color: t.ink, width: 30, textAlign: 'center' }}>{target}</span>
          <button onClick={() => step(1)} disabled={target >= 50} aria-label="More servings" className="bc-press" style={{ ...stepperButtonStyle(t), backgroundColor: t.bgSecondary, opacity: target >= 50 ? 0.4 : 1 }}>+</button>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: t.textSecondary, whiteSpace: 'nowrap', flexShrink: 0 }}>{group.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: YELLOW, color: '#1c1917', borderRadius: 9999, padding: '1px 8px', flexShrink: 0 }}>{group.ingredients.length}</span>
            <div style={{ flex: 1, height: 1.5, backgroundColor: t.borderLight }} />
          </div>
          {group.ingredients.map((ingredient) => {
            const note = scaleIngredientNote(ingredient.note, factor);
            return (
              <div key={ingredient.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 600, color: t.ink }}>{ingredient.name}</div>
                  {note && <div style={{ fontSize: 12.5, color: t.textTertiary, marginTop: 2 }}>{note}</div>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: t.ink, flexShrink: 0 }}>×{scaleIngredientQuantity(ingredient.quantity || 1, factor)}</span>
              </div>
            );
          })}
        </div>
      ))}

      <button
        onClick={() => onAdd(recipe, factor)}
        className="bc-press bc-cta"
        style={{ width: '100%', height: 54, marginTop: 6, borderRadius: 9999, border: 'none', backgroundColor: added ? t.ink : YELLOW, color: added ? t.accentOnInk : INK, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.22s ease, color 0.22s ease' }}
      >
        {added ? 'Added ✓' : 'Add to list'}
      </button>
      <button
        onClick={() => onEdit(recipe)}
        className="bc-press"
        style={{ display: 'block', margin: '14px auto 0', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: t.textSecondary }}
      >
        Edit recipe
      </button>
    </BottomSheet>
  );
};

// ── The year trail ────────────────────────────────────────────────────────
const YearTrailSheet = ({ trips, t, onClose, onOpenTrip }) => {
  const [snapshot] = useState(() => trips);
  const year = new Date().getFullYear();
  const thisYear = snapshot.filter((trip) => new Date(trip.ts).getFullYear() === year);
  const byMonth = MONTH_NAMES.map((_, m) => thisYear.filter((trip) => new Date(trip.ts).getMonth() === m).sort((a, b) => a.ts - b.ts));
  const rows = Math.max(5, ...byMonth.map((m) => m.length));
  const { reached, upcoming } = milestoneLadder(snapshot);
  const ladderRows = [
    ...reached.map((m) => ({ ...m, achieved: true })),
    ...upcoming.map((m) => ({ ...m, achieved: false }))
  ];

  return (
    <BottomSheet onClose={onClose} t={t} labelledBy="bc-year-heading">
      <h2 id="bc-year-heading" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', color: t.ink, margin: '4px 0 18px' }}>Every shop, {year}</h2>

      <div style={{ display: 'flex', gap: 3 }}>
        {byMonth.map((monthTrips, m) => (
          <div key={m} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: t.textTertiary, marginBottom: 8 }}>{MONTH_INITIALS[m]}</span>
            {Array.from({ length: rows }).map((_, r) => {
              const trip = monthTrips[r];
              if (!trip) {
                return <span key={r} aria-hidden="true" style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: t.bgTertiary, margin: '0 0 15px' }} />;
              }
              return (
                <button
                  key={r}
                  onClick={() => onOpenTrip(trip)}
                  aria-label={`Shop on ${new Date(trip.ts).toDateString()}, ${trip.itemCount} items`}
                  style={{ width: '100%', minWidth: 20, height: 24, padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: YELLOW }} />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, margin: '16px 0 26px', lineHeight: 1.5 }}>
        {thisYear.length === 0
          ? 'No shops logged this year yet.'
          : `${capitalise(numberWord(thisYear.length))} ${plural(thisYear.length, 'shop', 'shops')} so far. Tap a dot to open that one.`}
      </p>

      <h3 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: t.textSecondary, margin: '0 0 14px' }}>Milestones</h3>
      {ladderRows.length === 0 ? (
        <p style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, margin: 0 }}>Nothing reached yet — the first one is fifty items.</p>
      ) : ladderRows.map((row) => (
        <div key={`${row.kind}-${row.threshold}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0' }}>
          <span
            aria-hidden="true"
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: row.achieved ? YELLOW : t.bgTertiary,
              fontFamily: MONO, fontSize: 13, fontWeight: 600,
              color: row.achieved ? INK : t.textSecondary
            }}
          >
            {row.threshold}
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 16, fontWeight: 700, color: row.achieved ? t.ink : t.textSecondary }}>
              {milestoneName(row.kind, row.threshold)}
            </span>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: t.textSecondary, marginTop: 2 }}>
              {row.achieved
                ? new Date(row.ts).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                : `${numberWord(row.toGo)} ${row.kind === 'items' ? plural(row.toGo, 'item', 'items') : plural(row.toGo, 'shop', 'shops')} to go`}
            </span>
          </span>
        </div>
      ))}
    </BottomSheet>
  );
};

// ── Usuals ────────────────────────────────────────────────────────────────
// Above the list when it is nearly empty — and the empty state itself, once
// there is enough history to draw on.
const UsualsCard = ({ usuals, t, onAdd }) => (
  <div style={{ backgroundColor: t.bgSecondary, border: `1.5px solid ${t.border}`, borderRadius: 20, boxShadow: t.cardShadow, padding: 20, marginBottom: 18 }}>
    <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', color: t.ink, margin: 0 }}>You usually buy these</h3>
    <p style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, margin: '6px 0 16px', lineHeight: 1.5 }}>{usuals.context}</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {usuals.suggestions.map((suggestion) => (
        <button
          key={suggestion.key}
          onClick={() => onAdd(suggestion)}
          className="bc-press bc-dashed"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, minHeight: 44, padding: '10px 16px',
            borderRadius: 9999, border: `2px dashed ${t.textTertiary}`, backgroundColor: 'transparent',
            color: t.ink, fontSize: 13.5, fontWeight: 700, cursor: 'pointer'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 5v14M5 12h14" /></svg>
          {suggestion.name}
        </button>
      ))}
    </div>
  </div>
);

export default function App() {
  // Both of these read persisted JSON. If the value is corrupt (or
  // localStorage itself throws, e.g. storage disabled) an exception here
  // escapes the useState initialiser and takes the whole app down with a
  // blank screen on every load, with no way for the user to recover — so
  // fall back to the defaults instead.
  const [listId, setListId] = useState(() => {
    try {
      const saved = localStorage.getItem('breadcrumbs-current-list');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed.listId === 'string' ? parsed.listId : null;
    } catch (e) {
      return null;
    }
  });
  const [listName, setListName] = useState('');
  const [editingListName, setEditingListName] = useState('');
  const [items, setItems] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [settingsTab, setSettingsTab] = useState('general');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  // Hidden aisles are a per-list preference (see the loader effect below,
  // which fills this in once `listId` is known) — default here is only
  // what's on screen for the brief moment before that effect runs.
  const [hiddenCategories, setHiddenCategories] = useState(['baby', 'alcohol']);
  // Aisle the user just tried to hide that still has items in it — hiding
  // deletes those items for everyone on the list, so we confirm first
  // rather than doing it silently on tap.
  const [pendingHideCategoryId, setPendingHideCategoryId] = useState(null);
  const [createAnim, setCreateAnim] = useState(false);
  const [checkingItems, setCheckingItems] = useState(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingQuantityId, setEditingQuantityId] = useState(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isWide = useMediaQuery(WIDE_QUERY);

  // Recipe state
  const [recipes, setRecipes] = useState([]);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeNotes, setNewRecipeNotes] = useState('');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState([]);
  // The editor's single ingredient input, and the parsed line waiting on
  // "Which aisle?" when nothing matched it.
  const [newRecipeItemText, setNewRecipeItemText] = useState('');
  const [recipeNoMatch, setRecipeNoMatch] = useState(null);
  const [newRecipeServings, setNewRecipeServings] = useState(null);
  const [editingIngredientId, setEditingIngredientId] = useState(null);
  const [editingIngredientName, setEditingIngredientName] = useState('');
  const [editingIngredientNote, setEditingIngredientNote] = useState('');
  const [movingIngredient, setMovingIngredient] = useState(null);
  // The recipe open in the sheet, by id, so flag changes from another
  // phone show up while it is open.
  const [viewingRecipeId, setViewingRecipeId] = useState(null);
  // React state only: back to All on every visit to the tab.
  const [recipeFilter, setRecipeFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [addingRecipeId, setAddingRecipeId] = useState(null);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  // Store layout state
  const [storeLayouts, setStoreLayouts] = useState(DEFAULT_STORE_LAYOUTS);
  const [activeStoreLayoutId, setActiveStoreLayoutId] = useState('default');
  const [editingStoreLayout, setEditingStoreLayout] = useState(null);
  const [editingStoreLayoutData, setEditingStoreLayoutData] = useState(null);

  // Navigation and UI state
  const [activeTab, setActiveTab] = useState('list');
  // `hideCompleted` lives on the list document so both phones agree. It
  // starts false and is filled in by the list listener; the old per-device
  // localStorage value is migrated up once per list (see the listener below)
  // and never read again.
  const [hideCompleted, setHideCompleted] = useState(false);
  const hideCompletedMigratedRef = useRef(null);
  // First tick of the current shop, used for `durationMinutes`. Deliberately
  // React state only — never written to Firestore. If the app reloads
  // mid-shop the value is lost and the trip simply omits the duration.
  const firstTickAtRef = useRef(null);
  const finishingShopRef = useRef(false);

  // Theme — light / dark / system, persisted
  const [themePref, setThemePref] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-theme');
    return ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const isDark = themePref === 'dark' || (themePref === 'system' && systemDark);
  // Shadow the literal tokens so every in-screen usage follows the theme.
  // On-yellow elements use literal '#1c1917' below — yellow stays light in both.
  const theme = isDark ? THEMES.dark : THEMES.light;
  const INK = theme.ink;
  const PAPER = theme.bg;

  // Quick Add state — the only way to add items
  // Completed shops. Read once per list and never written here — the only
  // write to a trip is the one prompt 1 makes when a shop is finished.
  const [trips, setTrips] = useState([]);
  // The celebration currently on screen: { trip, previousTrip, milestone }.
  const [completion, setCompletion] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showYearTrail, setShowYearTrail] = useState(false);
  // A past shop opened from a year-trail dot.
  const [tripDetail, setTripDetail] = useState(null);

  const [fabOpen, setFabOpen] = useState(false);
  const [fabInput, setFabInput] = useState('');
  const [fabNoMatchMode, setFabNoMatchMode] = useState(false);
  const [showingCategoryTag, setShowingCategoryTag] = useState(new Set());
  const [longPressItem, setLongPressItem] = useState(null);
  const longPressTimerRef = useRef(null);
  const fabInputRef = useRef(null);

  const recipeInputRef = useRef(null);
  // The recipes array every recipe write is built from. It follows state on
  // each render and is moved forward the moment a write is made, so two
  // writes in quick succession each start from the one before.
  const recipesRef = useRef(recipes);
  recipesRef.current = recipes;
  const codeInputRef = useRef(null);

  // Show toast helper. Stable identity so the callbacks below (which report
  // failures through it) don't have to be rebuilt on every render.
  const showToastMessage = useCallback((message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  // Persist theme preference and follow the system setting
  useEffect(() => {
    localStorage.setItem('breadcrumbs-theme', themePref);
  }, [themePref]);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Keep the browser chrome and page background in step with the theme.
  // Welcome stays black — that's the brand moment.
  useEffect(() => {
    const color = !listId ? '#1c1917' : theme.bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
    document.body.style.backgroundColor = color;
  }, [listId, theme.bg]);

  // Focus fab input when opened
  useEffect(() => {
    if (fabOpen && fabInputRef.current) {
      setTimeout(() => fabInputRef.current.focus(), 50);
    }
  }, [fabOpen]);

  // Close fab and modals when switching tabs
  useEffect(() => {
    setFabOpen(false);
    setFabInput('');
    setFabNoMatchMode(false);
    setShowClearConfirm(false);
    setShowClearAllConfirm(false);
    setViewingRecipeId(null);
    setRecipeFilter('all');
  }, [activeTab]);

  // Load list name from localStorage when listId changes
  useEffect(() => {
    if (listId) {
      const savedName = localStorage.getItem(`breadcrumbs-list-name-${listId}`);
      setListName(savedName || '');
      setEditingListName(savedName || '');
    }
  }, [listId]);

  // Load hidden aisles from localStorage when listId changes. This is a
  // per-list preference — hiding an aisle on one list shouldn't hide it on
  // every other list sharing this device. Falls back to the old
  // device-wide key so a list opened for the first time under this scheme
  // still gets the hidden aisles the user already had, instead of jumping
  // back to the ['baby', 'alcohol'] defaults.
  useEffect(() => {
    if (!listId) return;
    try {
      const saved = localStorage.getItem(`breadcrumbs-hidden-categories-${listId}`);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        setHiddenCategories(parsed);
        return;
      }
      const legacy = localStorage.getItem('breadcrumbs-hidden-categories');
      const parsedLegacy = legacy ? JSON.parse(legacy) : null;
      setHiddenCategories(Array.isArray(parsedLegacy) ? parsedLegacy : ['baby', 'alcohol']);
    } catch (e) {
      setHiddenCategories(['baby', 'alcohol']);
    }
  }, [listId]);

  // Load the completed shops for this list, once. Everything the trail,
  // the celebration and the stats sheet show is derived from this array in
  // the browser; new trips are appended locally as they are written.
  useEffect(() => {
    if (!listId) {
      setTrips([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'lists', listId, 'trips'));
        if (cancelled) return;
        const rows = [];
        snap.forEach((tripDoc) => {
          const normalised = normaliseTrip(tripDoc.id, tripDoc.data());
          if (normalised) rows.push(normalised);
        });
        rows.sort((a, b) => a.ts - b.ts);
        setTrips(rows);
      } catch (error) {
        // Offline, or the list has no history yet. Neither is worth a toast:
        // the stats sheet simply says there is nothing to show.
        console.error('Error loading trips:', error);
      }
    })();
    return () => { cancelled = true; };
  }, [listId]);

  // Close every celebration and sheet when the list changes.
  useEffect(() => {
    setCompletion(null);
    setShowStats(false);
    setShowYearTrail(false);
    setTripDetail(null);
    setViewingRecipeId(null);
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
  const layoutCategories = (() => {
    const categoryOrder = activeStoreLayout?.categoryOrder || [];
    return [...categories].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.id);
      const bIndex = categoryOrder.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  })();
  const visibleCategories = layoutCategories.filter(cat => !hiddenCategories.includes(cat.id));

  // A recipe's ingredients grouped by aisle, in store order, filled aisles
  // only. A hidden aisle still shows here (and an aisle that no longer
  // exists shows under its id) so no ingredient is ever out of sight.
  const recipeGroups = (ingredients) => {
    const list = Array.isArray(ingredients) ? ingredients : [];
    const known = new Set(layoutCategories.map(c => c.id));
    const groups = layoutCategories
      .map(c => ({ id: c.id, name: c.name, ingredients: list.filter(i => i.category === c.id) }))
      .filter(g => g.ingredients.length > 0);
    const unknownIds = [...new Set(list.filter(i => !known.has(i.category)).map(i => i.category))];
    unknownIds.forEach(id => groups.push({ id: String(id), name: String(id || 'Other'), ingredients: list.filter(i => i.category === id) }));
    return groups;
  };

  const checkOnboarding = useCallback(() => {
    const hasSeenOnboarding = localStorage.getItem('breadcrumbs-has-seen-onboarding');
    if (!hasSeenOnboarding) setShowOnboarding(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('breadcrumbs-has-seen-onboarding', 'true');
    setShowOnboarding(false);
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

  useEffect(() => {
    if (!listId) return;
    const unsubscribe = onSnapshot(
      doc(db, 'lists', listId),
      // Every snapshot is applied, including the ones echoing our own writes.
      // Firestore keeps pending local writes applied on top of whatever the
      // server sends, so an incoming snapshot always already contains our
      // in-flight change — there is nothing to suppress. Skipping snapshots
      // while a save is in flight would silently drop a collaborator's edit
      // that landed in the same window (this listener has no
      // includeMetadataChanges, so it is never re-delivered), and our next
      // write would then push that stale array back over their change.
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setItems(data.items || []);
          if (data.recipes) setRecipes(data.recipes);

          // Hide-done is shared: whoever toggled last wins, and the field is
          // absent on lists that predate it (default false).
          setHideCompleted(data.hideCompleted === true);

          // One-off migration of the old per-device preference. Only runs
          // when the document has no `hideCompleted` field at all, and only
          // once per list per session — after this localStorage is never
          // read for it again (the key is left in place, harmlessly stale).
          if (!('hideCompleted' in data) && hideCompletedMigratedRef.current !== listId) {
            hideCompletedMigratedRef.current = listId;
            let local = null;
            try {
              local = localStorage.getItem('breadcrumbs-hide-completed');
            } catch (e) {
              // Storage unavailable — nothing to migrate
            }
            if (local === 'true' || local === 'false') {
              const value = local === 'true';
              setHideCompleted(value);
              // RECIPES MUST BE PRESERVED. Single-field update: `recipes`
              // and `items` are not part of this write, so they cannot be
              // clobbered by stale local state.
              updateDoc(doc(db, 'lists', listId), {
                hideCompleted: value,
                updatedAt: new Date().toISOString()
              }).catch((error) => console.error('Error migrating hide-completed:', error));
            }
          }
        }
      },
      (error) => {
        console.error('Error listening to list:', error);
      }
    );
    return () => unsubscribe();
  }, [listId]);

  // Separate listener for categories/store layouts
  useEffect(() => {
    if (!listId) return;
    const unsubscribe = onSnapshot(
      doc(db, 'lists', listId, 'meta', 'categories'),
      { includeMetadataChanges: true },
      (docSnap) => {
        if (docSnap.metadata.hasPendingWrites) return;
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.categories) setCategories(data.categories);
          if (data.storeLayouts) {
            const storedLayouts = data.storeLayouts;
            const defaultLayoutIds = DEFAULT_STORE_LAYOUTS.map(l => l.id);
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

  // Save items and/or recipes to the main list document.
  // IMPORTANT: this is a merge write and each field is only included when the
  // caller explicitly passes it. The list document is shared, so writing a
  // field the caller did not actually change overwrites it with whatever
  // stale local state happens to be in memory (e.g. before the onSnapshot
  // listener has finished its first load) and wipes it for everyone:
  //  - item-only saves (add/tick/delete groceries) must not touch `recipes`
  //  - recipe-only saves (save/delete a recipe) must not touch `items`
  const saveList = useCallback(async (newItems, newRecipes) => {
    if (!listId) return;
    if (newItems === undefined && newRecipes === undefined) return;
    // RECIPES MUST BE PRESERVED. Because this is a merge write, a field left
    // out of the payload is untouched on the document — so an item-only save
    // cannot lose recipes. When `recipes` IS in the payload it must be a
    // real array: writing undefined/null/[] here would wipe every recipe on
    // the list for everyone, and nothing would complain.
    if (newRecipes !== undefined && !Array.isArray(newRecipes)) {
      console.error('Refusing to write list: recipes is not an array', newRecipes);
      showToastMessage('Failed to save changes');
      return;
    }
    try {
      const payload = { updatedAt: new Date().toISOString() };
      if (newItems !== undefined) payload.items = newItems;
      if (newRecipes !== undefined) payload.recipes = newRecipes;
      await setDoc(doc(db, 'lists', listId), payload, { merge: true });
    } catch (error) {
      console.error('Error saving list:', error);
      setToastMessage('Failed to save changes');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  }, [listId, showToastMessage]);

  // Recipe-only write — leaves the shared `items` array untouched.
  const saveRecipes = useCallback((newRecipes) => saveList(undefined, newRecipes), [saveList]);

  // Toggle the shared hide-done preference. This is a write to the list
  // document, so it goes through updateDoc: exactly one field changes and
  // `recipes` / `items` are never part of the payload and cannot be lost.
  const toggleHideCompleted = useCallback(async () => {
    triggerHaptic('light');
    const next = !hideCompleted;
    setHideCompleted(next);
    if (!listId) return;
    hideCompletedMigratedRef.current = listId;
    try {
      await updateDoc(doc(db, 'lists', listId), {
        hideCompleted: next,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving hide-completed:', error);
    }
  }, [hideCompleted, listId]);

  // Write the trip document, and report how far the write got.
  // Returns 'server' (confirmed), 'duplicate' (the other phone already
  // logged this shop) or 'local' (queued and applied locally — Firestore
  // will replay it on reconnect). Throws only on a real failure.
  const commitTrip = useCallback(async (tripRef, trip) => {
    // A create that loses the race with another device is rejected with
    // permission-denied, because the rules deny updates to an existing trip.
    // That is the duplicate case, and it is success: the shop is recorded.
    const write = setDoc(tripRef, trip).then(
      () => 'server',
      async (error) => {
        if (error?.code === 'permission-denied') {
          const existing = await getDoc(tripRef).catch(() => null);
          if (existing?.exists()) return 'duplicate';
        }
        throw error;
      }
    );

    // The mutation is in Firestore's local queue the moment setDoc is
    // called, so it is already acknowledged locally here. Give the server a
    // short grace period anyway, so a genuine failure is caught before the
    // list is cleared; past that, proceed on the local acknowledgement
    // rather than leaving the user staring at a stuck screen underground.
    let timer;
    const localAck = new Promise((resolve) => {
      timer = setTimeout(() => resolve('local'), navigator.onLine ? TRIP_SERVER_ACK_MS : 0);
    });

    try {
      const outcome = await Promise.race([write, localAck]);
      if (outcome === 'local') {
        // Still in flight. Never let the queued promise surface as an
        // unhandled rejection — offline it stays pending for as long as the
        // device is off the network.
        write.catch((error) => {
          console.error('Trip write failed after the list was cleared:', error);
          showToastMessage("Shop wasn't recorded");
        });
      }
      return outcome;
    } finally {
      clearTimeout(timer);
    }
  }, [showToastMessage]);

  // Finish a shop: record the ticked items as a trip, then take them off the
  // list. Called when the last unticked item is ticked, and by the finish
  // control. `sourceItems` lets a caller pass the array it has just built,
  // rather than the state value this render closed over.
  const finishShop = useCallback(async (sourceItems) => {
    if (!listId) return 'noop';
    if (finishingShopRef.current) return 'busy';

    const baseItems = Array.isArray(sourceItems) ? sourceItems : items;
    const ticked = baseItems.filter((i) => i.checked);
    // Nothing ticked — no trip, no write, nothing at all.
    if (ticked.length === 0) return 'noop';

    // The list document is only ever written below through saveList, which
    // is a merge write naming `items` alone. `recipes` is not in the payload
    // and cannot be lost. Guard on it anyway: if local recipe state is not
    // an array something is badly wrong and we would rather not touch the
    // shared document at all.
    if (!Array.isArray(recipes)) {
      console.error('Refusing to finish shop: recipes is not an array', recipes);
      showToastMessage("Couldn't finish this shop");
      return 'error';
    }

    finishingShopRef.current = true;
    try {
      const finishedAt = new Date().toISOString();
      const firstTickAt = firstTickAtRef.current;
      const durationMinutes = typeof firstTickAt === 'number'
        ? Math.max(0, Math.round((Date.now() - firstTickAt) / 60000))
        : undefined;
      const storeLayout = storeLayouts.find((l) => l.id === activeStoreLayoutId);
      const trip = buildTrip(ticked, categories, finishedAt, durationMinutes, storeLayout);
      const tripRef = doc(db, 'lists', listId, 'trips', buildTripId(finishedAt, ticked));

      await commitTrip(tripRef, trip);

      // The shop is recorded. Everything from here is presentation: the
      // celebration reads the trip we just built plus the history already in
      // memory, and nothing else is written.
      const recorded = normaliseTrip(tripRef.id, trip);
      if (recorded) {
        const previousTrips = trips.filter((existing) => existing.id !== recorded.id);
        const previousTrip = previousTrips.length
          ? previousTrips.reduce((latest, candidate) => (candidate.ts > latest.ts ? candidate : latest))
          : null;
        // If both ladders cross on this shop, detectMilestone returns the
        // items one — the bigger moment of the two.
        const milestone = detectMilestone(previousTrips, recorded);
        setTrips([...previousTrips, recorded].sort((a, b) => a.ts - b.ts));
        setCompletion({ trip: recorded, previousTrip, milestone });
      }

      // Only now do the ticked items come off the list. If the trip write
      // had failed we would have thrown above and left the list untouched:
      // an unrecorded shop is annoying, a cleared and unrecorded shop is
      // data loss.
      const remaining = baseItems.filter((i) => !i.checked);
      setItems(remaining);
      firstTickAtRef.current = null;
      // RECIPES MUST BE PRESERVED. saveList is a merge write carrying only
      // `items` and `updatedAt`, so `recipes` and `hideCompleted` on the
      // document are left exactly as they are. Do not turn this into a
      // whole-document write. Not awaited: offline the promise stays
      // pending until the device reconnects, and Firestore replays it then.
      saveList(remaining);
      return 'finished';
    } catch (error) {
      console.error('Error finishing shop:', error);
      showToastMessage("Couldn't record this shop — nothing was cleared");
      return 'error';
    } finally {
      finishingShopRef.current = false;
    }
  }, [listId, items, recipes, categories, storeLayouts, activeStoreLayoutId, trips, commitTrip, saveList, showToastMessage]);

  // Save categories / store layouts to the shared meta document.
  // Same rule as saveList: merge write, and only the fields the caller
  // actually changed go into the payload. Rewriting all three fields from
  // local state clobbers a collaborator's concurrent change to a different
  // field, and clobbers everything if local state has not been filled in by
  // the meta listener yet (it would push DEFAULT_CATEGORIES /
  // DEFAULT_STORE_LAYOUTS over the list's real ones).
  const saveCategories = async (changes) => {
    if (!listId) return;
    const keys = Object.keys(changes || {});
    if (keys.length === 0) return;
    try {
      await setDoc(doc(db, 'lists', listId, 'meta', 'categories'), {
        ...changes,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving categories:', error);
      setToastMessage('Failed to save category changes');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const saveHiddenCategories = (hidden) => {
    if (listId) {
      try {
        localStorage.setItem(`breadcrumbs-hidden-categories-${listId}`, JSON.stringify(hidden));
      } catch (e) {
        // Storage unavailable — the preference still applies for this session
      }
    }
    setHiddenCategories(hidden);
  };

  // If a category the user is about to hide still has items in it, hiding
  // it deletes those items from the shared list for every collaborator —
  // so route through a confirmation instead of doing that silently.
  const toggleCategoryVisibility = (categoryId) => {
    triggerHaptic('light');
    const isCurrentlyHidden = hiddenCategories.includes(categoryId);
    if (isCurrentlyHidden) {
      saveHiddenCategories(hiddenCategories.filter(id => id !== categoryId));
      return;
    }
    const hasItems = items.some(item => item.category === categoryId);
    if (hasItems) {
      setPendingHideCategoryId(categoryId);
      return;
    }
    saveHiddenCategories([...hiddenCategories, categoryId]);
  };

  const confirmHideCategory = async () => {
    if (!pendingHideCategoryId) return;
    triggerHaptic('success');
    const categoryId = pendingHideCategoryId;
    setPendingHideCategoryId(null);
    saveHiddenCategories([...hiddenCategories, categoryId]);
    const newItems = items.filter(item => item.category !== categoryId);
    setItems(newItems);
    await saveList(newItems);
  };

  // Aisles an item was just placed into that the user had hidden — e.g. an
  // auto-categorised "beer" landing in a hidden Alcohol aisle. The item
  // would otherwise be saved and counted, but never rendered and
  // impossible to tick off or delete from the UI. Unhiding beats losing
  // the item from view.
  const unhideCategoriesIfNeeded = (categoryIds) => {
    const toUnhide = categoryIds.filter(id => hiddenCategories.includes(id));
    if (toUnhide.length === 0) return;
    saveHiddenCategories(hiddenCategories.filter(id => !toUnhide.includes(id)));
  };

  const addCustomCategory = async () => {
    if (!newCategoryName.trim()) return;
    triggerHaptic('success');
    const newCategory = { id: `custom-${generateId()}`, name: newCategoryName.trim(), isDefault: false };
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    await saveCategories({ categories: newCategories });
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const deleteCustomCategory = async (categoryId) => {
    triggerHaptic('light');
    const newCategories = categories.filter(cat => cat.id !== categoryId);
    const newItems = items.filter(item => item.category !== categoryId);
    setCategories(newCategories);
    setItems(newItems);
    await saveCategories({ categories: newCategories });
    await saveList(newItems);
  };

  // Store layout functions
  const switchStoreLayout = async (layoutId) => {
    triggerHaptic('success');
    setActiveStoreLayoutId(layoutId);
    await saveCategories({ activeStoreLayoutId: layoutId });
    const layout = storeLayouts.find(s => s.id === layoutId);
    showToastMessage(`Switched to ${layout?.name || 'layout'}`);
  };

  const updateStoreLayoutOrder = async (layoutId, newCategoryOrder) => {
    const newLayouts = storeLayouts.map(layout =>
      layout.id === layoutId ? { ...layout, categoryOrder: newCategoryOrder } : layout
    );
    setStoreLayouts(newLayouts);
    await saveCategories({ storeLayouts: newLayouts });
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
    await saveCategories({ storeLayouts: newLayouts });
    return newLayout;
  };

  const createLayoutFromPrompt = async () => {
    const name = prompt('Enter a name for your custom layout:');
    if (name && name.trim()) {
      const newLayout = await createCustomStoreLayout(name);
      setEditingStoreLayout(newLayout.id);
      setEditingStoreLayoutData(newLayout);
    }
  };

  const deleteStoreLayout = async (layoutId) => {
    triggerHaptic('light');
    const newLayouts = storeLayouts.filter(s => s.id !== layoutId);
    const newActiveId = activeStoreLayoutId === layoutId ? 'default' : activeStoreLayoutId;
    setStoreLayouts(newLayouts);
    setActiveStoreLayoutId(newActiveId);
    await saveCategories({ storeLayouts: newLayouts, activeStoreLayoutId: newActiveId });
  };

  const createNewList = async () => {
    setCreateAnim(true);
    triggerHaptic('success');

    // Pick a code nobody's already using. A collision is very unlikely
    // (36^6 ≈ 2.18 billion codes) but would otherwise silently overwrite
    // someone else's existing shared list. Best-effort only — skipped
    // entirely offline, since list creation needs to keep working with no
    // network (see the note below on why the writes aren't awaited).
    let code = generateListCode();
    if (isOnline) {
      try {
        for (let attempt = 0; attempt < 5; attempt++) {
          const existing = await getDoc(doc(db, 'lists', code));
          if (!existing.exists()) break;
          code = generateListCode();
        }
      } catch (e) {
        // Couldn't check (e.g. connection dropped mid-check) — proceed
        // with the code we have rather than blocking list creation.
      }
    }

    setTimeout(() => {
      setListId(code);
      setItems([]);
      setCategories(DEFAULT_CATEGORIES);
      setRecipes([]);
      setStoreLayouts(DEFAULT_STORE_LAYOUTS);
      setActiveStoreLayoutId('default');
      setListName('');
      setEditingListName('');
      setHideCompleted(false);
      hideCompletedMigratedRef.current = code;
      firstTickAtRef.current = null;
      checkOnboarding();

      // Remember the code and finish the button animation before the network
      // writes. Offline, setDoc's promise stays pending until the device
      // reconnects, so awaiting it here meant the new list was never written
      // to localStorage (lost on the next launch) and the create button was
      // left stuck mid-animation. Firestore replays both writes on reconnect.
      try {
        localStorage.setItem('breadcrumbs-current-list', JSON.stringify({ listId: code }));
      } catch (e) {
        // Storage unavailable — the list still works for this session
      }
      setCreateAnim(false);

      // RECIPES MUST BE PRESERVED. This is the only non-merge write to a
      // list document, and it is safe only because the code is brand new and
      // the document does not exist yet — `recipes: []` is the initial value,
      // not an overwrite. Never point this at an existing list.
      setDoc(doc(db, 'lists', code), {
        items: [],
        recipes: [],
        updatedAt: new Date().toISOString()
      }).catch(error => console.error('Error creating list:', error));
      setDoc(doc(db, 'lists', code, 'meta', 'categories'), {
        categories: DEFAULT_CATEGORIES,
        storeLayouts: DEFAULT_STORE_LAYOUTS,
        activeStoreLayoutId: 'default',
        updatedAt: new Date().toISOString()
      }).catch(error => console.error('Error creating list categories:', error));
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
        setHideCompleted(data.hideCompleted === true);
        firstTickAtRef.current = null;
        checkOnboarding();

        const catSnap = await getDoc(doc(db, 'lists', code, 'meta', 'categories'));
        if (catSnap.exists()) {
          const catData = catSnap.data();
          if (catData.categories) setCategories(catData.categories);
          if (catData.storeLayouts) {
            // Same merge the meta listener does: keep the built-in layouts'
            // names/ids from code, but take the aisle order from the list so
            // a customised built-in layout is not reset to the default order.
            const storedLayouts = catData.storeLayouts;
            const defaultLayoutIds = DEFAULT_STORE_LAYOUTS.map(l => l.id);
            const mergedDefaultLayouts = DEFAULT_STORE_LAYOUTS.map(defaultLayout => {
              const stored = storedLayouts.find(l => l.id === defaultLayout.id);
              return stored ? { ...defaultLayout, categoryOrder: stored.categoryOrder } : defaultLayout;
            });
            const customLayouts = storedLayouts.filter(l => !defaultLayoutIds.includes(l.id) && l.isDefault === false);
            setStoreLayouts([...mergedDefaultLayouts, ...customLayouts]);
          }
          const activeId = catData.activeStoreLayoutId;
          if (activeId) setActiveStoreLayoutId(activeId);
        } else {
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
    setHideCompleted(false);
    hideCompletedMigratedRef.current = null;
    firstTickAtRef.current = null;
    localStorage.removeItem('breadcrumbs-current-list');
  };

  const clearAllItems = async () => {
    triggerHaptic('success');
    setItems([]);
    firstTickAtRef.current = null;
    await saveList([]);
    setShowClearAllConfirm(false);
  };

  // The aisle tag beside a row that was just added, gone after two seconds.
  // Shared by Quick Add and the recipe editor.
  const flashCategoryTag = (id) => {
    setShowingCategoryTag(prev => new Set([...prev, id]));
    setTimeout(() => {
      setShowingCategoryTag(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  // Quick Add functions — the only way to add items
  const handleFabAdd = async () => {
    if (!fabInput.trim()) return;
    const itemName = fabInput.trim();
    const result = findCategoryForItem(itemName);

    if (result) {
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
          i.id === existingItem.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      } else {
        newItemId = generateId();
        newItems = [...items, { id: newItemId, name: itemName, category: result.categoryId, checked: false, quantity: 1, addedAt: Date.now() }];
      }

      setItems(newItems);
      setFabInput('');
      setFabNoMatchMode(false);
      unhideCategoriesIfNeeded([result.categoryId]);
      await saveList(newItems);

      flashCategoryTag(newItemId);
    } else {
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
        i.id === existingItem.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
      );
    } else {
      newItemId = generateId();
      newItems = [...items, { id: newItemId, name: itemName, category: categoryId, checked: false, quantity: 1, addedAt: Date.now() }];
    }

    setItems(newItems);
    saveCategoryCorrection(itemName, categoryId);
    setFabInput('');
    setFabNoMatchMode(false);
    unhideCategoriesIfNeeded([categoryId]);
    await saveList(newItems);

    flashCategoryTag(newItemId);

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
    unhideCategoriesIfNeeded([newCategoryId]);
    await saveList(newItems);
  };

  // Toggle item — completed items simply stay, crossed out
  const toggleItem = async (id) => {
    const item = items.find(i => i.id === id);
    const willCheck = !item.checked;
    triggerHaptic(willCheck ? 'success' : 'light');

    if (willCheck) {
      setCheckingItems(prev => new Set([...prev, id]));
      setTimeout(() => {
        setCheckingItems(prev => { const next = new Set(prev); next.delete(id); return next; });
      }, 400);
    }

    const newItems = items.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    setItems(newItems);

    // Start the clock on the first tick of a shop. State only — never
    // written to Firestore.
    if (willCheck && firstTickAtRef.current === null) firstTickAtRef.current = Date.now();

    // Ticking the last unticked item finishes the shop.
    const shopComplete = willCheck && newItems.length > 0 && newItems.every(i => i.checked);

    // The tick itself still gets saved first, so that a failed trip write
    // leaves the list exactly as the user left it — ticks and all.
    const savePromise = saveList(newItems);
    if (shopComplete) {
      // Not awaiting the tick save: offline its promise stays pending until
      // the device reconnects, and the shop has to finish now, in the shop.
      await finishShop(newItems);
      return;
    }
    await savePromise;
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

  // Recipe functions
  //
  // RECIPES MUST BE PRESERVED. Every recipe write goes through here: it is
  // built from recipesRef (the latest array, see above), carries the whole
  // array, and goes out through saveRecipes, which never touches `items`.
  const writeRecipes = (newRecipes) => {
    recipesRef.current = newRecipes;
    setRecipes(newRecipes);
    return saveRecipes(newRecipes);
  };

  // Adds a parsed line to the recipe being edited. The same name already in
  // that aisle takes the extra quantity and keeps its own note.
  const addParsedIngredient = (parsed, categoryId) => {
    triggerHaptic('success');
    const existing = newRecipeIngredients.find(i =>
      i.name.toLowerCase() === parsed.name.toLowerCase() && i.category === categoryId
    );
    let ingredientId;
    if (existing) {
      ingredientId = existing.id;
      setNewRecipeIngredients(newRecipeIngredients.map(i =>
        i.id === existing.id ? { ...i, quantity: (i.quantity || 1) + parsed.quantity } : i
      ));
    } else {
      ingredientId = generateId();
      const ingredient = { id: ingredientId, name: parsed.name, category: categoryId, quantity: parsed.quantity };
      if (parsed.note) ingredient.note = parsed.note;
      setNewRecipeIngredients([...newRecipeIngredients, ingredient]);
    }
    setNewRecipeItemText('');
    setRecipeNoMatch(null);
    flashCategoryTag(ingredientId);
    if (recipeInputRef.current) recipeInputRef.current.focus();
  };

  const handleRecipeAdd = () => {
    if (!newRecipeItemText.trim()) return;
    const parsed = parseIngredientLine(newRecipeItemText);
    const result = findCategoryForItem(parsed.name);
    if (result) addParsedIngredient(parsed, result.categoryId);
    else setRecipeNoMatch(parsed);
  };

  const handleRecipeChipSelect = (categoryId) => {
    if (!recipeNoMatch) return;
    saveCategoryCorrection(recipeNoMatch.name, categoryId);
    addParsedIngredient(recipeNoMatch, categoryId);
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

  const startEditIngredient = (ingredient) => {
    setEditingIngredientId(ingredient.id);
    setEditingIngredientName(ingredient.name);
    setEditingIngredientNote(ingredient.note || '');
  };

  // An emptied name keeps the old one; an emptied note drops the key.
  const saveEditIngredient = () => {
    if (!editingIngredientId) return;
    const name = editingIngredientName.trim();
    const note = editingIngredientNote.trim();
    setNewRecipeIngredients(newRecipeIngredients.map(i => {
      if (i.id !== editingIngredientId) return i;
      const { note: _previousNote, ...rest } = i;
      const updated = { ...rest, name: name || i.name };
      if (note) updated.note = note;
      return updated;
    }));
    setEditingIngredientId(null);
    setEditingIngredientName('');
    setEditingIngredientNote('');
  };

  // Same picker, same memory as moving an item on the list. Moving onto a
  // name the aisle already has merges the two, as adding does.
  const moveRecipeIngredient = (ingredient, categoryId) => {
    triggerHaptic('success');
    saveCategoryCorrection(ingredient.name, categoryId);
    setMovingIngredient(null);
    if (ingredient.category === categoryId) return;
    const existing = newRecipeIngredients.find(i =>
      i.id !== ingredient.id && i.category === categoryId && i.name.toLowerCase() === ingredient.name.toLowerCase()
    );
    if (existing) {
      setNewRecipeIngredients(newRecipeIngredients
        .filter(i => i.id !== ingredient.id)
        .map(i => (i.id === existing.id ? { ...i, quantity: (i.quantity || 1) + (ingredient.quantity || 1) } : i)));
    } else {
      setNewRecipeIngredients(newRecipeIngredients.map(i => (i.id === ingredient.id ? { ...i, category: categoryId } : i)));
    }
  };

  // Serves: unset shows —, + from unset starts at 4, − at 1 goes back to unset.
  const stepRecipeServings = (delta) => {
    triggerHaptic('light');
    setNewRecipeServings(current => {
      if (current === null) return delta > 0 ? 4 : null;
      const next = current + delta;
      if (next < 1) return null;
      return Math.min(50, next);
    });
  };

  const resetRecipeEditor = () => {
    setNewRecipeName('');
    setNewRecipeNotes('');
    setNewRecipeIngredients([]);
    setNewRecipeItemText('');
    setNewRecipeServings(null);
    setRecipeNoMatch(null);
    setEditingIngredientId(null);
    setMovingIngredient(null);
    setShowCreateRecipe(false);
    setEditingRecipeId(null);
  };

  const saveRecipe = () => {
    if (!newRecipeName.trim() || newRecipeIngredients.length === 0 || savingRecipe) return;
    setSavingRecipe(true);
    triggerHaptic('success');
    // `servings` is left off entirely when unset — never null or 0.
    const withServings = (recipe) => {
      const { servings: _previousServings, ...rest } = recipe;
      return newRecipeServings === null ? rest : { ...rest, servings: newRecipeServings };
    };
    const current = recipesRef.current;
    let newRecipes;
    if (editingRecipeId) {
      newRecipes = current.map(r =>
        r.id === editingRecipeId
          ? withServings({ ...r, name: newRecipeName.trim(), ingredients: newRecipeIngredients, notes: newRecipeNotes.trim() })
          : r
      );
    } else {
      newRecipes = [...current, withServings({ id: generateId(), name: newRecipeName.trim(), ingredients: newRecipeIngredients, createdAt: Date.now(), notes: newRecipeNotes.trim() })];
    }
    // Not awaited: offline the write stays pending until the device
    // reconnects (Firestore replays it then), and the editor would sit on
    // "Saving…" until it did. saveList reports a real failure itself.
    writeRecipes(newRecipes);
    resetRecipeEditor();
    setSavingRecipe(false);
    showToastMessage(editingRecipeId ? 'Recipe updated!' : 'Recipe saved!');
  };

  const cancelCreateRecipe = () => {
    triggerHaptic('light');
    resetRecipeEditor();
  };

  const startEditRecipe = (recipe) => {
    triggerHaptic('light');
    setViewingRecipeId(null);
    setEditingRecipeId(recipe.id);
    setNewRecipeName(recipe.name);
    setNewRecipeNotes(recipe.notes || '');
    setNewRecipeIngredients([...(recipe.ingredients || [])]);
    setNewRecipeServings(recipeServings(recipe));
    setNewRecipeItemText('');
    setRecipeNoMatch(null);
    setEditingIngredientId(null);
    setShowCreateRecipe(true);
  };

  // Favourite and want-to-cook. Missing means false, so switching one off
  // removes the key rather than writing false.
  const toggleRecipeFlag = (recipeId, flag) => {
    triggerHaptic('light');
    const newRecipes = recipesRef.current.map(r => {
      if (r.id !== recipeId) return r;
      if (r[flag] === true) {
        const { [flag]: _cleared, ...rest } = r;
        return rest;
      }
      return { ...r, [flag]: true };
    });
    writeRecipes(newRecipes);
  };

  // `factor` is target servings ÷ saved servings, from the recipe sheet.
  // Only the ×N is scaled; notes never reach the list.
  const addRecipeToList = async (recipe, factor = 1) => {
    triggerHaptic('success');
    setAddingRecipeId(recipe.id);
    const ingredients = recipe.ingredients || [];
    let newItems = [...items];
    for (const ingredient of ingredients) {
      const quantity = scaleIngredientQuantity(ingredient.quantity || 1, factor);
      const existingItem = newItems.find(i =>
        i.name.toLowerCase() === ingredient.name.toLowerCase() &&
        i.category === ingredient.category &&
        !i.checked
      );
      if (existingItem) {
        newItems = newItems.map(i =>
          i.id === existingItem.id ? { ...i, quantity: (i.quantity || 1) + quantity } : i
        );
      } else {
        newItems.push({
          id: generateId(),
          name: ingredient.name,
          category: ingredient.category,
          checked: false,
          quantity,
          addedAt: Date.now()
        });
      }
    }
    setItems(newItems);
    unhideCategoriesIfNeeded(ingredients.map(i => i.category));
    await saveList(newItems);
    showToastMessage(`Added ${ingredients.length} items to your list`);
    setTimeout(() => {
      setAddingRecipeId(currentId => (currentId === recipe.id ? null : currentId));
    }, 1600);
  };

  const confirmDeleteRecipe = () => {
    if (!deletingRecipeId) return;
    triggerHaptic('success');
    const newRecipes = recipesRef.current.filter(r => r.id !== deletingRecipeId);
    // Not awaited, for the same reason as saveRecipe.
    writeRecipes(newRecipes);
    setDeletingRecipeId(null);
    showToastMessage('Recipe deleted');
  };

  const totalItems = items.length;
  const checkedCount = items.filter(i => i.checked).length;
  const remainingCount = totalItems - checkedCount;
  // Aisles that actually render a card — drives the desktop sparse state.
  const activeCategoryCount = visibleCategories.filter(cat => items.some(i => i.category === cat.id)).length;

  // Items in trail order — aisle by aisle, the way they'll be walked.
  const trailItems = visibleCategories.flatMap(cat => items.filter(item => item.category === cat.id));

  // Halfway, rounded down, so the finish control arrives a tick early on an
  // odd list rather than late. Seven items: after the third tick.
  const finishReady = totalItems > 0 && checkedCount >= Math.max(1, Math.floor(totalItems / 2));

  // Past the halfway mark the add affordance goes away entirely, including
  // an input bar that happens to be open.
  useEffect(() => {
    if (finishReady && fabOpen) {
      setFabOpen(false);
      setFabInput('');
      setFabNoMatchMode(false);
    }
  }, [finishReady, fabOpen]);


  // Suggestions are only worth showing on a nearly-empty list, and only once
  // there is enough history for them to be true rather than noise.
  const usuals = totalItems <= 3 ? buildUsuals(trips, items) : null;

  const addUsual = async (suggestion) => {
    triggerHaptic('success');
    const categoryId = suggestion.categoryId && categories.some(c => c.id === suggestion.categoryId)
      ? suggestion.categoryId
      : (findCategoryForItem(suggestion.name)?.categoryId || 'other');
    const newItems = [...items, { id: generateId(), name: suggestion.name, category: categoryId, checked: false, quantity: 1, addedAt: Date.now() }];
    setItems(newItems);
    unhideCategoriesIfNeeded([categoryId]);
    await saveList(newItems);
  };

  // Hide done — a 40px circular icon button beside the title. It used to be
  // a pill in a row of its own under the trail; that row, and the counter
  // line that shared it, are gone.
  const hideDoneButton = (
    <button
      onClick={toggleHideCompleted}
      aria-label="Hide done items"
      aria-pressed={hideCompleted}
      className="bc-press bc-icon-btn"
      style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0, border: 'none', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        backgroundColor: hideCompleted ? INK : theme.bgTertiary,
        color: hideCompleted ? theme.accentOnInk : theme.textSecondary
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {hideCompleted
          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
      </svg>
    </button>
  );

  const openStatsSheet = () => { triggerHaptic('light'); setCompletion(null); setShowStats(true); };

  // Every celebration and sheet in one place, so the list screen and the
  // desktop shell mount exactly the same overlays.
  const trailOverlays = (
    <>
      {completion && (
        <ShopCompleteScreen
          trip={completion.trip}
          previousTrip={completion.previousTrip}
          milestone={completion.milestone}
          totals={{ since: sinceMonth(trips), months: monthsOfHistory(trips) }}
          t={theme}
          onDismiss={() => setCompletion(null)}
          onOpenStats={openStatsSheet}
        />
      )}
      {showStats && (
        <StatsSheet
          trips={trips}
          t={theme}
          onClose={() => setShowStats(false)}
          onOpenYear={() => { triggerHaptic('light'); setShowStats(false); setShowYearTrail(true); }}
        />
      )}
      {showYearTrail && (
        <YearTrailSheet
          trips={trips}
          t={theme}
          onClose={() => setShowYearTrail(false)}
          onOpenTrip={(trip) => { triggerHaptic('light'); setTripDetail(trip); }}
        />
      )}
      {tripDetail && (
        <div
          onClick={() => setTripDetail(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 230, backgroundColor: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 26px', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}
        >
          <ShopCompleteScreen summary trip={tripDetail} t={theme} onDismiss={() => setTripDetail(null)} onOpenStats={() => {}} />
        </div>
      )}
    </>
  );

  // ── Bold Crumb motion vocabulary ──
  const styles = `
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bcFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bcPop { 0% { transform: scale(1); } 45% { transform: scale(1.18); } 100% { transform: scale(1); } }
    @keyframes bcCharPop { 0% { transform: scale(0.85); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
    @keyframes bcNumIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bcHintIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bcBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    @keyframes breathe {
      0%   { transform: translateY(0px) scale(1); }
      40%  { transform: translateY(-10px) scale(1.08); }
      100% { transform: translateY(0px) scale(1); }
    }
    @keyframes buttonPop {
      0% { transform: scale(1); background-color: #1c1917; }
      50% { transform: scale(1.02); background-color: #FACC15; }
      100% { transform: scale(1); background-color: #FACC15; }
    }
    @keyframes bcSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    /* The crumbs run into the house as the complete screen enters. */
    @keyframes bcCrumbHome {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      70%  { opacity: 1; }
      100% { opacity: 0; transform: translateY(74px) scale(0.3); }
    }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes fabSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .fade-in { animation: fadeIn 0.2s ease-out; }
    .bc-fu1 { animation: bcFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
    .bc-fu2 { animation: bcFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
    .bc-fu3 { animation: bcFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
    .bc-fu4 { animation: bcFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
    .bc-pop { animation: bcPop 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
    .bc-charpop { animation: bcCharPop 0.18s ease-out; }
    .bc-num { display: inline-block; animation: bcNumIn 0.28s cubic-bezier(0.22,1,0.36,1); }
    .bc-hint { animation: bcHintIn 0.25s ease-out; }
    .bc-crumb-home { animation: bcCrumbHome 0.7s cubic-bezier(0.55,0,0.35,1) both; }
    /* The + retracts as the flag draws in. Nothing translates, nothing
       resizes — only the glyph inside the button changes. */
    .bc-glyph { transform-origin: 50% 50%; transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1); }
    .bc-press { transition: transform 0.12s ease; }
    .bc-press:active { transform: scale(0.96); }
    .breathe-1 { animation: breathe 2.8s ease-in-out infinite; }
    .breathe-2 { animation: breathe 3.2s ease-in-out infinite; animation-delay: 0.35s; }
    .breathe-3 { animation: breathe 3.6s ease-in-out infinite; animation-delay: 0.7s; }
    .btn-pop { animation: buttonPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .sync-pulse { animation: pulse 1.5s ease-in-out infinite; }
    input { font-size: 16px !important; }

    /* Every clickable thing looks clickable, and can be reached by keyboard. */
    button, [role="button"] { cursor: pointer; }
    button:disabled { cursor: default; }
    /* Scoped to the controls that had no focus indicator at all. Inputs are
       left alone: they already opt out via focus:outline-none and style their
       own underline, and a blanket rule here would restyle them on phones. */
    button:focus-visible,
    [role="button"]:focus-visible,
    [role="tab"]:focus-visible,
    a:focus-visible { outline: 2px solid ${YELLOW}; outline-offset: 2px; }
    /* Desktop keyboard users still get a ring on text fields; the extra
       :focus outranks the utility class that switches the outline off. */
    @media (min-width: 1024px) {
      input:focus-visible:focus { outline: 2px solid ${YELLOW}; outline-offset: 2px; }
    }
    .bc-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
    .bc-item-row { transition: background-color 0.15s ease; }
    .bc-row-actions { transition: opacity 0.16s ease; }
    .bc-icon-btn { transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease; }

    /* Pointer affordances only where there is a pointer — touch keeps every
       control visible at rest, exactly as it is today. */
    @media (hover: hover) and (pointer: fine) {
      .bc-press:hover { opacity: 0.9; }
      .bc-card:hover { transform: translateY(-2px); box-shadow: ${theme.cardShadow}, 0 10px 28px rgba(0,0,0,${isDark ? '0.32' : '0.07'}); border-color: ${theme.textTertiary}; }
      .bc-item-row:hover { background-color: ${theme.bgTertiary}; }
      .bc-row-actions { opacity: 0; }
      .bc-item-row:hover .bc-row-actions,
      .bc-item-row:focus-within .bc-row-actions,
      .bc-recipe-card:hover .bc-row-actions,
      .bc-recipe-card:focus-within .bc-row-actions,
      .bc-store-card:hover .bc-row-actions,
      .bc-store-card:focus-within .bc-row-actions { opacity: 1; }
      .bc-hover-row:hover { background-color: ${theme.bgTertiary}; }
      .bc-nav-item:hover { background-color: ${theme.bgTertiary}; }
      .bc-icon-btn:hover { background-color: ${theme.bgTertiary}; color: ${theme.text}; border-color: ${theme.textTertiary}; }
      .bc-cta:hover { filter: brightness(0.94); }
      .bc-dashed:hover { border-color: ${theme.text}; background-color: ${theme.bgTertiary}; }
      .bc-fab:hover { transform: scale(1.05); box-shadow: 0 14px 36px rgba(250,204,21,0.5); }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
      /* The glyph swap still needs to be noticeable enough that nobody
         finishes a shop on autopilot — so it cross-fades rather than
         snapping, and never rotates. */
      .bc-glyph { transform: none !important; transition: opacity 0.3s ease !important; transition-duration: 0.3s !important; }
    }
  `;

  const copyShareCode = () => {
    navigator.clipboard?.writeText(listId);
    triggerHaptic('success');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  };

  // Desktop sidebar — wordmark, current list, nav, store switcher, sync status
  const desktopSidebar = isDesktop && (
    <DesktopSidebar
      activeTab={activeTab}
      onTabChange={setActiveTab}
      t={theme}
      ink={INK}
      paper={PAPER}
      listId={listId}
      listName={listName}
      remainingCount={remainingCount}
      recipeCount={recipes.length}
      isOnline={isOnline}
      storeLayouts={storeLayouts}
      activeStoreLayoutId={activeStoreLayoutId}
      onSwitchStore={switchStoreLayout}
      onCopyCode={copyShareCode}
      codeCopied={codeCopied}
    />
  );

  // Shell metrics — the main column gets a real padding/max-width system
  // instead of stopping at an arbitrary point next to the rail.
  const shellPadX = isWide ? 44 : 32;
  const contentMax = { list: isWide ? 1560 : 1240, recipes: isWide ? 1420 : 1160, settings: isWide ? 1180 : 1020 };

  // ── Aisle renderer — Bold Crumb. Only aisles with items appear. ──
  const renderCategory = (category) => {
    const categoryItems = items.filter(item => item.category === category.id);
    if (categoryItems.length === 0) return null;
    const uncheckedCount = categoryItems.filter(i => !i.checked).length;
    const allHidden = hideCompleted && uncheckedCount === 0;
    // Every item in the aisle ticked: the whole section steps back. A small
    // reward in each aisle rather than only at the end of the shop.
    const aisleDone = uncheckedCount === 0;

    return (
      <div
        key={category.id}
        style={{ display: 'grid', gridTemplateRows: allHidden ? '0fr' : '1fr', opacity: allHidden ? 0 : (aisleDone ? 0.5 : 1), transition: 'grid-template-rows 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease', breakInside: 'avoid' }}
      >
        <div style={{ overflow: 'hidden', padding: isDesktop ? '6px 8px 16px' : 0 }}>
          <div
            className={isDesktop ? 'bc-card' : ''}
            style={isDesktop
              ? { backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 18, padding: '15px 16px 12px', boxShadow: theme.cardShadow }
              : { marginBottom: 14 }}
          >
            {/* Aisle label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isDesktop ? 6 : 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textSecondary, whiteSpace: 'nowrap', flexShrink: 0 }}>{category.name}</span>
              {uncheckedCount > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: YELLOW, color: '#1c1917', borderRadius: 9999, padding: '1px 8px', flexShrink: 0 }}>{uncheckedCount}</span>
              ) : (
                <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: YELLOW, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, height: 1.5, backgroundColor: isDesktop ? theme.borderLight : theme.border }} />
            </div>

            {/* Items */}
            {categoryItems.map(item => {
              const isChecking = checkingItems.has(item.id);
              const isEditingQty = editingQuantityId === item.id;
              const quantity = item.quantity || 1;
              const rowHidden = hideCompleted && item.checked;

              return (
                <div
                  key={item.id}
                  style={{ display: 'grid', gridTemplateRows: rowHidden ? '0fr' : '1fr', opacity: rowHidden ? 0 : 1, transition: 'grid-template-rows 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease' }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      className={`flex items-center gap-3${isDesktop ? ' bc-item-row' : ''}`}
                      style={isDesktop
                        ? { padding: '8px 9px', margin: '0 -9px', borderRadius: 10 }
                        : { padding: '10px 0' }}
                      onTouchStart={() => {
                        if (!item.checked) {
                          longPressTimerRef.current = setTimeout(() => {
                            triggerHaptic('light');
                            setLongPressItem(item);
                          }, 500);
                        }
                      }}
                      onTouchEnd={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                      onTouchMove={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={isChecking ? 'bc-pop' : ''}
                        style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          border: `2.5px solid ${item.checked ? YELLOW : INK}`,
                          backgroundColor: item.checked ? YELLOW : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', padding: 0,
                          transition: 'background-color 0.18s ease, border-color 0.18s ease',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12l6 6L20 6" style={{ strokeDasharray: 24, strokeDashoffset: item.checked ? 0 : 24, transition: item.checked ? 'stroke-dashoffset 0.25s ease 0.08s' : 'none' }} />
                        </svg>
                      </button>

                      {editingId === item.id ? (
                        <input
                          type="text" value={editText} onChange={(e) => setEditText(e.target.value)}
                          onBlur={saveEdit} onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="flex-1 py-1 px-2 rounded-lg focus:outline-none"
                          style={{ backgroundColor: theme.bgTertiary, color: theme.text, fontSize: 15, fontWeight: 600 }}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="flex-1"
                          style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: item.checked ? theme.textTertiary : INK, transition: 'color 0.25s ease', position: 'relative', minWidth: 0 }}
                          onClick={() => !item.checked && startEdit(item)}
                        >
                          {item.name}
                          <span style={{ position: 'absolute', left: 0, top: '54%', height: 1.5, width: item.checked ? '100%' : '0%', maxWidth: '100%', backgroundColor: theme.textTertiary, transition: item.checked ? 'width 0.28s cubic-bezier(0.22,1,0.36,1) 0.06s' : 'width 0.18s ease', pointerEvents: 'none' }} />
                          {showingCategoryTag.has(item.id) && (
                            <span style={{ fontSize: 11, color: theme.textSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 9999, padding: '2px 8px', marginLeft: 8, display: 'inline-block', animation: 'fadeIn 0.2s ease-out', whiteSpace: 'nowrap', fontWeight: 500 }}>
                              {categories.find(c => c.id === item.category)?.name || item.category}
                            </span>
                          )}
                        </span>
                      )}

                      {isEditingQty ? (
                        <div className="flex items-center gap-1 fade-in quantity-editor">
                          <button onClick={() => updateQuantity(item.id, -1)} className="bc-press" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.bgTertiary, color: INK, border: 'none', cursor: 'pointer', fontSize: 14 }}>−</button>
                          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, width: 24, textAlign: 'center', color: INK }}>{quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="bc-press" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.bgTertiary, color: INK, border: 'none', cursor: 'pointer', fontSize: 14 }}>+</button>
                          <button onClick={() => setEditingQuantityId(null)} className="bc-press" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: YELLOW, color: '#1c1917', border: 'none', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>✓</button>
                        </div>
                      ) : (() => {
                        // Quantity and delete. On a pointer device these fade in
                        // on row hover (see .bc-row-actions) so a full aisle
                        // card reads as names, not controls; on touch they stay
                        // exactly where they have always been.
                        const quantityButton = !item.checked && (
                          <button
                            onClick={() => setEditingQuantityId(item.id)}
                            className="bc-press"
                            aria-label={`Change quantity of ${item.name}`}
                            style={{ fontSize: 12, fontWeight: 700, fontFamily: MONO, color: INK, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '4px 6px' }}
                          >
                            ×{quantity}
                          </button>
                        );
                        const deleteButton = (
                          <button onClick={() => deleteItem(item.id)} aria-label={`Delete ${item.name}`} style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 300, flexShrink: 0, padding: 0 }}>×</button>
                        );
                        if (!isDesktop) return <>{quantityButton}{deleteButton}</>;
                        // A quantity above one is information, not just an
                        // affordance, so it stays legible at rest; ×1 and the
                        // delete cross fade in with the pointer.
                        return (
                          <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                            {quantity > 1
                              ? quantityButton
                              : <span className="bc-row-actions" style={{ display: 'flex' }}>{quantityButton}</span>}
                            <span className="bc-row-actions" style={{ display: 'flex' }}>{deleteButton}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── "Move … to" sheet ──
  // The list's long-press reassign sheet, shared with the recipe editor.
  const renderMoveSheet = (name, currentCategoryId, onPick, onClose) => (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: theme.overlay }} onClick={onClose}>
      <div className="w-full max-h-[75vh] flex flex-col" style={{ backgroundColor: PAPER, borderRadius: '28px 28px 0 0', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center" style={{ marginTop: 12, marginBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: theme.border }} />
        </div>
        <div className="px-6 py-3" style={{ borderBottom: `1.5px solid ${theme.border}` }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.015em', color: INK, margin: 0 }}>Move "{name}" to…</h2>
        </div>
        <div className="overflow-y-auto px-6 py-2" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
          {visibleCategories.map((cat) => {
            const isCurrent = cat.id === currentCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => onPick(cat.id)}
                className="w-full flex items-center justify-between bc-press"
                style={{ padding: '14px 0', background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.borderLight}`, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 15, fontWeight: isCurrent ? 700 : 600, color: INK }}>{cat.name}</span>
                {isCurrent && (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 6"/></svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Recipe editor ──
  // One input finds each ingredient's aisle; the filled aisles are listed
  // below it in store order. Shared by both layouts: phone keeps the
  // underlined-row treatment, desktop puts each aisle on a card.
  const renderAisleHeading = (name, count) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className={isDesktop ? 'truncate' : undefined} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textSecondary, whiteSpace: 'nowrap', flexShrink: isDesktop ? 1 : 0 }}>{name}</span>
      <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: YELLOW, color: '#1c1917', borderRadius: 9999, padding: '1px 8px', flexShrink: 0 }}>{count}</span>
      <div style={{ flex: 1, height: 1.5, backgroundColor: theme.borderLight, minWidth: 8 }} />
    </div>
  );

  const renderRecipeIngredientRow = (ingredient) => {
    const isEditing = editingIngredientId === ingredient.id;
    const cancelLongPress = () => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); };
    const fieldStyle = { backgroundColor: theme.bgTertiary, color: INK, border: 'none', borderRadius: 8, padding: '5px 8px', width: '100%' };
    return (
      <div
        key={ingredient.id}
        className={`flex items-center gap-3 fade-in${isDesktop ? ' bc-item-row' : ''}`}
        style={isDesktop ? { padding: '7px 8px', margin: '0 -8px', borderRadius: 10 } : { padding: '9px 0' }}
        onTouchStart={() => {
          if (isEditing) return;
          longPressTimerRef.current = setTimeout(() => {
            triggerHaptic('light');
            setMovingIngredient(ingredient);
          }, 500);
        }}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
      >
        {isEditing ? (
          <div
            className="flex-1"
            style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) saveEditIngredient(); }}
          >
            <input
              type="text"
              value={editingIngredientName}
              onChange={(e) => setEditingIngredientName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEditIngredient(); }}
              aria-label="Ingredient name"
              className="focus:outline-none"
              style={{ ...fieldStyle, fontSize: 15, fontWeight: 600 }}
              autoFocus
            />
            <input
              type="text"
              value={editingIngredientNote}
              onChange={(e) => setEditingIngredientNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEditIngredient(); }}
              placeholder="Note (optional)"
              aria-label="Ingredient note"
              className="focus:outline-none"
              style={{ ...fieldStyle, fontSize: 13, color: theme.textSecondary }}
            />
          </div>
        ) : (
          <div className="flex-1" style={{ minWidth: 0 }}>
            <span
              role="button"
              tabIndex={0}
              onClick={() => startEditIngredient(ingredient)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEditIngredient(ingredient); } }}
              aria-label={`Edit ${ingredient.name}`}
              style={{ fontSize: isDesktop ? 14.5 : 15.5, fontWeight: 600, color: INK, cursor: 'text', overflowWrap: 'anywhere' }}
            >
              {ingredient.name}
              {showingCategoryTag.has(ingredient.id) && (
                <span style={{ fontSize: 11, color: theme.textSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 9999, padding: '2px 8px', marginLeft: 8, display: 'inline-block', animation: 'fadeIn 0.2s ease-out', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {categories.find(c => c.id === ingredient.category)?.name || ingredient.category}
                </span>
              )}
            </span>
            {ingredient.note && (
              <div style={{ fontSize: 12.5, color: theme.textTertiary, marginTop: 2, lineHeight: 1.35 }}>{ingredient.note}</div>
            )}
          </div>
        )}
        {isDesktop && (
          <span className="bc-row-actions" style={{ display: 'flex' }}>
            <button
              onClick={() => setMovingIngredient(ingredient)}
              className="bc-icon-btn"
              aria-label={`Change aisle for ${ingredient.name}`}
              title="Change aisle"
              style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${theme.borderLight}`, background: 'none', color: theme.textTertiary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4L3 8l4 4" /><path d="M3 8h13" /><path d="M17 20l4-4-4-4" /><path d="M21 16H8" /></svg>
            </button>
          </span>
        )}
        <button onClick={() => updateRecipeIngredientQuantity(ingredient.id, -1)} className="bc-press" aria-label={`One fewer ${ingredient.name}`} style={stepperButtonStyle(theme)}>−</button>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: INK, width: 30, textAlign: 'center', flexShrink: 0 }}>×{ingredient.quantity || 1}</span>
        <button onClick={() => updateRecipeIngredientQuantity(ingredient.id, 1)} className="bc-press" aria-label={`One more ${ingredient.name}`} style={stepperButtonStyle(theme)}>+</button>
        <button onClick={() => removeRecipeIngredient(ingredient.id)} aria-label={`Remove ${ingredient.name}`} style={{ width: 28, height: 28, color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 300, padding: 0, flexShrink: 0 }}>×</button>
      </div>
    );
  };

  const recipeEditorGroups = recipeGroups(newRecipeIngredients);
  const recipeIngredientCategoryCount = recipeEditorGroups.length;
  const recipeSaveReady = !!newRecipeName.trim() && newRecipeIngredients.length > 0 && !savingRecipe;
  const recipeAddReady = !!newRecipeItemText.trim();

  const recipeAdder = (
    <div>
      <div className="flex items-center gap-3">
        <input
          ref={recipeInputRef}
          type="text"
          value={newRecipeItemText}
          onChange={(e) => { setNewRecipeItemText(e.target.value); setRecipeNoMatch(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRecipeAdd(); if (e.key === 'Escape') setRecipeNoMatch(null); }}
          placeholder="Add an ingredient — e.g. 400g chicken thighs"
          aria-label="Add an ingredient"
          className="flex-1 py-2 focus:outline-none bg-transparent"
          style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 15, fontWeight: 600, minWidth: 0 }}
        />
        <button
          onClick={handleRecipeAdd}
          disabled={!recipeAddReady}
          className="bc-press bc-cta"
          style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: recipeAddReady ? YELLOW : theme.bgTertiary, color: recipeAddReady ? '#1c1917' : theme.textTertiary, cursor: recipeAddReady ? 'pointer' : 'default', flexShrink: 0 }}
        >
          Add
        </button>
      </div>

      {recipeNoMatch && (isDesktop ? (
        <div
          className="fade-in"
          style={{ marginTop: 12, backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 18, boxShadow: theme.cardShadow, padding: 14 }}
        >
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 10px' }}>Which aisle?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {visibleCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleRecipeChipSelect(cat.id)}
                className="bc-press bc-cta"
                style={{ backgroundColor: 'transparent', color: INK, fontSize: 12.5, fontWeight: 700, borderRadius: 9999, padding: '7px 14px', border: `2px solid ${INK}`, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="fade-in" style={{ marginTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 8px' }}>Which aisle?</p>
          <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
            {visibleCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleRecipeChipSelect(cat.id)}
                className="bc-press"
                style={{ display: 'inline-block', backgroundColor: theme.bgSecondary, color: INK, fontSize: 12.5, fontWeight: 700, borderRadius: 9999, padding: '8px 16px', border: `2px solid ${INK}`, marginRight: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      ))}

      {newRecipeIngredients.length === 0 && !recipeNoMatch && (
        <p style={{ fontSize: 13, color: theme.textTertiary, margin: '10px 0 0' }}>Type anything — it'll find its aisle.</p>
      )}
    </div>
  );

  const recipeFieldLabelStyle = isDesktop
    ? { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.textTertiary }
    : { fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textSecondary };

  const recipeServesStepper = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span id="bc-recipe-serves" style={{ ...recipeFieldLabelStyle, flex: 1 }}>Serves</span>
      <button
        onClick={() => stepRecipeServings(-1)}
        disabled={newRecipeServings === null}
        className="bc-press"
        aria-label="Fewer servings"
        style={{ ...stepperButtonStyle(theme), opacity: newRecipeServings === null ? 0.4 : 1 }}
      >
        −
      </button>
      <span aria-labelledby="bc-recipe-serves" aria-live="polite" style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, color: newRecipeServings === null ? theme.textTertiary : INK, width: 30, textAlign: 'center' }}>
        {newRecipeServings === null ? '—' : newRecipeServings}
      </span>
      <button
        onClick={() => stepRecipeServings(1)}
        disabled={newRecipeServings === 50}
        className="bc-press"
        aria-label="More servings"
        style={{ ...stepperButtonStyle(theme), opacity: newRecipeServings === 50 ? 0.4 : 1 }}
      >
        +
      </button>
    </div>
  );

  // ── Recipe list ──
  const RECIPE_FILTERS = [['all', 'All'], ['favourites', 'Favourites'], ['wantToCook', 'Want to cook']];
  const filteredRecipes = recipeFilter === 'favourites'
    ? recipes.filter(r => r.favourite === true)
    : recipeFilter === 'wantToCook'
      ? recipes.filter(r => r.wantToCook === true)
      : recipes;
  const viewingRecipe = viewingRecipeId ? recipes.find(r => r.id === viewingRecipeId) : null;
  const openRecipe = (recipe) => { triggerHaptic('light'); setViewingRecipeId(recipe.id); };
  // Buttons inside a tappable recipe row or card do only their own job.
  const stopThen = (fn) => (e) => { e.stopPropagation(); fn(); };
  const openOnKey = (recipe) => (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRecipe(recipe); }
  };

  const recipeFilterPills = recipes.length > 0 && (
    <div role="group" aria-label="Filter recipes" style={{ display: 'flex', gap: 6, paddingTop: isDesktop ? 22 : 8, paddingBottom: isDesktop ? 0 : 4, maxWidth: isDesktop ? 440 : 'none' }}>
      {RECIPE_FILTERS.map(([id, label]) => {
        const active = recipeFilter === id;
        return (
          <button
            key={id}
            aria-pressed={active}
            onClick={() => { triggerHaptic('light'); setRecipeFilter(id); }}
            className="bc-press"
            style={{
              flex: 1, minWidth: 0, height: 40, borderRadius: 9999, cursor: 'pointer', whiteSpace: 'nowrap',
              fontSize: 13, fontWeight: 700,
              backgroundColor: active ? YELLOW : 'transparent',
              color: active ? '#1c1917' : theme.textSecondary,
              border: active ? '2px solid transparent' : `2px solid ${theme.border}`,
              transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease'
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  const recipeFilterEmpty = recipes.length > 0 && filteredRecipes.length === 0 && (
    <p style={{ fontSize: 14, color: theme.textTertiary, margin: 0, padding: isDesktop ? '22px 0 0' : '18px 0 4px' }}>
      {recipeFilter === 'favourites' ? 'No favourites yet — tap the ☆ on a recipe.' : 'Nothing on your want-to-cook list yet.'}
    </p>
  );

  // ════════════════ Recipes Screen ════════════════
  if (activeTab === 'recipes' && listId) {
    return (
      <div
        className="min-h-screen"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: PAPER, paddingLeft: isDesktop ? SIDEBAR_WIDTH : 0 }}
      >
        <style>{styles}</style>
        {desktopSidebar}
        <Toast message={toastMessage} visible={showToast} t={theme} />

        {/* Paper header. In the desktop editor it scrolls away — the sticky
            left panel carries the name, the count and Save/Cancel from there. */}
        <div
          className={isDesktop && showCreateRecipe ? '' : 'sticky top-0 z-40'}
          style={{ backgroundColor: PAPER, borderBottom: `1.5px solid ${theme.border}`, padding: isDesktop ? `20px ${shellPadX}px 18px` : '12px 28px 18px' }}
        >
          <div style={{ maxWidth: isDesktop ? contentMax.recipes : 'none', margin: isDesktop ? '0 auto' : undefined }}>
          {showCreateRecipe ? (
            isDesktop ? (
              <div className="flex items-center" style={{ gap: 14 }}>
                <button
                  onClick={cancelCreateRecipe}
                  className="bc-press bc-icon-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 700, color: theme.textSecondary, background: 'none', border: `1.5px solid ${theme.border}`, borderRadius: 9999, cursor: 'pointer', padding: '7px 14px 7px 11px' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                  Recipes
                </button>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', color: INK, margin: 0 }}>
                  {editingRecipeId ? 'Edit recipe' : 'New recipe'}
                </h1>
              </div>
            ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={resetRecipeEditor}
                className="bc-press"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: INK, margin: 0 }}>
                {editingRecipeId ? 'Edit recipe' : 'New recipe'}
              </h1>
              <div style={{ width: 56 }} />
            </div>
            )
          ) : isDesktop ? (
            <div className="flex items-end justify-between" style={{ gap: 24 }}>
              <div>
                <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: INK }}>Recipes</h1>
                <p style={{ fontSize: 13.5, color: theme.textSecondary, margin: '7px 0 0' }}>
                  {recipes.length === 0
                    ? 'A whole meal, dropped on the list at once.'
                    : `${recipes.length} saved · a whole meal, dropped on the list at once.`}
                </p>
              </div>
              <button
                onClick={() => setShowCreateRecipe(true)}
                className="bc-press bc-cta"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', fontSize: 13.5, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: YELLOW, color: '#1c1917', cursor: 'pointer', flexShrink: 0 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                New recipe
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: INK }}>Recipes</h1>
              <p style={{ fontSize: 14, color: theme.textSecondary, margin: '6px 0 0' }}>A whole meal, dropped on the list at once.</p>
            </>
          )}
          </div>
        </div>

        <div style={{ padding: isDesktop ? `0 ${shellPadX}px` : '6px 28px 0', paddingBottom: isDesktop ? 40 : 110, maxWidth: isDesktop ? contentMax.recipes : 'none', margin: isDesktop ? '0 auto' : undefined }}>
          {showCreateRecipe ? (
            isDesktop ? (
              /* Desktop editor: a sticky panel holds the recipe's identity and
                 its Save/Cancel. The right column is the ingredient input,
                 with the filled aisles as cards underneath it. */
              <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: isWide ? '340px 1fr' : '300px 1fr', gap: 28, alignItems: 'start', paddingTop: 22 }}>
                <div style={{ position: 'sticky', top: 24 }}>
                  <div style={{ backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 20, padding: 20, boxShadow: theme.cardShadow }}>
                    <label htmlFor="bc-recipe-name" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.textTertiary, display: 'block', marginBottom: 7 }}>Recipe name</label>
                    <input
                      id="bc-recipe-name"
                      type="text"
                      value={newRecipeName}
                      onChange={(e) => setNewRecipeName(e.target.value)}
                      placeholder="e.g. Sunday Roast…"
                      className="w-full py-2 focus:outline-none bg-transparent"
                      style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 16, fontWeight: 700, marginBottom: 20 }}
                      autoFocus
                    />

                    <label htmlFor="bc-recipe-notes" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.textTertiary, display: 'block', marginBottom: 7 }}>Source (optional)</label>
                    <input
                      id="bc-recipe-notes"
                      type="text"
                      value={newRecipeNotes}
                      onChange={(e) => setNewRecipeNotes(e.target.value)}
                      placeholder="e.g. pg 74, yellow cookbook"
                      className="w-full py-2 focus:outline-none bg-transparent"
                      style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 14, fontWeight: 500, marginBottom: 20 }}
                    />

                    <div style={{ marginBottom: 22 }}>{recipeServesStepper}</div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span className="bc-num" key={newRecipeIngredients.length} style={{ fontSize: 34, fontWeight: 800, fontFamily: MONO, letterSpacing: '-0.03em', color: newRecipeIngredients.length ? INK : theme.textTertiary, lineHeight: 1 }}>
                        {newRecipeIngredients.length}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: theme.textSecondary }}>
                        {newRecipeIngredients.length === 1 ? 'ingredient' : 'ingredients'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: theme.textTertiary, margin: '0 0 18px', lineHeight: 1.5 }}>
                      {recipeIngredientCategoryCount === 0
                        ? 'Add ingredients on the right to start.'
                        : `across ${recipeIngredientCategoryCount} ${recipeIngredientCategoryCount === 1 ? 'aisle' : 'aisles'}`}
                    </p>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={cancelCreateRecipe}
                        disabled={savingRecipe}
                        className="bc-press bc-icon-btn"
                        style={{ flex: 1, padding: '12px 0', fontSize: 13.5, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer', opacity: savingRecipe ? 0.5 : 1 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveRecipe}
                        disabled={!recipeSaveReady}
                        className="bc-press bc-cta"
                        style={{
                          flex: 1.4, padding: '12px 0', fontSize: 13.5, fontWeight: 700, borderRadius: 9999, border: 'none',
                          backgroundColor: recipeSaveReady ? YELLOW : theme.border,
                          color: recipeSaveReady ? '#1c1917' : theme.textTertiary,
                          cursor: recipeSaveReady ? 'pointer' : 'default',
                          opacity: recipeSaveReady ? 1 : 0.5,
                        }}
                      >
                        {savingRecipe ? 'Saving…' : (editingRecipeId ? 'Update' : 'Save recipe')}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ paddingBottom: 40 }}>
                  <div style={{ backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 20, padding: '14px 18px 16px', boxShadow: theme.cardShadow, marginBottom: 22 }}>
                    {recipeAdder}
                  </div>

                  {recipeEditorGroups.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
                      {recipeEditorGroups.map(group => (
                        <div
                          key={group.id}
                          className="bc-card"
                          style={{ backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 18, padding: '14px 16px', boxShadow: theme.cardShadow }}
                        >
                          {renderAisleHeading(group.name, group.ingredients.length)}
                          <div style={{ marginTop: 6 }}>{group.ingredients.map(renderRecipeIngredientRow)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
            <div className="fade-in" style={{ paddingBottom: 90 }}>
              {/* Recipe name */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textSecondary, display: 'block', marginBottom: 6 }}>Recipe name</label>
                <input
                  type="text"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  placeholder="e.g. Sunday Roast, Pasta Bolognese…"
                  className="w-full py-2 focus:outline-none bg-transparent"
                  style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 16, fontWeight: 600 }}
                  autoFocus
                />
              </div>

              {/* Recipe source */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textSecondary, display: 'block', marginBottom: 6 }}>Source (optional)</label>
                <input
                  type="text"
                  value={newRecipeNotes}
                  onChange={(e) => setNewRecipeNotes(e.target.value)}
                  placeholder="e.g. pg 74, yellow cookbook"
                  className="w-full py-2 focus:outline-none bg-transparent"
                  style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 16, fontWeight: 500 }}
                />
              </div>

              {/* Serves */}
              <div style={{ marginBottom: 26 }}>{recipeServesStepper}</div>

              {/* One input — each ingredient finds its own aisle */}
              <div style={{ marginBottom: 22 }}>{recipeAdder}</div>

              {recipeEditorGroups.map(group => (
                <div key={group.id} style={{ marginBottom: 14 }}>
                  {renderAisleHeading(group.name, group.ingredients.length)}
                  {group.ingredients.map(renderRecipeIngredientRow)}
                </div>
              ))}
            </div>
            )
          ) : (
            <>
              {recipeFilterPills}
              {recipeFilterEmpty}
              {recipes.length === 0 ? (
                <div className="text-center" style={{ paddingTop: 60, paddingBottom: 40 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: YELLOW }} />
                    <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6, alignSelf: 'center' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3, alignSelf: 'center' }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', color: INK, marginBottom: 8 }}>No recipes yet</h3>
                  <p style={{ fontSize: 14, color: theme.textSecondary, maxWidth: 260, margin: '0 auto', lineHeight: 1.55 }}>
                    Save your favourite meals and add every ingredient to your list in one tap.
                  </p>
                </div>
              ) : isDesktop ? (
                /* Card grid. Ingredients read as chips, and Edit/Delete stay
                   out of the way until the pointer is on the card. Clicking
                   the card opens the recipe sheet. */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 18, alignItems: 'start', paddingTop: 18, paddingBottom: 12 }}>
                  {filteredRecipes.map((recipe) => {
                    const isAdded = addingRecipeId === recipe.id;
                    const ingredients = recipe.ingredients || [];
                    const shownIngredients = ingredients.slice(0, 5);
                    const overflowCount = ingredients.length - shownIngredients.length;
                    return (
                      <div
                        key={recipe.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${recipe.name}`}
                        onClick={() => openRecipe(recipe)}
                        onKeyDown={openOnKey(recipe)}
                        className="bc-card bc-recipe-card"
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 20, boxShadow: theme.cardShadow, overflow: 'hidden', minHeight: 196 }}
                      >
                        <div style={{ padding: '17px 16px 0 16px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <h3 className="flex-1" style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', margin: 0, color: INK, lineHeight: 1.25, minWidth: 0 }}>
                              {recipe.name}
                              <span style={{ display: 'inline-flex', marginLeft: 7, verticalAlign: '-1px' }}><RecipeFlagMarks recipe={recipe} /></span>
                            </h3>
                            <div className="bc-row-actions" style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button
                                onClick={stopThen(() => startEditRecipe(recipe))}
                                className="bc-icon-btn"
                                aria-label={`Edit ${recipe.name}`}
                                title="Edit"
                                style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${theme.borderLight}`, background: 'none', color: theme.textTertiary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                              </button>
                              <button
                                onClick={stopThen(() => { triggerHaptic('light'); setDeletingRecipeId(recipe.id); })}
                                className="bc-icon-btn"
                                aria-label={`Delete ${recipe.name}`}
                                title="Delete"
                                style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${theme.borderLight}`, background: 'none', color: theme.textTertiary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                              </button>
                            </div>
                          </div>

                          <p style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, letterSpacing: '0.06em', color: theme.textTertiary, margin: '7px 0 12px' }}>
                            {ingredients.length} {ingredients.length === 1 ? 'INGREDIENT' : 'INGREDIENTS'}
                            {recipeServings(recipe) && ` · SERVES ${recipeServings(recipe)}`}
                          </p>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {shownIngredients.map(ing => (
                              <span key={ing.id} style={{ fontSize: 11.5, fontWeight: 600, color: theme.textSecondary, backgroundColor: theme.bgTertiary, border: `1px solid ${theme.borderLight}`, borderRadius: 9999, padding: '4px 10px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ing.name}
                              </span>
                            ))}
                            {overflowCount > 0 && (
                              <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.textTertiary, padding: '4px 4px' }}>+{overflowCount} more</span>
                            )}
                          </div>

                          {recipe.notes && (
                            <p style={{ fontSize: 12, fontStyle: 'italic', color: theme.textTertiary, margin: '10px 0 0', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {recipe.notes}
                            </p>
                          )}
                        </div>

                        <div style={{ padding: '14px 16px 16px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={stopThen(() => addRecipeToList(recipe))}
                            className="bc-press bc-cta"
                            style={{ width: 84, padding: '10px 0', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: isAdded ? INK : YELLOW, color: isAdded ? theme.accentOnInk : '#1c1917', cursor: 'pointer', transition: 'background-color 0.22s ease, color 0.22s ease' }}
                          >
                            {isAdded ? 'Added ✓' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Keeps the grid from trailing off into blank canvas, and
                      puts the primary action at the end of the reading order. */}
                  <button
                    onClick={() => setShowCreateRecipe(true)}
                    className="bc-dashed bc-card"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 196, borderRadius: 20, border: `2px dashed ${theme.border}`, background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 20 }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: YELLOW }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>New recipe</span>
                    <span style={{ fontSize: 12, color: theme.textTertiary, textAlign: 'center', lineHeight: 1.5, maxWidth: 200 }}>
                      Save a meal once, add every ingredient in one click.
                    </span>
                  </button>
                </div>
              ) : (
                <div>
                  {filteredRecipes.map((recipe) => {
                    const ingredientNames = (recipe.ingredients || []).map(i => i.name);
                    const preview = ingredientNames.slice(0, 4).join(', ') + (ingredientNames.length > 4 ? '…' : '');
                    const isAdded = addingRecipeId === recipe.id;
                    return (
                      <div
                        key={recipe.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${recipe.name}`}
                        onClick={() => openRecipe(recipe)}
                        onKeyDown={openOnKey(recipe)}
                        style={{ padding: '18px 0', borderBottom: `1.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 16 }}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', margin: 0, color: INK }}>
                            {recipe.name}
                            <span style={{ display: 'inline-flex', marginLeft: 7, verticalAlign: '-1px' }}><RecipeFlagMarks recipe={recipe} size={14} /></span>
                          </h3>
                          <div style={{ fontSize: 12.5, color: theme.textTertiary, margin: '6px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontFamily: MONO, fontWeight: 700, color: INK, flexShrink: 0 }}>{ingredientNames.length}</span>
                            {preview && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>· {preview}</span>}
                          </div>
                          {recipe.notes && (
                            <p style={{ fontSize: 12.5, fontStyle: 'italic', color: theme.textTertiary, margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {recipe.notes}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                            <button onClick={stopThen(() => startEditRecipe(recipe))} style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit</button>
                            <button onClick={stopThen(() => { triggerHaptic('light'); setDeletingRecipeId(recipe.id); })} style={{ fontSize: 13, fontWeight: 600, color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                          </div>
                        </div>
                        <button
                          onClick={stopThen(() => addRecipeToList(recipe))}
                          className="bc-press"
                          style={{ padding: '11px 0', width: 80, fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: isAdded ? INK : YELLOW, color: isAdded ? theme.accentOnInk : '#1c1917', cursor: 'pointer', flexShrink: 0, transition: 'background-color 0.22s ease, color 0.22s ease' }}
                        >
                          {isAdded ? 'Added ✓' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* New recipe — desktop puts this CTA in the header instead */}
              {!isDesktop && (
                <button
                  onClick={() => setShowCreateRecipe(true)}
                  className="bc-press"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M12 5v14M5 12h14"/></svg>
                  <span style={{ fontSize: 16, fontWeight: 600, color: theme.textSecondary }}>New recipe</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Sticky Save/Cancel footer — phone only; desktop keeps these in the
            editor's left panel where the recipe name and count already live. */}
        {showCreateRecipe && !isDesktop && (
          <div className="fixed bottom-0 left-0 right-0 p-4 z-40" style={{ backgroundColor: PAPER, borderTop: `1.5px solid ${theme.border}` }}>
            <div className="flex gap-3 max-w-lg mx-auto">
              <button
                onClick={cancelCreateRecipe}
                disabled={savingRecipe}
                className="flex-1 py-3 bc-press"
                style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer', opacity: savingRecipe ? 0.5 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={saveRecipe}
                disabled={!newRecipeName.trim() || newRecipeIngredients.length === 0 || savingRecipe}
                className="flex-1 py-3 bc-press"
                style={{
                  fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none',
                  backgroundColor: (newRecipeName.trim() && newRecipeIngredients.length > 0 && !savingRecipe) ? YELLOW : theme.border,
                  color: (newRecipeName.trim() && newRecipeIngredients.length > 0 && !savingRecipe) ? '#1c1917' : theme.textTertiary, cursor: 'pointer',
                  opacity: (newRecipeName.trim() && newRecipeIngredients.length > 0 && !savingRecipe) ? 1 : 0.5,
                }}
              >
                {savingRecipe ? 'Saving…' : (editingRecipeId ? `Update (${newRecipeIngredients.length})` : `Save recipe (${newRecipeIngredients.length})`)}
              </button>
            </div>
          </div>
        )}

        {viewingRecipe && (
          <RecipeSheet
            key={viewingRecipe.id}
            recipe={viewingRecipe}
            groups={recipeGroups(viewingRecipe.ingredients)}
            t={theme}
            added={addingRecipeId === viewingRecipe.id}
            onClose={() => setViewingRecipeId(null)}
            onToggleFlag={toggleRecipeFlag}
            onAdd={addRecipeToList}
            onEdit={startEditRecipe}
          />
        )}

        {movingIngredient && renderMoveSheet(
          movingIngredient.name,
          movingIngredient.category,
          (categoryId) => moveRecipeIngredient(movingIngredient, categoryId),
          () => setMovingIngredient(null)
        )}

        {/* Delete Recipe Confirmation */}
        {deletingRecipeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: theme.overlay }}>
            <div className="w-full max-w-xs text-center" style={{ backgroundColor: theme.bgSecondary, borderRadius: 24, padding: 28 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: INK, marginBottom: 8 }}>Delete recipe?</h2>
              <p style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 6, lineHeight: 1.5 }}>
                This permanently deletes "{recipes.find(r => r.id === deletingRecipeId)?.name}".
              </p>
              <p style={{ fontSize: 12.5, color: theme.textTertiary, marginBottom: 22 }}>This affects everyone sharing this list.</p>
              <div className="flex gap-3">
                <button onClick={() => { triggerHaptic('light'); setDeletingRecipeId(null); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={confirmDeleteRecipe} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: INK, color: PAPER, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {!isDesktop && !showCreateRecipe && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} t={theme} />}
      </div>
    );
  }

  // ════════════════ Settings Screen ════════════════
  if (activeTab === 'settings' && listId) {
    const inSubSection = settingsTab !== 'general';
    // Desktop settings are grouped into titled cards rather than one long
    // stack of divider rows; these keep the three parts consistent.
    const settingsCardStyle = { backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 20, padding: '18px 20px 20px', boxShadow: theme.cardShadow };
    const settingsCardHeader = { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 };
    const settingsCardTitle = { fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textSecondary, margin: 0 };
    return (
      <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: PAPER, paddingLeft: isDesktop ? SIDEBAR_WIDTH : 0 }}>
        <style>{styles}</style>
        {desktopSidebar}
        <Toast message={toastMessage} visible={showToast} t={theme} />

        {/* Paper header with the share code card */}
        <div style={{ padding: isDesktop ? `20px ${shellPadX}px 0` : '12px 28px 0' }}>
          <div style={{ maxWidth: isDesktop ? contentMax.settings : 'none', margin: isDesktop ? '0 auto' : undefined }}>
          {isDesktop ? (
            /* No drill-down on desktop — there is room for all three sections
               as tabs, and the share code already lives in the sidebar. */
            <>
              <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: INK }}>Settings</h1>
              <div role="tablist" style={{ display: 'flex', gap: 4, marginTop: 18, borderBottom: `1.5px solid ${theme.border}` }}>
                {[['general', 'General'], ['stores', 'Stores'], ['categories', 'Categories']].map(([id, label]) => {
                  const isActive = settingsTab === id;
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => { setSettingsTab(id); triggerHaptic('light'); }}
                      className="bc-hover-row"
                      style={{
                        padding: '11px 16px', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: isActive ? INK : theme.textTertiary,
                        borderTopLeftRadius: 10, borderTopRightRadius: 10,
                        boxShadow: isActive ? `inset 0 -2.5px 0 ${YELLOW}` : 'none',
                        transition: 'color 0.18s ease, background-color 0.18s ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          ) : inSubSection ? (
            <div className="flex items-center" style={{ gap: 12 }}>
              <button
                onClick={() => { setSettingsTab('general'); triggerHaptic('light'); }}
                className="bc-press flex items-center"
                style={{ gap: 6, fontSize: 14, fontWeight: 700, color: theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                Settings
              </button>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', margin: 0, color: INK }}>
                {settingsTab === 'stores' ? 'Stores' : 'Categories'}
              </h1>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: INK }}>Settings</h1>
              <div style={{ marginTop: 16, borderRadius: 18, border: `1.5px solid ${theme.border}`, background: theme.bgSecondary, padding: '16px 18px', boxShadow: theme.cardShadow }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: theme.textTertiary, textTransform: 'uppercase', margin: '0 0 6px' }}>Share code</p>
                    <span style={{ fontSize: 26, fontWeight: 700, fontFamily: MONO, letterSpacing: '0.14em', color: INK }}>{listId}</span>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(listId); triggerHaptic('success'); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 1500); }}
                    className="bc-press"
                    style={{ padding: '11px 0', width: 86, fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: codeCopied ? INK : YELLOW, color: codeCopied ? theme.accentOnInk : '#1c1917', cursor: 'pointer', transition: 'background-color 0.22s ease, color 0.22s ease' }}
                  >
                    {codeCopied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: theme.textTertiary, margin: '10px 0 0', lineHeight: 1.45 }}>Anyone with this code follows the same trail.</p>
              </div>
            </>
          )}
          </div>
        </div>

        <div style={{ padding: isDesktop ? `22px ${shellPadX}px 0` : '10px 28px 0', paddingBottom: isDesktop ? 48 : 110, maxWidth: isDesktop ? contentMax.settings : 'none', margin: isDesktop ? '0 auto' : undefined }}>

          {/* ── General — desktop splits the stack into two columns ── */}
          {settingsTab === 'general' && isDesktop && (
            <div style={{ display: 'grid', gridTemplateColumns: isWide ? '1fr 1fr' : 'minmax(0,1fr) minmax(0,1fr)', gap: 22, alignItems: 'start' }}>

              {/* Left: identity and destructive actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <section style={settingsCardStyle}>
                  <div style={settingsCardHeader}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a1 1 0 001 1h14a1 1 0 001-1v-8" /><path d="M2 7h20v5H2z" /><path d="M12 21V7" /><path d="M12 7S9.5 3 7.5 3a2.5 2.5 0 000 5" /><path d="M12 7s2.5-4 4.5-4a2.5 2.5 0 010 5" /></svg>
                    <h2 style={settingsCardTitle}>Share code</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, fontFamily: MONO, letterSpacing: '0.14em', color: INK }}>{listId}</span>
                    <button
                      onClick={copyShareCode}
                      className="bc-press bc-cta"
                      style={{ padding: '11px 0', width: 92, fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: codeCopied ? INK : YELLOW, color: codeCopied ? theme.accentOnInk : '#1c1917', cursor: 'pointer', flexShrink: 0, transition: 'background-color 0.22s ease, color 0.22s ease' }}
                    >
                      {codeCopied ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ fontSize: 12.5, color: theme.textTertiary, margin: '12px 0 0', lineHeight: 1.45 }}>Anyone with this code follows the same trail.</p>
                </section>

                <section style={settingsCardStyle}>
                  <div style={settingsCardHeader}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    <h2 style={settingsCardTitle}>List name</h2>
                  </div>
                  <input
                    type="text"
                    value={editingListName}
                    onChange={(e) => setEditingListName(e.target.value)}
                    onBlur={() => saveListName(editingListName)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                    placeholder="Name your list…"
                    aria-label="List name"
                    className="w-full focus:outline-none bg-transparent"
                    style={{ color: INK, fontSize: 16, fontWeight: 600, border: 'none', borderBottom: `1.5px solid ${theme.border}`, padding: '4px 0 8px' }}
                  />
                  <p style={{ fontSize: 12.5, color: theme.textTertiary, margin: '12px 0 0', lineHeight: 1.45 }}>Saved on this device only — it isn't shared with the list.</p>
                </section>

                <section style={settingsCardStyle}>
                  <div style={settingsCardHeader}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>
                    <h2 style={settingsCardTitle}>Danger zone</h2>
                  </div>
                  {checkedCount > 0 && (
                    <button
                      onClick={() => { triggerHaptic('light'); setShowClearConfirm(true); }}
                      className="w-full flex items-center justify-between bc-press bc-hover-row"
                      style={{ padding: '13px 10px', margin: '0 -10px', width: 'calc(100% + 20px)', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>Clear ticked items</span>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: theme.textSecondary }}>{checkedCount}</span>
                    </button>
                  )}
                  {totalItems > 0 && (
                    <button
                      onClick={() => { triggerHaptic('light'); setShowClearAllConfirm(true); }}
                      className="w-full flex items-center justify-between bc-press bc-hover-row"
                      style={{ padding: '13px 10px', margin: '0 -10px', width: 'calc(100% + 20px)', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>Clear all items</span>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: theme.textSecondary }}>{totalItems}</span>
                    </button>
                  )}
                  <button
                    onClick={() => { triggerHaptic('light'); setShowLeaveConfirm(true); }}
                    className="w-full flex items-center justify-between bc-press bc-hover-row"
                    style={{ padding: '13px 10px', margin: '0 -10px', width: 'calc(100% + 20px)', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: theme.textTertiary }}>Leave this list</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                  </button>
                  {checkedCount === 0 && totalItems === 0 && (
                    <p style={{ fontSize: 12.5, color: theme.textTertiary, margin: '10px 0 0', lineHeight: 1.45 }}>Nothing on the list to clear right now.</p>
                  )}
                </section>
              </div>

              {/* Right: appearance and how the list behaves */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <section style={settingsCardStyle}>
                  <div style={settingsCardHeader}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                    <h2 style={settingsCardTitle}>Appearance</h2>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', background: theme.bgTertiary, borderRadius: 9999, padding: 3 }}>
                    <div style={{ position: 'absolute', top: 3, bottom: 3, left: 3, width: 'calc(33.333% - 2px)', borderRadius: 9999, background: INK, transform: `translateX(${['light', 'dark', 'system'].indexOf(themePref) * 100}%)`, transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)' }} />
                    {[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']].map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => { triggerHaptic('light'); setThemePref(value); }}
                        aria-pressed={themePref === value}
                        style={{ flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', background: 'transparent', color: themePref === value ? theme.accentOnInk : theme.textSecondary, cursor: 'pointer', position: 'relative', zIndex: 1, transition: 'color 0.25s ease' }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>

                <section style={settingsCardStyle}>
                  <div style={settingsCardHeader}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                    <h2 style={settingsCardTitle}>Ticked items</h2>
                  </div>
                  <button
                    onClick={toggleHideCompleted}
                    className="w-full flex items-center justify-between bc-press bc-hover-row"
                    aria-pressed={hideCompleted}
                    style={{ padding: '11px 10px', margin: '0 -10px', width: 'calc(100% + 20px)', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ minWidth: 0, paddingRight: 14 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: INK }}>Hide ticked items</span>
                      <span style={{ display: 'block', fontSize: 12.5, color: theme.textTertiary, marginTop: 2 }}>Picked-up items drop out of the aisles</span>
                    </span>
                    <span
                      aria-hidden="true"
                      style={{ width: 46, height: 27, borderRadius: 9999, flexShrink: 0, backgroundColor: hideCompleted ? YELLOW : theme.bgTertiary, border: `1.5px solid ${hideCompleted ? YELLOW : theme.border}`, display: 'flex', alignItems: 'center', padding: 2, transition: 'background-color 0.2s ease, border-color 0.2s ease' }}
                    >
                      <span style={{ width: 21, height: 21, borderRadius: '50%', backgroundColor: hideCompleted ? '#1c1917' : theme.textTertiary, transform: `translateX(${hideCompleted ? 19 : 0}px)`, transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1), background-color 0.2s ease' }} />
                    </span>
                  </button>
                </section>

                <section style={settingsCardStyle}>
                  <div style={settingsCardHeader}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 8v4l2.5 2.5" /></svg>
                    <h2 style={settingsCardTitle}>Getting started</h2>
                  </div>
                  <button
                    onClick={() => { localStorage.removeItem('breadcrumbs-has-seen-onboarding'); setShowOnboarding(true); }}
                    className="w-full flex items-center justify-between bc-press bc-hover-row"
                    style={{ padding: '13px 10px', margin: '0 -10px', width: 'calc(100% + 20px)', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>Replay app intro</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </section>
              </div>
            </div>
          )}

          {/* ── General (main settings page) ── */}
          {settingsTab === 'general' && !isDesktop && (
            <>
              <div style={{ padding: '15px 0', borderBottom: `1.5px solid ${theme.border}` }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textSecondary, display: 'block', marginBottom: 6 }}>List name</label>
                <input
                  type="text"
                  value={editingListName}
                  onChange={(e) => setEditingListName(e.target.value)}
                  onBlur={() => saveListName(editingListName)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  placeholder="Name your list…"
                  className="w-full focus:outline-none bg-transparent"
                  style={{ color: INK, fontSize: 16, fontWeight: 600, border: 'none', padding: '2px 0' }}
                />
              </div>

              {/* Navigation rows */}
              {[['stores', 'Stores', 'Switch store layout and reorder aisles'], ['categories', 'Categories', 'Show or hide aisles, add custom ones']].map(([id, label, desc]) => (
                <button
                  key={id}
                  onClick={() => { setSettingsTab(id); triggerHaptic('light'); }}
                  className="w-full flex items-center justify-between bc-press"
                  style={{ padding: '16px 0', background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.border}`, cursor: 'pointer', textAlign: 'left' }}
                >
                  <div>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: INK }}>{label}</span>
                    <span style={{ display: 'block', fontSize: 12, color: theme.textTertiary, marginTop: 2 }}>{desc}</span>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ))}

              {/* Theme — light / dark / system */}
              <div style={{ padding: '16px 0', borderBottom: `1.5px solid ${theme.border}` }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: INK, display: 'block', marginBottom: 12 }}>Theme</span>
                <div style={{ position: 'relative', display: 'flex', background: theme.bgTertiary, borderRadius: 9999, padding: 3 }}>
                  <div style={{ position: 'absolute', top: 3, bottom: 3, left: 3, width: 'calc(33.333% - 2px)', borderRadius: 9999, background: INK, transform: `translateX(${['light', 'dark', 'system'].indexOf(themePref) * 100}%)`, transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)' }} />
                  {[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => { triggerHaptic('light'); setThemePref(value); }}
                      style={{ flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', background: 'transparent', color: themePref === value ? theme.accentOnInk : theme.textSecondary, cursor: 'pointer', position: 'relative', zIndex: 1, transition: 'color 0.25s ease' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { localStorage.removeItem('breadcrumbs-has-seen-onboarding'); setShowOnboarding(true); }}
                className="w-full flex items-center justify-between bc-press"
                style={{ padding: '16px 0', background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.border}`, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>Replay app intro</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>

              {checkedCount > 0 && (
                <button
                  onClick={() => { triggerHaptic('light'); setShowClearConfirm(true); }}
                  className="w-full flex items-center justify-between bc-press"
                  style={{ padding: '16px 0', background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.border}`, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>Clear ticked items</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: theme.textSecondary }}>{checkedCount}</span>
                </button>
              )}


              {totalItems > 0 && (
                <button
                  onClick={() => { triggerHaptic('light'); setShowClearAllConfirm(true); }}
                  className="w-full flex items-center justify-between bc-press"
                  style={{ padding: '16px 0', background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.border}`, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>Clear all items</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: theme.textSecondary }}>{totalItems}</span>
                </button>
              )}

              <button
                onClick={() => { triggerHaptic('light'); setShowLeaveConfirm(true); }}
                className="w-full flex items-center justify-between bc-press"
                style={{ padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textTertiary }}>Leave this list</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </button>
            </>
          )}

          {/* ── Stores — desktop lays the layouts out as selectable cards ── */}
          {settingsTab === 'stores' && isDesktop && (
            <>
              <div className="flex items-end justify-between" style={{ gap: 24, marginBottom: 20 }}>
                <p style={{ fontSize: 13.5, color: theme.textSecondary, margin: 0, lineHeight: 1.55, maxWidth: 560 }}>
                  Pick a store and your aisles reorder to match how it's laid out. Your items stay the same.
                </p>
                <button
                  onClick={createLayoutFromPrompt}
                  className="bc-press bc-icon-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: `2px dashed ${theme.textTertiary}`, background: 'none', color: INK, cursor: 'pointer', flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  Create custom layout
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 14, alignItems: 'start' }}>
                {storeLayouts.map((layout) => {
                  const isActive = layout.id === activeStoreLayoutId;
                  return (
                    <div
                      key={layout.id}
                      className="bc-card bc-store-card"
                      style={{
                        position: 'relative',
                        backgroundColor: isActive ? theme.bgSecondary : 'transparent',
                        border: `2px solid ${isActive ? YELLOW : theme.border}`,
                        borderRadius: 18, padding: '15px 16px 13px',
                        boxShadow: isActive ? theme.yellowGlow : 'none',
                      }}
                    >
                      <button
                        onClick={() => switchStoreLayout(layout.id)}
                        aria-pressed={isActive}
                        style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2.5px solid ${isActive ? YELLOW : theme.border}`, backgroundColor: isActive ? YELLOW : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s ease' }}>
                            {isActive && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 6" /></svg>
                            )}
                          </div>
                          {isActive ? (
                            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', backgroundColor: YELLOW, color: '#1c1917', borderRadius: 9999, padding: '3px 9px', flexShrink: 0 }}>Active</span>
                          ) : !layout.isDefault && (
                            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.textSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 9999, padding: '2px 8px', flexShrink: 0 }}>Custom</span>
                          )}
                        </div>
                        <span className="truncate" style={{ display: 'block', fontSize: 16, fontWeight: isActive ? 800 : 700, letterSpacing: '-0.015em', color: INK }}>{layout.name}</span>
                        <span style={{ display: 'block', fontSize: 11.5, color: theme.textTertiary, marginTop: 3 }}>
                          {layout.categoryOrder.length} aisles in order
                        </span>
                      </button>

                      {/* Reordering aisles is the point of a layout card, so
                          this one stays put rather than waiting for a hover. */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                        <button
                          onClick={() => { setEditingStoreLayout(layout.id); setEditingStoreLayoutData(storeLayouts.find(s => s.id === layout.id)); }}
                          className="bc-icon-btn"
                          style={{ flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 700, borderRadius: 9999, border: `1.5px solid ${theme.border}`, background: 'none', color: theme.textSecondary, cursor: 'pointer' }}
                        >
                          Edit order
                        </button>
                        {!layout.isDefault && (
                          <button
                            onClick={() => deleteStoreLayout(layout.id)}
                            className="bc-icon-btn"
                            aria-label={`Delete ${layout.name}`}
                            title="Delete layout"
                            style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${theme.border}`, color: theme.textTertiary, background: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 300, padding: 0, flexShrink: 0 }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Stores ── */}
          {settingsTab === 'stores' && !isDesktop && (
            <>
              <p style={{ fontSize: 13.5, color: theme.textSecondary, marginBottom: 18, lineHeight: 1.55 }}>
                Pick a store and your aisles reorder to match how it's laid out. Your items stay the same.
              </p>
              {storeLayouts.map((layout) => {
                const isActive = layout.id === activeStoreLayoutId;
                return (
                  <div key={layout.id} className="flex items-center gap-3" style={{ padding: '13px 0', borderBottom: `1.5px solid ${theme.borderLight}` }}>
                    <button onClick={() => switchStoreLayout(layout.id)} className="flex-1 flex items-center gap-3 text-left" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2.5px solid ${isActive ? YELLOW : theme.border}`, backgroundColor: isActive ? YELLOW : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s ease' }}>
                        {isActive && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 6"/></svg>
                        )}
                      </div>
                      <span style={{ fontSize: 15.5, fontWeight: isActive ? 700 : 600, color: INK }}>{layout.name}</span>
                      {!layout.isDefault && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 9999, padding: '2px 8px' }}>Custom</span>
                      )}
                    </button>
                    <button
                      onClick={() => { setEditingStoreLayout(layout.id); setEditingStoreLayoutData(storeLayouts.find(s => s.id === layout.id)); }}
                      className="bc-press"
                      style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px' }}
                    >
                      Edit
                    </button>
                    {!layout.isDefault && (
                      <button onClick={() => deleteStoreLayout(layout.id)} style={{ width: 28, height: 28, color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 300, padding: 0 }}>×</button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={createLayoutFromPrompt}
                className="w-full bc-press"
                style={{ marginTop: 18, padding: '15px 0', fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px dashed ${theme.textTertiary}`, background: 'none', color: INK, cursor: 'pointer' }}
              >
                + Create custom layout
              </button>
            </>
          )}

          {/* ── Categories ── */}
          {settingsTab === 'categories' && (
            <>
              {isDesktop ? (
                /* Blurb and the add affordance share the top row, so the full
                   aisle list starts higher up the page. */
                <div className="flex items-start justify-between" style={{ gap: 24, marginBottom: 20 }}>
                  <p style={{ fontSize: 13.5, color: theme.textSecondary, margin: '4px 0 0', lineHeight: 1.55, maxWidth: 520 }}>
                    Toggle aisles on or off. Hidden aisles won't appear in your list. Reorder them in the Stores tab.
                  </p>
                  {!showAddCategory && (
                    <button
                      onClick={() => setShowAddCategory(true)}
                      className="bc-press bc-icon-btn"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: `2px dashed ${theme.textTertiary}`, background: 'none', color: INK, cursor: 'pointer', flexShrink: 0 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                      Add custom category
                    </button>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 13.5, color: theme.textSecondary, marginBottom: 18, lineHeight: 1.55 }}>
                  Toggle aisles on or off. Hidden aisles won't appear in your list. Reorder them in the Stores tab.
                </p>
              )}

              {showAddCategory ? (
                <div className="fade-in" style={{ marginBottom: 18, maxWidth: isDesktop ? 460 : 'none' }}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCustomCategory(); if (e.key === 'Escape') { setShowAddCategory(false); setNewCategoryName(''); } }}
                    placeholder="Category name…"
                    aria-label="New category name"
                    className="w-full py-2 focus:outline-none bg-transparent"
                    style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 16, fontWeight: 600, marginBottom: 12 }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }} className="flex-1 py-2.5 bc-press bc-icon-btn" style={{ fontSize: 13, fontWeight: 700, borderRadius: 9999, border: `1.5px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={addCustomCategory} disabled={!newCategoryName.trim()} className="flex-1 py-2.5 bc-press bc-cta" style={{ fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: newCategoryName.trim() ? INK : theme.border, color: newCategoryName.trim() ? PAPER : theme.textTertiary, cursor: newCategoryName.trim() ? 'pointer' : 'default', transition: 'background-color 0.18s ease' }}>Create</button>
                  </div>
                </div>
              ) : !isDesktop && (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="w-full bc-press"
                  style={{ marginBottom: 18, padding: '14px 0', fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px dashed ${theme.textTertiary}`, background: 'none', color: INK, cursor: 'pointer' }}
                >
                  + Add custom category
                </button>
              )}

              <div style={isDesktop ? { display: 'grid', gridTemplateColumns: isWide ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))', gap: 10, alignItems: 'start' } : undefined}>
              {categories.map((cat) => {
                const isHidden = hiddenCategories.includes(cat.id);
                const itemCount = items.filter(i => i.category === cat.id).length;
                const isCustom = cat.isDefault === false;
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-3${isDesktop ? ' bc-hover-row' : ''}`}
                    style={isDesktop
                      ? { padding: '10px 12px', borderRadius: 14, border: `1.5px solid ${theme.borderLight}`, backgroundColor: isHidden ? 'transparent' : theme.bgSecondary, transition: 'background-color 0.16s ease, border-color 0.16s ease' }
                      : { padding: '12px 0', borderBottom: `1.5px solid ${theme.borderLight}` }}
                  >
                    <div className="flex-1 min-w-0" style={{ opacity: isHidden ? 0.4 : 1, transition: 'opacity 0.2s ease' }}>
                      <div className="flex items-center gap-2">
                        <span className="truncate" style={{ fontSize: 15, fontWeight: 600, color: INK }}>{cat.name}</span>
                        {isCustom && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 9999, padding: '2px 8px', flexShrink: 0 }}>Custom</span>
                        )}
                      </div>
                      {itemCount > 0 && !isHidden && (
                        <span style={{ fontSize: 12, fontFamily: MONO, color: theme.textTertiary }}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                      )}
                    </div>
                    {isCustom && (
                      <button onClick={() => deleteCustomCategory(cat.id)} style={{ width: 28, height: 28, color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 300, flexShrink: 0, padding: 0 }}>×</button>
                    )}
                    <button
                      onClick={() => toggleCategoryVisibility(cat.id)}
                      className={`bc-press${isDesktop ? ' bc-icon-btn' : ''}`}
                      title={isHidden ? 'Show aisle' : 'Hide aisle'}
                      aria-label={`${isHidden ? 'Show' : 'Hide'} ${cat.name}`}
                      aria-pressed={!isHidden}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${theme.border}`, backgroundColor: isHidden ? 'transparent' : theme.bgTertiary, color: isHidden ? theme.textTertiary : theme.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'background-color 0.18s ease, color 0.18s ease', padding: 0 }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {isHidden
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>
                );
              })}
              </div>
            </>
          )}
        </div>

        {/* Edit Store Layout Modal */}
        {editingStoreLayout && (
          <div
            className={`fixed inset-0 z-[60] flex justify-center ${isDesktop ? 'items-center p-6' : 'items-end'}`}
            style={{ backgroundColor: theme.overlay }}
          >
            <div
              className="w-full flex flex-col"
              style={isDesktop
                ? { maxWidth: 560, maxHeight: '82vh', backgroundColor: PAPER, borderRadius: 24, overflow: 'hidden', border: `1.5px solid ${theme.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }
                : { maxHeight: '85vh', backgroundColor: PAPER, borderRadius: '28px 28px 0 0', overflow: 'hidden' }}
            >
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1.5px solid ${theme.border}` }}>
                <button
                  onClick={async () => {
                    if (editingStoreLayoutData) {
                      await updateStoreLayoutOrder(editingStoreLayout, editingStoreLayoutData.categoryOrder);
                    }
                    setEditingStoreLayout(null);
                    setEditingStoreLayoutData(null);
                  }}
                  style={{ fontSize: 14, fontWeight: 700, color: INK, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Done
                </button>
                <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.015em', color: INK, margin: 0 }}>Edit {editingStoreLayoutData?.name}</h2>
                <button
                  onClick={() => {
                    const defaultLayout = DEFAULT_STORE_LAYOUTS.find(s => s.id === editingStoreLayout);
                    if (defaultLayout && editingStoreLayoutData) {
                      setEditingStoreLayoutData({ ...editingStoreLayoutData, categoryOrder: defaultLayout.categoryOrder });
                      showToastMessage('Layout reset to default');
                    }
                  }}
                  disabled={!editingStoreLayoutData?.isDefault}
                  style={{ fontSize: 14, fontWeight: 700, color: editingStoreLayoutData?.isDefault ? theme.textSecondary : theme.border, background: 'none', border: 'none', cursor: editingStoreLayoutData?.isDefault ? 'pointer' : 'default', padding: 0 }}
                >
                  Reset
                </button>
              </div>
              <p className="px-6 py-3" style={{ fontSize: 13.5, color: theme.textSecondary, margin: 0 }}>
                Move aisles to match your store's layout.
              </p>
              <div className="flex-1 overflow-y-auto px-6" style={{ paddingBottom: isDesktop ? 24 : 'calc(2rem + env(safe-area-inset-bottom))' }}>
                {(() => {
                  const layout = editingStoreLayoutData;
                  const allCategories = [...DEFAULT_CATEGORIES, ...categories.filter(c => !DEFAULT_CATEGORIES.find(d => d.id === c.id))];
                  const orderedCategories = layout?.categoryOrder
                    .map(id => allCategories.find(c => c.id === id))
                    .filter(Boolean) || [];

                  return orderedCategories.map((cat, idx) => {
                    const isHidden = hiddenCategories.includes(cat.id);
                    const isFirst = idx === 0;
                    const isLast = idx === orderedCategories.length - 1;
                    const move = (dir) => {
                      triggerHaptic('light');
                      const newOrder = [...editingStoreLayoutData.categoryOrder];
                      const catIdx = newOrder.indexOf(cat.id);
                      const swap = catIdx + dir;
                      [newOrder[catIdx], newOrder[swap]] = [newOrder[swap], newOrder[catIdx]];
                      setEditingStoreLayoutData({ ...editingStoreLayoutData, categoryOrder: newOrder });
                    };
                    return (
                      <div key={cat.id} className={`flex items-center gap-3${isDesktop ? ' bc-item-row' : ''}`} style={{ padding: isDesktop ? '8px 10px' : '10px 0', margin: isDesktop ? '0 -10px' : undefined, borderRadius: isDesktop ? 10 : undefined, borderBottom: `1.5px solid ${theme.borderLight}`, opacity: isHidden ? 0.4 : 1 }}>
                        <button
                          onClick={() => !isFirst && move(-1)}
                          disabled={isFirst}
                          aria-label={`Move ${cat.name} earlier`}
                          className={`bc-press${isFirst ? '' : ' bc-icon-btn'}`}
                          style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${isFirst ? theme.borderLight : INK}`, color: isFirst ? theme.border : INK, background: 'none', cursor: isFirst ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                        </button>
                        <span className="flex-1" style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>{cat.name}</span>
                        <button
                          onClick={() => !isLast && move(1)}
                          disabled={isLast}
                          aria-label={`Move ${cat.name} later`}
                          className={`bc-press${isLast ? '' : ' bc-icon-btn'}`}
                          style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${isLast ? theme.borderLight : INK}`, color: isLast ? theme.border : INK, background: 'none', cursor: isLast ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Confirms shared with list view */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: theme.overlay }}>
            <div className="w-full max-w-xs text-center" style={{ backgroundColor: theme.bgSecondary, borderRadius: 24, padding: 28 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: INK, marginBottom: 8 }}>Clear ticked items?</h2>
              <p style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 6 }}>This removes {checkedCount} ticked {checkedCount === 1 ? 'item' : 'items'}.</p>
              <p style={{ fontSize: 12.5, color: theme.textTertiary, marginBottom: 22 }}>This affects everyone sharing this list.</p>
              <div className="flex gap-3">
                <button onClick={() => { triggerHaptic('light'); setShowClearConfirm(false); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={async () => { triggerHaptic('success'); const newItems = items.filter(i => !i.checked); setItems(newItems); firstTickAtRef.current = null; await saveList(newItems); setShowClearConfirm(false); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: YELLOW, color: '#1c1917', cursor: 'pointer' }}>Clear</button>
              </div>
            </div>
          </div>
        )}

        {showClearAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: theme.overlay }}>
            <div className="w-full max-w-xs text-center" style={{ backgroundColor: theme.bgSecondary, borderRadius: 24, padding: 28 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: INK, marginBottom: 8 }}>Clear all items?</h2>
              <p style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 6 }}>This removes all {totalItems} {totalItems === 1 ? 'item' : 'items'} — ticked and unticked.</p>
              <p style={{ fontSize: 12.5, color: theme.textTertiary, marginBottom: 22 }}>This affects everyone sharing this list.</p>
              <div className="flex gap-3">
                <button onClick={() => { triggerHaptic('light'); setShowClearAllConfirm(false); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={clearAllItems} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: INK, color: PAPER, cursor: 'pointer' }}>Clear all</button>
              </div>
            </div>
          </div>
        )}

        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: theme.overlay }}>
            <div className="w-full max-w-xs text-center" style={{ backgroundColor: theme.bgSecondary, borderRadius: 24, padding: 28 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: INK, marginBottom: 8 }}>Leave this list?</h2>
              <p style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 6 }}>You'll be removed from this list on your device.</p>
              <p style={{ fontSize: 12.5, color: theme.textTertiary, marginBottom: 22 }}>Rejoin anytime with the code <span style={{ fontFamily: MONO, fontWeight: 700, color: INK }}>{listId}</span>.</p>
              <div className="flex gap-3">
                <button onClick={() => { triggerHaptic('light'); setShowLeaveConfirm(false); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Stay</button>
                <button onClick={confirmLeaveList} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: INK, color: PAPER, cursor: 'pointer' }}>Leave</button>
              </div>
            </div>
          </div>
        )}

        {pendingHideCategoryId && (() => {
          const pendingCategory = categories.find(c => c.id === pendingHideCategoryId);
          const pendingItemCount = items.filter(i => i.category === pendingHideCategoryId).length;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: theme.overlay }}>
              <div className="w-full max-w-xs text-center" style={{ backgroundColor: theme.bgSecondary, borderRadius: 24, padding: 28 }}>
                <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: INK, marginBottom: 8 }}>Hide {pendingCategory ? pendingCategory.name : 'this aisle'}?</h2>
                <p style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 6 }}>This deletes {pendingItemCount} {pendingItemCount === 1 ? 'item' : 'items'} in this aisle from the list.</p>
                <p style={{ fontSize: 12.5, color: theme.textTertiary, marginBottom: 22 }}>This affects everyone sharing this list.</p>
                <div className="flex gap-3">
                  <button onClick={() => { triggerHaptic('light'); setPendingHideCategoryId(null); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={confirmHideCategory} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: INK, color: PAPER, cursor: 'pointer' }}>Hide & delete</button>
                </div>
              </div>
            </div>
          );
        })()}

        {showOnboarding && <OnboardingModal listCode={listId} onComplete={completeOnboarding} t={theme} />}
        {!isDesktop && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} t={theme} />}
      </div>
    );
  }

  // ════════════════ Welcome Screen ════════════════
  if (!listId) {
    const codeChars = (joinCode + '      ').slice(0, 6).split('');
    const codeValid = joinCode.length === 6;
    return (
      <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#1c1917' }}>
        <style>{styles}</style>

        {/* Top block — black */}
        <div style={{ padding: '64px 32px 0', flex: 1 }}>
          <div className="bc-fu1 flex items-center" style={{ gap: 8 }}>
            <div className="breathe-1" style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: YELLOW }} />
            <div className="breathe-2" style={{ width: 29, height: 29, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
            <div className="breathe-3" style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
          </div>
          <h1 className="bc-fu2" style={{ fontSize: 'clamp(40px, 12vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, margin: '28px 0 0', color: '#fafaf9' }}>
            Breadcrumbs
          </h1>
          <p className="bc-fu3" style={{ fontSize: 15, color: 'rgba(250,250,249,0.55)', margin: '16px 0 0', lineHeight: 1.5, maxWidth: 280 }}>
            The smartest path to a stocked home.
          </p>
        </div>

        {/* Bottom sheet — paper */}
        <div className="bc-fu4" style={{ backgroundColor: '#fafaf9', borderRadius: '32px 32px 0 0', padding: '30px 28px calc(40px + env(safe-area-inset-bottom, 0px))', maxWidth: 560, width: '100%', margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: THEMES.light.textTertiary, textTransform: 'uppercase', margin: '0 0 14px' }}>Join with a code</p>

          <div style={{ position: 'relative', marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 7 }} onClick={() => codeInputRef.current && codeInputRef.current.focus()}>
              {codeChars.map((ch, i) => {
                const filled = !!ch.trim();
                const isCursor = !codeValid && i === joinCode.length;
                return (
                  <div
                    key={filled ? `f${i}${ch}` : `e${i}`}
                    className={filled ? 'bc-charpop' : ''}
                    style={{ flex: 1, height: 56, borderRadius: 14, backgroundColor: filled ? '#fff' : THEMES.light.bgTertiary, border: `2px solid ${filled ? '#1c1917' : isCursor ? YELLOW : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, fontWeight: 700, fontFamily: MONO, color: '#1c1917', transition: 'border-color 0.15s ease', position: 'relative', cursor: 'text' }}
                  >
                    {ch.trim() || ''}
                    {isCursor && <div style={{ position: 'absolute', bottom: 10, width: 16, height: 3, backgroundColor: YELLOW, borderRadius: 2, animation: 'bcBlink 1.05s steps(2) infinite' }} />}
                  </div>
                );
              })}
            </div>
            {/* Real input — invisible overlay so the keyboard opens */}
            <input
              ref={codeInputRef}
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              onKeyDown={(e) => { if (e.key === 'Enter' && codeValid) joinList(); }}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              aria-label="Share code"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', background: 'transparent', color: 'transparent', caretColor: 'transparent' }}
            />
          </div>

          <button
            onClick={joinList}
            disabled={!codeValid}
            className="bc-press"
            style={{ width: '100%', padding: '18px 0', fontSize: 16, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: codeValid ? YELLOW : THEMES.light.border, color: codeValid ? '#1c1917' : THEMES.light.textTertiary, cursor: codeValid ? 'pointer' : 'default', transition: 'background-color 0.25s ease, color 0.25s ease', marginBottom: 12 }}
          >
            Join list
          </button>
          <button
            onClick={createNewList}
            className={`bc-press w-full ${createAnim ? 'btn-pop' : ''}`}
            style={{ padding: '17px 0', fontSize: 15, fontWeight: 700, borderRadius: 9999, border: `2px solid ${'#1c1917'}`, backgroundColor: 'transparent', color: '#1c1917', cursor: 'pointer' }}
          >
            Start a new one
          </button>
        </div>
      </div>
    );
  }

  // ════════════════ Main List ════════════════
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: PAPER, paddingLeft: isDesktop ? SIDEBAR_WIDTH : 0 }}
      onClick={(e) => {
        if (editingQuantityId && !e.target.closest('.quantity-editor')) setEditingQuantityId(null);
        if (!e.target.closest('.fab-area')) {
          if (fabOpen) {
            setFabOpen(false);
            setFabInput('');
          }
          if (fabOpen || fabNoMatchMode) setFabNoMatchMode(false);
        }
      }}
    >
      <style>{styles}</style>
      {desktopSidebar}
      <Toast message={toastMessage} visible={showToast} t={theme} />

      {showOnboarding && <OnboardingModal listCode={listId} onComplete={completeOnboarding} t={theme} />}

      {/* Offline is already spelled out by the sidebar's sync pill on desktop. */}
      {!isOnline && !isDesktop && (
        <div className="px-4 py-2 text-center" style={{ backgroundColor: YELLOW, color: '#1c1917', fontSize: 12.5, fontWeight: 700 }}>
          You're offline. Changes will sync when you reconnect.
        </div>
      )}

      {/* ── Paper header with the crumb trail ── */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: PAPER, borderBottom: `1.5px solid ${theme.border}`, padding: isDesktop ? `20px ${shellPadX}px 0` : '12px 26px 14px' }}>
        <div style={{ maxWidth: isDesktop ? contentMax.list : 'none', margin: isDesktop ? '0 auto' : undefined }}>

        {isDesktop ? (
          /* Title and quick add share one row; the toolbar sits right under
             it, so content starts immediately instead of after a gap. */
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <h1 className="truncate" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, color: INK }}>
                  {listName || 'Breadcrumbs'}
                </h1>
                {hideDoneButton}
              </div>
              <p style={{ fontSize: 13, color: theme.textSecondary, margin: '7px 0 0' }}>
                {totalItems === 0
                  ? 'Nothing on the list yet.'
                  : `${totalItems} ${totalItems === 1 ? 'item' : 'items'} across ${activeCategoryCount} ${activeCategoryCount === 1 ? 'aisle' : 'aisles'}`}
              </p>
            </div>

            {/* Inline quick add — the desktop replacement for the thumb-reach
                FAB. Past the halfway mark it becomes the finish control, and
                adding is no longer offered. */}
            <div className="fab-area" style={{ position: 'relative', width: isWide ? 460 : 400, flexShrink: 0, paddingBottom: 2 }}>
              {finishReady ? (
                <button
                  onClick={() => { triggerHaptic('light'); finishShop(); }}
                  aria-label="Finish shop"
                  className="bc-press bc-cta"
                  style={{ width: '100%', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 9999, border: 'none', backgroundColor: YELLOW, color: '#1c1917', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: theme.yellowGlow }}
                >
                  <FinishGlyph finishing color="#1c1917" />
                  Finish shop
                </button>
              ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 5px 5px 16px', borderRadius: 9999, border: `1.5px solid ${theme.border}`, backgroundColor: theme.bgSecondary }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M12 5v14M5 12h14" /></svg>
                <input
                  ref={fabInputRef}
                  type="text"
                  value={fabInput}
                  onChange={(e) => { setFabInput(e.target.value); setFabNoMatchMode(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleFabAdd(); if (e.key === 'Escape') { setFabInput(''); setFabNoMatchMode(false); e.currentTarget.blur(); } }}
                  placeholder={isWide ? 'Quick add — what do you need?' : 'Quick add an item…'}
                  aria-label="Quick add an item"
                  className="flex-1 focus:outline-none bg-transparent"
                  style={{ color: INK, fontSize: 15, fontWeight: 600, border: 'none', minWidth: 0, padding: '6px 0' }}
                />
                <button
                  onClick={handleFabAdd}
                  disabled={!fabInput.trim()}
                  className="bc-press bc-cta"
                  style={{ padding: '9px 20px', fontSize: 13.5, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: fabInput.trim() ? YELLOW : theme.bgTertiary, color: fabInput.trim() ? '#1c1917' : theme.textTertiary, cursor: fabInput.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'background-color 0.2s ease, color 0.2s ease' }}
                >
                  Add
                </button>
              </div>
              )}

              {!finishReady && fabNoMatchMode && (
                <div
                  className="fade-in"
                  style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 60, backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 18, boxShadow: theme.cardShadow, padding: 14, maxHeight: 300, overflowY: 'auto' }}
                >
                  <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 10px' }}>Which aisle?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {visibleCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleChipSelect(cat.id)}
                        className="bc-press bc-cta"
                        style={{ backgroundColor: 'transparent', color: INK, fontSize: 12.5, fontWeight: 700, borderRadius: 9999, padding: '7px 14px', border: `2px solid ${INK}`, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="truncate" style={{ flex: 1, minWidth: 0, fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, margin: 0, color: INK }}>
              {listName || 'Breadcrumbs'}
            </h1>
            {hideDoneButton}
          </div>
        )}

        {isDesktop ? (
          /* The trail is the whole toolbar now: the dots carry the count the
             old "n to go" line spelled out, and tapping them opens the
             stats sheet. */
          totalItems > 0 && (
            <div style={{ marginTop: 12, padding: '2px 0 6px', borderTop: `1.5px solid ${theme.borderLight}` }}>
              <CrumbTrail items={trailItems} t={theme} onOpen={openStatsSheet} />
            </div>
          )
        ) : (
        <>
        {/* The crumb trail — one crumb per item, picked up as you shop.
            It replaces the old "n to go · n picked up" line: the dots tell
            that story, and the line only repeated it. */}
        {totalItems > 0 && (
          <div style={{ marginTop: 10 }}>
            <CrumbTrail items={trailItems} t={theme} onOpen={openStatsSheet} />
          </div>
        )}
        </>
        )}
        </div>
      </div>

      {/* ── Aisles ── */}
      <div style={{ padding: isDesktop ? `18px ${shellPadX}px 0` : '16px 28px 0', paddingBottom: isDesktop ? 40 : 110, maxWidth: isDesktop ? contentMax.list : 'none', margin: isDesktop ? '0 auto' : undefined }}>
        {/* Usuals sit above the list while it is nearly empty, and stand in
            for the empty state once there is history to draw on. */}
        {usuals && <UsualsCard usuals={usuals} t={theme} onAdd={addUsual} />}

        {totalItems === 0 && usuals ? null : totalItems === 0 ? (
          <div className="text-center" style={{ paddingTop: isDesktop ? 96 : 70 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <div className={isDesktop ? 'breathe-1' : ''} style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: YELLOW }} />
              <div className={isDesktop ? 'breathe-2' : ''} style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
              <div className={isDesktop ? 'breathe-3' : ''} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
            </div>
            <h3 style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 700, letterSpacing: '-0.015em', color: INK, marginBottom: 8 }}>Nothing on the list</h3>
            <p style={{ fontSize: 14, color: theme.textSecondary, maxWidth: isDesktop ? 340 : 240, margin: '0 auto', lineHeight: 1.55 }}>
              {isDesktop
                ? 'Type anything into the quick-add box above — it lands in the right aisle automatically.'
                : 'Tap the yellow button and type anything — it lands in the right aisle automatically.'}
            </p>
          </div>
        ) : isDesktop ? (
          /* Column packing rather than a row-aligned grid. Same responsive
             behaviour — the browser fits as many ~320px columns as the window
             allows, two at 1024 and four when it's wide — but aisle cards of
             different heights pack tight instead of leaving a row's worth of
             blank space under every short one. Aisles still read in store
             order, down each column. */
          <div style={{ columnWidth: 320, columnGap: 12 }}>
            {visibleCategories.map(renderCategory)}
            {activeCategoryCount > 0 && activeCategoryCount < 3 && (
              /* A list this short would otherwise leave the grid mostly
                 blank — say something useful in the space instead. */
              <div style={{ padding: '6px 8px 16px', breakInside: 'avoid' }}>
                <div
                  className="bc-dashed bc-card"
                  style={{ borderRadius: 18, border: `2px dashed ${theme.border}`, padding: '26px 22px', textAlign: 'center', backgroundColor: 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: YELLOW }} />
                    <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
                  </div>
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', color: INK, margin: '0 0 6px' }}>
                    {activeCategoryCount === 1 ? 'One aisle so far' : 'Two aisles so far'}
                  </h4>
                  <p style={{ fontSize: 12.5, color: theme.textSecondary, lineHeight: 1.55, margin: 0 }}>
                    Add from the quick-add box and new aisles appear here as cards, in the order you'll walk them.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          visibleCategories.map(renderCategory)
        )}
      </div>

      {/* ── Quick Add FAB — phone only; desktop adds inline from the header ── */}
      {activeTab === 'list' && !fabOpen && !isDesktop && (
        <button
          onClick={() => {
            triggerHaptic('light');
            // Halfway through a shop the button stops adding and starts
            // finishing. Same routine as ticking the last item.
            if (finishReady) finishShop();
            else setFabOpen(true);
          }}
          className="bc-fab"
          aria-label={finishReady ? 'Finish shop' : 'Add item'}
          style={{
            position: 'fixed', bottom: 'calc(66px + max(34px, calc(env(safe-area-inset-bottom, 0px) + 8px)))', right: 24,
            width: 62, height: 62, borderRadius: '50%',
            backgroundColor: YELLOW, border: 'none',
            boxShadow: '0 10px 30px rgba(250,204,21,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, cursor: 'pointer', padding: 0, lineHeight: 1,
            transition: 'transform 0.15s cubic-bezier(0.175,0.885,0.32,1.275)',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <FinishGlyph finishing={finishReady} color="#1c1917" />
        </button>
      )}

      {/* ── Quick Add Input Bar ── */}
      {fabOpen && !isDesktop && (
        <div
          className="fab-area"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            backgroundColor: PAPER, borderTop: `1.5px solid ${theme.border}`,
            padding: '12px 20px calc(16px + env(safe-area-inset-bottom, 0px))',
            zIndex: 55, animation: 'fabSlideUp 250ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div>
          <div className="flex items-center gap-3">
            <input
              ref={fabInputRef}
              type="text"
              value={fabInput}
              onChange={(e) => { setFabInput(e.target.value); setFabNoMatchMode(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleFabAdd(); if (e.key === 'Escape') { setFabOpen(false); setFabInput(''); setFabNoMatchMode(false); } }}
              placeholder="What do you need?"
              className="flex-1 py-2 focus:outline-none bg-transparent"
              style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 16, fontWeight: 600 }}
            />
            <button
              onClick={handleFabAdd}
              disabled={!fabInput.trim()}
              className="bc-press"
              style={{ padding: '11px 22px', fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: fabInput.trim() ? YELLOW : theme.bgTertiary, color: fabInput.trim() ? '#1c1917' : theme.textTertiary, cursor: fabInput.trim() ? 'pointer' : 'default', transition: 'background-color 0.2s ease, color 0.2s ease' }}
            >
              Add
            </button>
            <button
              onClick={() => { setFabOpen(false); setFabInput(''); setFabNoMatchMode(false); }}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', color: theme.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          {fabNoMatchMode && (
            <div className="fade-in" style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 8px' }}>Which aisle?</p>
              <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
                {visibleCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleChipSelect(cat.id)}
                    className="bc-press"
                    style={{ display: 'inline-block', backgroundColor: theme.bgSecondary, color: INK, fontSize: 12.5, fontWeight: 700, borderRadius: 9999, padding: '8px 16px', border: `2px solid ${INK}`, marginRight: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ── Long-press reassign sheet ── */}
      {longPressItem && renderMoveSheet(
        longPressItem.name,
        longPressItem.category,
        (categoryId) => handleLongPressReassign(longPressItem, categoryId),
        () => setLongPressItem(null)
      )}

      {/* Bottom Navigation */}
      {trailOverlays}

      {!isDesktop && !fabOpen && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} t={theme} />}

      {/* Clear ticked items confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: theme.overlay }}>
          <div className="w-full max-w-xs text-center" style={{ backgroundColor: theme.bgSecondary, borderRadius: 24, padding: 28 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: INK, marginBottom: 8 }}>Clear ticked items?</h2>
            <p style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 6 }}>This removes {checkedCount} ticked {checkedCount === 1 ? 'item' : 'items'}.</p>
            <p style={{ fontSize: 12.5, color: theme.textTertiary, marginBottom: 22 }}>This affects everyone sharing this list.</p>
            <div className="flex gap-3">
              <button onClick={() => { triggerHaptic('light'); setShowClearConfirm(false); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => { triggerHaptic('success'); const newItems = items.filter(i => !i.checked); setItems(newItems); firstTickAtRef.current = null; await saveList(newItems); setShowClearConfirm(false); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: YELLOW, color: '#1c1917', cursor: 'pointer' }}>Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Pure helpers, exported for the tests.
export { parseIngredientLine, findCategoryForItem, scaleIngredientQuantity, scaleIngredientNote };
