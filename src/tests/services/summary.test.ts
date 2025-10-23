import { describe, it, expect } from "vitest";
import { calculateTotalAmount, calculateSummary } from "../../services/summary";
import { Transaction } from "../../types/transaction";

describe("Summary Service", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      timestamp: new Date("2024-01-01"),
      amount: 100.5,
      type: "credit",
      category: "Salary",
      description: "Monthly salary",
      merchantName: "Company Inc",
      status: "completed",
      userId: "user1",
    },
    {
      id: "2",
      timestamp: new Date("2024-01-02"),
      amount: 50.25,
      type: "debit",
      category: "Food",
      description: "Grocery shopping",
      merchantName: "Grocery Store",
      status: "completed",
      userId: "user1",
    },
    {
      id: "3",
      timestamp: new Date("2024-01-03"),
      amount: 200.0,
      type: "credit",
      category: "Bonus",
      description: "Performance bonus",
      merchantName: "Company Inc",
      status: "completed",
      userId: "user1",
    },
  ];

  describe("calculateTotalAmount", () => {
    it("should calculate total amount correctly", () => {
      const result = calculateTotalAmount(mockTransactions);
      expect(result).toBe(350.75); // 100.5 + 50.25 + 200.0
    });

    it("should return 0 for empty array", () => {
      const result = calculateTotalAmount([]);
      expect(result).toBe(0);
    });
  });

  describe("calculateSummary", () => {
    it("should calculate complete summary correctly", () => {
      const result = calculateSummary(mockTransactions);

      expect(result.totalTransactions).toBe(3);
      expect(result.totalAmount).toBe(350.75);
      expect(result.totalCredits).toBe(300.5); // 100.5 + 200.0
      expect(result.totalDebits).toBe(50.25);
      expect(result.categoryCounts).toEqual({
        Salary: 1,
        Food: 1,
        Bonus: 1,
      });
    });

    it("should handle empty transaction array", () => {
      const result = calculateSummary([]);

      expect(result.totalTransactions).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.totalCredits).toBe(0);
      expect(result.totalDebits).toBe(0);
      expect(result.categoryCounts).toEqual({});
    });

    it("should count duplicate categories correctly", () => {
      const transactionsWithDuplicates: Transaction[] = [
        {
          id: "1",
          timestamp: new Date("2024-01-01"),
          amount: 100,
          type: "credit",
          category: "Food",
          description: "First food transaction",
          merchantName: "Store A",
          status: "completed",
          userId: "user1",
        },
        {
          id: "2",
          timestamp: new Date("2024-01-02"),
          amount: 200,
          type: "credit",
          category: "Food",
          description: "Second food transaction",
          merchantName: "Store B",
          status: "completed",
          userId: "user1",
        },
      ];

      const result = calculateSummary(transactionsWithDuplicates);

      expect(result.categoryCounts).toEqual({
        Food: 2,
      });
    });
  });
});
