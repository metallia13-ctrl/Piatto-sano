const db = {
    "pasta": ["carboidrati"], "pane": ["carboidrati"], "riso": ["carboidrati"], "patate": ["carboidrati"],
    "pollo": ["proteine"], "tacchino": ["proteine"], "manzo": ["proteine"], "uova": ["proteine"],
    "pesce": ["proteine"], "merluzzo": ["proteine"], "salmone": ["proteine"],
    "formaggio": ["proteine", "grassi"], "mozzarella": ["proteine", "grassi"], "parmigiano": ["proteine", "grassi"],
    "olio": ["grassi"], "burro": ["grassi"],
    "mela": ["fibre"], "insalata": ["fibre"], "zucchine": ["fibre"], "carote": ["fibre"]
};

const fonti = {
    proteine: [
        {nome: "Pollo", info: "Proteina magra"},
        {nome: "Pesce", info: "Ottimo per il cuore"},
        {nome: "Formaggi", alert: "Attenzione: contengono grassi saturi. Monitora il colesterolo."}
    ],
    carboidrati: ["Pane", "Pasta", "Riso", "Cereali"],
    fibre: ["Insalata", "Zucchine", "Spinaci", "Frutta di stagione"]
};

let pastoCorrente = "";

function analizzaPasto() {
    const input = document.getElementById('food-input').value.toLowerCase().trim();
    if (!input) return;

    const categorie = db[input] || [];
    let feedback = `Hai scelto: <strong>${input}</strong>.<br>`;
    let suggerimenti = "<h3>Cosa aggiungere per un pasto completo?</h3>";

    if (categorie.length === 0) {
        feedback += "Alimento non riconosciuto, ma ricordati di variare!";
    } else {
        feedback += `Questo alimento contiene: ${categorie.join(' e ')}.`;
    }

    // Reminder Carboidrati e Logica Suggerimenti
    if (!categorie.includes("carboidrati")) {
        suggerimenti += "<p>⚠️ <strong>Ricorda i Carboidrati!</strong> Ti servono per l'energia. Aggiungi: " + fonti.carboidrati.join(', ') + ".</p>";
    }

    if (!categorie.includes("proteine")) {
        suggerimenti += "<p>Aggiungi una <strong>Fonte Proteica</strong>:</p><ul>";
        fonti.proteine.forEach(p => {
            suggerimenti += `<li><strong>${p.nome}</strong>: ${p.info || ''}`;
            if (p.alert) suggerimenti += `<div class="alert-colesterolo">⚠️ ${p.alert}</div>`;
            suggerimenti += `</li>`;
        });
        suggerimenti += "</ul>";
    }

    pastoCorrente = input;
    document.getElementById('feedback-card').innerHTML = feedback;
    document.getElementById('suggestions-card').innerHTML = suggerimenti;
    document.getElementById('result-area').classList.remove('hidden');
}

function salvaNelDiario() {
    const diario = JSON.parse(localStorage.getItem('diarioPasti')) || [];
    const ora = new Date().toLocaleString();
    diario.push({ pasto: pastoCorrente, data: ora });
    localStorage.setItem('diarioPasti', JSON.stringify(diario));
    alert("Pasto salvato con successo!");
    mostraDiario();
}

function mostraDiario() {
    const diario = JSON.parse(localStorage.getItem('diarioPasti')) || [];
    const lista = document.getElementById('diario-lista');
    lista.innerHTML = diario.map(item => `
        <div class="card" style="border-left-color: #3498db">
            <small>${item.data}</small><br>
            <strong>${item.pasto}</strong>
        </div>
    `).reverse().join('');
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(tab).classList.remove('hidden');
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    if(tab === 'diario') mostraDiario();
}
