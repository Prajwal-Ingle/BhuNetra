from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
res = client.get("/")
print("Root Status Code:", res.status_code)
print("Content-Type:", res.headers.get("content-type"))
print("HTML contains root div:", 'id="root"' in res.text)
