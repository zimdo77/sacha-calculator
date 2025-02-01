const ADD = "+";
const SUBTRACT = "-";
const MULTIPLY = "×";
const DIVIDE = "÷";

const DEFAULT_OUTPUT = "0";
const MAX_DISPLAY_CHARACTERS = 9;
const DEFAULT_OPACITY = 1;
const HIGHLIGHT_OPACITY = 0.8;

let firstOperand = null;
let secondOperand = null;
let globalOperator = null; // value of operator being used
let selectedOperatorButton = null; // DOM object reference of current operator

let awaitingSecondOperand = false; // flag triggered after choosing operator
let awaitingNewOperation = false; // flag triggered after clicking equals sign

// Initialise output display
const output = document.querySelector("#output-display");
changeOutput(DEFAULT_OUTPUT);

// All buttons change color when hovered over,
// except the selected operator - which is permanently highlghted.
const buttons = document.querySelectorAll("#keypad div");
buttons.forEach((button) => {
  button.addEventListener("mouseover", () => {
    if (button !== selectedOperatorButton) {
      button.style.cursor = "pointer";
      button.style.opacity = HIGHLIGHT_OPACITY;
    }
  });
  button.addEventListener("mouseout", () => {
    if (button !== selectedOperatorButton) {
      button.style.opacity = DEFAULT_OPACITY;
    }
  });
});

// Handle all clear (AC) button
const acButton = document.querySelector("#ac");
ac.addEventListener("click", () => {
  changeOutput(DEFAULT_OUTPUT);
  removeOperatorHighlightedEffect();
  resetVariables();
  resetFlags();
});

// Handle digit button clicks
const digitButtons = document.querySelectorAll(".digit");
digitButtons.forEach((digitButton) => {
  digitButton.addEventListener("click", () => {
    // Wipe display if one of these conditions are met:
    if (
      output.textContent === DEFAULT_OUTPUT ||
      awaitingSecondOperand ||
      awaitingNewOperation
    ) {
      resetFlags();
      changeOutput("");
    }

    appendOutput(digitButton.textContent);
  });
});

// Handle decimal button click
const decimalButton = document.querySelector("#decimal");
decimalButton.addEventListener("click", () => {
  if (awaitingSecondOperand || awaitingNewOperation) {
    resetFlags();
    changeOutput(DEFAULT_OUTPUT);
  }

  // Can only have one decimal point
  if (!output.textContent.includes(decimalButton.textContent)) {
    appendOutput(decimalButton.textContent);
  }
});

// Handle operator button clicks
const operatorButtons = document.querySelectorAll(".operator");
operatorButtons.forEach((operatorButton) => {
  operatorButton.addEventListener("click", () => {
    // Remove "highlighted" effect of previously selected operator
    if (selectedOperatorButton) removeOperatorHighlightedEffect();
    // Give the new selected operator the "highlighted" effect
    setOperatorHighlightedEffect(operatorButton);

    // Get and set the first operand
    if (globalOperator === null) {
      // no pending operations:
      firstOperand = output.textContent;
      evaluate();
    } else {
      // pending operation: evaluate first before using next operator
      firstOperand = evaluate();
    }

    // Get operator symbol and set flag
    globalOperator = operatorButton.textContent;
    awaitingSecondOperand = true;
  });
});

// Handle equals button click
const equalsButton = document.querySelector("#equals");
equalsButton.addEventListener("click", () => {
  // If no opereator selected, make the first operand the current output
  if (globalOperator === null) firstOperand = output.textContent;

  // Evaluate operation, reset variables, and set flag
  evaluate();
  resetVariables();
  awaitingNewOperation = true;

  // Remove "highlighted" effect of previously selected operator
  if (selectedOperatorButton) removeOperatorHighlightedEffect();
});

//  Handle plus-minus button click
const plusMinusButton = document.querySelector("#plus-minus");
plusMinusButton.addEventListener("click", () => {
  if (awaitingSecondOperand || awaitingNewOperation) resetFlags();
  changeOutput(multiply(output.textContent, -1));
});

// Handle delete button click
const deleteButton = document.querySelector("#delete");
deleteButton.addEventListener("click", () => {
  if (!awaitingSecondOperand && !awaitingNewOperation) {
    const display = output.textContent;
    if (display.length === 1) {
      if (display !== DEFAULT_OUTPUT) output.textContent = DEFAULT_OUTPUT;
    } else {
      output.textContent = display.slice(0, display.length - 1);
    }
  }
});

// Handle duck click
const duckIcon = document.querySelector("#duck");
duckIcon.addEventListener("click", () => {
  const quack = new Audio("./quack.mp3");
  quack.play();
});
duckIcon.addEventListener("mouseover", () => {
  duckIcon.style.cursor = "pointer";
});

// Handle keyboard pressing events
document.addEventListener("keydown", (event) => {
  const key = event.key;
  const button = document.querySelector(`#keypad div[data-key="${key}"]`);

  if (button) {
    // add active state to trigger animation
    button.classList.add("active");
    setTimeout(() => {
      button.classList.remove("active");
    }, 200);

    // handle key press
    button.click();
  }
});

// FUNCTIONS //

function add(num1, num2) {
  return num1 + num2;
}

function subtract(num1, num2) {
  return num1 - num2;
}

function multiply(num1, num2) {
  return num1 * num2;
}

function divide(num1, num2) {
  return num1 / num2;
}

function operate(operator, num1, num2) {
  let result;
  switch (operator) {
    case ADD:
      result = add(num1, num2);
      break;
    case SUBTRACT:
      result = subtract(num1, num2);
      break;
    case MULTIPLY:
      result = multiply(num1, num2);
      break;
    case DIVIDE:
      result = divide(num1, num2);
      break;
    default:
      result = num1;
      break;
  }

  return result;
}

function resetVariables() {
  firstOperand = null;
  secondOperand = null;
  globalOperator = null;
}

function evaluate() {
  // Let the second operand equal the first if not entered
  if (awaitingSecondOperand) {
    secondOperand = firstOperand;
  } else {
    secondOperand = output.textContent;
  }

  // Operate and display output
  changeOutput(
    operate(globalOperator, parseFloat(firstOperand), parseFloat(secondOperand))
  );

  return output.textContent;
}

function formatOutput(number) {
  let result = number.toString();
  if (result.length > MAX_DISPLAY_CHARACTERS) {
    result = number.toExponential(2);
  }
  return result;
}

function changeOutput(value) {
  output.textContent = formatOutput(value);
}

function appendOutput(value) {
  let newOutput = output.textContent + value;
  output.textContent = formatOutput(newOutput);
}

function removeOperatorHighlightedEffect() {
  selectedOperatorButton.style.opacity = DEFAULT_OPACITY;
  selectedOperatorButton = null;
}

function setOperatorHighlightedEffect(button) {
  button.style.opacity = HIGHLIGHT_OPACITY;
  selectedOperatorButton = button;
}

function resetFlags() {
  awaitingSecondOperand = false;
  awaitingNewOperation = false;
}
