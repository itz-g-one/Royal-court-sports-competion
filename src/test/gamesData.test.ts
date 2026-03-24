import { describe, expect, it } from 'vitest';
import { getEligibleGames } from '@/lib/gamesData';

function eligibleIds(age: string, gender: string, maritalStatus = '') {
  return getEligibleGames(age, gender, maritalStatus, [], []).map(game => game.id).sort();
}

describe('getEligibleGames', () => {
  it('blocks kho-kho below age 13', () => {
    expect(eligibleIds('12', 'Male')).not.toContain('kho');
    expect(eligibleIds('12', 'Female')).not.toContain('kho');
    expect(eligibleIds('13', 'Male')).toContain('kho');
    expect(eligibleIds('13', 'Female')).toContain('kho');
  });

  it('allows volleyball only for male players aged 16 and above', () => {
    expect(eligibleIds('15', 'Male')).not.toContain('volleyball');
    expect(eligibleIds('16', 'Male')).toContain('volleyball');
    expect(eligibleIds('18-34', 'Male')).toContain('volleyball');
    expect(eligibleIds('16', 'Female')).not.toContain('volleyball');
  });

  it('keeps 100m restricted to age 16 and below', () => {
    expect(eligibleIds('16', 'Male')).toContain('100m');
    expect(eligibleIds('17', 'Male')).not.toContain('100m');
    expect(eligibleIds('16', 'Female')).toContain('100m');
    expect(eligibleIds('17', 'Female')).not.toContain('100m');
  });

  it('allows badminton from age 10 and open category from 16+', () => {
    expect(eligibleIds('10', 'Male')).toContain('badminton');
    expect(eligibleIds('10', 'Female')).toContain('badminton');
    expect(eligibleIds('18-34', 'Male')).toContain('badminton');
    expect(eligibleIds('18-34', 'Female', 'Married')).toContain('badminton');
  });

  it('keeps long jump aligned with published categories', () => {
    expect(eligibleIds('11', 'Male')).toContain('longjump');
    expect(eligibleIds('16', 'Female')).toContain('longjump');
    expect(eligibleIds('17', 'Male')).not.toContain('longjump');
    expect(eligibleIds('35+', 'Male')).toContain('longjump');
    expect(eligibleIds('35+', 'Female', 'Married')).not.toContain('longjump');
  });

  it('keeps spoon and musical chair eligibility correct', () => {
    expect(eligibleIds('11', 'Female')).toContain('spoon');
    expect(eligibleIds('17', 'Female', 'Unmarried')).toContain('spoon');
    expect(eligibleIds('17', 'Female', 'Married')).not.toContain('spoon');
    expect(eligibleIds('18-34', 'Female', 'Married')).toContain('spoon');
    expect(eligibleIds('18-34', 'Female', 'Married')).toContain('musical');
    expect(eligibleIds('18-34', 'Female', 'Unmarried')).not.toContain('musical');
  });

  it('respects admin gender and age entry blocks', () => {
    const entryBlocks = {
      badminton: {
        blockedGenders: ['Female' as const],
        blockedAges: {
          Male: ['10'],
          Female: [],
        },
      },
    };

    expect(getEligibleGames('10', 'Male', '', [], [], entryBlocks).map(game => game.id)).not.toContain('badminton');
    expect(getEligibleGames('10', 'Female', '', [], [], entryBlocks).map(game => game.id)).not.toContain('badminton');
    expect(getEligibleGames('11', 'Male', '', [], [], entryBlocks).map(game => game.id)).toContain('badminton');
  });
});
