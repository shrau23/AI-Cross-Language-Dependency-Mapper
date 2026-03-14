
function regularFunction() {
    console.log("hello");
}

const MyComponent = () => {
    fetch("/api/users");
    return <div>Hello</div>;
}

function AnotherComponent() {
    fetch("/api/posts?id=1")
    return <p>Test</p>
}
