import { describe, it, expect } from 'vitest';
import { AIBudgetManager } from '../../src/ai/budget.js';

describe('AI Budget Manager', () => {
  it('should decrement budget correctly on first pass usage', () => {
    const budget = new AIBudgetManager(40, 10, 2);

    budget.recordUsage(5, 1);
    const state = budget.getState();

    expect(state.totalUsed).toBe(5);
    expect(state.remaining).toBe(35);
    expect(state.canProcess).toBe(true);
  });

  it('should track second pass usage separately', () => {
    const budget = new AIBudgetManager(40, 10, 2);

    budget.recordUsage(5, 2);
    const state = budget.getState();

    expect(state.totalUsed).toBe(5);
    expect(state.secondPassUsed).toBe(5);
    expect(state.canSecondPass).toBe(true);
  });

  it('should prevent first-pass budget from consuming second-pass reserve', () => {
    const budget = new AIBudgetManager(40, 10, 2);

    // Use up 30 (which is dailyLimit - secondPassReserve)
    budget.recordUsage(30, 1);
    expect(budget.canProcess()).toBe(false);

    // But second pass should still be available
    expect(budget.canSecondPass()).toBe(true);
  });

  it('should return canProcess: false when budget exhausted', () => {
    const budget = new AIBudgetManager(40, 10, 2);

    // Exhaust first-pass budget (dailyLimit - secondPassReserve = 30)
    budget.recordUsage(30, 1);
    expect(budget.canProcess()).toBe(false);

    // Exhaust second-pass reserve
    budget.recordUsage(10, 2);
    expect(budget.canSecondPass()).toBe(false);
  });

  it('should reset all counters', () => {
    const budget = new AIBudgetManager(40, 10, 2);

    budget.recordUsage(20, 1);
    budget.recordUsage(5, 2);

    budget.reset();
    const state = budget.getState();

    expect(state.totalUsed).toBe(0);
    expect(state.secondPassUsed).toBe(0);
    expect(state.remaining).toBe(40);
    expect(state.canProcess).toBe(true);
    expect(state.canSecondPass).toBe(true);
  });

  it('should correctly calculate remaining budget', () => {
    const budget = new AIBudgetManager(50, 15, 2);

    budget.recordUsage(20, 1);
    expect(budget.remaining()).toBe(30);

    budget.recordUsage(10, 2);
    expect(budget.remaining()).toBe(20);
  });

  it('should return max attempts per document', () => {
    const budget = new AIBudgetManager(40, 10, 3);
    expect(budget.getMaxAttemptsPerDocument()).toBe(3);
  });

  it('should never have negative remaining', () => {
    const budget = new AIBudgetManager(10, 5, 2);

    budget.recordUsage(20, 1);
    expect(budget.remaining()).toBe(0);
  });
});
