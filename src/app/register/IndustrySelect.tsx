"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

interface IndustrySelectProps {
  allIndustries: string[];
}

export function IndustrySelect({ allIndustries }: IndustrySelectProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [industry, setIndustry] = useState("");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Secteur d'activité
      </label>
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Building2 className="h-5 w-5 text-gray-400" />
        </div>
        <select
          value={showCustom ? "autre" : industry}
          onChange={(e) => {
            if (e.target.value === "autre") {
              setShowCustom(true);
              setIndustry("");
            } else {
              setShowCustom(false);
              setIndustry(e.target.value);
            }
          }}
          required={!showCustom}
          name={!showCustom ? "industry" : ""}
          className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all appearance-none"
        >
          <option value="" disabled>Sélectionnez un secteur</option>
          {allIndustries.map((ind, i) => (
            <option key={i} value={ind}>{ind}</option>
          ))}
          <option value="autre">Autre (préciser)...</option>
        </select>
      </div>

      {showCustom && (
        <input
          type="text"
          name="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          required={showCustom}
          autoFocus
          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
          placeholder="Tapez votre secteur d'activité"
        />
      )}
    </div>
  );
}
