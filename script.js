// ID del tuo foglio Google
const SHEET_ID = '1WwWvH2q5zlKgC0pZaR6zruLbhOaNV5W1v8cEIo9XwYc';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

let nutrizioneDB = [];
let alimentoRilevato = null;

// Funzione avanzata per caricare i dati dal foglio Google
async function caricaDatabase() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // Trasformiamo il CSV in un formato che l'app capisce
        const righe = data.split('\n').slice(1); // Salta l'intestazione
        nutrizioneDB = righe.map(riga => {
            // Gestione semplice del CSV (separato da virgole, ma gestisce le virgolette)
            const colonne = riga.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (colonne.length < 4) return null;

            return {
                keywords: colonne[0].replace(/"/g, '').toLowerCase().split(';').map(k => k.trim()),
                nome: colonne[1].replace(/"/g, '').trim(),
                macro: colonne[2].replace(/"/g, '').toLowerCase().split(';').map(m => m.trim()),
                noteCliniche: colonne[3].replace(/"/g, '').trim()
            };
        }).filter(item => item !== null);

        console.log("Database caricato con successo:", nutrizioneDB.length, "alimenti.");
    } catch (error) {
        console.error("Errore nel caricamento del database:", error);
        alert("Errore nel caricamento dei dati. Controlla la connessione o i permessi del foglio.");
    }
}

// Avvia il caricamento appena si apre l'app
window.onload = () => {
    caricaDatabase();
};

function analizzaPasto() {
    const input = document.getElementById('food-input').value.toLowerCase().trim();
    if (!input) return;

    if (nutrizioneDB.length === 0) {
        alert("Il database sta ancora caricando, riprova tra un secondo.");
        return;
    }

    // Ricerca Fuzzy: cerca se l'input contiene una delle keywords
    alimentoRilevato = nutrizioneDB.find(item => item.keywords.some(kw => input.includes(kw)));

    let htmlFeedback = "";
    let htmlSuggerimenti = "<h4>Integrazioni consigliate:</h4>";
    
    const categorie = alimentoRilevato ? alimentoRilevato.macro : [];

    if (alimentoRilevato) {
        htmlFeedback = `<h3>Alimento Rilevato: <span style="color:var(--accent-green);">${alimentoRilevato.nome}</span></h3>
                        <p>Nutrienti principali: <strong>${categorie.join(', ')}</strong>.</p>`;
        
        if (alimentoRilevato.noteCliniche) {
            htmlFeedback += `<div style="background:#e8f4fd; padding:15px; border-radius:8px; margin-top:10px; font-size:0.95rem; border-left: 4px solid var(--accent-blue);">
                                ${alimentoRilevato.noteCliniche}
                             </div>`;
        }
    } else {
        htmlFeedback = `<h3>Alimento non classificato</h3>
                        <p>Non ho trovato l'alimento nel database. Ricordati di bilanciare il piatto!</p>`;
        alimentoRilevato = { nome: input, macro: [] };
    }

    // Valutazione Clinica
    if (!categorie.includes("fibre")) {
        htmlSuggerimenti += `<div class="alert-box">⚠️ <strong>Carenza di Fibre:</strong> Aggiungi una porzione abbondante di verdure per modulare l'assorbimento e nutrire il microbiota.</div>`;
    }

    if (!categorie.includes("carboidrati")) {
        htmlSuggerimenti += `<p>⛽ <strong>Mancano Carboidrati:</strong> Necessari per l'energia. Privilegia fonti a <strong>basso indice glicemico</strong>:<br>
        <ul>
            <li><strong>Riso (Integrale, Basmati o Parboiled)</strong></li>
            <li><strong>Cereali in chicco (Orzo, Farro, Avena)</strong></li>
            <li><strong>Pane Integrale o Pasta</strong></li>
        </ul></p>`;
    }

    if (!categorie.includes("proteine")) {
        htmlSuggerimenti += `<strong>💪 Mancano Proteine:</strong><ul>
            <li><strong>Fiocchi di Latte:</strong> Ottimo profilo aminoacidico con minimi grassi saturi.</li>
            <li><strong>Yogurt Greco (0% grassi)</strong></li>
            <li><strong>Legumi, Pesce o Carni Bianche</strong></li>
        </ul>`;
    }

    document.getElementById('feedback-card').innerHTML = htmlFeedback;
    document.getElementById('suggestions-card').innerHTML = htmlSuggerimenti;
    document.getElementById('result-area').classList.remove('hidden');
}

// ... restano uguali le funzioni showTab, caricaGuida, salvaNelDiario, mostraDiario, svuotaDiario ...
// Ricordati di copiare anche le funzioni seguenti se non le hai salvate:

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.tab-bar button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById('tab-' + tabId).classList.add('active');
    if (tabId === 'guida') caricaGuida();
    if (tabId === 'diario') mostraDiario();
}

function caricaGuida() {
    const guida = document.getElementById('guida-contenuto');
    guida.innerHTML = `
        <div class="card">
            <h3>Indice Glicemico (IG)</h3>
            <p><strong>Basso IG:</strong> Riso integrale, basmati, orzo, legumi. Rilasciano glucosio lentamente.</p>
            <p><strong>Alto IG:</strong> Gallette, patate bollite, pane bianco. Provocano picchi insulinici repentini.</p>
        </div>
        <div class="card">
            <h3>Grassi e Colesterolo</h3>
            <p><strong>Saturi:</strong> Formaggi grassi, burro. Da limitare per proteggere le arterie.</p>
            <p><strong>Insaturi:</strong> Olio extravergine, pesce, noci. Funzione cardioprotettiva.</p>
        </div>
        <div class="card">
            <h3>Focus Latticini</h3>
            <p>Preferire <strong>Fiocchi di Latte</strong> e <strong>Yogurt Greco</strong> per l'elevato rapporto proteine/grassi rispetto a mozzarella e spalmabili.</p>
        </div>
    `;
}

function salvaNelDiario() {
    const extra = document.getElementById('extra-input').value.trim();
    const nomeBase = alimentoRilevato ? alimentoRilevato.nome : document.getElementById('food-input').value;
    const pastoCompleto = extra ? `${nomeBase} con ${extra}` : nomeBase;
    const diario = JSON.parse(localStorage.getItem('diario_pasti')) || [];
    diario.push({ testo: pastoCompleto, data: new Date().toLocaleString() });
    localStorage.setItem('diario_pasti', JSON.stringify(diario));
    alert("Salvato!");
    document.getElementById('food-input').value = "";
    document.getElementById('extra-input').value = "";
    document.getElementById('result-area').classList.add('hidden');
}

function mostraDiario() {
    const lista = document.getElementById('diario-lista');
    const diario = JSON.parse(localStorage.getItem('diario_pasti')) || [];
    lista.innerHTML = diario.length === 0 ? "<p>Nessuna registrazione.</p>" : 
        diario.map(item => `<div class="card"><small>${item.data}</small><br><strong>${item.testo}</strong></div>`).reverse().join('');
}

function svuotaDiario() {
    if(confirm("Cancellare tutto?")) {
        localStorage.removeItem('diario_pasti');
        mostraDiario();
    }
}
