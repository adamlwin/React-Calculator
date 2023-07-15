import { useReducer } from "react";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";
import SpecialOperationButton from "./SpecialOperationButton";
import "./styles.css"

let rootCheck = false
let paranthCheck = false
let panelOpen = false
let modeSwitch = false
let isCurrent = false
let isPi = false

export const ACTIONS = {
	ADD_DIGIT: 'add-digit',
	ADD_SYMBOL: 'add-symbol',
	CHOOSE_OPERATION: 'choose-operation',
	CHOOSE_SPECIAL_OPERATION: 'choose-special-operation',
	DELETE_DIGIT: 'delete-digit',
	CLEAR: 'clear',
	EVALUATE: 'evaluate'
}

function reducer(state, { type, payload }) {
	rootCheck = false
	paranthCheck = false
	isCurrent = false
	if(type != "add-symbol")
		isPi = false;
	switch (type) {
		case ACTIONS.ADD_DIGIT:
			isCurrent = true
			if (state.overwrite)
					return {
						...state,
						currentOperand: payload.digit,
						overwrite: false,
					}
			if(state.specialOperation != null)
				return state
			if(state.currentOperand === Math.PI.toString() || state.currentOperand === Math.E.toString())
				return state
			if (state.currentOperand != undefined) {
				if (payload.digit === "0" && state.currentOperand === "0")
					return state
				if (payload.digit === "." && state.currentOperand.includes("."))
					return state
			}

			return {
				...state,
				currentOperand: `${state.currentOperand || ""}${payload.digit}`,
			}

		case ACTIONS.ADD_SYMBOL:
			return {
				...state,
				overwrite: true,
				currentOperand: payload.symbol
			}

		case ACTIONS.CHOOSE_OPERATION:
			isPi = false
			if (state.specialOperation != null)
				return {
					...state,
					previousOperand: evaluate(state),
					operation: payload.operation,
					specialOperation: null,
					currentOperand: null
				}
			if (state.currentOperand == null && state.previousOperand == null)
				return state

			if (state.currentOperand == null)
				return {
					...state,
					operation: payload.operation,
					specialOperation: null,
				}

			if (state.previousOperand == null)
				return {
					...state,
					operation: payload.operation,
					specialOperation: null,
					previousOperand: state.currentOperand,
					currentOperand: null,
				}

			return {
				...state,
				previousOperand: evaluate(state),
				operation: payload.operation,
				specialOperation: null,
				currentOperand: null
			}
		case ACTIONS.CHOOSE_SPECIAL_OPERATION:
			if (payload.specialOperation == "√")
				rootCheck = true;
			else
				paranthCheck = true;

			if (state.currentOperand == null && state.previousOperand == null)
				return state
			if (state.currentOperand == null)
			{
				if(state.operation != null)
					return {
						...state,
						specialOperation: payload.specialOperation,
						operation: null,
					}
				else
					return {
						...state,
						previousOperand: evaluate(state),
						specialOperation: payload.specialOperation,
						operation: null,
					}
			}
			if (state.previousOperand == null)
				return {
					...state,
					specialOperation: payload.specialOperation,
					operation: null,
					previousOperand: state.currentOperand,
					currentOperand: null,
				}

			return {
				...state,
				previousOperand: evaluate(state),
				specialOperation: payload.specialOperation,
				operation: null,
				currentOperand: null
			}
		case ACTIONS.CLEAR:
			return {}

		case ACTIONS.DELETE_DIGIT:
			if (state.overwrite)
				return {
					...state,
					overwrite: false,
					currentOperand: null,
				}

			if (state.currentOperand == null) return state

			if (state.currentOperand.length === 1)
				return {
					...state,
					currentOperand: null
				}

			return {
				...state,
				currentOperand: state.currentOperand.slice(0, -1)
			}

		case ACTIONS.EVALUATE:
			if (
				state.specialOperation == null &&
				(state.operation == null ||
				state.currentOperand == null ||
				state.previousOperand == null)
			)
				return state

			return {
				...state,
				overwrite: true,
				previousOperand: null,
				operation: null,
				specialOperation: null,
				currentOperand: evaluate(state),
			}
	}
}

function evaluate({ currentOperand, previousOperand, operation, specialOperation }) {
	const prev = parseFloat(previousOperand)
	const current = parseFloat(currentOperand)

	if (specialOperation == null && (isNaN(prev) || isNaN(current))) return ""

	let computation = ""

	switch (operation) {
		case "+":
			computation = prev + current
			break
		case "-":
			computation = prev - current
			break
		case "*":
			computation = prev * current
			break
		case "÷":
			computation = prev / current
			break
		case "^":
			computation = Math.pow(prev, current)
			break
	}

	switch (specialOperation) {
		case "√":
			computation = Math.sqrt(prev)
			break
		case "sin":
			computation = modeSwitch ? Math.sin(prev * Math.PI / 180) : Math.sin(prev)
			break
		case "cos":
			computation = modeSwitch ? Math.cos(prev * Math.PI / 180.0) : Math.cos(prev)
			break
		case "log":
			computation = Math.log10(prev)
			break
		case "ln":
			computation = Math.log(prev)
			break
		case "-":
			computation = -prev
			break

	}

	return computation.toString()
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
	maximumFractionDigits: 0,
})

