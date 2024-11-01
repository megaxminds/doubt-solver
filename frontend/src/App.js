import React, { useState } from "react";
import './App.css';

const trackSearchEvent = (data) => {
    if (window.gtag) {
        window.gtag('event', 'search', {
            event_category: 'User Actions',
            event_label: `${data.question}, Grade: ${data.grade}, Subject: ${data.subject}`,
            value: 1
        });
    } else {
        console.error('Google Analytics is not loaded');
    }
};

function trackQuestionSubmit(data) {
    if (window.gtag) {
        window.gtag('event', 'question_submit', {
            event_category: 'User Actions',
            event_label: 'Question Submitted',
            value: 1,
            ...data
        });
    } else {
        console.error('Google Analytics is not loaded');
    }
}

function App() {
    const [token, setToken] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [grade, setGrade] = useState("");
    const [subject, setSubject] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    const expectedToken = "12345"; // Replace with your actual token

    const handleLogin = (e) => {
        e.preventDefault();
        if (token === expectedToken) {
            setShowWelcome(true);
            setTimeout(() => {
                setIsAuthenticated(true);
                setShowWelcome(false);
            }, 2000);
        } else {
            alert("Invalid token. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { grade, subject, question };

        trackSearchEvent(data);
        trackQuestionSubmit(data);
        setLoading(true);

        try {
            const response = await fetch("https://doubt-solver-1.onrender.com/solve_doubt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: question + ' Remember to maintain a conversational tone and provide comprehensive responses for ' + grade +' student'+ ' and subject '+subject }),
            });
            const responseData = await response.json();
            setAnswer(responseData.answer);
            console.log(answer);

        } catch (error) {
            setAnswer("Error fetching answer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
            <h1 className="text-center mb-4">Doubt Solver</h1>
            {!isAuthenticated ? (
                <>
                    <form onSubmit={handleLogin} className="text-center">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Enter your token..."
                                required
                            />
                            <div className="input-group-append">
                                <button className="btn btn-primary" type="submit">
                                    Login
                                </button>
                            </div>
                        </div>
                    </form>
                    {showWelcome && (
                        <div className="alert alert-success welcome-message">
                            Welcome! Redirecting to the doubt solver...
                        </div>
                    )}
                    {/* Messenger link for getting token */}
                    <div className="text-center">
                        <p>Need a token? <a href="https://www.facebook.com/megaxminds/" target="_blank" rel="noopener noreferrer">Contact us on Facebook</a></p>
                    </div>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="text-center transition-effect">
                    <div className="input-group mb-3">
                        <select
                            className="form-control"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            required
                        >
                            <option value="">Select Grade</option>
                            {["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`), "Others"].map((gradeOption, index) => (
                                <option key={index} value={gradeOption}>{gradeOption}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <select
                            className="form-control"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        >
                            <option value="">Select Subject</option>
                            {["Math", "Science", "Computer Science", "English", "History", "Geography", "General Knowledge", "Other"].map((subjectOption, index) => (
                                <option key={index} value={subjectOption}>{subjectOption}</option>
                            ))}
                        </select>
                    </div>
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
                    {answer && (
                        <div className="alert alert-info" role="alert" style={{ textAlign: "left" }}>
                            <strong>Answer:</strong> {answer} <br />
                            <div className="alert alert-info" role="alert" style={{ textAlign: "center" }}>
                                <p>Want personalized doubt resolution? Reach out to us <a href="https://megaxminds.github.io/courses/" target="_blank" rel="noopener noreferrer">here</a>.
                                You can also let us know if there is any scope for improvement</p>
                                <p>Follow us to be a part of future giveaways: 
                                    <a href="https://www.facebook.com/megaxminds/" target="_blank" rel="noopener noreferrer"> Facebook</a>, 
                                    <a href="https://www.youtube.com/@MegaxMinds" target="_blank" rel="noopener noreferrer"> Youtube</a>, 
                                    <a href="https://www.instagram.com/megaxminds/" target="_blank" rel="noopener noreferrer"> Instagram</a>
                                </p>
                            </div>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}

export default App;

