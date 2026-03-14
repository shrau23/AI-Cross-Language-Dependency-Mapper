from fastapi import FastAPI
app = FastAPI()

class TestClass:
    def __init__(self):
        self.value = 42

def test_function():
    print("Hello from test")

@app.get("/test")
async def test_route():
    return {"message": "AST test"}


