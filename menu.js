function showSection(section) {
    const content = document.getElementById("content");
    let html = "";

    switch (section) {
        case 'battery':
            html = `
                <h2>🔋 Battery Status</h2>
                <p>Charge Level: 82%</p>
                <p>Range: 245 miles</p>
                <p>Status: Not charging</p>
            `;
            break;
        case 'climate':
            html = `
                <h2>🌡️ Climate Control</h2>
                <p>Interior Temperature: 70°F</p>
                <p>AC: On</p>
                <p>Heated Seats: Front only</p>
            `;
            break;
        case 'navigation':
            html = `
                <h2>🧭 Navigation</h2>
                <p>Destination: 3500 Deer Creek Rd, Palo Alto</p>
                <p>ETA: 23 mins</p>
                <p>Traffic: Light</p>
            `;
            break;
        case 'autopilot':
            html = `
                <h2>🤖 Autopilot</h2>
                <p>Status: Enabled</p>
                <p>Autosteer: Active</p>
                <p>Navigate on Autopilot: Available</p>
            `;
            break;
    }

    content.innerHTML = html;
}
