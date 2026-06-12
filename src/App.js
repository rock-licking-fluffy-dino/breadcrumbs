import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
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
// Bold Crumb theme — single theme, no dark mode.
// Yellow has three jobs: signal, primary action, progress.
// Black surfaces carry wayfinding; paper carries content.
// Mono is reserved for data: codes, counts, quantities.
// ─────────────────────────────────────────────────────────────
const INK = '#1c1917';
const PAPER = '#fafaf9';
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const theme = {
  bg: PAPER,
  bgSecondary: '#fff',
  bgTertiary: '#f5f5f4',
  text: '#292524',
  textSecondary: '#78716c',
  textTertiary: '#a8a29e',
  border: '#e7e5e4',
  borderLight: '#f5f5f4',
  cardShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
  yellowGlow: '0 4px 20px rgba(250,204,21,0.35)',
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateListCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

const triggerHaptic = (style = 'light') => {
  if (navigator.vibrate) {
    navigator.vibrate(style === 'success' ? [10, 50, 20] : style === 'light' ? 10 : 5);
  }
};

// Sync trail — the three-dot logo working as the live indicator
const SyncTrail = ({ active = true, mono = false }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
    {[5, 4, 3].map((d, i) => (
      <span
        key={i}
        className={active ? 'bc-sync-dot' : ''}
        style={{ width: d, height: d, borderRadius: '50%', backgroundColor: mono ? '#a8a29e' : '#FACC15', animationDelay: `${i * 0.22}s`, opacity: active ? undefined : 0.4 }}
      />
    ))}
  </span>
);

// Onboarding Modal Component
const OnboardingModal = ({ listCode, onComplete }) => {
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
      className="fixed inset-0 z-[100] flex items-end select-none"
      style={{ backgroundColor: 'rgba(28,25,23,0.4)', fontFamily: 'Inter, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full flex flex-col" style={{ backgroundColor: theme.bg, borderRadius: '28px 28px 0 0', maxHeight: '92vh', overflowY: 'auto' }}>
        <div
          className="flex justify-center"
          style={{ marginTop: 12, marginBottom: 12 }}
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => { if (touchStartY.current !== null && e.changedTouches[0].clientY - touchStartY.current > 60) skip(); touchStartY.current = null; }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: theme.border }} />
        </div>

        <div className="flex items-center justify-center" style={{ height: 170 }}>
          {card.isWelcome ? (
            <div key="welcome-hero" className="flex items-center gap-4" style={{ animation: 'onboardSlideIn 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
              <div className="breathe-1" style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: '#FACC15' }} />
              <div className="breathe-2" style={{ width: 54, height: 54, borderRadius: '50%', backgroundColor: '#FACC15', opacity: 0.6 }} />
              <div className="breathe-3" style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#FACC15', opacity: 0.3 }} />
            </div>
          ) : (
            <div key={`circle-${currentCard}`} style={{ width: 130, height: 130, borderRadius: '50%', backgroundColor: '#fff', border: `2px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'onboardSlideIn 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
              <span style={{ fontSize: 44, lineHeight: 1, display: 'block' }}>{card.emoji}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col" style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom, 0px) + 24px))' }}>
          <div key={`text-${currentCard}`} className="text-center" style={{ animation: 'onboardSlideIn 0.5s cubic-bezier(0.22,1,0.36,1)', minHeight: 128 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', color: theme.text, marginBottom: 10, lineHeight: 1.3 }}>{card.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: theme.textSecondary, margin: 0 }}>{card.description}</p>
            {card.showCode && (
              <div className="flex justify-center mt-4">
                <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 8, paddingBottom: 8, borderRadius: 9999, border: `2px solid ${INK}`, color: theme.text, fontFamily: MONO, fontWeight: 700, letterSpacing: '0.14em' }}>
                  {listCode || 'ABC123'}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          <div className="text-center" style={{ marginBottom: 12, visibility: isLastCard ? 'hidden' : 'visible' }}>
            <button onClick={skip} style={{ fontSize: 13, color: theme.textTertiary, background: 'none', border: 'none', cursor: isLastCard ? 'default' : 'pointer', padding: '4px 8px' }}>Skip</button>
          </div>

          <div className="flex justify-center" style={{ gap: 8, marginBottom: 16 }}>
            {cards.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: i === currentCard ? '#FACC15' : theme.border, transition: 'background-color 0.3s' }} />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-full transition-all active:scale-[0.97]"
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
const Toast = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-6 left-4 right-4 flex justify-center z-50 fade-in">
      <div className="px-5 py-3 rounded-full text-sm font-semibold" style={{ backgroundColor: INK, color: PAPER, boxShadow: '0 8px 28px rgba(0,0,0,0.25)' }}>
        {message}
      </div>
    </div>
  );
};

// Bottom Navigation — black pill, yellow active label
const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'list', label: 'List' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ padding: '8px 48px calc(14px + env(safe-area-inset-bottom, 0px))', pointerEvents: 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: INK, borderRadius: 9999, padding: '15px 10px', pointerEvents: 'auto', boxShadow: '0 10px 30px rgba(28,25,23,0.3)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { triggerHaptic('light'); onTabChange(tab.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', color: activeTab === tab.id ? '#FACC15' : 'rgba(250,250,249,0.4)', padding: '2px 12px', transition: 'color 0.2s ease' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
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
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [settingsTab, setSettingsTab] = useState('general');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [hiddenCategories, setHiddenCategories] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-hidden-categories');
    if (saved) return JSON.parse(saved);
    return ['baby', 'alcohol'];
  });
  const [createAnim, setCreateAnim] = useState(false);
  const [checkingItems, setCheckingItems] = useState(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
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
  const [activeTab, setActiveTab] = useState('list');
  const [hideCompleted, setHideCompleted] = useState(() => localStorage.getItem('breadcrumbs-hide-completed') === 'true');

  // Quick Add state — the only way to add items
  const [fabOpen, setFabOpen] = useState(false);
  const [fabInput, setFabInput] = useState('');
  const [fabNoMatchMode, setFabNoMatchMode] = useState(false);
  const [showingCategoryTag, setShowingCategoryTag] = useState(new Set());
  const [longPressItem, setLongPressItem] = useState(null);
  const longPressTimerRef = useRef(null);
  const fabInputRef = useRef(null);

  const recipeInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const isSavingRef = useRef(false);

  // Show toast helper
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Persist hide-completed preference
  useEffect(() => {
    localStorage.setItem('breadcrumbs-hide-completed', hideCompleted ? 'true' : 'false');
  }, [hideCompleted]);

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
      (docSnap) => {
        if (isSavingRef.current) {
          setSyncing(false);
          return;
        }
        if (docSnap.exists()) {
          const data = docSnap.data();
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

  // Save categories and store layouts
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
    const newCategory = { id: `custom-${generateId()}`, name: newCategoryName.trim(), isDefault: false };
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
      layout.id === layoutId ? { ...layout, categoryOrder: newCategoryOrder } : layout
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
      await setDoc(doc(db, 'lists', code), {
        items: [],
        recipes: [],
        updatedAt: new Date().toISOString()
      });
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
    await saveList(newItems);
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
          ? { ...r, name: newRecipeName.trim(), ingredients: newRecipeIngredients }
          : r
      );
    } else {
      newRecipes = [...recipes, { id: generateId(), name: newRecipeName.trim(), ingredients: newRecipeIngredients, createdAt: Date.now() }];
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
  const remainingCount = totalItems - checkedCount;

  // ── Bold Crumb motion vocabulary ──
  const styles = `
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bcFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bcPop { 0% { transform: scale(1); } 45% { transform: scale(1.18); } 100% { transform: scale(1); } }
    @keyframes bcCharPop { 0% { transform: scale(0.85); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
    @keyframes bcNumIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bcSyncPulse { 0%, 100% { opacity: 0.25; } 30% { opacity: 1; } }
    @keyframes bcBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    @keyframes breathe {
      0%   { transform: translateY(0px) scale(1); }
      40%  { transform: translateY(-10px) scale(1.08); }
      100% { transform: translateY(0px) scale(1); }
    }
    @keyframes buttonPop {
      0% { transform: scale(1); background-color: ${INK}; }
      50% { transform: scale(1.02); background-color: ${YELLOW}; }
      100% { transform: scale(1); background-color: ${YELLOW}; }
    }
    @keyframes recipePop { 0% { transform: scale(1); } 50% { transform: scale(0.95); } 100% { transform: scale(1); } }
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
    .bc-sync-dot { animation: bcSyncPulse 1.8s ease-in-out infinite; }
    .bc-press { transition: transform 0.12s ease; }
    .bc-press:active { transform: scale(0.96); }
    .breathe-1 { animation: breathe 2.8s ease-in-out infinite; }
    .breathe-2 { animation: breathe 3.2s ease-in-out infinite; animation-delay: 0.35s; }
    .breathe-3 { animation: breathe 3.6s ease-in-out infinite; animation-delay: 0.7s; }
    .btn-pop { animation: buttonPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .recipe-pop { animation: recipePop 0.3s ease-out; }
    .sync-pulse { animation: pulse 1.5s ease-in-out infinite; }
    input { font-size: 16px !important; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
    }
  `;

  // Desktop sidebar — ink, with the dots up top
  const desktopSidebar = isDesktop && (
    <div
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 88,
        backgroundColor: INK,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 24, paddingBottom: 28, zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: YELLOW }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
        <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        {[{ id: 'list', label: 'List' }, { id: 'recipes', label: 'Recipes' }, { id: 'settings', label: 'Settings' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => { triggerHaptic('light'); setActiveTab(tab.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', color: activeTab === tab.id ? YELLOW : 'rgba(250,250,249,0.4)', transition: 'color 0.2s ease' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Aisle renderer — Bold Crumb. Only aisles with items appear. ──
  const renderCategory = (category) => {
    const categoryItems = items.filter(item => item.category === category.id);
    if (categoryItems.length === 0) return null;
    const uncheckedCount = categoryItems.filter(i => !i.checked).length;
    const allHidden = hideCompleted && uncheckedCount === 0;

    return (
      <div
        key={category.id}
        style={{ display: 'grid', gridTemplateRows: allHidden ? '0fr' : '1fr', opacity: allHidden ? 0 : 1, transition: 'grid-template-rows 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease' }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ marginBottom: 14 }}>
            {/* Aisle label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: theme.textSecondary, whiteSpace: 'nowrap', flexShrink: 0 }}>{category.name}</span>
              {uncheckedCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: YELLOW, color: INK, borderRadius: 9999, padding: '1px 8px', flexShrink: 0 }}>{uncheckedCount}</span>
              )}
              <div style={{ flex: 1, height: 1.5, backgroundColor: theme.border }} />
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
                      className="flex items-center gap-3"
                      style={{ padding: '10px 0' }}
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
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
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

                      {!item.checked && !isEditingQty && (
                        <button
                          onClick={() => setEditingQuantityId(item.id)}
                          className="bc-press"
                          style={{ fontSize: 12, fontWeight: 700, fontFamily: MONO, color: INK, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '4px 6px' }}
                        >
                          ×{quantity}
                        </button>
                      )}

                      {isEditingQty && (
                        <div className="flex items-center gap-1 fade-in quantity-editor">
                          <button onClick={() => updateQuantity(item.id, -1)} className="bc-press" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.bgTertiary, color: INK, border: 'none', cursor: 'pointer', fontSize: 14 }}>−</button>
                          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, width: 24, textAlign: 'center', color: INK }}>{quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="bc-press" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.bgTertiary, color: INK, border: 'none', cursor: 'pointer', fontSize: 14 }}>+</button>
                          <button onClick={() => setEditingQuantityId(null)} className="bc-press" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: YELLOW, color: INK, border: 'none', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>✓</button>
                        </div>
                      )}

                      {!isEditingQty && (
                        <button onClick={() => deleteItem(item.id)} style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 300, flexShrink: 0, padding: 0 }}>×</button>
                      )}
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

  // ════════════════ Recipes Screen ════════════════
  if (activeTab === 'recipes' && listId) {
    return (
      <div
        className="min-h-screen"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: PAPER, paddingLeft: isDesktop ? 88 : 0 }}
        onClick={(e) => {
          if (recipeAddingTo && !e.target.closest('.recipe-input-area')) cancelRecipeAdding();
        }}
      >
        <style>{styles}</style>
        {desktopSidebar}
        <Toast message={toastMessage} visible={showToast} />

        {/* Black header */}
        <div className="sticky top-0 z-40" style={{ backgroundColor: INK, borderRadius: '0 0 28px 28px', padding: '18px 28px 22px' }}>
          {showCreateRecipe ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setShowCreateRecipe(false); setEditingRecipeId(null); setNewRecipeName(''); setNewRecipeIngredients([]); }}
                className="bc-press"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: PAPER, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: PAPER, margin: 0 }}>
                {editingRecipeId ? 'Edit recipe' : 'New recipe'}
              </h1>
              <div style={{ width: 56 }} />
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: PAPER }}>Recipes</h1>
              <p style={{ fontSize: 14, color: 'rgba(250,250,249,0.5)', margin: '6px 0 0' }}>Whole meals, one tap.</p>
            </>
          )}
        </div>

        <div className="px-6 py-5" style={{ paddingBottom: isDesktop ? 24 : 120 }}>
          {showCreateRecipe ? (
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

              {/* Category-based ingredient adding */}
              {visibleCategories.map(category => {
                const categoryIngredients = newRecipeIngredients.filter(i => i.category === category.id);
                const hasIngredients = categoryIngredients.length > 0;
                const isAdding = recipeAddingTo === category.id;

                return (
                  <div key={category.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: hasIngredients ? theme.textSecondary : theme.textTertiary, whiteSpace: 'nowrap', flexShrink: 0 }}>{category.name}</span>
                      {hasIngredients && (
                        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: YELLOW, color: INK, borderRadius: 9999, padding: '1px 8px', flexShrink: 0 }}>{categoryIngredients.length}</span>
                      )}
                      <div style={{ flex: 1, height: 1.5, backgroundColor: theme.borderLight }} />
                      <button
                        onClick={() => isAdding ? cancelRecipeAdding() : startRecipeAdding(category.id)}
                        className="bc-press recipe-input-area"
                        style={{ width: 28, height: 28, borderRadius: '50%', border: isAdding ? 'none' : `1.5px solid ${theme.border}`, backgroundColor: isAdding ? INK : 'transparent', color: isAdding ? PAPER : theme.textTertiary, cursor: 'pointer', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
                      >
                        <span style={{ transform: isAdding ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', fontWeight: 300 }}>+</span>
                      </button>
                    </div>

                    {isAdding && (
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
                            style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 15 }}
                          />
                          <button
                            onClick={addRecipeIngredient}
                            disabled={!newRecipeItemText.trim()}
                            className="bc-press"
                            style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: newRecipeItemText.trim() ? YELLOW : theme.bgTertiary, color: newRecipeItemText.trim() ? INK : theme.textTertiary, cursor: newRecipeItemText.trim() ? 'pointer' : 'default' }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {hasIngredients && categoryIngredients.map(ingredient => (
                      <div key={ingredient.id} className="flex items-center gap-3 fade-in" style={{ padding: '9px 0' }}>
                        <span className="flex-1" style={{ fontSize: 15.5, fontWeight: 600, color: INK }}>{ingredient.name}</span>
                        <button onClick={() => updateRecipeIngredientQuantity(ingredient.id, -1)} className="bc-press" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.bgTertiary, color: INK, border: 'none', cursor: 'pointer', fontSize: 14 }}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: INK, width: 30, textAlign: 'center' }}>×{ingredient.quantity || 1}</span>
                        <button onClick={() => updateRecipeIngredientQuantity(ingredient.id, 1)} className="bc-press" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.bgTertiary, color: INK, border: 'none', cursor: 'pointer', fontSize: 14 }}>+</button>
                        <button onClick={() => removeRecipeIngredient(ingredient.id)} style={{ width: 28, height: 28, color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 300, padding: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
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
              ) : (
                <div style={isDesktop ? { display: 'grid', gridTemplateColumns: isWide ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '0 32px' } : {}}>
                  {recipes.map((recipe) => {
                    const ingredientNames = recipe.ingredients.map(i => i.name);
                    const preview = ingredientNames.slice(0, 4).join(', ') + (ingredientNames.length > 4 ? '…' : '');
                    const isAdded = addingRecipeId === recipe.id;
                    return (
                      <div key={recipe.id} className={isAdded ? 'recipe-pop' : ''} style={{ padding: '18px 0', borderBottom: `1.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className={isAdded ? 'bc-pop' : ''} style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: isAdded ? YELLOW : '#fff', border: `2px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 17, fontWeight: 700, fontFamily: MONO, color: INK, transition: 'background-color 0.25s ease' }}>
                          {recipe.ingredients.length}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', margin: 0, color: INK }}>{recipe.name}</h3>
                          {preview && <p style={{ fontSize: 12.5, color: theme.textTertiary, margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</p>}
                          <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                            <button onClick={() => startEditRecipe(recipe)} style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit</button>
                            <button onClick={() => { triggerHaptic('light'); setDeletingRecipeId(recipe.id); }} style={{ fontSize: 13, fontWeight: 600, color: theme.textTertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                          </div>
                        </div>
                        <button
                          onClick={() => addRecipeToList(recipe)}
                          className="bc-press"
                          style={{ padding: '11px 0', width: 76, fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: isAdded ? INK : YELLOW, color: isAdded ? YELLOW : INK, cursor: 'pointer', flexShrink: 0, transition: 'background-color 0.22s ease, color 0.22s ease' }}
                        >
                          {isAdded ? 'Added ✓' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* New recipe */}
              <button
                onClick={() => setShowCreateRecipe(true)}
                className="bc-press"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2px dashed ${theme.textTertiary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: theme.textSecondary }}>New recipe</span>
              </button>
            </>
          )}
        </div>

        {/* Sticky Save/Cancel footer for recipe creation */}
        {showCreateRecipe && (
          <div className="fixed bottom-0 left-0 right-0 p-4 z-40" style={{ backgroundColor: PAPER, borderTop: `1.5px solid ${theme.border}`, paddingLeft: isDesktop ? 104 : 16 }}>
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
                  color: INK, cursor: 'pointer',
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28,25,23,0.5)' }}>
            <div className="w-full max-w-xs text-center" style={{ backgroundColor: '#fff', borderRadius: 24, padding: 28 }}>
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

        {!isDesktop && !showCreateRecipe && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
      </div>
    );
  }

  // ════════════════ Settings Screen ════════════════
  if (activeTab === 'settings' && listId) {
    const tabIndex = { general: 0, stores: 1, categories: 2 }[settingsTab];
    return (
      <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: PAPER, paddingLeft: isDesktop ? 88 : 0 }}>
        <style>{styles}</style>
        {desktopSidebar}
        <Toast message={toastMessage} visible={showToast} />

        {/* Black header with share code hero */}
        <div style={{ backgroundColor: INK, borderRadius: '0 0 28px 28px', padding: '18px 28px 22px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: PAPER }}>Settings</h1>
          <div style={{ marginTop: 16, borderRadius: 18, border: '1.5px solid rgba(250,250,249,0.18)', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(250,250,249,0.45)', textTransform: 'uppercase', margin: '0 0 6px' }}>Share code</p>
              <span style={{ fontSize: 26, fontWeight: 700, fontFamily: MONO, letterSpacing: '0.14em', color: PAPER }}>{listId}</span>
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(listId); triggerHaptic('success'); showToastMessage('Code copied!'); }}
              className="bc-press"
              style={{ padding: '11px 0', width: 86, fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: YELLOW, color: INK, cursor: 'pointer' }}
            >
              Copy
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(250,250,249,0.4)', margin: '10px 0 0' }}>Share this code so others can join your list.</p>
        </div>

        <div className="px-6 py-5" style={{ paddingBottom: isDesktop ? 24 : 120, maxWidth: isDesktop ? 560 : 'none' }}>
          {/* Segmented tabs — sliding ink thumb */}
          <div style={{ position: 'relative', display: 'flex', backgroundColor: theme.bgTertiary, borderRadius: 9999, padding: 3, marginBottom: 22 }}>
            <div style={{ position: 'absolute', top: 3, bottom: 3, left: 3, width: 'calc(33.333% - 2px)', borderRadius: 9999, backgroundColor: INK, transform: `translateX(${tabIndex * 100}%)`, transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)' }} />
            {[['general', 'General'], ['stores', 'Stores'], ['categories', 'Categories']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => { setSettingsTab(id); triggerHaptic('light'); }}
                style={{ flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', background: 'transparent', color: settingsTab === id ? YELLOW : theme.textSecondary, cursor: 'pointer', position: 'relative', zIndex: 1, transition: 'color 0.25s ease', fontFamily: 'inherit' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── General ── */}
          {settingsTab === 'general' && (
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

              <button
                onClick={() => { localStorage.removeItem('breadcrumbs-has-seen-onboarding'); setShowOnboarding(true); }}
                className="w-full flex items-center justify-between"
                style={{ padding: '16px 0', borderBottom: `1.5px solid ${theme.border}`, background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.border}`, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>Replay app intro</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>

              {checkedCount > 0 && (
                <button
                  onClick={() => { triggerHaptic('light'); setShowClearConfirm(true); }}
                  className="w-full flex items-center justify-between"
                  style={{ padding: '16px 0', background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.border}`, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>Clear ticked items</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: theme.textSecondary }}>{checkedCount}</span>
                </button>
              )}

              {totalItems > 0 && (
                <button
                  onClick={() => { triggerHaptic('light'); setShowClearAllConfirm(true); }}
                  className="w-full flex items-center justify-between"
                  style={{ padding: '16px 0', background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.border}`, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>Clear all items</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: theme.textSecondary }}>{totalItems}</span>
                </button>
              )}

              <button
                onClick={() => { triggerHaptic('light'); setShowLeaveConfirm(true); }}
                className="w-full flex items-center justify-between"
                style={{ padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.textTertiary }}>Leave this list</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </button>
            </>
          )}

          {/* ── Stores ── */}
          {settingsTab === 'stores' && (
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
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 6"/></svg>
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
                onClick={async () => {
                  const name = prompt('Enter a name for your custom layout:');
                  if (name && name.trim()) {
                    const newLayout = await createCustomStoreLayout(name);
                    setEditingStoreLayout(newLayout.id);
                    setEditingStoreLayoutData(newLayout);
                  }
                }}
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
              <p style={{ fontSize: 13.5, color: theme.textSecondary, marginBottom: 18, lineHeight: 1.55 }}>
                Toggle aisles on or off. Hidden aisles won't appear in your list. Reorder them in the Stores tab.
              </p>

              {showAddCategory ? (
                <div className="fade-in" style={{ marginBottom: 18 }}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCustomCategory(); if (e.key === 'Escape') { setShowAddCategory(false); setNewCategoryName(''); } }}
                    placeholder="Category name…"
                    className="w-full py-2 focus:outline-none bg-transparent"
                    style={{ borderBottom: `1.5px solid ${theme.border}`, color: INK, fontSize: 16, fontWeight: 600, marginBottom: 12 }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }} className="flex-1 py-2.5 bc-press" style={{ fontSize: 13, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={addCustomCategory} disabled={!newCategoryName.trim()} className="flex-1 py-2.5 bc-press" style={{ fontSize: 13, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: newCategoryName.trim() ? YELLOW : theme.border, color: INK, cursor: 'pointer' }}>Create</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="w-full bc-press"
                  style={{ marginBottom: 18, padding: '14px 0', fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px dashed ${theme.textTertiary}`, background: 'none', color: INK, cursor: 'pointer' }}
                >
                  + Add custom category
                </button>
              )}

              {categories.map((cat) => {
                const isHidden = hiddenCategories.includes(cat.id);
                const itemCount = items.filter(i => i.category === cat.id).length;
                const isCustom = cat.isDefault === false;
                return (
                  <div key={cat.id} className="flex items-center gap-3" style={{ padding: '12px 0', borderBottom: `1.5px solid ${theme.borderLight}`, opacity: isHidden ? 0.45 : 1, transition: 'opacity 0.2s ease' }}>
                    <div className="flex-1 min-w-0">
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
                      style={{ width: 46, height: 26, borderRadius: 9999, backgroundColor: isHidden ? theme.border : INK, position: 'relative', flexShrink: 0, border: 'none', cursor: 'pointer', transition: 'background-color 0.2s ease', padding: 0 }}
                    >
                      <div style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', backgroundColor: isHidden ? '#fff' : YELLOW, left: isHidden ? 3 : 'calc(100% - 23px)', transition: 'left 0.22s cubic-bezier(0.22,1,0.36,1), background-color 0.2s ease' }} />
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Edit Store Layout Modal */}
        {editingStoreLayout && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: 'rgba(28,25,23,0.5)' }}>
            <div className="w-full max-h-[85vh] flex flex-col" style={{ backgroundColor: PAPER, borderRadius: '28px 28px 0 0', overflow: 'hidden' }}>
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
              <div className="flex-1 overflow-y-auto px-6" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
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
                      <div key={cat.id} className="flex items-center gap-3" style={{ padding: '10px 0', borderBottom: `1.5px solid ${theme.borderLight}`, opacity: isHidden ? 0.4 : 1 }}>
                        <button
                          onClick={() => !isFirst && move(-1)}
                          disabled={isFirst}
                          className="bc-press"
                          style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${isFirst ? theme.borderLight : INK}`, color: isFirst ? theme.border : INK, background: 'none', cursor: isFirst ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                        </button>
                        <span className="flex-1" style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>{cat.name}</span>
                        <button
                          onClick={() => !isLast && move(1)}
                          disabled={isLast}
                          className="bc-press"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28,25,23,0.5)' }}>
            <div className="w-full max-w-xs text-center" style={{ backgroundColor: '#fff', borderRadius: 24, padding: 28 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: INK, marginBottom: 8 }}>Clear ticked items?</h2>
              <p style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 6 }}>This removes {checkedCount} ticked {checkedCount === 1 ? 'item' : 'items'}.</p>
              <p style={{ fontSize: 12.5, color: theme.textTertiary, marginBottom: 22 }}>This affects everyone sharing this list.</p>
              <div className="flex gap-3">
                <button onClick={() => { triggerHaptic('light'); setShowClearConfirm(false); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: `2px solid ${theme.border}`, color: theme.textSecondary, background: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={async () => { triggerHaptic('success'); const newItems = items.filter(i => !i.checked); setItems(newItems); await saveList(newItems); setShowClearConfirm(false); }} className="flex-1 py-3 bc-press" style={{ fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: YELLOW, color: INK, cursor: 'pointer' }}>Clear</button>
              </div>
            </div>
          </div>
        )}

        {showClearAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28,25,23,0.5)' }}>
            <div className="w-full max-w-xs text-center" style={{ backgroundColor: '#fff', borderRadius: 24, padding: 28 }}>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28,25,23,0.5)' }}>
            <div className="w-full max-w-xs text-center" style={{ backgroundColor: '#fff', borderRadius: 24, padding: 28 }}>
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

        {showOnboarding && <OnboardingModal listCode={listId} onComplete={completeOnboarding} />}
        {!isDesktop && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
      </div>
    );
  }

  // ════════════════ Welcome Screen ════════════════
  if (!listId) {
    const codeChars = (joinCode + '      ').slice(0, 6).split('');
    const codeValid = joinCode.length === 6;
    return (
      <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: INK }}>
        <style>{styles}</style>

        {/* Top block — black */}
        <div style={{ padding: '64px 32px 0', flex: 1 }}>
          <div className="bc-fu1 flex items-center" style={{ gap: 8 }}>
            <div className="breathe-1" style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: YELLOW }} />
            <div className="breathe-2" style={{ width: 29, height: 29, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
            <div className="breathe-3" style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
          </div>
          <h1 className="bc-fu2" style={{ fontSize: 'clamp(40px, 12vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, margin: '28px 0 0', color: PAPER }}>
            Breadcrumbs
          </h1>
          <p className="bc-fu3" style={{ fontSize: 15, color: 'rgba(250,250,249,0.55)', margin: '16px 0 0', lineHeight: 1.5, maxWidth: 280 }}>
            The smartest path to a stocked home.
          </p>
        </div>

        {/* Bottom sheet — paper */}
        <div className="bc-fu4" style={{ backgroundColor: PAPER, borderRadius: '32px 32px 0 0', padding: '30px 28px calc(40px + env(safe-area-inset-bottom, 0px))', maxWidth: 560, width: '100%', margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: theme.textTertiary, textTransform: 'uppercase', margin: '0 0 14px' }}>Join with a code</p>

          <div style={{ position: 'relative', marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 7 }} onClick={() => codeInputRef.current && codeInputRef.current.focus()}>
              {codeChars.map((ch, i) => {
                const filled = !!ch.trim();
                const isCursor = !codeValid && i === joinCode.length;
                return (
                  <div
                    key={filled ? `f${i}${ch}` : `e${i}`}
                    className={filled ? 'bc-charpop' : ''}
                    style={{ flex: 1, height: 56, borderRadius: 14, backgroundColor: filled ? '#fff' : theme.bgTertiary, border: `2px solid ${filled ? INK : isCursor ? YELLOW : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, fontWeight: 700, fontFamily: MONO, color: INK, transition: 'border-color 0.15s ease', position: 'relative', cursor: 'text' }}
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
            style={{ width: '100%', padding: '18px 0', fontSize: 16, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: codeValid ? YELLOW : theme.border, color: codeValid ? INK : theme.textTertiary, cursor: codeValid ? 'pointer' : 'default', transition: 'background-color 0.25s ease, color 0.25s ease', marginBottom: 12 }}
          >
            Join list
          </button>
          <button
            onClick={createNewList}
            className={`bc-press w-full ${createAnim ? 'btn-pop' : ''}`}
            style={{ padding: '17px 0', fontSize: 15, fontWeight: 700, borderRadius: 9999, border: `2px solid ${INK}`, backgroundColor: 'transparent', color: INK, cursor: 'pointer' }}
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
      style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: PAPER, paddingLeft: isDesktop ? 88 : 0 }}
      onClick={(e) => {
        if (editingQuantityId && !e.target.closest('.quantity-editor')) setEditingQuantityId(null);
        if (fabOpen && !e.target.closest('.fab-area')) {
          setFabOpen(false);
          setFabInput('');
          setFabNoMatchMode(false);
        }
      }}
    >
      <style>{styles}</style>
      {desktopSidebar}
      <Toast message={toastMessage} visible={showToast} />

      {showOnboarding && <OnboardingModal listCode={listId} onComplete={completeOnboarding} />}

      {!isOnline && (
        <div className="px-4 py-2 text-center" style={{ backgroundColor: YELLOW, color: INK, fontSize: 12.5, fontWeight: 700 }}>
          You're offline. Changes will sync when you reconnect.
        </div>
      )}

      {/* ── Black header ── */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: INK, borderRadius: '0 0 28px 28px', padding: '14px 26px 18px' }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => { triggerHaptic('light'); setShowStorePicker(true); }}
            className="bc-press flex items-center"
            style={{ gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 0 }}
          >
            <span className="truncate" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(250,250,249,0.45)', textTransform: 'uppercase' }}>
              {listName || 'Breadcrumbs'}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: YELLOW, textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
              {activeStoreLayout?.name}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </button>
          <div className="flex items-center" style={{ gap: 8, padding: '6px 12px', borderRadius: 9999, border: '1.5px solid rgba(250,250,249,0.2)', flexShrink: 0 }}>
            <SyncTrail active={isOnline && !syncing} />
            <span style={{ fontSize: 11.5, fontFamily: MONO, fontWeight: 500, letterSpacing: '0.12em', color: PAPER }}>{listId}</span>
          </div>
        </div>

        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, margin: 0, color: PAPER, fontFeatureSettings: '"tnum"', display: 'flex', alignItems: 'baseline', overflow: 'hidden' }}>
            <span key={remainingCount} className="bc-num">{remainingCount}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: YELLOW, marginLeft: 8 }}>to go</span>
          </h1>
          <button
            onClick={() => { triggerHaptic('light'); setHideCompleted(!hideCompleted); }}
            className="bc-press flex items-center"
            style={{ gap: 7, padding: '8px 14px', borderRadius: 9999, border: hideCompleted ? '1.5px solid transparent' : '1.5px solid rgba(250,250,249,0.25)', backgroundColor: hideCompleted ? YELLOW : 'transparent', color: hideCompleted ? INK : 'rgba(250,250,249,0.7)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {hideCompleted
                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
            </svg>
            Hide done
          </button>
        </div>

        {/* Progress — ticks up to 24 items, bar beyond */}
        {totalItems > 0 && (
          totalItems <= 24 ? (
            <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
              {items.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < checkedCount ? YELLOW : 'rgba(250,250,249,0.18)', transition: `background-color 0.3s ease ${i * 0.03}s` }} />
              ))}
            </div>
          ) : (
            <div style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(250,250,249,0.18)', marginTop: 14, overflow: 'hidden' }}>
              <div style={{ width: `${(checkedCount / totalItems) * 100}%`, height: '100%', borderRadius: 2, backgroundColor: YELLOW, transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
          )
        )}
      </div>

      {/* ── Aisles ── */}
      <div className="px-7 pt-5" style={{ paddingBottom: isDesktop ? 24 : 120 }}>
        {totalItems === 0 ? (
          <div className="text-center" style={{ paddingTop: 70 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: YELLOW }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.6 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: YELLOW, opacity: 0.3 }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', color: INK, marginBottom: 8 }}>Nothing on the list</h3>
            <p style={{ fontSize: 14, color: theme.textSecondary, maxWidth: 240, margin: '0 auto', lineHeight: 1.55 }}>
              Tap the yellow button and type anything — it lands in the right aisle automatically.
            </p>
          </div>
        ) : isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
            <div>{visibleCategories.filter((_, i) => i % 2 === 0).map(renderCategory)}</div>
            <div>{visibleCategories.filter((_, i) => i % 2 === 1).map(renderCategory)}</div>
          </div>
        ) : (
          visibleCategories.map(renderCategory)
        )}
      </div>

      {/* ── Quick Add FAB ── */}
      {activeTab === 'list' && !fabOpen && (
        <button
          onClick={() => { triggerHaptic('light'); setFabOpen(true); }}
          style={{
            position: 'fixed', bottom: isDesktop ? 28 : 104, right: 22,
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      )}

      {/* ── Quick Add Input Bar ── */}
      {fabOpen && (
        <div
          className="fab-area"
          style={{
            position: 'fixed', bottom: 0, left: isDesktop ? 88 : 0, right: 0,
            backgroundColor: PAPER, borderTop: `1.5px solid ${theme.border}`,
            padding: '12px 20px calc(16px + env(safe-area-inset-bottom, 0px))',
            zIndex: 55, animation: 'fabSlideUp 250ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
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
              style={{ padding: '11px 22px', fontSize: 14, fontWeight: 700, borderRadius: 9999, border: 'none', backgroundColor: fabInput.trim() ? YELLOW : theme.bgTertiary, color: fabInput.trim() ? INK : theme.textTertiary, cursor: fabInput.trim() ? 'pointer' : 'default', transition: 'background-color 0.2s ease, color 0.2s ease' }}
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
                    style={{ display: 'inline-block', backgroundColor: '#fff', color: INK, fontSize: 12.5, fontWeight: 700, borderRadius: 9999, padding: '8px 16px', border: `2px solid ${INK}`, marginRight: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Long-press reassign sheet ── */}
      {longPressItem && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: 'rgba(28,25,23,0.5)' }} onClick={() => setLongPressItem(null)}>
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

      {/* ── Store Picker ── */}
      {showStorePicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: 'rgba(28,25,23,0.5)' }} onClick={() => setShowStorePicker(false)}>
          <div className="w-full max-h-[75vh] flex flex-col" style={{ backgroundColor: PAPER, borderRadius: '28px 28px 0 0', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center" style={{ marginTop: 12, marginBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: theme.border }} />
            </div>
            <div className="px-6 py-3" style={{ borderBottom: `1.5px solid ${theme.border}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.015em', color: INK, margin: 0 }}>Switch store</h2>
            </div>
            <div className="overflow-y-auto px-6 py-2" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
              {storeLayouts.map((layout) => {
                const isActive = layout.id === activeStoreLayoutId;
                return (
                  <button
                    key={layout.id}
                    onClick={() => switchStoreLayout(layout.id)}
                    className="w-full flex items-center justify-between bc-press"
                    style={{ padding: '14px 0', background: 'none', border: 'none', borderBottom: `1.5px solid ${theme.borderLight}`, cursor: 'pointer' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: isActive ? 700 : 600, color: INK }}>{layout.name}</span>
                      {!layout.isDefault && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary, border: `1.5px solid ${theme.border}`, borderRadius: 9999, padding: '2px 8px' }}>Custom</span>
                      )}
                    </span>
                    {isActive && (
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
      {!isDesktop && !fabOpen && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
