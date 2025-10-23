import { useState } from "react";

export interface UserPreferences {
  theme: string;
  currency: string;
  itemsPerPage: number;
  sortOrder: "asc" | "desc";
  enableNotifications: boolean;
  autoRefresh: boolean;
  showAdvancedFilters: boolean;
  compactView: boolean;
  timestamps: {
    created: number;
    updated: number;
  };
  analytics?: any;
}

export interface RefreshControls {
  currentRate: number;
  updateRate: (rate: number) => void;
  isActive: boolean;
}

/**
 * Custom hook for managing user preferences and refresh controls
 */
export const useUserPreferences = (globalSettings: {
  theme: string;
  currency: string;
}) => {
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: globalSettings.theme,
    currency: globalSettings.currency,
    itemsPerPage: 50,
    sortOrder: "desc",
    enableNotifications: true,
    autoRefresh: true,
    showAdvancedFilters: false,
    compactView: false,
    timestamps: { created: Date.now(), updated: Date.now() },
  });

  const actualRefreshRate = refreshInterval || 5000;

  const refreshControls: RefreshControls = {
    currentRate: refreshInterval,
    updateRate: setRefreshInterval,
    isActive: actualRefreshRate > 0,
  };

  // Store controls for potential dashboard integration
  if (typeof window !== "undefined") {
    (window as { dashboardControls?: RefreshControls }).dashboardControls =
      refreshControls;
  }

  return {
    userPreferences,
    setUserPreferences,
    refreshControls,
    actualRefreshRate,
  };
};
