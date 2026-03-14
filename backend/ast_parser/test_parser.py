import tree_sitter_python as tspython
from tree_sitter import Language, Parser

def test_python_parser():
    # Load the python language
    PY_LANGUAGE = Language(tspython.language())
    parser = Parser(PY_LANGUAGE)

    # Simple python code
    code = b'''
def hello_world():
    print("Hello, world!")
'''
    
    # Parse the code
    tree = parser.parse(code)
    
    print("Successfully parsed python code!")
    print("Root node type:", tree.root_node.type)

if __name__ == "__main__":
    test_python_parser()
