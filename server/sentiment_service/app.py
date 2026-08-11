from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"

app = Flask(__name__)
CORS(app)

# Load once at startup
sentiment = pipeline("sentiment-analysis", model=MODEL_NAME)


@app.post("/api/sentiment")
def sentiment_api():
    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    result = sentiment(text[:1000])[0]
    return jsonify({"label": result["label"], "score": float(result["score"])})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

