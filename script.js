const SHEET_ID = '1WwWvH2q5zlKgC0pZaR6zruLbhOaNV5W1v8cEIo9XwYc';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

let nutrizioneDB = [];
let alimentoRilevato = null;

async function caricaDatabase() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        const righe = data.split('\n').slice(1);
        nutrizioneDB = righe.map(riga => {
            // Regexp per leggere correttamente il CSV anche se ci sono virgole nel testo
            const colonne = riga.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (colonne.length < 4) return null;

            // Estrae i macronutrienti e li conta per lo spareggio
            const macros = colonne[2].replace(/"/g, '').toLowerCase().split(';').map(m => m.trim());
            
            // Legge la colonna 5 (indice 4) per il punteggio. Se non c'è, assegna 5 di default.
            const punteggioStr = colonne.length > 4 ? colonne[4].replace(/"/g, '').trim() : "5";
            const punteggioNum = parseInt(punteggioStr) || 5;

            return {
                keywords: colonne[0].replace(/"/g, '').toLowerCase().split(';').map(k => k.trim()),
                nome: colonne[1].replace(/"/g, '').trim(),
                macro: macros,
                noteCliniche: colonne[3].replace(/"/g, '').trim(),
                punteggio: punteggioNum,
                numeroMacro: macros.length // Usato per lo spareggio in caso di parità
            };
        }).filter(item => item !== null);

        console.log("Database caricato:", nutrizioneDB.length, "alimenti.");
        document.getElementById('loading-msg').innerText = "● Database clinico attivo e sincronizzato";
    } catch (error) {
        console.error("Errore di connessione:", error);
        document.getElementById('loading-msg').innerText = "⚠️ Errore di connessione al database";
        document.getElementById('loading-msg').style.color = "#e74c3c";
    }
}

window.onload = () => { caricaDatabase(); };

// Algoritmo di filtro, ordinamento e generazione dell'elenco
function generaListaSuggerimenti(macroRichiesto) {
    // 1. Filtra tutti gli alimenti che contengono il macro mancante
    let candidati = nutrizioneDB.filter(item => item.macro.includes(macroRichiesto));
    
    // 2. Ordinamento: Punteggio (1->10) e poi Numero Macronutrienti (decrescente)
    candidati.sort((a, b) => {
        if (a.punteggio !== b.punteggio) {
            return a.punteggio - b.punteggio; 
        } else {
            return b.numeroMacro - a.numeroMacro; 
        }
    });

    // 3. Creazione dell'output visivo
    if (candidati.length === 0) return "<p>Nessun alimento trovato per questa categoria.</p>";
    
    let html = `<ul style="font-size: 1rem; list-style-type: none; padding-left: 0;">`;
    candidati.forEach(c => {
        html += `<li style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ecf0f1;">
                    <strong>${c.nome}</strong> <span style="background: #bdc3c7; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 5px;">Score: ${c.punteggio}</span>
                    <br><span style="font-size: 0.85rem; color: #7f8c8d;">Fornisce: ${c.macro.join(', ')}</span>`;
        if (c.noteCliniche) {
            html += `<br><small style="color: #34495e; display: block; margin-top: 4px;"><em>${c.noteCliniche}</em></small>`;
        }
        html += `</li>`;
    });
    html += `</ul>`;
    return html;
}

function analizzaPasto() {
    const input = document.getElementById('food-input').value.toLowerCase().trim();
    if (!input) return;

    if (nutrizioneDB.length === 0) {
        alert("Il database sta ancora caricando, riprova tra un secondo.");
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
        alimentoRilevato = { nome: input, macro: [] };
    }

    // Richiamo le liste ordinate solo se il nutriente manca
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
    `;
}

function salvaNelDiario() {
    const extra = document.getElementById('extra-input').value.trim();
    const nomeBase = alimentoRilevato ? alimentoRilevato.nome : document.getElementById('food-input').value;
    const pastoCompleto = extra ? `${nomeBase} con ${extra}` : nomeBase;
    const diario = JSON.parse(localStorage.getItem('diario_pasti')) || [];
    diario.push({ testo: pastoCompleto, data: new Date().toLocaleString() });
    localStorage.setItem('diario_pasti', JSON.stringify(diario));
    alert("Salvato nel diario clinico!");
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
    if(confirm("Cancellare tutti i log?")) {
        localStorage.removeItem('diario_pasti');
        mostraDiario();
    }
}
