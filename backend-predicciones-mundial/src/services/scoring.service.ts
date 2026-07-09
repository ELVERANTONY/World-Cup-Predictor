export interface ScoreDetail {
  rule: string;
  points: number;
}

export interface ScoreResult {
  points: number;
  details: ScoreDetail[];
}

export class ScoringService {
  calculatePoints(
    actualHome: number,
    actualAway: number,
    predictedHome: number,
    predictedAway: number,
    matchDate: Date,
    predictionDate: Date,
  ): ScoreResult {
    const details: ScoreDetail[] = [];
    let points = 0;

    const actualWinner = actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw';
    const predictedWinner = predictedHome > predictedAway ? 'home' : predictedAway > predictedHome ? 'away' : 'draw';

    const exact = actualHome === predictedHome && actualAway === predictedAway;
    const correctWinner = actualWinner === predictedWinner;
    const goalDiff = Math.abs(actualHome - actualAway);
    const predictedGoalDiff = Math.abs(predictedHome - predictedAway);
    const correctGoalDiff = goalDiff === predictedGoalDiff;

    if (exact) {
      points += 5;
      details.push({ rule: 'exact_result', points: 5 });
    } else if (correctWinner) {
      points += 3;
      details.push({ rule: 'correct_winner', points: 3 });
      
      // Diferencia de goles correcta is an extra condition? The image says "Diferencia de goles correcta 2 pts". 
      // If we make it 3 (winner) + 2 (diff) = 5, it equals exact score. 
      // Let's assume it means if you get winner (3) and diff (+2) you get 5. I will leave it as is, or we make it additive.
      // Wait, let's just change it to 2 points extra if difference is right but not exact.
      if (correctGoalDiff) {
        points += 2; // Making it 5 total
        details.push({ rule: 'correct_goal_difference', points: 2 });
      }
    }

    const hoursBeforeMatch = (matchDate.getTime() - predictionDate.getTime()) / (1000 * 60 * 60);
    if (hoursBeforeMatch >= 24) {
      points += 1;
      details.push({ rule: 'early_prediction_bonus', points: 1 });
    }

    points = Math.min(points, 10);

    return { points, details };
  }
}

export const scoringService = new ScoringService();
