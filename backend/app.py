from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import openai
from groq import Groq  # Assuming Groq is an actual API, adjust if not

from flask_cors import CORS

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enables Cross-Origin Resource Sharing

# Set up OpenAI API key and Groq API key
openai.api_key = os.getenv("OPENAI_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = Groq(api_key=groq_api_key)

# System prompt setup
system_prompt = {
    "role": "system",
    "content": "You are a helpful assistant. You reply with very short answers."
}
chat_history = [system_prompt]  # Initialize chat history

# Function to get answer from OpenAI
def get_openai_answer(question):
    response = openai.ChatCompletion.create(
        model="gpt-4",  # Use the appropriate OpenAI model
        messages=[{"role": "user", "content": question}],
        max_tokens=150
    )
    return response.choices[0].message['content'].strip()

# Function to get answer from Groq
def get_groq_answer(question):
    # Add user message to chat history
    chat_history.append({"role": "user", "content": question})
    
    # Generate a response
    response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",  # Change model as needed
        messages=chat_history,
        max_tokens=1000,
        temperature=1.2
    )
    
    # Extract and store response
    assistant_message = response.choices[0].message.content
    chat_history.append({"role": "assistant", "content": assistant_message})
    
    return assistant_message

# Route to solve a doubt
@app.route("/solve_doubt", methods=["POST"])
def solve_doubt():
    question = request.json.get("question")  # Get the question from JSON payload
    # Decide on which model to use based on a condition or test with both
    # Example: using Groq
    answer = get_groq_answer(question)
    return jsonify({"answer": answer})

if __name__ == "__main__":
    # Bind to the appropriate host and port for production
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
