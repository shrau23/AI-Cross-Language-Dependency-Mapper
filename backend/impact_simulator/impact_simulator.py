import networkx as nx
import os
import json
from groq import Groq
from dotenv import load_dotenv

# -------------------------------------------------------------------
# SETUP
# -------------------------------------------------------------------

# Attempt to load Groq client from environment variable
# Loading from .env file
load_dotenv()

# In terminal, you MUST set GROQ_API_KEY before running this!
# Command (Windows PowerShell): $env:GROQ_API_KEY="your-api-key"
# Command (Mac/Linux): export GROQ_API_KEY="your-api-key"
api_key = os.environ.get("GROQ_API_KEY")

if api_key:
    client = Groq(api_key=api_key)
else:
    client = None
    print("⚠️ WARNING: GROQ_API_KEY environment variable is missing. AI suggestions will be disabled.")


# -------------------------------------------------------------------
# FUNCTIONS for Person 4
# -------------------------------------------------------------------

def get_impacted_elements(graph, changed_element):
    """
    Finds all elements that depend on `changed_element` using the dependency graph.
    """
    try:
        # nx.descendants finds all nodes that can be reached from `changed_element`
        impacted_nodes = list(nx.descendants(graph, changed_element))
        return impacted_nodes
    except nx.NetworkXError:
        print(f"❌ Error: '{changed_element}' does not exist in the graph.")
        return []

def get_ai_suggestions(changed_element, impacted_elements):
    """
    Calls the Groq AI API to get risk analysis, refactoring strategy, and a code fix.
    """
    if not client:
        return {"error": "Groq client is not initialized. Check your API key."}

    prompt = f"""
You are an expert software architect analyzing the impact of code changes.
A developer is modifying or renaming the following code element: '{changed_element}'.
Based on our dependency graph, this change will break or impact the following dependent elements: {impacted_elements}.

Please provide:
1. An explanation of the risks associated with changing '{changed_element}'.
2. A safer refactoring strategy to minimize breaking changes in the impacted elements.
3. A brief example of a backwards-compatible code fix.

Output your response strictly as a JSON object with the exact keys:
"explanation", "safer_refactor_strategy", and "example_code_fix".
"""

    try:
        # Calling Groq using 'llama3-8b-8192' (you can change model as needed)
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            # Enforcing JSON output format to cleanly parse the result
            response_format={"type": "json_object"},
            temperature=0.2, # Low temperature to keep the output analytical
        )
        
        # Parse the JSON string from the AI's response into a Python dictionary
        return json.loads(response.choices[0].message.content)
    
    except Exception as e:
        return {"error": f"AI request failed: {str(e)}"}


# -------------------------------------------------------------------
# MAIN EXECUTION SCRIPT
# -------------------------------------------------------------------
if __name__ == "__main__":
    print("-" * 50)
    print("🔍 Person 4: Impact Simulator + AI Suggestions")
    print("-" * 50)
    
    # 1. BUILD A MOCK DEPENDENCY GRAPH
    # Note: In the final app, you will get this `G` from Person 3 instead of creating it here
    print("\n[Step 1] Building a mock Dependency Graph (Waiting for Person 3)...")
    G = nx.DiGraph()
    G.add_node("user_id")
    G.add_node("UserAPI")
    G.add_node("GraphQLResolver")
    G.add_node("ReactProfilePage")
    
    G.add_edge("user_id", "UserAPI")
    G.add_edge("UserAPI", "GraphQLResolver")
    G.add_edge("GraphQLResolver", "ReactProfilePage")
    
    # Let's say we want to change "user_id"
    target_code_element = "user_id"
    
    # 2. RUN IMPACT SIMULATION
    print(f"\n[Step 2] Simulating impact of changing: '{target_code_element}'")
    impacted = get_impacted_elements(G, target_code_element)
    
    if not impacted:
        print(f"✅ '{target_code_element}' has no dependencies. It is safe to change.")
    else:
        print(f"⚠️  DANGER: Changing '{target_code_element}' will impact these {len(impacted)} elements:")
        for item in impacted:
            print(f"   - {item}")
        
        # 3. GET AI SUGGESTIONS
        print("\n[Step 3] Asking Groq AI for an impact analysis and code fix...")
        if client:
            ai_response = get_ai_suggestions(target_code_element, impacted)
            
            # Print the AI response beautifully!
            print("\n" + "="*40)
            print("🤖 GROQ AI ANALYSIS RESULTS")
            print("="*40)
            
            if "error" in ai_response:
                print(f"❌ {ai_response['error']}")
            else:
                print("\n📌 EXPLANATION OF RISKS:")
                print(ai_response.get("explanation", "N/A"))
                
                print("\n💡 SAFER REFACTOR STRATEGY:")
                print(ai_response.get("safer_refactor_strategy", "N/A"))
                
                print("\n🛠️ EXAMPLE CODE FIX:")
                print(ai_response.get("example_code_fix", "N/A"))
                
            print("\n" + "="*40 + "\n")
        else:
            print("\n❌ Skipping Groq API call because no API key was found.")
