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

// Initialize App Check (only in production)
// TODO: Replace YOUR_RECAPTCHA_SITE_KEY with your actual reCAPTCHA v3 site key
// Get your key from: https://www.google.com/recaptcha/admin
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
  const [slideDirection, setSlideDirection] = useState('right');

  const cards = [
    {
      icon: '🏪',
      title: 'Smart Organisation',
      description: 'Your shopping list is organised by store section — just like a real supermarket. Shop faster and never miss an aisle.',
      visual: (
        <div className="flex flex-col gap-2 mt-4">
          {['🥬 Fruits & Veg', '🧀 Dairy & Eggs', '🧊 Frozen'].map((cat, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: theme.bgTertiary }}>
              <span className="text-sm" style={{ color: theme.text }}>{cat}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: '🔗',
      title: 'Share in Seconds',
      description: 'Invite anyone to shop together — no accounts needed. Just share your 6-character code and start collaborating instantly.',
      visual: (
        <div className="mt-4 flex flex-col items-center">
          <div className="px-6 py-3 rounded-full text-2xl font-mono tracking-widest" style={{ backgroundColor: '#fefce8', border: `2px solid ${YELLOW}` }}>
            {listCode || 'ABC123'}
          </div>
          <p className="text-xs mt-3" style={{ color: theme.textSecondary }}>You'll find your code at the top of your list</p>
        </div>
      )
    },
    {
      icon: '⚡',
      title: 'Shop Together, Live',
      description: 'See items being ticked off in real-time as your group shops. Stay in sync across all devices — no refresh needed.',
      visual: (
        <div className="mt-4 flex justify-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1" style={{ borderColor: theme.border }}>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: theme.border }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: YELLOW }}></div>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: theme.border }}></div>
            </div>
            <span className="text-xs" style={{ color: theme.textSecondary }}>You</span>
          </div>
          <div className="flex items-center">
            <span style={{ color: YELLOW }}>⟷</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1" style={{ borderColor: theme.border }}>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: theme.border }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: YELLOW }}></div>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: theme.border }}></div>
            </div>
            <span className="text-xs" style={{ color: theme.textSecondary }}>Them</span>
          </div>
        </div>
      )
    },
    {
      icon: '📖',
      title: 'Save Your Recipes',
      description: 'Create recipes with ingredients and add them all to your list in one tap. Perfect for weekly meal planning.',
      visual: (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: theme.bgTertiary }}>
            <span className="text-sm" style={{ color: theme.text }}>Sunday Roast</span>
            <span className="text-xs" style={{ color: theme.textSecondary }}>8 items</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: theme.bgTertiary }}>
            <span className="text-sm" style={{ color: theme.text }}>Pasta Bolognese</span>
            <span className="text-xs" style={{ color: theme.textSecondary }}>6 items</span>
          </div>
        </div>
      )
    },
    {
      icon: '🎛️',
      title: 'Make It Yours',
      description: 'Name your list, reorder categories, hide ones you don\'t need, create custom categories, and toggle dark mode.',
      visual: (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: '#fefce8', border: `1px solid ${YELLOW}` }}>
            <span className="text-sm font-medium" style={{ color: '#292524' }}>Weekly Shop</span>
            <span className="text-xs" style={{ color: '#78716c' }}>ABC123</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: theme.bgTertiary }}>
            <span className="text-sm" style={{ color: theme.text }}>Dark Mode</span>
            <div className="w-8 h-4 rounded-full" style={{ backgroundColor: YELLOW }}></div>
          </div>
        </div>
      )
    },
    {
      icon: '🎉',
      title: "You're All Set!",
      description: 'Your list is ready. Tap + to add items, or tap the recipe book to save your favourite meals.',
      visual: (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: YELLOW }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.6 }}></div>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.3 }}></div>
          </div>
        </div>
      )
    }
  ];

  const goNext = () => {
    if (currentCard < cards.length - 1) {
      setSlideDirection('right');
      setCurrentCard(currentCard + 1);
      triggerHaptic('light');
    } else {
      onComplete();
    }
  };

  const goBack = () => {
    if (currentCard > 0) {
      setSlideDirection('left');
      setCurrentCard(currentCard - 1);
      triggerHaptic('light');
    }
  };

  const skip = () => {
    triggerHaptic('light');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ backgroundColor: theme.bgSecondary, maxHeight: '90vh', boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex justify-end p-4 pb-0">
          <button onClick={skip} className="text-sm" style={{ color: theme.textTertiary }}>Skip</button>
        </div>
        <div className="px-6 pb-6 overflow-hidden">
          <div key={currentCard} className="text-center" style={{ animation: `${slideDirection === 'right' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out` }}>
            <div className="text-4xl mb-4">{cards[currentCard].icon}</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>{cards[currentCard].title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>{cards[currentCard].description}</p>
            {cards[currentCard].visual}
          </div>
        </div>
        <div className="flex justify-center gap-2 pb-4">
          {cards.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all duration-300" style={{ backgroundColor: i === currentCard ? YELLOW : theme.border }}></div>
          ))}
        </div>
        <div className="flex gap-3 p-4 pt-0">
          {currentCard > 0 && (
            <button onClick={goBack} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]" style={{ border: `1.5px solid ${theme.border}`, color: theme.textSecondary }}>Back</button>
          )}
          <button onClick={goNext} className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.97]" style={{ backgroundColor: YELLOW, color: '#292524', boxShadow: '0 4px 20px rgba(250,204,21,0.35)' }}>
            {currentCard === cards.length - 1 ? 'Start Shopping' : 'Next'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
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
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [hiddenCategories, setHiddenCategories] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-hidden-categories');
    return saved ? JSON.parse(saved) : [];
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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [editingQuantityId, setEditingQuantityId] = useState(null);
  
  // Recipe state
  const [recipes, setRecipes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState([]);
  const [recipeAddingTo, setRecipeAddingTo] = useState(null);
  const [newRecipeItemText, setNewRecipeItemText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [addingRecipeId, setAddingRecipeId] = useState(null);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [hideShareCode, setHideShareCode] = useState(false);
  
  const inputRef = useRef(null);
  const recipeInputRef = useRef(null);
  const listNameInputRef = useRef(null);

  const theme = darkMode ? themes.dark : themes.light;

  // Show toast helper
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('breadcrumbs-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

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

  const visibleCategories = categories.filter(cat => !hiddenCategories.includes(cat.id));

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
    setSyncing(true);
    const unsubscribe = onSnapshot(
      doc(db, 'lists', listId),
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Check for 60-day inactivity - clear items and recipes if stale
          if (data.updatedAt) {
            const lastUpdate = new Date(data.updatedAt);
            const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceUpdate > 60 && (data.items?.length > 0 || data.recipes?.length > 0)) {
              // List is stale - clear it
              console.log(`List ${listId} inactive for ${Math.floor(daysSinceUpdate)} days, clearing...`);
              await setDoc(doc(db, 'lists', listId), {
                items: [],
                categories: data.categories || DEFAULT_CATEGORIES,
                recipes: [],
                hideShareCode: data.hideShareCode || false,
                updatedAt: new Date().toISOString(),
                clearedDueToInactivity: true
              });
              setItems([]);
              setRecipes([]);
              if (data.categories) setCategories(data.categories);
              if (data.hideShareCode !== undefined) setHideShareCode(data.hideShareCode);
              setSyncing(false);
              return;
            }
          }
          
          setItems(data.items || []);
          if (data.categories) setCategories(data.categories);
          if (data.recipes) setRecipes(data.recipes);
          if (data.hideShareCode !== undefined) setHideShareCode(data.hideShareCode);
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

  const saveList = useCallback(async (newItems, newCategories = categories, newRecipes = recipes, newHideShareCode = hideShareCode) => {
    if (!listId) return;
    try {
      await setDoc(doc(db, 'lists', listId), {
        items: newItems,
        categories: newCategories,
        recipes: newRecipes,
        hideShareCode: newHideShareCode,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving list:', error);
    }
  }, [listId, categories, recipes, hideShareCode]);

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
    await saveList(items, newCategories);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const deleteCustomCategory = async (categoryId) => {
    triggerHaptic('light');
    const newCategories = categories.filter(cat => cat.id !== categoryId);
    const newItems = items.filter(item => item.category !== categoryId);
    setCategories(newCategories);
    setItems(newItems);
    await saveList(newItems, newCategories);
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
      setListName('');
      setEditingListName('');
      await setDoc(doc(db, 'lists', code), {
        items: [],
        categories: DEFAULT_CATEGORIES,
        recipes: [],
        updatedAt: new Date().toISOString()
      });
      localStorage.setItem('breadcrumbs-current-list', JSON.stringify({ listId: code }));
      checkOnboarding();
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
        if (data.categories) setCategories(data.categories);
        if (data.recipes) setRecipes(data.recipes);
        setJoinCode('');
        localStorage.setItem('breadcrumbs-current-list', JSON.stringify({ listId: code }));
        checkOnboarding();
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

  const toggleItem = async (id) => {
    const item = items.find(i => i.id === id);
    const willCheck = !item.checked;
    triggerHaptic(willCheck ? 'success' : 'light');
    if (willCheck) {
      setCheckingItems(prev => new Set([...prev, id]));
      setTimeout(() => {
        setCheckingItems(prev => { const next = new Set(prev); next.delete(id); return next; });
      }, 500);
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

  const moveCategory = async (fromIdx, toIdx) => {
    triggerHaptic('light');
    const newCats = [...categories];
    const [moved] = newCats.splice(fromIdx, 1);
    newCats.splice(toIdx, 0, moved);
    setCategories(newCats);
    await saveList(items, newCats);
  };

  const toggleDarkMode = () => {
    triggerHaptic('light');
    setDarkMode(!darkMode);
  };

  const toggleHideShareCode = async () => {
    triggerHaptic('light');
    const newValue = !hideShareCode;
    setHideShareCode(newValue);
    await saveList(items, categories, recipes, newValue);
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
    await saveList(items, categories, newRecipes);
    
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
    await saveList(items, categories, newRecipes);
    setDeletingRecipeId(null);
    showToastMessage('Recipe deleted');
  };

  const totalItems = items.length;
  const checkedCount = items.filter(i => i.checked).length;

  const styles = `
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
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
    .sync-pulse { animation: pulse 1.5s ease-in-out infinite; }
    .btn-pop { animation: buttonPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .recipe-pop { animation: recipePop 0.3s ease-out; }
    .check-pop { animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .fill-check { animation: fillCheck 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .draw-check { stroke-dasharray: 24; stroke-dashoffset: 24; animation: drawCheck 0.3s ease-out 0.15s forwards; }
    .item-row { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    input { font-size: 16px !important; }
  `;

  // Recipes Screen
  if (showRecipes) {
    return (
      <div 
        className="min-h-screen" 
        style={{ fontFamily: 'Inter, system-ui, sans-serif', background: theme.bgGradient, backgroundAttachment: 'fixed' }}
        onClick={(e) => {
          // Close recipe input if clicking outside input area
          if (recipeAddingTo && !e.target.closest('.recipe-input-area')) {
            cancelRecipeAdding();
          }
        }}
      >
        <style>{styles}</style>
        <Toast message={toastMessage} visible={showToast} theme={theme} />
        
        <div className="sticky top-0 z-40" style={{ backgroundColor: darkMode ? theme.bg : 'rgba(250,249,248,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.border}` }}>
          <div className="px-5 py-4 flex items-center justify-between">
            <button onClick={() => { setShowRecipes(false); setShowCreateRecipe(false); setEditingRecipeId(null); setNewRecipeName(''); setNewRecipeIngredients([]); }} className="text-sm font-medium flex items-center gap-2 transition-all" style={{ color: theme.text }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>
            <h1 className="text-base font-medium" style={{ color: theme.text }}>
              {showCreateRecipe ? (editingRecipeId ? 'Edit Recipe' : 'New Recipe') : 'Recipes'}
            </h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="px-5 py-6 pb-28">
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
                            <button onClick={() => removeRecipeIngredient(ingredient.id)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                              <span className="text-sm">×</span>
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
                <div className="space-y-3">
                  {recipes.map((recipe, index) => (
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
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-baseline gap-2">
                              <h3 style={{ color: theme.text, fontWeight: 600, fontSize: '15px' }}>{recipe.name}</h3>
                              <span style={{ color: theme.textTertiary, fontWeight: 300, fontSize: '12px' }}>{recipe.ingredients.length} items</span>
                            </div>
                          </div>
                          <button
                            onClick={() => { triggerHaptic('light'); setDeletingRecipeId(recipe.id); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => startEditRecipe(recipe)}
                            className="transition-all active:scale-95"
                            style={{ color: theme.textTertiary, fontWeight: 400, fontSize: '13px', background: 'none', border: 'none', padding: 0 }}
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
                  ))}
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
      </div>
    );
  }

  // Settings Page
  if (showSettings) {
    return (
      <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif', background: theme.bgGradient, backgroundAttachment: 'fixed' }}>
        <style>{styles}</style>
        <Toast message={toastMessage} visible={showToast} theme={theme} />
        <div className="sticky top-0 z-40" style={{ backgroundColor: darkMode ? theme.bg : 'rgba(250,249,248,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.border}` }}>
          <div className="px-5 py-4 flex items-center justify-between">
            <button onClick={() => setShowSettings(false)} className="text-sm font-medium flex items-center gap-2 transition-all" style={{ color: theme.text }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>
            <h1 className="text-base font-medium" style={{ color: theme.text }}>Settings</h1>
            <div className="w-16"></div>
          </div>
          
          {/* Tabs - Consolidated to 2 */}
          <div className="flex px-5 gap-2 pb-3">
            {[
              { id: 'general', label: 'General' },
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
                  boxShadow: settingsTab === tab.id ? theme.yellowGlowSubtle : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-6">
          {/* General Tab */}
          {settingsTab === 'general' && (
            <>
              {/* List Name & Preferences Card */}
              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
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
                
                {/* Preferences section */}
                <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${theme.borderLight}` }}>
                  <label className="text-xs font-medium mb-3 block" style={{ color: theme.textSecondary }}>Preferences</label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.text }}>Dark Mode</span>
                    <button
                      onClick={toggleDarkMode}
                      className="w-12 h-7 rounded-full transition-all relative"
                      style={{ backgroundColor: darkMode ? YELLOW : theme.border, boxShadow: darkMode ? theme.yellowGlowSubtle : 'none' }}
                    >
                      <div
                        className="absolute top-1 w-5 h-5 rounded-full transition-all shadow-sm"
                        style={{ backgroundColor: '#fff', left: darkMode ? 'calc(100% - 24px)' : '4px' }}
                      ></div>
                    </button>
                  </div>
                  
                  {/* Hide Share Code toggle */}
                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: `1px solid ${theme.borderLight}` }}>
                    <div>
                      <span className="text-sm" style={{ color: theme.text }}>Hide Share Code</span>
                      <p className="text-xs mt-0.5" style={{ color: theme.textTertiary, fontWeight: 300 }}>Hides the 6-digit code on the main screen for everyone</p>
                    </div>
                    <button
                      onClick={toggleHideShareCode}
                      className="w-12 h-7 rounded-full transition-all relative flex-shrink-0 ml-3"
                      style={{ backgroundColor: hideShareCode ? YELLOW : theme.border, boxShadow: hideShareCode ? theme.yellowGlowSubtle : 'none' }}
                    >
                      <div
                        className="absolute top-1 w-5 h-5 rounded-full transition-all shadow-sm"
                        style={{ backgroundColor: '#fff', left: hideShareCode ? 'calc(100% - 24px)' : '4px' }}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Share Code */}
              <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
                <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>Share Code</label>
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
                <p className="text-xs mt-2" style={{ color: theme.textTertiary, fontWeight: 300 }}>Share this code so others can join your list.</p>
              </div>

              {/* Danger Zone */}
              <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.textTertiary }}>⚠️ Danger Zone</h2>
              
              <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(239,68,68,0.03)' }}>
                <button 
                  onClick={() => { triggerHaptic('light'); setShowSettings(false); setTimeout(() => setShowClearAllConfirm(true), 100); }}
                  disabled={items.length === 0}
                  className="w-full py-3 text-sm font-medium rounded-full active:scale-[0.98] transition-all mb-3" 
                  style={{ 
                    border: '1.5px solid #ef4444', 
                    color: items.length === 0 ? theme.textTertiary : '#ef4444',
                    opacity: items.length === 0 ? 0.5 : 1
                  }}
                >
                  Clear all items {items.length > 0 && `(${items.length})`}
                </button>

                <button onClick={() => { triggerHaptic('light'); setShowSettings(false); setTimeout(() => setShowLeaveConfirm(true), 100); }} className="w-full py-3 text-sm font-medium rounded-full active:scale-[0.98] transition-all" style={{ border: '1.5px solid #ef4444', color: '#ef4444' }}>
                  Leave this list
                </button>
              </div>
            </>
          )}

          {/* Categories Tab - Combined reorder, visibility, and custom */}
          {settingsTab === 'categories' && (
            <>
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
                  📦 Add Custom Category
                </button>
              )}

              <p className="text-xs mb-3" style={{ color: theme.textTertiary, fontWeight: 300 }}>Use arrows to reorder. Toggle to show/hide.</p>

              {/* Combined category list with arrows on opposite sides + toggle */}
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
                {categories.map((cat, idx) => {
                  const isHidden = hiddenCategories.includes(cat.id);
                  const itemCount = items.filter(i => i.category === cat.id).length;
                  const isCustom = cat.isDefault === false;
                  const isFirst = idx === 0;
                  const isLast = idx === categories.length - 1;
                  
                  return (
                    <div 
                      key={cat.id} 
                      className="flex items-center gap-2 px-2 py-2 transition-all"
                      style={{ 
                        borderBottom: idx < categories.length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                        opacity: isHidden ? 0.5 : 1
                      }}
                    >
                      {/* UP arrow on left */}
                      <button
                        onClick={() => { if (!isFirst) { triggerHaptic('light'); moveCategory(idx, idx - 1); } }}
                        disabled={isFirst}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                        style={{ 
                          color: isFirst ? theme.border : theme.text,
                          backgroundColor: isFirst ? 'transparent' : theme.bgTertiary
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                      </button>
                      
                      {/* Category name and info */}
                      <div className="flex-1 min-w-0 px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate" style={{ color: theme.text }}>{cat.name}</span>
                          {isCustom && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#fefce8', color: '#a16207' }}>Custom</span>
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
                          style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}
                        >
                          <span className="text-sm">×</span>
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

                      {/* DOWN arrow on right */}
                      <button
                        onClick={() => { if (!isLast) { triggerHaptic('light'); moveCategory(idx, idx + 1); } }}
                        disabled={isLast}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                        style={{ 
                          color: isLast ? theme.border : theme.text,
                          backgroundColor: isLast ? 'transparent' : theme.bgTertiary
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (!listId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif', background: theme.bgGradient, backgroundAttachment: 'fixed' }}>
        <style>{styles}</style>
        {/* Decorative blob */}
        <div 
          className="absolute pointer-events-none" 
          style={{ 
            width: '500px', 
            height: '400px', 
            top: '10%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse, rgba(250,204,21,0.12) 0%, transparent 70%)',
            zIndex: 0
          }}
        />
        
        <div className="w-full max-w-sm relative" style={{ zIndex: 1 }}>
          {/* Hero section */}
          <div className="text-center mb-10">
            <div className="mb-6 flex justify-center items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: YELLOW }}></div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.6 }}></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.3 }}></div>
            </div>
            <h1 className="text-3xl font-light tracking-tight mb-3" style={{ color: theme.text }}>Breadcrumbs</h1>
            <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary, fontWeight: 300 }}>Never get lost in the aisles again.</p>
            <p className="text-sm" style={{ color: theme.textTertiary, fontWeight: 300 }}>The smartest path to a stocked home.</p>
          </div>
          
          {/* Action card */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }}>
            {/* Create new list */}
            <button 
              onClick={createNewList} 
              className={`w-full py-4 text-sm tracking-wide font-medium rounded-full transition-all mb-6 ${createAnim ? 'btn-pop' : ''}`} 
              style={{ 
                backgroundColor: createAnim ? YELLOW : (darkMode ? '#fafaf9' : '#292524'), 
                color: createAnim ? '#292524' : (darkMode ? '#292524' : '#fff'), 
                boxShadow: createAnim ? theme.yellowGlow : 'none' 
              }}
            >
              Create new list
            </button>
            
            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: theme.border }}></div>
              <span className="text-xs tracking-widest uppercase" style={{ color: theme.textTertiary }}>or join</span>
              <div className="flex-1 h-px" style={{ backgroundColor: theme.border }}></div>
            </div>
            
            {/* Join existing list */}
            <div className="space-y-3">
              <input 
                type="text" 
                value={joinCode} 
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
                placeholder="Enter 6-digit code" 
                maxLength={6}
                className="w-full px-5 py-4 text-center text-sm tracking-widest uppercase font-mono focus:outline-none transition-all rounded-xl"
                style={{ border: `1.5px solid ${theme.border}`, backgroundColor: theme.bgTertiary, color: theme.text }}
                onFocus={(e) => e.target.style.borderColor = YELLOW}
                onBlur={(e) => e.target.style.borderColor = theme.border} 
              />
              <button 
                onClick={joinList} 
                disabled={joinCode.length !== 6}
                className="w-full py-4 text-sm tracking-wide font-medium rounded-full transition-all active:scale-[0.98]" 
                style={{ 
                  border: `1.5px solid ${joinCode.length === 6 ? theme.text : theme.border}`, 
                  color: joinCode.length === 6 ? theme.text : theme.textTertiary,
                  opacity: joinCode.length === 6 ? 1 : 0.7
                }}
              >
                Join list
              </button>
            </div>
          </div>
          
          <p className="text-center mt-8 text-xs" style={{ color: theme.textTertiary, fontWeight: 300 }}>Share your code to shop together</p>
        </div>
      </div>
    );
  }

  // Main List
  return (
    <div 
      className="min-h-screen" 
      style={{ fontFamily: 'Inter, system-ui, sans-serif', background: theme.bgGradient, backgroundAttachment: 'fixed' }}
      onClick={(e) => {
        // Close adding input if clicking outside input area
        if (addingTo && !e.target.closest('.adding-input-area')) {
          cancelAdding();
        }
        // Close quantity editor if clicking outside
        if (editingQuantityId && !e.target.closest('.quantity-editor')) {
          setEditingQuantityId(null);
        }
      }}
    >
      <style>{styles}</style>
      
      <Toast message={toastMessage} visible={showToast} theme={theme} />
      
      {showOnboarding && <OnboardingModal listCode={listId} onComplete={completeOnboarding} theme={theme} />}
      
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

      {showCodePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCodePopup(false)}>
          <div className="w-full max-w-xs rounded-2xl p-6 text-center" style={{ backgroundColor: theme.bgSecondary, boxShadow: theme.cardShadow }} onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Your Share Code</h2>
            <div className="px-6 py-4 rounded-2xl mb-4" style={{ backgroundColor: theme.bgTertiary }}>
              <span className="text-3xl font-mono tracking-widest" style={{ color: theme.text }}>{listId}</span>
            </div>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary, fontWeight: 300 }}>
              Share this code with family or housemates so they can join your list and shop together in real-time!
            </p>
            <button 
              onClick={() => { 
                navigator.clipboard?.writeText(listId); 
                triggerHaptic('success'); 
                setShowCodePopup(false);
                showToastMessage('Code copied!');
              }} 
              className="w-full py-3 text-sm font-medium rounded-full transition-all active:scale-[0.97]" 
              style={{ backgroundColor: YELLOW, color: '#292524', boxShadow: theme.yellowGlow }}
            >
              Copy Code
            </button>
          </div>
        </div>
      )}
      
      {!isOnline && (
        <div className="px-4 py-2 text-center text-xs font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>You're offline. Changes will sync when you reconnect.</div>
      )}
      
      <div className="sticky top-0 z-40" style={{ backgroundColor: darkMode ? theme.bg : 'rgba(250,249,248,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.border}` }}>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* Left side - Logo and title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: YELLOW }}></div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.6 }}></div>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.3 }}></div>
              </div>
              <h1 className="text-lg font-medium tracking-tight" style={{ color: theme.text }}>
                {listName || 'Breadcrumbs'}
              </h1>
            </div>
            
            {/* Right side - Code pill (or just status dot), settings, and recipe button */}
            <div className="flex items-center gap-2">
              {hideShareCode ? (
                /* Just show status dot when code is hidden */
                <button 
                  onClick={() => { triggerHaptic('light'); setShowCodePopup(true); }}
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95"
                  style={{ backgroundColor: theme.codePillBg }}
                >
                  <span 
                    className={`w-2 h-2 rounded-full ${syncing ? 'sync-pulse' : ''}`} 
                    style={{ backgroundColor: isOnline ? '#22c55e' : '#f59e0b' }}
                  ></span>
                </button>
              ) : (
                /* Show full code pill */
                <button 
                  onClick={() => { triggerHaptic('light'); setShowCodePopup(true); }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full transition-all active:scale-95"
                  style={{ backgroundColor: theme.codePillBg }}
                >
                  <span className="text-xs font-mono" style={{ color: theme.textSecondary }}>{listId}</span>
                  <span 
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${syncing ? 'sync-pulse' : ''}`} 
                    style={{ backgroundColor: isOnline ? '#22c55e' : '#f59e0b' }}
                  ></span>
                </button>
              )}
              <button onClick={() => setShowSettings(true)} className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform" style={{ backgroundColor: theme.bgTertiary }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button 
                onClick={() => setShowRecipes(true)} 
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform" 
                style={{ backgroundColor: YELLOW }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </button>
            </div>
          </div>
          {totalItems > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(checkedCount / totalItems) * 100}%`, backgroundColor: YELLOW }} />
              </div>
              <span className="text-xs font-medium tabular-nums" style={{ color: theme.textSecondary }}>{checkedCount}/{totalItems}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 py-4 pb-20">
        {visibleCategories.map(category => {
          const categoryItems = items.filter(item => item.category === category.id);
          const uncheckedCount = categoryItems.filter(i => !i.checked).length;
          const hasItems = categoryItems.length > 0;
          const isAdding = addingTo === category.id;
          return (
            <div key={category.id} className="mb-3">
              <div className="flex items-center justify-between py-3 px-4 rounded-2xl transition-all" style={{ backgroundColor: hasItems ? theme.bgSecondary : 'transparent', boxShadow: hasItems ? theme.cardShadow : 'none' }}>
                <span className="text-sm" style={{ color: hasItems ? theme.text : theme.textTertiary, fontWeight: 600 }}>
                  {category.name}
                  {hasItems && <span className="ml-2" style={{ color: theme.textTertiary, fontWeight: 300 }}>{uncheckedCount}</span>}
                </span>
                <button onClick={() => isAdding ? cancelAdding() : startAdding(category.id)} className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 adding-input-area" style={{ backgroundColor: isAdding ? theme.text : theme.bgTertiary, color: isAdding ? theme.bg : theme.textSecondary }}>
                  <span className="text-lg leading-none transition-transform duration-200" style={{ transform: isAdding ? 'rotate(45deg)' : 'none' }}>+</span>
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
                  {categoryItems.map(item => {
                    const isChecking = checkingItems.has(item.id);
                    const isEditingQty = editingQuantityId === item.id;
                    const quantity = item.quantity || 1;
                    
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
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90" 
                            style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}
                          >
                            <span className="text-sm">×</span>
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
      </div>

      {checkedCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 flex justify-center fade-in">
          <button onClick={() => { triggerHaptic('light'); setShowClearConfirm(true); }}
            className="px-6 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.97]"
            style={{ backgroundColor: YELLOW, color: '#292524', boxShadow: theme.yellowGlow }}>
            Clear {checkedCount} completed
          </button>
        </div>
      )}
    </div>
  );
}
