import json
import os
from graph_builder import GraphBuilder

# Initialize graph builder
graph = GraphBuilder()

# --- Create Nodes ---

# Frontend Components (React)
graph.add_node("UserDashboard", "UserDashboard", "component", "react")
graph.add_node("ProfilePage", "ProfilePage", "component", "react")
graph.add_node("OrdersPage", "OrdersPage", "component", "react")
graph.add_node("AdminPanel", "AdminPanel", "component", "react")

# API Endpoints (FastAPI)
graph.add_node("get_users", "get_users", "endpoint", "fastapi")
graph.add_node("get_profile", "get_profile", "endpoint", "fastapi")
graph.add_node("get_orders", "get_orders", "endpoint", "fastapi")
graph.add_node("create_order", "create_order", "endpoint", "fastapi")

# Backend Services (Python/FastAPI logical layer)
graph.add_node("UserService", "UserService", "service", "python")
graph.add_node("OrderService", "OrderService", "service", "python")
graph.add_node("AuthService", "AuthService", "service", "python")
graph.add_node("NotificationService", "NotificationService", "service", "python")
graph.add_node("AnalyticsService", "AnalyticsService", "service", "python")

# Infrastructure - Databases
graph.add_node("users_table", "users_table", "table", "postgres")
graph.add_node("orders_table", "orders_table", "table", "postgres")

# Infrastructure - Cache & Queue
graph.add_node("RedisCache", "RedisCache", "cache", "redis")
graph.add_node("OrderQueue", "OrderQueue", "queue", "rabbitmq")


# --- Create Edges ---

# Frontend -> API
graph.add_edge("UserDashboard", "get_users", "API_CALL")
graph.add_edge("ProfilePage", "get_profile", "API_CALL")
graph.add_edge("OrdersPage", "get_orders", "API_CALL")
graph.add_edge("OrdersPage", "create_order", "API_CALL")
graph.add_edge("AdminPanel", "get_users", "API_CALL")
graph.add_edge("AdminPanel", "get_orders", "API_CALL")

# API -> Services
graph.add_edge("get_users", "UserService", "SERVICE_CALL")
graph.add_edge("get_profile", "UserService", "SERVICE_CALL")
graph.add_edge("get_profile", "AuthService", "SERVICE_CALL")
graph.add_edge("get_orders", "OrderService", "SERVICE_CALL")
graph.add_edge("create_order", "OrderService", "SERVICE_CALL")
graph.add_edge("create_order", "AuthService", "SERVICE_CALL")

# Services -> DB
graph.add_edge("UserService", "users_table", "DB_REF")
graph.add_edge("AuthService", "users_table", "DB_REF")
graph.add_edge("OrderService", "orders_table", "DB_REF")
graph.add_edge("OrderService", "users_table", "DB_REF")

# Services -> Cache
graph.add_edge("UserService", "RedisCache", "CACHE_USE")
graph.add_edge("AuthService", "RedisCache", "CACHE_USE")

# Services -> Queue
graph.add_edge("OrderService", "OrderQueue", "QUEUE_PUBLISH")

# Queue -> Consumers (Notification & Analytics)
graph.add_edge("OrderQueue", "NotificationService", "EVENT_TRIGGER")
graph.add_edge("OrderQueue", "AnalyticsService", "EVENT_TRIGGER")


# --- Export Data ---
# Export the graph to a JSON file for the 3D frontend visualization
output_dir = "frontend"
os.makedirs(output_dir, exist_ok=True)
json_path = os.path.join(output_dir, "graph_data.json")

# The graph builder get_graph returns a JSON string containing networkx metadata.
# We parse it, extract exactly nodes and links, and use json.dump as requested.
graph_data = json.loads(graph.get_graph())
output_data = {
    "nodes": graph_data.get("nodes", []),
    "links": graph_data.get("links", [])
}

with open(json_path, "w") as f:
    json.dump(output_data, f, indent=2)

print("Graph exported successfully.")