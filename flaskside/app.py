from flask import Flask
from flask_cors import CORS
from app import app

CORS(app)

if __name__ == '__main__':
    app.run(debug=True)
