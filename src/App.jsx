import { useState, useRef, useEffect } from "react";
import Header from "./components/Header.jsx";
import UserInput from "./components/UserInput.jsx";
import Results from "./components/Results.jsx";
import Calculator from "./components/Calculator.jsx";
import Notepad from "./components/Notepad.jsx";
import MarketView from "./components/MarketView.jsx";

function App() {
  const [userInput, setUserInput] = useState({
    initialInvestment: 0,
    annualInvestment: 0,
    contributionIncrease: 0,
    expectedReturn: 0,
    inflationRate: 0,
    taxRate: 0,
    duration: 0,
  });

  const [currency, setCurrency] = useState("USD");
  const [fontSize, setFontSize] = useState("md");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  const zCounter = useRef(1000);
  const [zOrder, setZOrder] = useState({ calculator: 1000, notepad: 1000 });

  useEffect(() => {
    document.body.setAttribute("data-font-size", fontSize);
  }, [fontSize]);

  const bringToFront = (which) => {
    zCounter.current += 1;
    setZOrder((prev) => ({ ...prev, [which]: zCounter.current }));
  };

  const hasAnyInput = Object.values(userInput).some((v) => Number(v) > 0);
  const validInput = userInput.duration >= 1;

  function handleChange(input, value) {
    setUserInput((prev) => ({ ...prev, [input]: +value }));
  }

  const toggleCalculator = () => {
    setIsCalculatorOpen((v) => {
      if (!v) bringToFront("calculator");
      return !v;
    });
  };

  const toggleNotepad = () => {
    setIsNotepadOpen((v) => {
      if (!v) bringToFront("notepad");
      return !v;
    });
  };

  return (
    <>
      <Header />
      <UserInput userInput={userInput} onChange={handleChange} />

      {!validInput && (
        <p className="center">
          {!hasAnyInput
            ? "Enter your numbers above to see projections."
            : userInput.duration > 100
            ? "Duration is capped at 100 years."
            : "Please enter a valid duration, number greater than 0"}
        </p>
      )}

      {validInput && (
        <Results
          data={userInput}
          currency={currency}
          onCurrencyChange={setCurrency}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
        />
      )}

      <div className="center action-buttons">
        <button onClick={toggleCalculator} aria-haspopup="dialog">
          Open Calculator
        </button>
        <button onClick={toggleNotepad} aria-haspopup="dialog">
          Open Notepad
        </button>
      </div>

      <Calculator
        isOpen={isCalculatorOpen}
        onClose={toggleCalculator}
        zIndex={zOrder.calculator}
        onActivate={() => bringToFront("calculator")}
      />
      <Notepad
        isOpen={isNotepadOpen}
        onClose={toggleNotepad}
        zIndex={zOrder.notepad}
        onActivate={() => bringToFront("notepad")}
      />

      <MarketView />
    </>
  );
}

export default App;