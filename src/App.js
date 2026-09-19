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

// Onboarding Modal Component
const OnboardingModal = ({ listCode, onComplete, t, isDesktop }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const cards = [
    { isWelcome: true, title: 'Welcome to Breadcrumbs', description: 'Never get lost in the aisles again.' },
    { emoji: '⚡', title: 'Add anything, instantly', description: 'Tap the yellow button and type what you need. Breadcrumbs drops it into the right category automatically — no fussing around.' },
    { emoji: '🗂️', title: 'Organised like a real shop', description: 'Items are sorted by aisle automatically — Dairy, Bakery, Frozen and more. Switch to your store and the order updates to match.' },
    { emoji: '🔗', title: 'Shop together', description: 'Share your 6-character code with anyone. They join instantly — no account needed — and your list updates for everyone in real time.', showCode: true },
    { emoji: '👨‍🍳', title: 'Recipes', description: 'Save your favourite meals and add every ingredient to your list in one tap.' },
    { emoji: '🏪', title: 'Shop by store', description: "Save a layout for every supermarket you visit. Switch stores and your list reorders itself to match that store's aisles." },
  ];

  const isLastCard = currentCard === cards.length - 1;
  const card = cards[currentCard];

  const goNext = () => {
    if (!isLastCard) { setCurrentCard(c => c + 1); triggerHaptic('light'); }
    else onComplete();
  };
  const skip = () => { triggerHaptic('light'); onComplete(); };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) goNext();
    else if (diff < -50 && currentCard > 0) { setCurrentCard(c => c - 1); triggerHaptic('light'); }
    touchStartX.current = null;
  };

  const ctaLabel = currentCard === 0 ? 'Get started' : isLastCard ? 'Start shopping' : 'Next';

  return (
    <div
      className={`fixed inset-0 z-[100] flex select-none ${isDesktop ? 'items-center justify-center p-6' : 'items-end'}`}
      style={{ backgroundColor: t.overlay, fontFamily: 'Inter, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full flex flex-col"
        style={isDesktop
          ? { backgroundColor: t.bg, borderRadius: 28, maxWidth: 460, maxHeight: '88vh', overflowY: 'auto', border: `1.5px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }
          : { backgroundColor: t.bg, borderRadius: '28px 28px 0 0', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div
          className="flex justify-center"
          style={{ marginTop: 12, marginBottom: 12, visibility: isDesktop ? 'hidden' : 'visible', height: isDesktop ? 4 : undefined }}
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => { if (touchStartY.current !== null && e.changedTouches[0].clientY - touchStartY.current > 60) skip(); touchStartY.current = null; }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: t.border }} />
        </div>

        <div className="flex items-center justify-center" style={{ height: 170 }}>
          {card.isWelcome ? (
            <div key="welcome-hero" className="flex items-center gap-4" style={{ animation: 'onboardSlideIn 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
              <div className="breathe-1" style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: '#FACC15' }} />
              <div className="breathe-2" style={{ width: 54, height: 54, borderRadius: '50%', backgroundColor: '#FACC15', opacity: 0.6 }} />
              <div className="breathe-3" style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#FACC15', opacity: 0.3 }} />
            </div>
          ) : (
            <div key={`circle-${currentCard}`} style={{ width: 130, height: 130, borderRadius: '50%', backgroundColor: t.bgSecondary, border: `2px solid ${t.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'onboardSlideIn 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
              <span style={{ fontSize: 44, lineHeight: 1, display: 'block' }}>{card.emoji}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col" style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: isDesktop ? 32 : 'max(32px, calc(env(safe-area-inset-bottom, 0px) + 24px))' }}>
          <div key={`text-${currentCard}`} className="text-center" style={{ animation: 'onboardSlideIn 0.5s cubic-bezier(0.22,1,0.36,1)', minHeight: 128 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', color: t.text, marginBottom: 10, lineHeight: 1.3 }}>{card.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: t.textSecondary, margin: 0 }}>{card.description}</p>
            {card.showCode && (
              <div className="flex justify-center mt-4">
                <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 8, paddingBottom: 8, borderRadius: 9999, border: `2px solid ${t.ink}`, color: t.text, fontFamily: MONO, fontWeight: 700, letterSpacing: '0.14em' }}>
                  {listCode || 'ABC123'}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          <div className="text-center" style={{ marginBottom: 12, visibility: isLastCard ? 'hidden' : 'visible' }}>
            <button onClick={skip} style={{ fontSize: 13, color: t.textTertiary, background: 'none', border: 'none', cursor: isLastCard ? 'default' : 'pointer', padding: '4px 8px' }}>Skip</button>
          </div>

          <div className="flex justify-center" style={{ gap: 8, marginBottom: 16 }}>
            {cards.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: i === currentCard ? '#FACC15' : t.border, transition: 'background-color 0.3s' }} />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-full transition-all active:scale-[0.97] bc-cta"
            style={{ height: 54, borderRadius: 9999, backgroundColor: '#FACC15', color: INK, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}
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
  const [recipeAddingTo, setRecipeAddingTo] = useState(null);
  const [newRecipeItemText, setNewRecipeItemText] = useState('');
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

  useEffect(() => {
    if (recipeAddingTo && recipeInputRef.current) recipeInputRef.current.focus();
  }, [recipeAddingTo]);

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

      setShowingCategoryTag(prev => new Set([...prev, newItemId]));
      setTimeout(() => {
        setShowingCategoryTag(prev => {
          const next = new Set(prev);
          next.delete(newItemId);
          return next;
        });
      }, 2000);
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

    setShowingCategoryTag(prev => new Set([...prev, newItemId]));
    setTimeout(() => {
      setShowingCategoryTag(prev => {
        const next = new Set(prev);
        next.delete(newItemId);
        return next;
      });
    }, 2000);

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
  const startRecipeAdding = (categoryId) => {
    triggerHaptic('light');
    setRecipeAddingTo(categoryId);
    setNewRecipeItemText('');
  };

  const addRecipeIngredient = () => {
    if (!newRecipeItemText.trim() || !recipeAddingTo) return;
    triggerHaptic('success');
    const existingIdx = newRecipeIngredients.findIndex(i =>
      i.name.toLowerCase() === newRecipeItemText.trim().toLowerCase() &&
      i.category === recipeAddingTo
    );
    if (existingIdx >= 0) {
      const updated = [...newRecipeIngredients];
      updated[existingIdx] = { ...updated[existingIdx], quantity: (updated[existingIdx].quantity || 1) + 1 };
      setNewRecipeIngredients(updated);
    } else {
      setNewRecipeIngredients([...newRecipeIngredients, { id: generateId(), name: newRecipeItemText.trim(), category: recipeAddingTo, quantity: 1 }]);
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
      newRecipes = recipes.map(r =>
        r.id === editingRecipeId
          ? { ...r, name: newRecipeName.trim(), ingredients: newRecipeIngredients, notes: newRecipeNotes.trim() }
          : r
      );
    } else {
      newRecipes = [...recipes, { id: generateId(), name: newRecipeName.trim(), ingredients: newRecipeIngredients, createdAt: Date.now(), notes: newRecipeNotes.trim() }];
    }
    setRecipes(newRecipes);
    await saveRecipes(newRecipes);
    setNewRecipeName('');
    setNewRecipeNotes('');
    setNewRecipeIngredients([]);
    setShowCreateRecipe(false);
    setEditingRecipeId(null);
    setSavingRecipe(false);
    showToastMessage(editingRecipeId ? 'Recipe updated!' : 'Recipe saved!');
  };

  const cancelCreateRecipe = () => {
    triggerHaptic('light');
    setNewRecipeName('');
    setNewRecipeNotes('');
    setNewRecipeIngredients([]);
    setRecipeAddingTo(null);
    setShowCreateRecipe(false);
    setEditingRecipeId(null);
  };

  const startEditRecipe = (recipe) => {
    triggerHaptic('light');
    setEditingRecipeId(recipe.id);
    setNewRecipeName(recipe.name);
    setNewRecipeNotes(recipe.notes || '');
    setNewRecipeIngredients([...recipe.ingredients]);
    setShowCreateRecipe(true);
  };

  const addRecipeToList = async (recipe) => {
    triggerHaptic('success');
    setAddingRecipeId(recipe.id);
    let newItems = [...items];
    for (const ingredient of recipe.ingredients) {
      const existingItem = newItems.find(i =>
        i.name.toLowerCase() === ingredient.name.toLowerCase() &&
        i.category === ingredient.category &&
        !i.checked
      );
      if (existingItem) {
        newItems = newItems.map(i =>
          i.id === existingItem.id ? { ...i, quantity: (i.quantity || 1) + (ingredient.quantity || 1) } : i
        );
      } else {
        newItems.push({
          id: generateId(),
          name: ingredient.name,
          category: ingredient.category,
          checked: false,
          quantity: ingredient.quantity || 1,
          addedAt: Date.now()
        });
      }
    }
    setItems(newItems);
    unhideCategoriesIfNeeded(recipe.ingredients.map(i => i.category));
    await saveList(newItems);
    showToastMessage(`Added ${recipe.ingredients.length} items to your list`);
    setTimeout(() => {
      setAddingRecipeId(currentId => (currentId === recipe.id ? null : currentId));
    }, 1600);
  };

  const confirmDeleteRecipe = async () => {
    if (!deletingRecipeId) return;
    triggerHaptic('success');
    const newRecipes = recipes.filter(r => r.id !== deletingRecipeId);
    setRecipes(newRecipes);
    await saveRecipes(newRecipes);
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

  // ── Recipe editor: one aisle's worth of ingredients ──
  // Shared by both layouts. Phone keeps the original underlined-row treatment;
  // desktop gets a card, and `compact` is the collapsed form used for the
  // aisles that have nothing in them yet.
  const renderRecipeCategoryBlock = (category, compact) => {
    const categoryIngredients = newRecipeIngredients.filter(i => i.category === category.id);
    const hasIngredients = categoryIngredients.length > 0;
    const isAdding = recipeAddingTo === category.id;

    const addButton = (
      <button
        onClick={() => isAdding ? cancelRecipeAdding() : startRecipeAdding(category.id)}
        className="bc-press recipe-input-area"
        aria-label={isAdding ? `Stop adding to ${category.name}` : `Add an ingredient to ${category.name}`}
        style={{ width: 28, height: 28, borderRadius: '50%', border: isAdding ? 'none' : `1.5px solid ${theme.border}`, backgroundColor: isAdding ? INK : 'transparent', color: isAdding ? PAPER : theme.textTertiary, cursor: 'pointer', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
      >
        <span style={{ transform: isAdding ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', fontWeight: 300 }}>+</span>
      </button>
    );

    const addInput = isAdding && (
      <div className="mt-2 fade-in recipe-input-area">
        <div className="flex items-center gap-3">
          <input
            ref={recipeInputRef}
            type="text"
            value={newRecipeItemText}
            onChange={(e) => setNewRecipeItemText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addRecipeIngredient(); if (e.key === 'Escape') cancelRecipeAdding(); }}
            placeholder={`Add to ${category.name}…`}
            className="flex-1 py-2 focus:outline-none bg-transparent"
            style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 15, minWidth: 0 }}
          />
          <button
            onClick={addRecipeIngredient}
            disabled={!newRecipeItemText.trim()}
            className="bc-press bc-cta"
            style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: newRecipeItemText.trim() ? YELLOW : theme.bgTertiary, color: newRecipeItemText.trim() ? '#1c1917' : theme.textTertiary, cursor: newRecipeItemText.trim() ? 'pointer' : 'default', flexShrink: 0 }}
          >
            Add
          </button>
        </div>
      </div>
    );

    const ingredientRows = hasIngredients && categoryIngredients.map(ingredient => (
      <div
        key={ingredient.id}
        className={`flex items-center gap-3 fade-in${isDesktop ? ' bc-item-row' : ''}`}
        style={isDesktop ? { padding: '7px 8px', margin: '0 -8px', borderRadius: 10 } : { padding: '9px 0' }}
      >
        <span className="flex-1 truncate" style={{ fontSize: isDesktop ? 14.5 : 15.5, fontWeight: 600, color: INK }}>{ingredient.name}</span>
        <button onClick={() => updateRecipeIngredientQuantity(ingredient.id, -1)} className="bc-press" aria-label={`One fewer ${ingredient.name}`} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.bgTertiary, color: INK, border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>−</button>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: INK, width: 30, textAlign: 'center', flexShrink: 0 }}>×{ingredient.quantity || 1}</span>
        <button onClick={() => updateRecipeIngredientQuantity(ingredient.id, 1)} className="bc-press" aria-label={`One more ${ingredient.name}`} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.bgTertiary, color: INK, border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>+</button>
        <button onClick={() => removeRecipeIngredient(ingredient.id)} aria-label={`Remove ${ingredient.name}`} style={{ width: 28, height: 28, color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 300, padding: 0, flexShrink: 0 }}>×</button>
      </div>
    ));

    if (!isDesktop) {
      return (
        <div key={category.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: hasIngredients ? theme.textSecondary : theme.textTertiary, whiteSpace: 'nowrap', flexShrink: 0 }}>{category.name}</span>
            {hasIngredients && (
              <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: YELLOW, color: '#1c1917', borderRadius: 9999, padding: '1px 8px', flexShrink: 0 }}>{categoryIngredients.length}</span>
            )}
            <div style={{ flex: 1, height: 1.5, backgroundColor: theme.borderLight }} />
            {addButton}
          </div>
          {addInput}
          {ingredientRows}
        </div>
      );
    }

    return (
      <div
        key={category.id}
        className="bc-card"
        title={compact ? category.name : undefined}
        style={{
          backgroundColor: compact && !isAdding ? 'transparent' : theme.bgSecondary,
          border: `1.5px solid ${compact && !isAdding ? theme.borderLight : theme.border}`,
          borderRadius: compact && !isAdding ? 14 : 18,
          padding: compact && !isAdding ? '9px 10px 9px 14px' : '14px 16px',
          boxShadow: compact && !isAdding ? 'none' : theme.cardShadow,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="truncate" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: hasIngredients ? theme.textSecondary : theme.textTertiary }}>{category.name}</span>
          {hasIngredients && (
            <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: YELLOW, color: '#1c1917', borderRadius: 9999, padding: '1px 8px', flexShrink: 0 }}>{categoryIngredients.length}</span>
          )}
          <div style={{ flex: 1, height: 1.5, backgroundColor: theme.borderLight, minWidth: 8 }} />
          {addButton}
        </div>
        {addInput}
        {ingredientRows && <div style={{ marginTop: 6 }}>{ingredientRows}</div>}
      </div>
    );
  };

  const recipeIngredientCategoryCount = new Set(newRecipeIngredients.map(i => i.category)).size;
  const recipeSaveReady = !!newRecipeName.trim() && newRecipeIngredients.length > 0 && !savingRecipe;
  // Aisles already carrying ingredients float to the top of the desktop picker.
  const recipeCategoriesWithIngredients = visibleCategories.filter(c => newRecipeIngredients.some(i => i.category === c.id));
  const recipeCategoriesEmpty = visibleCategories.filter(c => !newRecipeIngredients.some(i => i.category === c.id));

  // ════════════════ Recipes Screen ════════════════
  if (activeTab === 'recipes' && listId) {
    return (
      <div
        className="min-h-screen"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: PAPER, paddingLeft: isDesktop ? SIDEBAR_WIDTH : 0 }}
        onClick={(e) => {
          if (recipeAddingTo && !e.target.closest('.recipe-input-area')) cancelRecipeAdding();
        }}
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
                onClick={() => { setShowCreateRecipe(false); setEditingRecipeId(null); setNewRecipeName(''); setNewRecipeNotes(''); setNewRecipeIngredients([]); }}
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
                 its Save/Cancel, while the aisle picker spreads across a wide
                 right column — filled aisles as cards, the rest as a compact
                 "add to another aisle" row so all 20 stay reachable. */
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
                        ? 'Pick an aisle on the right to start adding.'
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

                <div>
                  {recipeCategoriesWithIngredients.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, alignItems: 'start', marginBottom: 26 }}>
                      {recipeCategoriesWithIngredients.map(category => renderRecipeCategoryBlock(category, false))}
                    </div>
                  )}

                  {recipeCategoriesEmpty.length > 0 && (
                    <>
                      <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.textTertiary, margin: '0 0 12px' }}>
                        {recipeCategoriesWithIngredients.length > 0 ? 'Add to another aisle' : 'Pick an aisle'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(216px, 1fr))', gap: 10, alignItems: 'start', paddingBottom: 40 }}>
                        {recipeCategoriesEmpty.map(category => renderRecipeCategoryBlock(category, true))}
                      </div>
                    </>
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

              {/* Category-based ingredient adding */}
              {visibleCategories.map(category => renderRecipeCategoryBlock(category, false))}
            </div>
            )
          ) : (
            <>
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
                   out of the way until the pointer is on the card. */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 18, alignItems: 'start', paddingTop: 22, paddingBottom: 12 }}>
                  {recipes.map((recipe) => {
                    const isAdded = addingRecipeId === recipe.id;
                    const shownIngredients = recipe.ingredients.slice(0, 5);
                    const overflowCount = recipe.ingredients.length - shownIngredients.length;
                    return (
                      <div
                        key={recipe.id}
                        className="bc-card bc-recipe-card"
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: theme.bgSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 20, boxShadow: theme.cardShadow, overflow: 'hidden', minHeight: 196 }}
                      >
                        <div style={{ padding: '17px 16px 0 16px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <h3 className="flex-1" style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', margin: 0, color: INK, lineHeight: 1.25, minWidth: 0 }}>{recipe.name}</h3>
                            <div className="bc-row-actions" style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button
                                onClick={() => startEditRecipe(recipe)}
                                className="bc-icon-btn"
                                aria-label={`Edit ${recipe.name}`}
                                title="Edit"
                                style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${theme.borderLight}`, background: 'none', color: theme.textTertiary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                              </button>
                              <button
                                onClick={() => { triggerHaptic('light'); setDeletingRecipeId(recipe.id); }}
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
                            {recipe.ingredients.length} {recipe.ingredients.length === 1 ? 'INGREDIENT' : 'INGREDIENTS'}
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
                            onClick={() => addRecipeToList(recipe)}
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
                  {recipes.map((recipe) => {
                    const ingredientNames = recipe.ingredients.map(i => i.name);
                    const preview = ingredientNames.slice(0, 4).join(', ') + (ingredientNames.length > 4 ? '…' : '');
                    const isAdded = addingRecipeId === recipe.id;
                    return (
                      <div key={recipe.id} style={{ padding: '18px 0', borderBottom: `1.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="flex-1 min-w-0">
                          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', margin: 0, color: INK }}>{recipe.name}</h3>
                          <div style={{ fontSize: 12.5, color: theme.textTertiary, margin: '6px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontFamily: MONO, fontWeight: 700, color: INK, flexShrink: 0 }}>{recipe.ingredients.length}</span>
                            {preview && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>· {preview}</span>}
                          </div>
                          {recipe.notes && (
                            <p style={{ fontSize: 12.5, fontStyle: 'italic', color: theme.textTertiary, margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {recipe.notes}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                            <button onClick={() => startEditRecipe(recipe)} style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit</button>
                            <button onClick={() => { triggerHaptic('light'); setDeletingRecipeId(recipe.id); }} style={{ fontSize: 13, fontWeight: 600, color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                          </div>
                        </div>
                        <button
                          onClick={() => addRecipeToList(recipe)}
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

        {showOnboarding && <OnboardingModal listCode={listId} onComplete={completeOnboarding} t={theme} isDesktop={isDesktop} />}
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

      {showOnboarding && <OnboardingModal listCode={listId} onComplete={completeOnboarding} t={theme} isDesktop={isDesktop} />}

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
      {longPressItem && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: theme.overlay }} onClick={() => setLongPressItem(null)}>
          <div className="w-full max-h-[75vh] flex flex-col" style={{ backgroundColor: PAPER, borderRadius: '28px 28px 0 0', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center" style={{ marginTop: 12, marginBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: theme.border }} />
            </div>
            <div className="px-6 py-3" style={{ borderBottom: `1.5px solid ${theme.border}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.015em', color: INK, margin: 0 }}>Move "{longPressItem.name}" to…</h2>
            </div>
            <div className="overflow-y-auto px-6 py-2" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
              {visibleCategories.map((cat) => {
                const isCurrent = cat.id === longPressItem.category;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleLongPressReassign(longPressItem, cat.id)}
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

