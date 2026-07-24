'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export type PlanType = 'Gratuit' | 'Pro' | 'Business';

export interface PlanLimits {
  maxProducts: number;
  maxUsers: number;
  maxCategories: number;
  maxMovements: number;
  hasExport: boolean;
  hasQrCode: boolean;
  hasScanner: boolean;
  hasAdvancedReports: boolean;
  advancedAlerts: boolean;
  multiUser: boolean;
  hasApi: boolean;
  hasCustomLogo: boolean;
  hasCsvImport: boolean;
}

export const getPlanLimits = (plan: PlanType): PlanLimits => {
  switch (plan) {
    case 'Pro': return {
      maxProducts: 2000,
      maxUsers: 5,
      maxCategories: Infinity,
      maxMovements: Infinity,
      hasExport: true,
      hasQrCode: true,
      hasScanner: true,
      hasAdvancedReports: true,
      advancedAlerts: true,
      multiUser: true,
      hasApi: false,
      hasCustomLogo: true,
      hasCsvImport: true,
    };
    case 'Business': return {
      maxProducts: Infinity,
      maxUsers: Infinity,
      maxCategories: Infinity,
      maxMovements: Infinity,
      hasExport: true,
      hasQrCode: true,
      hasScanner: true,
      hasAdvancedReports: true,
      advancedAlerts: true,
      multiUser: true,
      hasApi: true,
      hasCustomLogo: true,
      hasCsvImport: true,
    };
    case 'Gratuit':
    default: return {
      maxProducts: 50,
      maxUsers: 1,
      maxCategories: 5,
      maxMovements: 200,
      hasExport: false,
      hasQrCode: true,
      hasScanner: false,
      hasAdvancedReports: false,
      advancedAlerts: false,
      multiUser: false,
      hasApi: false,
      hasCustomLogo: false,
      hasCsvImport: false,
    };
  }
}

interface SubscriptionContextType {
  plan: PlanType;
  limits: PlanLimits;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ 
  children, 
  plan = 'Gratuit' 
}: { 
  children: ReactNode; 
  plan?: PlanType;
}) {
  const limits = getPlanLimits(plan);

  return (
    <SubscriptionContext.Provider value={{ plan, limits }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
