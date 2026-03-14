import requests
import json

url = "http://127.0.0.1:8000/parse"

payload = {
    "files": [
        "test_sample.js",
        "test_sample.py",
        "../db/schema.sql"
    ]
}

try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print("Request failed:", e)
