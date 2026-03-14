// Color scaling map based on the NEW architecture requirements
const nodeColorMap = {
    "component": "#FFD700", // Yellow for React
    "endpoint": "#1E90FF",  // Blue for FastAPI
    "service": "#FFA500",   // Orange for Service
    "table": "#800080",     // Purple for Database
    "cache": "#FFC0CB",     // Pink for Cache
    "queue": "#008080"      // Teal for Queue
};

// Edge color mapping
const edgeColorMap = {
    "API_CALL": "#00FF00",      // Green
    "SERVICE_CALL": "#FFA500",  // Orange
    "DB_REF": "#FF0000",        // Red
    "CACHE_USE": "#800080",     // Purple
    "QUEUE_PUBLISH": "#00FFFF", // Cyan
    "EVENT_TRIGGER": "#FFFFFF"  // White (Default fallback)
};

// Fetch the graph data generated from Python
fetch('graph_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load graph_data.json: HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Prepare graph data format for 3d-force-graph
        const formattedData = {
            nodes: data.nodes,
            links: data.links 
        };

        // Initialize the 3D Force Graph
        const Graph = ForceGraph3D()
        (document.getElementById('graph-container'))
            .graphData(formattedData)
            .nodeId('id')
            // Node aesthetics
            .nodeLabel(node => `
                <div class="scene-tooltip">
                    <div><strong>${node.name}</strong></div>
                    <div>Type: ${node.type}</div>
                    <div>Language: ${node.language}</div>
                </div>
            `)
            .nodeColor(node => nodeColorMap[node.type] || '#A9A9A9')
            .nodeResolution(16)
            
            // Edge aesthetics
            // The link color relies on the edge's "type" attribute mapped above
            .linkColor(link => edgeColorMap[link.type] || '#rgba(255,255,255,0.4)')
            .linkWidth(1.5)
            .linkDirectionalArrowLength(4)
            .linkDirectionalArrowRelPos(1)
            
            // Render text Sprites ON the links to satisfy persistent labels
            .linkThreeObjectExtend(true)
            .linkThreeObject(link => {
                // We use an HTML5 canvas to generate a texture containing text for Three.js
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context.font = '10px Arial';
                const textWidth = context.measureText(link.type).width;
                const canvasWidth = textWidth + 8; // padding
                const canvasHeight = 16;
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                
                // Set canvas font again after resize
                context.font = '10px Arial';
                context.fillStyle = 'rgba(0, 0, 0, 0.6)'; // background
                context.fillRect(0, 0, canvasWidth, canvasHeight);
                context.fillStyle = 'white'; // text color
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(link.type, canvasWidth / 2, canvasHeight / 2);

                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(spriteMaterial);
                
                // Size the sprite based on the canvas aspect ratio
                const scale = 5; // Scale multiplier for readability
                sprite.scale.set(scale * (canvasWidth / canvasHeight), scale, 1);
                
                return sprite;
            })
            // Update the Sprite position to stay halfway along the line
            .linkPositionUpdate((sprite, { start, end }) => {
                const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
                    [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                })));
                // Position sprite at middle point
                Object.assign(sprite.position, middlePos);
            });

        // Configure layout physics
        // Provide enough repulsive charge to spread nodes out automatically on load
        Graph.d3Force('charge').strength(-300);
        Graph.d3Force('link').distance(100);

        // Auto-center camera on startup
        setTimeout(() => {
            Graph.zoomToFit(1000, 50);
        }, 800);
    })
    .catch(error => {
        console.error("Error drawing graph:", error);
        document.getElementById('graph-container').innerHTML = `
            <div style="padding: 20px; color: red;">
                <h2>Error loading 3D Graph</h2>
                <p>${error.message}</p>
                <p>Ensure you are running a local development server (e.g., <code>python -m http.server</code>). Loading JSON files via direct file:// protocol is blocked by modern browsers.</p>
            </div>
        `;
    });
