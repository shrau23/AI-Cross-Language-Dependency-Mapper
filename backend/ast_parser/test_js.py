# test_js_parser.py

from ast_engine import parse_code

sample = """
function calculatePrice(item) {
    return item.price * 1.2;
}

const UserProfile = () => {
    const data = await fetch("/api/users/profile");
    return <div>{data.name}</div>;
};

const CartPage = () => {
    fetch("/api/cart/items");
};
"""

results = parse_code(sample, "frontend/App.js", "javascript")
for r in results:
    print(r)