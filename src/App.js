import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI9GJYMVYofjWz6cJ027zZbwi6XMOsAOU",
  authDomain: "breadcrumbs-0000.firebaseapp.com",
  projectId: "breadcrumbs-0000",
  storageBucket: "breadcrumbs-0000.firebasestorage.app",
  messagingSenderId: "933716614684",
  appId: "1:933716614684:web:a31b027b9b793841f709d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_CATEGORIES = [
  { id: 'fruit-veg', name: 'Fruits & Vegetables' },
  { id: 'spices', name: 'Spices' },
  { id: 'rice-pasta', name: 'Rice & Pasta' },
  { id: 'meat', name: 'Meat' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'canned', name: 'Canned Items' },
  { id: 'household', name: 'Household' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'frozen', name: 'Frozen' },
  { id: 'nuts-jams', name: 'Nuts & Jams' },
  { id: 'cereals', name: 'Cereals' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'alcohol', name: 'Alcohol' },
  { id: 'other', name: 'Other' },
];

const YELLOW = '#FACC15';

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateListCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

const triggerHaptic = (style = 'light') => {
  if (navigator.vibrate) {
    navigator.vibrate(style === 'success' ? [10, 50, 20] : style === 'light' ? 10 : 5);
  }
};

// Onboarding Modal Component
const OnboardingModal = ({ listCode, onComplete }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');

  const cards = [
    {
      icon: '🏪',
      title: 'Smart Organisation',
      description: 'Your shopping list is automatically organised by store section — just like a real supermarket. Shop faster and never miss an aisle.',
      visual: (
        <div className="flex flex-col gap-2 mt-4">
          {['🥬 Fruits & Veg', '🧀 Dairy', '🧊 Frozen'].map((cat, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#fffef5', borderLeft: `3px solid ${YELLOW}` }}>
              <span className="text-sm">{cat}</span>
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
          <p className="text-xs mt-3" style={{ color: '#78716c' }}>You'll find your code at the top of your list</p>
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
            <div className="w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1" style={{ borderColor: '#e7e5e4' }}>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: '#e7e5e4' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: YELLOW }}></div>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: '#e7e5e4' }}></div>
            </div>
            <span className="text-xs" style={{ color: '#78716c' }}>You</span>
          </div>
          <div className="flex items-center">
            <span style={{ color: YELLOW }}>⟷</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1" style={{ borderColor: '#e7e5e4' }}>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: '#e7e5e4' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: YELLOW }}></div>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: '#e7e5e4' }}></div>
            </div>
            <span className="text-xs" style={{ color: '#78716c' }}>Them</span>
          </div>
        </div>
      )
    },
    {
      icon: '✨',
      title: 'Reorder Your Way',
      description: 'Organise categories to match your local store layout. Head to Settings to drag and drop them into your perfect order.',
      visual: (
        <div className="mt-4 flex flex-col gap-2">
          {['Bakery', 'Dairy', 'Frozen'].map((cat, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ backgroundColor: '#f5f5f4' }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#a8a29e' }}></div>
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#a8a29e' }}></div>
                </div>
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#a8a29e' }}></div>
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#a8a29e' }}></div>
                </div>
              </div>
              <span className="text-sm" style={{ color: '#292524' }}>{cat}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: '🎉',
      title: "You're All Set!",
      description: 'Your list is ready. Start adding items or invite others with the share code at the top.',
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
      <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ backgroundColor: '#fff', maxHeight: '90vh' }}>
        {/* Skip button */}
        <div className="flex justify-end p-4 pb-0">
          <button onClick={skip} className="text-sm" style={{ color: '#a8a29e' }}>
            Skip
          </button>
        </div>

        {/* Card content */}
        <div className="px-6 pb-6 overflow-hidden">
          <div 
            key={currentCard}
            className="text-center"
            style={{
              animation: `${slideDirection === 'right' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out`
            }}
          >
            <div className="text-4xl mb-4">{cards[currentCard].icon}</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#292524' }}>{cards[currentCard].title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#78716c' }}>{cards[currentCard].description}</p>
            {cards[currentCard].visual}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {cards.map((_, i) => (
            <div 
              key={i} 
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: i === currentCard ? YELLOW : '#e7e5e4' }}
            ></div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 p-4 pt-0">
          {currentCard > 0 && (
            <button 
              onClick={goBack}
              className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]"
              style={{ border: '1.5px solid #e7e5e4', color: '#78716c' }}
            >
              Back
            </button>
          )}
          <button 
            onClick={goNext}
            className="flex-1 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98]"
            style={{ backgroundColor: YELLOW, color: '#292524' }}
          >
            {currentCard === cards.length - 1 ? 'Start Shopping' : 'Next'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [listId, setListId] = useState(() => {
    const saved = localStorage.getItem('breadcrumbs-current-list');
    return saved ? JSON.parse(saved).listId : null;
  });
  const [items, setItems] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [addingTo, setAddingTo] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [createAnim, setCreateAnim] = useState(false);
  const [checkingItems, setCheckingItems] = useState(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const inputRef = useRef(null);

  // Check if user has seen onboarding
  const checkOnboarding = useCallback(() => {
    const hasSeenOnboarding = localStorage.getItem('breadcrumbs-has-seen-onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('breadcrumbs-has-seen-onboarding', 'true');
    setShowOnboarding(false);
    triggerHaptic('success');
  };

  // Fixed online/offline detection
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

  // Real-time listener for list updates
  useEffect(() => {
    if (!listId) return;

    setSyncing(true);
    const unsubscribe = onSnapshot(
      doc(db, 'lists', listId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setItems(data.items || []);
          if (data.categories) setCategories(data.categories);
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

  const saveList = useCallback(async (newItems, newCategories = categories) => {
    if (!listId) return;
    try {
      await setDoc(doc(db, 'lists', listId), {
        items: newItems,
        categories: newCategories,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving list:', error);
    }
  }, [listId, categories]);

  useEffect(() => {
    if (addingTo && inputRef.current) inputRef.current.focus();
  }, [addingTo]);

  const createNewList = async () => {
    setCreateAnim(true);
    triggerHaptic('success');
    setTimeout(async () => {
      const code = generateListCode();
      setListId(code);
      setItems([]);
      setCategories(DEFAULT_CATEGORIES);
      
      await setDoc(doc(db, 'lists', code), {
        items: [],
        categories: DEFAULT_CATEGORIES,
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

  // Fixed leave list function
  const leaveList = () => {
    triggerHaptic('light');
    setShowSettings(false);
    setListId(null);
    setItems([]);
    setCategories(DEFAULT_CATEGORIES);
    localStorage.removeItem('breadcrumbs-current-list');
  };

  const startAdding = (categoryId) => {
    triggerHaptic('light');
    setAddingTo(categoryId);
    setNewItemText('');
  };

  const addItem = async () => {
    if (!newItemText.trim() || !addingTo) return;
    triggerHaptic('success');
    const item = { id: generateId(), name: newItemText.trim(), category: addingTo, checked: false, addedAt: Date.now() };
    const newItems = [...items, item];
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
        setCheckingItems(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
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
    @keyframes checkPop {
      0% { transform: scale(1); }
      25% { transform: scale(1.3); }
      50% { transform: scale(0.95); }
      75% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes fillCheck {
      0% { background-color: transparent; border-color: #d6d3d1; }
      50% { background-color: ${YELLOW}; border-color: ${YELLOW}; transform: scale(1.2); }
      100% { background-color: ${YELLOW}; border-color: ${YELLOW}; transform: scale(1); }
    }
    @keyframes drawCheck {
      0% { stroke-dashoffset: 24; }
      100% { stroke-dashoffset: 0; }
    }
    
    .fade-in { animation: fadeIn 0.2s ease-out; }
    .sync-pulse { animation: pulse 1.5s ease-in-out infinite; }
    .btn-pop { animation: buttonPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .check-pop { animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .fill-check { animation: fillCheck 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .draw-check { stroke-dasharray: 24; stroke-dashoffset: 24; animation: drawCheck 0.3s ease-out 0.15s forwards; }
    
    .item-row { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    
    input { font-size: 16px !important; }
    .drag-handle { cursor: grab; }
    .drag-handle:active { cursor: grabbing; }
    .dragging { opacity: 0.5; }
    .drag-over { background-color: #fefce8 !important; }
  `;

  // Settings Page
  if (showSettings) {
    return (
      <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#fafaf9' }}>
        <style>{styles}</style>
        <div className="sticky top-0 z-40" style={{ backgroundColor: '#fafaf9', borderBottom: '1px solid #e7e5e4' }}>
          <div className="px-5 py-4 flex items-center justify-between">
            <button onClick={() => setShowSettings(false)} className="text-sm font-medium flex items-center gap-2" style={{ color: '#292524' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>
            <h1 className="text-base font-medium" style={{ color: '#292524' }}>Settings</h1>
            <div className="w-16"></div>
          </div>
        </div>
        <div className="px-5 py-6">
          <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: '#78716c' }}>Reorder Categories</h2>
          <p className="text-sm mb-4" style={{ color: '#a8a29e' }}>Drag to reorder categories to match your store layout.</p>
          <div className="rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {categories.map((cat, idx) => (
              <div key={cat.id} draggable
                onDragStart={() => setDraggedIdx(idx)}
                onDragEnd={() => setDraggedIdx(null)}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                onDrop={(e) => { e.currentTarget.classList.remove('drag-over'); if (draggedIdx !== null) moveCategory(draggedIdx, idx); }}
                className={`flex items-center gap-4 px-4 py-4 transition-all ${draggedIdx === idx ? 'dragging' : ''}`}
                style={{ borderBottom: idx < categories.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                <div className="drag-handle flex flex-col gap-1 py-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="flex gap-0.5">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#d6d3d1' }}></div>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#d6d3d1' }}></div>
                    </div>
                  ))}
                </div>
                <span className="text-sm" style={{ color: '#292524' }}>{cat.name}</span>
              </div>
            ))}
          </div>
          <button onClick={leaveList} className="w-full py-3 text-sm font-medium rounded-full active:scale-[0.98] transition-transform" style={{ border: '1.5px solid #ef4444', color: '#ef4444' }}>
            Leave this list
          </button>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (!listId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#fafaf9' }}>
        <style>{styles}</style>
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: YELLOW }}></div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.6 }}></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.3 }}></div>
            </div>
            <h1 className="text-3xl font-light tracking-tight mb-4" style={{ color: '#292524' }}>Breadcrumbs</h1>
            <p className="text-sm font-light leading-relaxed" style={{ color: '#78716c' }}>Never get lost in the aisles again.</p>
            <p className="text-sm font-light" style={{ color: '#a8a29e' }}>The smartest path to a stocked home.</p>
          </div>
          <button onClick={createNewList}
            className={`w-full py-4 text-sm tracking-wide font-medium rounded-full transition-all ${createAnim ? 'btn-pop' : ''}`}
            style={{ backgroundColor: createAnim ? YELLOW : '#292524', color: createAnim ? '#292524' : '#fff' }}>
            Create new list
          </button>
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid #e7e5e4' }}></div></div>
            <div className="relative flex justify-center"><span className="px-4 text-xs tracking-widest uppercase" style={{ backgroundColor: '#fafaf9', color: '#a8a29e' }}>or join</span></div>
          </div>
          <div className="flex gap-3">
            <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Code" maxLength={6}
              className="flex-1 px-5 py-4 text-center text-sm tracking-widest uppercase font-mono focus:outline-none transition-all rounded-full"
              style={{ border: '1.5px solid #e7e5e4', backgroundColor: 'transparent' }}
              onFocus={(e) => e.target.style.borderColor = '#292524'}
              onBlur={(e) => e.target.style.borderColor = '#e7e5e4'} />
            <button onClick={joinList}
              className="px-8 py-4 text-sm tracking-wide font-medium active:scale-[0.98] rounded-full transition-transform"
              style={{ border: '1.5px solid #292524', color: '#292524' }}>
              Join
            </button>
          </div>
          <p className="text-center mt-10 text-xs" style={{ color: '#d6d3d1' }}>Share your code to shop together</p>
        </div>
      </div>
    );
  }

  // Main List
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#fafaf9' }}>
      <style>{styles}</style>
      
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal listCode={listId} onComplete={completeOnboarding} />
      )}
      
      {!isOnline && (
        <div className="px-4 py-2 text-center text-xs font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
          You're offline. Changes will sync when you reconnect.
        </div>
      )}
      <div className="sticky top-0 z-40" style={{ backgroundColor: '#fafaf9', borderBottom: '1px solid #e7e5e4' }}>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: YELLOW }}></div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.6 }}></div>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: YELLOW, opacity: 0.3 }}></div>
              </div>
              <h1 className="text-lg font-medium tracking-tight" style={{ color: '#292524' }}>Breadcrumbs</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f5f5f4' }}>
                <span className={`w-1.5 h-1.5 rounded-full ${syncing ? 'sync-pulse' : ''}`} style={{ backgroundColor: isOnline ? '#22c55e' : '#f59e0b' }}></span>
                <span className="text-xs font-mono" style={{ color: '#78716c' }}>{listId}</span>
              </div>
              <button onClick={() => setShowSettings(true)} className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform" style={{ backgroundColor: '#f5f5f4' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
          {totalItems > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e7e5e4' }}>
                <div className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(checkedCount / totalItems) * 100}%`, backgroundColor: YELLOW }} />
              </div>
              <span className="text-xs font-medium tabular-nums" style={{ color: '#78716c' }}>{checkedCount}/{totalItems}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-4 pb-20">
        {categories.map(category => {
          const categoryItems = items.filter(item => item.category === category.id);
          const uncheckedCount = categoryItems.filter(i => !i.checked).length;
          const hasItems = categoryItems.length > 0;
          const isAdding = addingTo === category.id;
          return (
            <div key={category.id} className="mb-3">
              <div className="flex items-center justify-between py-3 px-4 rounded-2xl transition-all"
                  style={{ backgroundColor: hasItems ? '#fff' : 'transparent', boxShadow: hasItems ? '0 1px 3px rgba(0,0,0,0.04)' : 'none' }}>                <span className="text-sm font-medium" style={{ color: hasItems ? '#292524' : '#a8a29e' }}>
                  {category.name}
                  {hasItems && <span className="ml-2 font-normal" style={{ color: '#a8a29e' }}>{uncheckedCount}</span>}
                </span>
                <button onClick={() => isAdding ? cancelAdding() : startAdding(category.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ backgroundColor: isAdding ? '#292524' : '#f5f5f4', color: isAdding ? '#fff' : '#78716c' }}>
                  <span className="text-lg leading-none transition-transform duration-200" style={{ transform: isAdding ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
              </div>
              {isAdding && (
                <div className="mt-1 ml-4 mr-4 fade-in">
                  <div className="flex items-center gap-3">
                    <input ref={inputRef} type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') cancelAdding(); }}
                      placeholder={`Add to ${category.name}...`}
                      className="flex-1 py-2 text-sm focus:outline-none bg-transparent"
                      style={{ borderBottom: '1px solid #d6d3d1' }} />
                    <button onClick={addItem} disabled={!newItemText.trim()}
                      className="px-4 py-1.5 text-sm font-medium rounded-full transition-all active:scale-95"
                      style={{ 
                        backgroundColor: newItemText.trim() ? YELLOW : 'transparent',
                        color: '#292524',
                        opacity: newItemText.trim() ? 1 : 0.3
                      }}>
                      Add
                    </button>
                  </div>
                </div>
              )}
              {hasItems && (
                <div className="mt-1 ml-4 mr-4">
                  {categoryItems.map(item => {
                    const isChecking = checkingItems.has(item.id);
                    return (
                      <div key={item.id} className="flex items-center gap-3 py-3 item-row fade-in"
                        style={{ borderBottom: '1px solid #f5f5f4', opacity: item.checked ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
                        <button onClick={() => toggleItem(item.id)}
                          className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${isChecking ? 'fill-check check-pop' : ''}`}
                          style={{
                            border: `2px solid ${item.checked || isChecking ? YELLOW : '#d6d3d1'}`,
                            backgroundColor: item.checked || isChecking ? YELLOW : 'transparent'
                          }}>
                          {(item.checked || isChecking) && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path className={isChecking ? 'draw-check' : ''} d="M4 12l6 6L20 6"/>
                            </svg>
                          )}
                        </button>
                        {editingId === item.id ? (
                          <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)}
                            onBlur={saveEdit} onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            className="flex-1 text-sm py-1 px-2 rounded-lg focus:outline-none" style={{ backgroundColor: '#f5f5f4' }} autoFocus />
                        ) : (
                          <span className={`flex-1 text-sm transition-all ${item.checked ? 'line-through' : ''}`}
                            style={{ color: item.checked ? '#a8a29e' : '#292524' }}
                            onClick={() => !item.checked && startEdit(item)}>
                            {item.name}
                          </span>
                        )}
                        <button onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90" style={{ color: '#d6d3d1' }}>
                          <span className="text-lg">−</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Clear completed button */}
        {checkedCount > 0 && (
          <div className="fixed bottom-6 left-4 right-4 flex justify-center fade-in">
            <button
              onClick={async () => {
                triggerHaptic('success');
                const newItems = items.filter(i => !i.checked);
                setItems(newItems);
                await saveList(newItems);
              }}
              className="px-6 py-3 text-sm font-medium rounded-full shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: YELLOW, color: '#292524' }}
            >
              Clear {checkedCount} completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
