export function calculateInvestmentResults({
  initialInvestment,
  annualInvestment,
  contributionIncrease = 0,
  expectedReturn,
  inflationRate = 0,
  taxRate = 0,
  duration,
}) {
  const annualData = [];
  let investmentValue = initialInvestment;
  let totalContributed = initialInvestment;
  let currentAnnualContribution = annualInvestment;
  let totalInterestEarned = 0;

  for (let i = 0; i < duration; i++) {
    const interestEarnedInYear = investmentValue * (expectedReturn / 100);
    investmentValue += interestEarnedInYear + currentAnnualContribution;
    totalContributed += currentAnnualContribution;
    totalInterestEarned += interestEarnedInYear;

    const realValue =
      investmentValue / Math.pow(1 + inflationRate / 100, i + 1);

    const gains = Math.max(0, investmentValue - totalContributed);
    const afterTaxValue = investmentValue - gains * (taxRate / 100);

    annualData.push({
      year: i + 1,
      interest: interestEarnedInYear,
      valueEndOfYear: investmentValue,
      annualInvestment: currentAnnualContribution,
      totalContributed,
      totalInterestEarned,
      realValue,
      afterTaxValue,
    });

    currentAnnualContribution *= 1 + contributionIncrease / 100;
  }

  return annualData;
}

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});