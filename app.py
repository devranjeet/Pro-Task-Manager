# app.py

from flask import Flask, render_template

# Initialize the Flask application
app = Flask(__name__)

@app.route('/')
def index():
    """
    Renders the main page of the advanced to-do application.
    """
    return render_template('index.html')

if __name__ == '__main__':
    # Run the Flask app with debug mode enabled.
    app.run(debug=True)