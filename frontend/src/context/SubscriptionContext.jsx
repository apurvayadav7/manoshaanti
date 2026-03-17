import { createContext, useContext, useMemo, useState } from 'react';

const SubscriptionContext = createContext(null);

const STORAGE_KEY = 'manoshaanti_plan';
const JOURNAL_FREE_LIMIT = 10;

const PLAN_VALUES = ['free', 'premium', 'student'];

function getInitialPlan() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (PLAN_VALUES.includes(saved)) {
    return saved;
  }
  return 'free';
}

export function SubscriptionProvider({ children }) {
  const [plan, setPlanState] = useState(getInitialPlan);

  function setPlan(nextPlan) {
    if (!PLAN_VALUES.includes(nextPlan)) {
      return;
    }
    setPlanState(nextPlan);
    localStorage.setItem(STORAGE_KEY, nextPlan);
  }

  const value = useMemo(() => {
    const isPremium = plan === 'premium' || plan === 'student';
    return {
      plan,
      setPlan,
      isPremium,
      isStudent: plan === 'student',
      journalFreeLimit: JOURNAL_FREE_LIMIT,
    };
  }, [plan]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used inside SubscriptionProvider');
  }
  return ctx;
}
