/**
 * Mock Machine Learning Model for Contract Bidding.
 * In a production environment, this would call a Python backend (like Firebase Cloud Functions)
 * or use a pre-trained TensorFlow.js model.
 * 
 * For this prototype, we simulate a Decision Tree Classifier's logic
 * based on key bidding features: experience, quality score, on-time rate, and past disputes.
 */

export const predictBidSuitability = (bidData) => {
  const { amount, duration, experience, qualityScore, onTimeRate, pastDisputes } = bidData;

  // Base score out of 100
  let score = 50; 
  let risk = "Medium";

  // Feature 1: Experience (years)
  if (experience > 10) score += 15;
  else if (experience > 5) score += 10;
  else if (experience < 2) score -= 10;

  // Feature 2: Quality Score (0-100)
  if (qualityScore > 85) score += 20;
  else if (qualityScore > 70) score += 10;
  else if (qualityScore < 50) score -= 15;

  // Feature 3: On-Time Rate (0-1)
  if (onTimeRate > 0.9) score += 15;
  else if (onTimeRate > 0.75) score += 5;
  else score -= 20;

  // Feature 4: Past Disputes (count)
  if (pastDisputes === 0) score += 10;
  else if (pastDisputes === 1) score -= 10;
  else if (pastDisputes >= 2) score -= 30;

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine Risk Category based on predicted suitability
  if (score >= 80) {
    risk = "Low";
  } else if (score >= 50) {
    risk = "Medium";
  } else {
    risk = "High";
  }

  return {
    suitabilityScore: score.toFixed(2), // return as percentage string
    riskLevel: risk
  };
};
