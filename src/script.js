let lastTimestamp = null;

// Funzione per aggiornare l'orologio in tempo reale nell'header
function updateClock() {
    const now = new Date();
    document.getElementById('live-clock').textContent = now.toLocaleTimeString('it-IT');
    document.getElementById('live-date').textContent = now.toISOString().split('T')[0];
}
setInterval(updateClock, 1000);
updateClock();

// Funzione asincrona di fetching dati
async function fetchAlerts() {
    try {
        const response = await fetch('alerts.json?nocache=' + new Date().getTime());
        const text = await response.text();
        if (!text.trim()) return;

        const lines = text.trim().split('\n');
        const allAlerts = lines.map(line => JSON.parse(line));
        
        let newAlerts = [];
        if (lastTimestamp === null) {
            newAlerts = allAlerts; 
        } else {
            newAlerts = allAlerts.filter(alert => alert.timestamp > lastTimestamp);
        }

        if (newAlerts.length > 0) {
            lastTimestamp = newAlerts[newAlerts.length - 1].timestamp;
            updateTable(newAlerts);
            updateKPIs(allAlerts);
        }
    } catch (error) {
        console.error("Errore fetch alerts.json:", error);
    }
}

function updateTable(newAlerts) {
    const tbody = document.getElementById('log-tbody');
    
    newAlerts.forEach(alert => {
        const tr = document.createElement('tr');
        const dateObj = new Date(alert.timestamp);
        const timeString = dateObj.toLocaleTimeString('it-IT', { hour12: false }) + '.' + String(dateObj.getMilliseconds()).padStart(3, '0');

        // Creazione dinamica del badge di severità
        let badgeClass = 'low';
        if (alert.severity === 'HIGH') badgeClass = 'high';
        else if (alert.severity === 'MEDIUM') badgeClass = 'medium';

        tr.innerHTML = `
            <td>${timeString}</td>
            <td style="color: #94A3B8;">${alert.src_ip}</td>
            <td style="color: #94A3B8;">${alert.dst_ip}</td>
            <td style="color: #F0F4F8;">${alert.attack_type}</td>
            <td><span class="badge-sev ${badgeClass}">${alert.severity}</span></td>
        `;
        
        tbody.prepend(tr);
    });
}

function updateKPIs(alerts) {
    document.getElementById('total-packets').textContent = alerts.length;
    document.getElementById('suspicious-traffic').textContent = alerts.filter(a => a.severity === 'MEDIUM').length;
    document.getElementById('blocked-ips').textContent = alerts.filter(a => a.severity === 'HIGH').length;

    if (alerts.length > 0) {
        const attackCounts = alerts.reduce((acc, alert) => {
            acc[alert.attack_type] = (acc[alert.attack_type] || 0) + 1;
            return acc;
        }, {});
        
        const topThreat = Object.keys(attackCounts).reduce((a, b) => attackCounts[a] > attackCounts[b] ? a : b);
        
        const threatElement = document.getElementById('top-threat');
        threatElement.textContent = topThreat;
        // Ridimensionamento dinamico in base alla lunghezza del nome dell'attacco
        threatElement.style.fontSize = topThreat.length > 10 ? "1.5rem" : "2.2rem";
    }
}

fetchAlerts();
setInterval(fetchAlerts, 2000);

// Simulazione variazione carico CPU/RAM per dare dinamismo all'interfaccia
setInterval(() => {
    const cpu = Math.floor(Math.random() * (25 - 8 + 1)) + 8; // Random 8-25%
    const ram = (2.1 + (Math.random() * 0.3)).toFixed(1);     // Random 2.1-2.4 GB
    document.getElementById('sys-cpu').textContent = cpu + '%';
    document.getElementById('sys-ram').textContent = ram + ' GB';
}, 5000);