function formatOperand(operand, currentCheck) {
	if (operand == null) return
	var val = (currentCheck || operand.length < 10) ? operand : Number(operand).toPrecision(10).toString()
	const [integer, decimal] = val.split('.')

	if (decimal == null) return INTEGER_FORMATTER.format(integer)
	return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function togglePanel() {
	panelOpen = !panelOpen

	if(panelOpen)
		document.querySelector("#arrow").innerHTML = "←"
	else
		document.querySelector("#arrow").innerHTML = "→"
	document.querySelector(".wrapper").classList.toggle("side-panel-open")
}

// change between radians and degrees
function changeMode() {
	modeSwitch = !modeSwitch
	if(modeSwitch)
		document.querySelector("#mode").innerHTML = "R"
	else
		document.querySelector("#mode").innerHTML = "D"
}

function App() {
	const [{ currentOperand, previousOperand, operation, specialOperation }, dispatch] = useReducer(
		reducer,
		{}
	)

	return (
		<div className="container">
			<div className="calculator-grid">
				{/* Calculator Fonts */}
				<link href="https://fonts.cdnfonts.com/css/calculator" rel="stylesheet"></link>
				<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Audiowide"></link>
				<div className="output">
					<div className="previous-operand">
						{/* If rootCheck is true, add css class that makes sqrt contain the number */}
						<span className={`${rootCheck ? "square-root" : ""}`}>
							{specialOperation}{`${paranthCheck ? "(" : ""}`}
						</span>
						<span className={`${rootCheck ? "square-root-number" : ""}`}>
							{formatOperand(previousOperand, false)}{`${paranthCheck ? ")" : ""}`}
						</span>
						{" "}{operation}
					</div>

					{/* Original Previous Operand Display */}
					{/* <div className="previous-operand">
						{specialOperation} {formatOperand(previousOperand)} {operation}
					</div> */}

					<div className="current-operand">
						{formatOperand(currentOperand, isCurrent)}
					</div>
				</div>
				<button
					className="delete-color"
					onClick={() => dispatch({ type: ACTIONS.CLEAR })}>
					AC
				</button>
				<button
					className="delete-color"
					onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
					DEL
				</button>
				<button
					id="arrow"
					className="delete-color"
					onClick={togglePanel}>
					→
				</button>
				<OperationButton operation="÷" dispatch={dispatch} />
				<DigitButton digit="1" dispatch={dispatch} />
				<DigitButton digit="2" dispatch={dispatch} />
				<DigitButton digit="3" dispatch={dispatch} />
				<OperationButton operation="*" dispatch={dispatch} />
				<DigitButton digit="4" dispatch={dispatch} />
				<DigitButton digit="5" dispatch={dispatch} />
				<DigitButton digit="6" dispatch={dispatch} />
				<OperationButton operation="+" dispatch={dispatch} />
				<DigitButton digit="7" dispatch={dispatch} />
				<DigitButton digit="8" dispatch={dispatch} />
				<DigitButton digit="9" dispatch={dispatch} />
				<OperationButton operation="-" dispatch={dispatch} />
				<DigitButton digit="." dispatch={dispatch} />
				<DigitButton digit="0" dispatch={dispatch} />

				<button
					className="normal-color"
					onClick={() => {
						dispatch({ type: ACTIONS.ADD_SYMBOL,
								payload: { symbol: `${(isPi) ? Math.E.toString() : Math.PI.toString()}`}
						})
						{isPi = !isPi}
					}}
				>
					<span className={`bold ${isPi ? "" : "highlight1"}`}>
							π
						</span>
						/
						<span className={`${isPi ? "highlight2" : ""}`}>
							e
						</span>
				</button>

				<button
					className="operation-color"
					onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
				>
					=
				</button>
			</div>
			<div className="wrapper side-panel-open">
					<div className="side-panel">
						<div className="side-buttons">
							{/* will prob need uniqueOperation for exponent */}
							<OperationButton operation="^" dispatch={dispatch} />
							<SpecialOperationButton specialOperation="√" dispatch={dispatch} />
							<SpecialOperationButton specialOperation="sin" dispatch={dispatch} />
							<SpecialOperationButton specialOperation="cos" dispatch={dispatch} />
							<SpecialOperationButton specialOperation="log" dispatch={dispatch} />
							<SpecialOperationButton specialOperation="ln" dispatch={dispatch} />
							<SpecialOperationButton specialOperation="-" dispatch={dispatch} />
							<button
								id="mode"
								className="delete-color"
								onClick={changeMode}>
								D
							</button>
						</div>
					</div>
			</div>
		</div>
	);
}

export default App;
