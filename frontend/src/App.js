import React, { useState } from "react";
import './App.css';

function App() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loading state
        try {
            const response = await fetch("http://localhost:5000/solve_doubt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });
            const data = await response.json();
            setAnswer(data.answer);
        } catch (error) {
            setAnswer("Error fetching answer. Please try again.");
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Doubt Solver</h1>
            <form onSubmit={handleSubmit} className="text-center">
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask your question..."
                        required
                    />
                    <div className="input-group-append">
                        <button className="btn btn-primary" type="submit">
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </form>
            {answer && (
                <div className="alert alert-info" role="alert">
                    <strong>Answer:</strong> {answer}
                </div>
            )}
        </div>
    );
}

export default App;
