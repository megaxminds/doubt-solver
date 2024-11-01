from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import openai
from groq import Groq  # Assuming Groq is an actual API, adjust if not
from flask_cors import CORS
import logging
import re

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
    "content": "You are a helpful assistant."
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
        model="llama3-groq-70b-8192-tool-use-preview",  # Change model as needed
        messages=chat_history,
        max_tokens=500,
        temperature=1.2,
        tool_choice="none"  # Add this line to get JSON output
    )
    
    # Extract and store response
    assistant_message = response.choices[0].message.content
    chat_history.append({"role": "assistant", "content": assistant_message})
    
    # Process the response to get a more conversational output
    output = " ".join(line.strip() for line in assistant_message.splitlines())
    
    return output


# Route to solve a doubt
@app.route("/solve_doubt", methods=["POST"])
def solve_doubt():
    question = request.json.get("question")  # Get the question from JSON payload
    
    if not question:
        return jsonify({"error": "Question is required."}), 400  # Return error if question is missing

    try:
        # Using Groq for the example
        answer = get_groq_answer(question)
        
        # Add some additional metadata to the response
        response = {
            "answer": answer,
            "question": question
        }
        
        return jsonify(response)

    except Exception as e:
        logging.error(f"Error processing question: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    # Bind to the appropriate host and port for production
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
