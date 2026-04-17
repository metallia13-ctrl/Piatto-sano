const SHEET_ID = '1WwWvH2q5zlKgC0pZaR6zruLbhOaNV5W1v8cEIo9XwYc';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// Collegamento al nuovo database di Giulia
const GIULIA_SHEET_ID = '1hSMX4IAtoX2M7BbIPvgVODCCqMY7HUWdt_MGKLpBbvE';
const GIULIA_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GIULIA_SHEET_ID}/export?format=csv`;

let nutrizioneDB = [];
let consigliGiuliaDB = [];
let alimentoRilevato = null;

async function caricaDatabase() {
    try {
        // Caricamento DB Principale Alimenti
        const response1 = await fetch(SHEET_URL);
        const data1 = await response1.text();
        const righe1 = data1.split('\n').slice(1);
        nutrizioneDB = righe1.map(riga => {
            const colonne = riga.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (colonne.length < 4) return null;
            const macros = colonne[2].replace(/"/g, '').toLowerCase().split(';').map(m => m.trim());
            const punteggioStr = colonne.length > 4 ? colonne[4].replace(/"/g, '').trim() : "5";
            return {
                keywords: colonne[0].replace(/"/g, '').toLowerCase().split(';').map(k => k.trim()),
                nome: colonne[1].replace(/"/g, '').trim(),
                macro: macros,
                noteCliniche: colonne[3].replace(/"/g, '').trim(),
                punteggio: parseInt(punteggioStr) || 5,
                numeroMacro: macros.length
            };
        }).filter(item => item !== null);

        // Caricamento DB Consigli di Giulia
        const response2 = await fetch(GIULIA_SHEET_URL);
        const data2 = await response2.text();
        const righe2 = data2.split('\n').slice(1);
        consigliGiuliaDB = righe2.map(riga => {
            const colonne = riga.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (colonne.length < 2) return null;
            return {
                alimento: colonne[0].replace(/"/g, '').toLowerCase().trim(),
                consiglio: colonne[1].replace(/"/g, '').trim()
            };
        }).filter(item => item !== null);

        document.getElementById('loading-msg').innerText = "● Entrambi i database clinici sono attivi e sincronizzati";
    } catch (error) {
        console.error("Errore di connessione:", error);
        document.getElementById('loading-msg').innerText = "⚠️ Errore di connessione ai database";
        document.getElementById('loading-msg').style.color = "#e74c3c";
    }
}

window.onload = () => { caricaDatabase(); };

function generaListaSuggerimenti(macroRichiesto) {
    let candidati = nutrizioneDB.filter(item => item.macro.includes(macroRichiesto));
    
    candidati.sort((a, b) => {
        if (a.punteggio !== b.punteggio) return a.punteggio - b.punteggio; 
        return b.numeroMacro - a.numeroMacro; 
    });

    if (candidati.length === 0) return "<p>Nessun alimento trovato per questa categoria.</p>";
    
    let html = `<ul style="font-size: 1rem; list-style-type: none; padding-left: 0;">`;
    candidati.forEach(c => {
        let colorBadge = "#bdc3c7"; 
        if(c.punteggio <= 3) colorBadge = "#2ecc71"; 
        if(c.punteggio >= 8) colorBadge = "#e74c3c"; 

        html += `<li style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ecf0f1;">
                    <strong>${c.nome}</strong> <span style="background: ${colorBadge}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 5px;">Score: ${c.punteggio}</span>
                    <br><span style="font-size: 0.85rem; color: #7f8c8d;">Fornisce: ${c.macro.join(', ')}</span>`;
        if (c.noteCliniche) html += `<br><small style="color: #34495e; display: block; margin-top: 4px;"><em>${c.noteCliniche}</em></small>`;
        html += `</li>`;
    });
    html += `</ul>`;
    return html;
}

function analizzaPasto() {
    const inputField = document.getElementById('food-input');
    const input = inputField.value.toLowerCase().trim();
    if (!input) {
        alert("Inserisci un alimento prima di analizzare.");
        return;
    }

    if (nutrizioneDB.length === 0 || consigliGiuliaDB.length === 0) {
        alert("I database stanno ancora caricando, riprova tra un secondo.");
        return;
    }

    alimentoRilevato = nutrizioneDB.find(item => item.keywords.some(kw => input.includes(kw)));

    let htmlFeedback = "";
    let htmlSuggerimenti = "<h4>Analisi completata. Elenco opzioni terapeutiche:</h4>";
    
    const categorie = alimentoRilevato ? alimentoRilevato.macro : [];

    if (alimentoRilevato) {
        htmlFeedback = `<h3>Alimento Rilevato: <span style="color:var(--accent-green);">${alimentoRilevato.nome}</span></h3>
                        <p>Nutrienti principali: <strong>${categorie.join(', ')}</strong>.</p>`;
        
        if (alimentoRilevato.noteCliniche) {
            htmlFeedback += `<div class="alert-box" style="border-color: var(--accent-blue); background: #e8f4fd;">
                                ${alimentoRilevato.noteCliniche}
                             </div>`;
        }
    } else {
        htmlFeedback = `<h3>Alimento non classificato</h3>
                        <p>Non ho trovato l'alimento nel database, ma ecco come bilanciare il pasto.</p>`;
        alimentoRilevato = { nome: input.charAt(0).toUpperCase() + input.slice(1), macro: [] };
    }

    // --- LOGICA "GIULIA CONSIGLIA" ---
    const giuliaCard = document.getElementById('giulia-consiglia-card');
    const giuliaText = document.getElementById('giulia-consiglia-text');
    // Cerca se l'input dell'utente (o il nome dell'alimento rilevato) corrisponde a una riga del secondo database
    const consiglioTrovato = consigliGiuliaDB.find(item => input.includes(item.alimento) || (alimentoRilevato && alimentoRilevato.nome.toLowerCase().includes(item.alimento)));

    if (consiglioTrovato) {
        giuliaText.innerText = consiglioTrovato.consiglio;
        giuliaCard.classList.remove('hidden');
    } else {
        giuliaCard.classList.add('hidden'); // Nascondi se non c'è il consiglio
    }
    // ----------------------------------

    if (!categorie.includes("fibre")) {
        htmlSuggerimenti += `<div class="alert-box" style="border-color: #27ae60; background: #e9f7ef;"><strong>Carenza di Fibre:</strong> Opzioni disponibili:</div>`;
        htmlSuggerimenti += generaListaSuggerimenti("fibre");
    }

    if (!categorie.includes("carboidrati")) {
        htmlSuggerimenti += `<div class="alert-box" style="border-color: #f39c12; background: #fef5e7;"><strong>Mancano Carboidrati:</strong> Opzioni ordinate per controllo glicemico:</div>`;
        htmlSuggerimenti += generaListaSuggerimenti("carboidrati");
    }

    if (!categorie.includes("proteine")) {
        htmlSuggerimenti += `<div class="alert-box" style="border-color: #9b59b6; background: #f4ecf7;"><strong>Mancano Proteine:</strong> Opzioni ordinate per profilo aminoacidico/lipidico:</div>`;
        htmlSuggerimenti += generaListaSuggerimenti("proteine");
    }

    if (categorie.includes("fibre") && categorie.includes("carboidrati") && categorie.includes("proteine")) {
        htmlSuggerimenti += `<div style="background: var(--accent-green); color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 15px;">
                                ✅ Pasto perfettamente bilanciato!
                             </div>`;
    }

    document.getElementById('feedback-card').innerHTML = htmlFeedback;
    document.getElementById('suggestions-card').innerHTML = htmlSuggerimenti;
    document.getElementById('result-area').classList.remove('hidden');
}

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
        <div class="card">
            <p><em>I contenuti completi della guida medica sono redatti secondo le evidenze cliniche più recenti.</em></p>
        </div>
    `;
}

function salvaNelDiario() {
    const extra = document.getElementById('extra-input').value.trim();
    let nomeBase = (alimentoRilevato && alimentoRilevato.nome) ? alimentoRilevato.nome : document.getElementById('food-input').value.trim();
    nomeBase = nomeBase.charAt(0).toUpperCase() + nomeBase.slice(1);

    if (!nomeBase) {
        alert("Nessun alimento da salvare.");
        return;
    }

    const pastoCompleto = extra ? `${nomeBase} con ${extra}` : nomeBase;
    
    try {
        let diario = JSON.parse(localStorage.getItem('diario_pasti_paziente'));
        if (!Array.isArray(diario)) diario = [];
        
        diario.push({ testo: pastoCompleto, data: new Date().toLocaleString() });
        localStorage.setItem('diario_pasti_paziente', JSON.stringify(diario));
        
        alert("Pasto registrato nel diario clinico.");
        
        document.getElementById('food-input').value = "";
        document.getElementById('extra-input').value = "";
        document.getElementById('result-area').classList.add('hidden');
        alimentoRilevato = null; 
    } catch (e) {
        console.error("Errore salvataggio:", e);
        alert("Errore nel salvataggio.");
    }
}

function mostraDiario() {
    const lista = document.getElementById('diario-lista');
    try {
        let diario = JSON.parse(localStorage.getItem('diario_pasti_paziente'));
        if (!Array.isArray(diario)) diario = [];
        
        lista.innerHTML = diario.length === 0 ? "<p>Nessuna registrazione presente.</p>" : 
            diario.map(item => `<div class="card" style="border-left-color: #9b59b6;"><small>${item.data}</small><br><strong>${item.testo}</strong></div>`).reverse().join('');
    } catch (e) {
        lista.innerHTML = "<p>Impossibile caricare lo storico.</p>";
    }
}

function svuotaDiario() {
    if(confirm("Confermi la cancellazione definitiva dello storico pazienti/pasti?")) {
        localStorage.removeItem('diario_pasti_paziente');
        mostraDiario();
    }
}
