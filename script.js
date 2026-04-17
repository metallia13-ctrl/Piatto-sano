const SHEET_ID = '1WwWvH2q5zlKgC0pZaR6zruLbhOaNV5W1v8cEIo9XwYc';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const GIULIA_SHEET_ID = '1hSMX4IAtoX2M7BbIPvgVODCCqMY7HUWdt_MGKLpBbvE';
const GIULIA_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GIULIA_SHEET_ID}/export?format=csv`;

const DOC_GUIDA_ID = '1C4-HVbOTA-ZTEKXRsLDVSgqK0mPfz3Kt8zejc1w2LfM';
// Nota: Abbiamo rimosso l'export fisso per gestirlo nella funzione con il timestamp
const DOC_BASE_URL = `https://docs.google.com/document/d/${DOC_GUIDA_ID}/export?format=html`;

let nutrizioneDB = [];
let consigliGiuliaDB = [];
let alimentoRilevato = null;

async function caricaDatabase() {
    try {
        // Aggiungiamo un timestamp anche ai database per sicurezza
        const ts = new Date().getTime();
        const response1 = await fetch(`${SHEET_URL}&t=${ts}`);
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

        const response2 = await fetch(`${GIULIA_SHEET_URL}&t=${ts}`);
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

        document.getElementById('loading-msg').innerText = "● Sistemi clinici sincronizzati";
    } catch (error) {
        console.error("Errore database:", error);
        document.getElementById('loading-msg').innerText = "⚠️ Errore di connessione ai dati";
    }
}

window.onload = () => { caricaDatabase(); };

function generaListaSuggerimenti(macroRichiesto) {
    let candidati = nutrizioneDB.filter(item => item.macro.includes(macroRichiesto));
    candidati.sort((a, b) => {
        if (a.punteggio !== b.punteggio) return a.punteggio - b.punteggio; 
        return b.numeroMacro - a.numeroMacro; 
    });
    if (candidati.length === 0) return "<p>Nessun alimento trovato.</p>";
    let html = `<ul style="font-size: 1rem; list-style-type: none; padding-left: 0;">`;
    candidati.forEach(c => {
        let colorBadge = "#bdc3c7"; 
        if(c.punteggio <= 3) colorBadge = "#2ecc71"; 
        if(c.punteggio >= 8) colorBadge = "#e74c3c"; 
        html += `<li style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ecf0f1;">
                    <strong>${c.nome}</strong> <span style="background: ${colorBadge}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 5px;">Score: ${c.punteggio}</span>
                    <br><small style="color: #7f8c8d;">${c.macro.join(', ')}</small>`;
        if (c.noteCliniche) html += `<br><small style="color: #34495e; display: block; margin-top: 4px;"><em>${c.noteCliniche}</em></small>`;
        html += `</li>`;
    });
    html += `</ul>`;
    return html;
}

