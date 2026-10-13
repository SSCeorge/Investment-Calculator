import FormattedNumberInput from "./FormattedNumberInput.jsx";

const MAX_MONEY = 1e12; 
const MAX_PERCENT = 100;

export default function UserInput({ onChange, userInput }) {
  const fields = [
    { key: "initialInvestment",    label: "Initial Investment",         placeholder: "10,000", min: 0, max: MAX_MONEY },
    { key: "annualInvestment",     label: "Annual Investment",          placeholder: "1,000",  min: 0, max: MAX_MONEY },
    { key: "contributionIncrease", label: "Contribution Increase %/yr", placeholder: "0",      min: 0, max: MAX_PERCENT },
    { key: "expectedReturn",       label: "Expected Return %/yr",       placeholder: "7",      min: 0, max: MAX_PERCENT },
    { key: "inflationRate",        label: "Inflation %/yr",             placeholder: "0",      min: 0, max: MAX_PERCENT },
    { key: "taxRate",              label: "Tax Rate on Gains %",        placeholder: "0",      min: 0, max: MAX_PERCENT },
    { key: "duration",             label: "Duration (years)",           placeholder: "10",     min: 1, max: 100 },
  ];

  return (
    <section id="user-input">
      <div className="inputs-grid">
        {fields.map(({ key, label, placeholder, min, max }) => (
          <p key={key}>
            <label>{label}</label>
            <FormattedNumberInput
              value={userInput[key]}
              placeholder={placeholder}
              min={min}
              max={max}
              onChange={(raw) => onChange(key, raw)}
            />
          </p>
        ))}
      </div>
    </section>
  );
}