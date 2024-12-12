import React, { useState, useEffect, useCallback } from 'react';
import './Calculator.css';

const Calculator = () => {
    const [calculatorState, setCalculatorState] = useState({
        input: "0",
        result: 0,
        history: JSON.parse(localStorage.getItem('history')) || [],
        memory: JSON.parse(localStorage.getItem('memory')) || 0,
        showHistory: false,
        showMemory: false,
        toggleSidebar: false
    });

    const {
        input,
        result,
        history,
        memory,
        showHistory,
        showMemory,
        toggleSidebar
    } = calculatorState;

    useEffect(() => {
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('memory', JSON.stringify(memory));
    }, [history, memory]);

    const updateState = useCallback((updates) => {
        setCalculatorState(prev => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const { key } = event;
            event.preventDefault();

            const keyActions = {
                '^[0-9.]$': () => handleButtonClick(key),
                '[+\-/]': () => handleButtonClick(key === '' ? 'x' : key),
                'Enter|=': calculateResult,
                'Backspace|Delete': clearEnd,
                'Escape': clearAll,
                'F1': recallMemory,
                'F2': saveToMemory,
                'F3': clearMemory
            };

            for (const [pattern, action] of Object.entries(keyActions)) {
                if (new RegExp(pattern).test(key)) {
                    action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [input, result, memory]);

    const handleButtonClick = useCallback((value) => {
        updateState({
            input: input === "0" || input === "Error"
                ? value
                : input + value
        });
    }, [input, updateState]);

    const calculateResult = useCallback(() => {
        try {
            // Replace 'x' with '*' for multiplication and sanitize input
            const sanitizedInput = input.replace(/x/g, '*');

            // Use Function constructor to evaluate the expression safely
            const evaluateExpression = new Function(`return (${sanitizedInput});`);
            const evaluatedResult = evaluateExpression();

            updateState({
                result: evaluatedResult,
                history: [...history, { query: input, result: evaluatedResult }],
                input: evaluatedResult.toString()
            });
        } catch {
            updateState({ input: "Error" });
        }
    }, [input, history, updateState]);

    const clearAll = useCallback(() => {
        updateState({ input: "0", result: 0 });
    }, [updateState]);

    const clearEnd = useCallback(() => {
        updateState({
            input: input?.slice(0, -1) || "0"
        });
    }, [input, updateState]);

    const toggleSidebarAndPanel = useCallback(() => {
        updateState({
            toggleSidebar: !toggleSidebar,
            showHistory: true,
            showMemory: false
        });
    }, [toggleSidebar, showHistory, updateState]);

    const saveToMemory = useCallback(() => {
        updateState({ memory: result });
    }, [result, updateState]);

    const recallMemory = useCallback(() => {
        updateState({ input: input + memory });
    }, [input, memory, updateState]);

    const minusRecallMemory = useCallback(() => {
        updateState({ input: input - memory });
    }, [input, memory, updateState]);

    const clearMemory = useCallback(() => {
        updateState({ memory: 0 });
    }, [updateState]);

    const closeModal = useCallback(() => {
        updateState({ toggleSidebar: false, showHistory: true });
    }, [updateState]);

    return (
        <div className="calculator">
            <div className='toggalButton'>
                <button type='button' className='btn' onClick={toggleSidebarAndPanel}>
                    <i class="fa-solid fa-bars"></i>
                </button>
            </div>
            <div className="display">{input}</div>

            {toggleSidebar ? (
                <>
                    <div className='button-container'>
                        <span className='button-wrapper'>
                            <button className='history-button' onClick={() => updateState({ showHistory: true, showMemory: false })}>
                                History
                            </button>
                            <button className='memory-button' onClick={() => updateState({ showMemory: true, showHistory: false })}>
                                Memory
                            </button>
                        </span>
                        <button className='btn' onClick={closeModal}>
                            X
                        </button>
                    </div>

                    {showHistory && (
                        <div className="history-panel">
                            <ul className='history-list'>
                                {history?.map((entry, index) => (
                                    <li className='history-list-item' key={index}>{entry.query} = <br />{entry.result}</li>
                                ))}
                            </ul>
                            <span>

                                <button className='btn' onClick={() => updateState({ history: [] })}>
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </span>
                        </div>
                    )}

                    {showMemory && (
                        <div className="memory-panel">
                            <h3>Memory: {memory}</h3>
                            <button onClick={clearMemory}>Clear Memory</button>
                        </div>
                    )}
                </>
            ) : (
                <div className="buttons">
                    <button className='bold-text' onClick={recallMemory}>MR</button>
                    <button className='bold-text' onClick={saveToMemory}>M+</button>
                    <button className='bold-text' onClick={minusRecallMemory}>M-</button>
                    <button className='bold-text' onClick={clearMemory}>MC</button>
                    <button onClick={clearEnd}>CE</button>
                    <button onClick={clearAll}>C</button>
                    <button onClick={clearEnd}><i class="fa-solid fa-delete-left"></i></button>
                    <button onClick={() => handleButtonClick('/')}>/</button>
                    <button onClick={() => handleButtonClick('7')}>7</button>
                    <button onClick={() => handleButtonClick('8')}>8</button>
                    <button onClick={() => handleButtonClick('9')}>9</button>
                    <button onClick={() => handleButtonClick('x')}>x</button>
                    <button onClick={() => handleButtonClick('4')}>4</button>
                    <button onClick={() => handleButtonClick('5')}>5</button>
                    <button onClick={() => handleButtonClick('6')}>6</button>
                    <button onClick={() => handleButtonClick('-')}>-</button>
                    <button onClick={() => handleButtonClick('1')}>1</button>
                    <button onClick={() => handleButtonClick('2')}>2</button>
                    <button onClick={() => handleButtonClick('3')}>3</button>
                    <button onClick={() => handleButtonClick('+')}>+</button>
                    <button onClick={() => handleButtonClick('')}></button>
                    <button onClick={() => handleButtonClick('0')}>0</button>
                    <button onClick={() => handleButtonClick('.')}>.</button>
                    <button className='equltobutton' onClick={calculateResult}>=</button>
                </div>
            )}
        </div>
    );
};

export default Calculator;