function analizzaPasto() {
    const input = document.getElementById('food-input').value.toLowerCase().trim();
    if (!input) return;

    alimentoRilevato = nutrizioneDB.find(item => item.keywords.some(kw => input.includes(kw)));
    let htmlFeedback = "";
    let htmlSuggerimenti = "<h4>Analisi opzioni terapeutiche:</h4>";
    const categorie = alimentoRilevato ? alimentoRilevato.macro : [];

    if (alimentoRilevato) {
        htmlFeedback = `<h3>${alimentoRilevato.nome}</h3><p>Nutrienti: ${categorie.join(', ')}</p>`;
        if (alimentoRilevato.noteCliniche) htmlFeedback += `<div class="alert-box" style="border-color: #3498db; background: #e8f4fd;">${alimentoRilevato.noteCliniche}</div>`;
    } else {
        htmlFeedback = `<h3>Alimento non in lista</h3><p>Segui i suggerimenti per bilanciare.</p>`;
        alimentoRilevato = { nome: input.charAt(0).toUpperCase() + input.slice(1), macro: [] };
    }

    const giuliaCard = document.getElementById('giulia-consiglia-card');
    const giuliaText = document.getElementById('giulia-consiglia-text');
    const consiglioTrovato = consigliGiuliaDB.find(item => input.includes(item.alimento) || (alimentoRilevato && alimentoRilevato.nome.toLowerCase().includes(item.alimento)));

    if (consiglioTrovato) {
        giuliaText.innerText = consiglioTrovato.consiglio;
        giuliaCard.classList.remove('hidden');
    } else {
        giuliaCard.classList.add('hidden');
    }

    if (!categorie.includes("fibre")) {
        htmlSuggerimenti += `<div class="alert-box" style="border-color: #27ae60; background: #e9f7ef;"><strong>Carenza di Fibre:</strong></div>` + generaListaSuggerimenti("fibre");
    }
    if (!categorie.includes("carboidrati")) {
        htmlSuggerimenti += `<div class="alert-box" style="border-color: #f39c12; background: #fef5e7;"><strong>Mancano Carboidrati:</strong></div>` + generaListaSuggerimenti("carboidrati");
    }
    if (!categorie.includes("proteine")) {
        htmlSuggerimenti += `<div class="alert-box" style="border-color: #9b59b6; background: #f4ecf7;"><strong>Mancano Proteine:</strong></div>` + generaListaSuggerimenti("proteine");
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

async function caricaGuida() {
    const guida = document.getElementById('guida-contenuto');
    guida.innerHTML = "<p style='text-align:center;'>Aggiornamento della guida clinica in corso...</p>";
    
    // TRUCCO ANTI-CACHE: Aggiungiamo l'ora esatta alla fine del link
    // Questo forza il browser a pensare che sia un file nuovo ogni secondo
    const timestamp = new Date().getTime();
    const urlSenzaCache = `${DOC_BASE_URL}&t=${timestamp}`;
    
    try {
        const response = await fetch(urlSenzaCache);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Pulizia stili Google
        const styles = doc.querySelectorAll('style');
        styles.forEach(s => s.remove());
        
        guida.innerHTML = `<div class="card">${doc.body.innerHTML}</div>`;
    } catch (e) {
        console.error("Errore guida:", e);
        guida.innerHTML = `<div class="card"><p>⚠️ Errore nel caricamento. Verifica la connessione.</p></div>`;
    }
}

function salvaNelDiario() {
    const extra = document.getElementById('extra-input').value.trim();
    let nomeBase = (alimentoRilevato && alimentoRilevato.nome) ? alimentoRilevato.nome : document.getElementById('food-input').value.trim();
    nomeBase = nomeBase.charAt(0).toUpperCase() + nomeBase.slice(1);
    
    const pastoCompleto = extra ? `${nomeBase} con ${extra}` : nomeBase;
    
    try {
        let diario = JSON.parse(localStorage.getItem('diario_pasti_paziente')) || [];
        diario.push({ testo: pastoCompleto, data: new Date().toLocaleString() });
        localStorage.setItem('diario_pasti_paziente', JSON.stringify(diario));
        alert("Pasto registrato.");
        document.getElementById('food-input').value = "";
        document.getElementById('extra-input').value = "";
        document.getElementById('result-area').classList.add('hidden');
    } catch (e) { alert("Errore salvataggio."); }
}

function mostraDiario() {
    const lista = document.getElementById('diario-lista');
    const diario = JSON.parse(localStorage.getItem('diario_pasti_paziente')) || [];
    lista.innerHTML = diario.length === 0 ? "<p>Nessun pasto in archivio.</p>" : 
        diario.map(item => `<div class="card" style="border-left-color: #9b59b6;"><small>${item.data}</small><br><strong>${item.testo}</strong></div>`).reverse().join('');
}

function svuotaDiario() {
    if(confirm("Cancellare lo storico?")) {
        localStorage.removeItem('diario_pasti_paziente');
        mostraDiario();
    }
}
