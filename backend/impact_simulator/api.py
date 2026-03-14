import networkx as nx
import os
import json
from groq import Groq
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# -------------------------------------------------------------------
# SETUP FASTAPI & GROQ
# -------------------------------------------------------------------
app = FastAPI(title="Impact Simulator API - Person 4")

api_key = os.environ.get("GROQ_API_KEY")
if api_key:
    client = Groq(api_key=api_key)
else:
    client = None
    print("⚠️ WARNING: GROQ_API_KEY environment variable is missing.")

# -------------------------------------------------------------------
# MOCK GRAPH (From Person 3)
# -------------------------------------------------------------------
# In the real system, Person 3 will feed us the graph. We keep this
# for now so we have dummy data to test the API endpoint.
def get_mock_graph():
    G = nx.DiGraph()
    G.add_node("user_id")
    G.add_node("UserAPI")
    G.add_node("GraphQLResolver")
    G.add_node("ReactProfilePage")
    
    G.add_edge("user_id", "UserAPI")
    G.add_edge("UserAPI", "GraphQLResolver")
    G.add_edge("GraphQLResolver", "ReactProfilePage")
    return G

# -------------------------------------------------------------------
# CORE LOGIC
# -------------------------------------------------------------------
def get_impacted_elements(graph, changed_element):
    """Finds all downstream dependencies of changed_element."""
    if not graph.has_node(changed_element):
        return []
    return list(nx.descendants(graph, changed_element))

def ask_groq_ai(changed_element, impacted_elements):
    """Calls Groq AI for refactoring suggestions."""
    if not client:
        return {"error": "Groq client not initialized"}

    prompt = f"""
You are an expert software architect analyzing the impact of code changes.
A developer is modifying or renaming the following code element: '{changed_element}'.
Based on our dependency graph, this change will break or impact the following dependent elements: {impacted_elements}.

Please provide:
1. An explanation of the risks associated with changing '{changed_element}'.
2. A safer refactoring strategy to minimize breaking changes in the impacted elements.
3. A brief example of a backwards-compatible code fix.

Output your response strictly as a JSON object with the exact keys:
"explanation", "safer_refactor_strategy", and "example_code_fix". Do not include markdown codeblocks (```json) wrapping the response, only pure JSON.
"""

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": str(e)}

# -------------------------------------------------------------------
# API ENDPOINTS
# -------------------------------------------------------------------
class ImpactRequest(BaseModel):
    changed_element: str
    graph_data: dict | None = None  # Expected to be nx.node_link_data format

@app.post("/simulate_impact")
def simulate_impact_endpoint(request: ImpactRequest):
    """
    Endpoint that the Frontend (Person D) or other services hit 
    to see the impact of a changed element.
    """
    element = request.changed_element
    
    # Construct graph from Person 3's incoming data, or fallback to mock data
    if request.graph_data:
        try:
            from networkx.readwrite import json_graph
            
            # networkx 3.x uses "edges" instead of "links" by default
            if "links" in request.graph_data:
                request.graph_data["edges"] = request.graph_data.pop("links")
            
            # Ensure "nodes" and "edges" exist
            if "nodes" not in request.graph_data:
                request.graph_data["nodes"] = []
            if "edges" not in request.graph_data:
                request.graph_data["edges"] = []
                
            G = json_graph.node_link_graph(request.graph_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid graph_data format: {str(e)}")
    else:
        G = get_mock_graph()
    
    # 1. Simulator: Get Impacted Elements

    impacted = get_impacted_elements(G, element)
    
    if not impacted:
        return {
            "changed_element": element,
            "impacted_elements": [],
            "message": "Safe to change! No dependencies found.",
            "ai_suggestions": None
        }
        
    # 2. AI Suggestions: Get Advice
    ai_advice = ask_groq_ai(element, impacted)
    
    return {
        "changed_element": element,
        "impacted_elements": impacted,
        "ai_suggestions": ai_advice
    }

# -------------------------------------------------------------------
# RUNNER
# -------------------------------------------------------------------
if __name__ == "__main__":
    print("-" * 50)
    print("🚀 Starting Person 4 API Server on http://localhost:8000")
    print("   Endpoints available:")
    print("   - POST /simulate_impact")
    print("-" * 50)
    # Run the uvicorn server serving the 'app' object
    uvicorn.run(app, host="0.0.0.0", port=8000)
