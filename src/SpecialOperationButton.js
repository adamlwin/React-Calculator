import { ACTIONS } from "./App"

export default function SpecialOperationButton({ dispatch, specialOperation }) {
    return (
    <button
        className="operation-color"
        onClick={() => dispatch({ type: ACTIONS.CHOOSE_SPECIAL_OPERATION, payload: { specialOperation } })}
    >
        <span className={`${(specialOperation == "√") ? "square-root-button" : ""}`}>
            {specialOperation}
        </span>
        <span className={`${(specialOperation == "√") ? "square-root-number-button" : ""}`}>
            {`${(specialOperation == "√") ? "x" : ""}`}
		</span>
    </button>
    )
}