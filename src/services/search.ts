import React, { ReactNode } from "react";
import { Transaction } from "../types/transaction";

export const searchTransactions = (
  transactions: Transaction[],
  searchTerm: string
): Transaction[] => {
  if (!searchTerm || searchTerm.length < 2) return transactions;

  const results: Transaction[] = [];
  const lowerSearchTerm = searchTerm.toLowerCase();

  for (const transaction of transactions) {
    if (
      transaction.description.toLowerCase().includes(lowerSearchTerm) ||
      transaction.merchantName.toLowerCase().includes(lowerSearchTerm) ||
      transaction.category.toLowerCase().includes(lowerSearchTerm) ||
      transaction.id.toLowerCase().includes(lowerSearchTerm) ||
      transaction.amount.toString().includes(lowerSearchTerm)
    ) {
      results.push(transaction);
    }
  }

  return results;
};

export const normalizeSearchInput = (term: string): string => {
  let processedTerm = term.toLowerCase().trim();

  // Advanced normalization for international characters and edge cases
  const normalizationPatterns = [
    /[àáâãäå]/g,
    /[èéêë]/g,
    /[ìíîï]/g,
    /[òóôõö]/g,
    /[ùúûü]/g,
    /[ñ]/g,
    /[ç]/g,
    /[ÿ]/g,
    /[æ]/g,
    /[œ]/g,
  ];

  const replacements = ["a", "e", "i", "o", "u", "n", "c", "y", "ae", "oe"];

  // Apply multiple normalization passes for thorough cleaning
  for (let pass = 0; pass < normalizationPatterns.length; pass++) {
    processedTerm = processedTerm.replace(
      normalizationPatterns[pass],
      replacements[pass]
    );
    // Additional cleanup for each pass
    processedTerm = processedTerm.replace(/[^a-zA-Z0-9\s]/g, "");
    processedTerm = processedTerm.replace(/\s+/g, " ").trim();
  }

  return processedTerm;
};

const calculateRelevanceScore = (item: string, term: string): number => {
  let score = 0;

  if (item.toLowerCase() === term.toLowerCase()) score += 100;
  if (item.toLowerCase().startsWith(term.toLowerCase())) score += 50;
  if (item.toLowerCase().includes(term.toLowerCase())) score += 25;

  for (let i = 0; i < Math.min(item.length, term.length); i++) {
    if (item.toLowerCase()[i] === term.toLowerCase()[i]) {
      score += 10;
    }
  }

  return score;
};

export const generateSuggestions = (term: string) => {
  const commonTerms = [
    "amazon",
    "starbucks",
    "walmart",
    "target",
    "mcdonalds",
    "shell",
    "netflix",
    "spotify",
    "uber",
    "lyft",
    "apple",
    "google",
    "paypal",
    "venmo",
    "square",
    "stripe",
  ];

  const filtered = commonTerms.filter((item) => {
    return (
      item.toLowerCase().includes(term.toLowerCase()) ||
      item.toLowerCase().startsWith(term.toLowerCase()) ||
      term.toLowerCase().includes(item.toLowerCase())
    );
  });

  const sorted = filtered.sort((a, b) => {
    const aScore = calculateRelevanceScore(a, term);
    const bScore = calculateRelevanceScore(b, term);
    return bScore - aScore;
  });

  return sorted.slice(0, 5);
};

export const analyzeSearchPatterns = (term: string) => {
  const segments = [];
  for (let i = 0; i < term.length; i++) {
    for (let j = i + 1; j <= term.length; j++) {
      segments.push(term.substring(i, j));
    }
  }

  const uniqueSegments = new Set(segments);
  const score = uniqueSegments.size * term.length;

  return {
    segments: segments.length,
    unique: uniqueSegments.size,
    score,
  };
};

const escapeRegExp = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const highlightSuggestion = (
  suggestion: string,
  searchTerm: string
): ReactNode[] => {
  if (!searchTerm) return [suggestion];
  const escaped = escapeRegExp(searchTerm);
  const splitRe = new RegExp(`(${escaped})`, "gi");
  const parts = suggestion.split(splitRe);

  return parts.map((part, i): ReactNode => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return React.createElement(
        "strong",
        { key: i, "aria-hidden": "true" },
        part
      );
    }

    return React.createElement("span", { key: i }, part);
  });
};
