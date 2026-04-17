// Database Google Sheets per Alimenti e Consigli (questi rimangono automatici)
const SHEET_ID = '1WwWvH2q5zlKgC0pZaR6zruLbhOaNV5W1v8cEIo9XwYc';
const ALIMENTI_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

const GIULIA_SHEET_ID = '1hSMX4IAtoX2M7BbIPvgVODCCqMY7HUWdt_MGKLpBbvE';
const GIULIA_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GIULIA_SHEET_ID}/export?format=csv`;

let nutrizioneDB = [];
let consigliGiuliaDB = [];
let alimentoRilevato = null;

async function caricaDatabase() {
    try {
        const ts = new Date().getTime();
        
        // 1. Carica Alimenti
        const res1 = await fetch(`${ALIMENTI_URL}&t=${ts}`);
        const data1 = await res1.text();
        nutrizioneDB = data1.split('\n').slice(1).map(r => {
            const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (c.length < 4) return null;
            return {
                keywords: c[0].replace(/"/g, '').toLowerCase().split(';').map(k => k.trim()),
                nome: c[1].replace(/"/g, '').trim(),
                macro: c[2].replace(/"/g, '').toLowerCase().split(';').map(m => m.trim()),
                note: c[3].replace(/"/g, '').trim(),
                punteggio: parseInt(c[4]) || 5
            };
        }).filter(i => i);

        // 2. Carica Consigli Giulia
        const res2 = await fetch(`${GIULIA_SHEET_URL}&t=${ts}`);
        const data2 = await res2.text();
        consigliGiuliaDB = data2.split('\n').slice(1).map(r => {
            const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return c.length >= 2 ? { al: c[0].replace(/"/g, '').toLowerCase().trim(), txt: c[1].replace(/"/g, '').trim() } : null;
        }).filter(i => i);

        document.getElementById('loading-msg').innerText = "● App pronta";
    } catch (e) { 
        document.getElementById('loading-msg').innerText = "⚠️ Errore sincronizzazione dati"; 
    }
}

window.onload = caricaDatabase;

function analizzaPasto() {
    const input = document.getElementById('food-input').value.toLowerCase().trim();
    if (!input) return;

    alimentoRilevato = nutrizioneDB.find(item => item.keywords.some(kw => input.includes(kw)));
    const resArea = document.getElementById('result-area');
    const feedback = document.getElementById('feedback-card');
    const sugg = document.getElementById('suggestions-card');
    const giuliaCard = document.getElementById('giulia-consiglia-card');
    const giuliaText = document.getElementById('giulia-consiglia-text');

    if (alimentoRilevato) {
        feedback.innerHTML = `<h3>${alimentoRilevato.nome}</h3><p>Nutrienti: ${alimentoRilevato.macro.join(', ')}</p>
                              <div class="alert-box" style="border-color:#3498db; background:#e8f4fd;">${alimentoRilevato.note}</div>`;
    } else {
        feedback.innerHTML = `<h3>Alimento non in lista</h3><p>Usa i consigli sotto per bilanciare.</p>`;
        alimentoRilevato = { nome: input.charAt(0).toUpperCase() + input.slice(1), macro: [] };
    }

    // Consigli Giulia
    const consiglio = consigliGiuliaDB.find(c => input.includes(c.al) || (alimentoRilevato && alimentoRilevato.nome.toLowerCase().includes(c.al)));
    if (consiglio) {
        giuliaText.innerText = consiglio.txt;
        giuliaCard.classList.remove('hidden');
    } else { giuliaCard.classList.add('hidden'); }

    // Logica Suggerimenti
    let htmlSugg = "<h4>Bilanciamento consigliato:</h4>";
    const m = alimentoRilevato.macro;
    if (!m.includes("fibre")) htmlSugg += `<div class="alert-box" style="border-color:#27ae60; background:#e9f7ef;"><strong>Aggiungi Fibre:</strong> Verdure o legumi.</div>`;
    if (!m.includes("carboidrati")) htmlSugg += `<div class="alert-box" style="border-color:#f39c12; background:#fef5e7;"><strong>Mancano Carboidrati:</strong> Scegli riso basmati o integrale.</div>`;
    if (!m.includes("proteine")) htmlSugg += `<div class="alert-box" style="border-color:#9b59b6; background:#f4ecf7;"><strong>Mancano Proteine:</strong> Scegli fiocchi di latte o pesce magro.</div>`;
    
    sugg.innerHTML = htmlSugg;
    resArea.classList.remove('hidden');
}

function salvaNelDiario() {
    const extra = document.getElementById('extra-input').value.trim();
    const nome = alimentoRilevato ? alimentoRilevato.nome : document.getElementById('food-input').value;
    const pasto = extra ? `${nome} con ${extra}` : nome;
    
    const diario = JSON.parse(localStorage.getItem('diario_paziente_app')) || [];
    diario.push({ txt: pasto, data: new Date().toLocaleString() });
    localStorage.setItem('diario_paziente_app', JSON.stringify(diario));
    
    alert("Pasto salvato nello storico!");
    document.getElementById('food-input').value = "";
    document.getElementById('extra-input').value = "";
    document.getElementById('result-area').classList.add('hidden');
}

function mostraDiario() {
    const lista = document.getElementById('diario-lista');
    const diario = JSON.parse(localStorage.getItem('diario_paziente_app')) || [];
    lista.innerHTML = diario.length ? diario.map(i => `<div class="card"><small>${i.data}</small><br><strong>${i.txt}</strong></div>`).reverse().join('') : "<p>Nessun pasto registrato.</p>";
}

// LOGICA AGGIORNATA: Legge dal file locale guida.html
async function caricaGuida() {
    const guida = document.getElementById('guida-contenuto');
    guida.innerHTML = "<p>Caricamento guida clinica...</p>";
    try {
        // Aggiungo un piccolo timestamp per evitare che il browser blocchi gli aggiornamenti
        const ts = new Date().getTime();
        const response = await fetch(`guida.html?v=${ts}`);
        if (!response.ok) throw new Error("File non trovato");
        const html = await response.text();
        guida.innerHTML = html;
    } catch (e) {
        guida.innerHTML = `<div class="card">⚠️ Errore. Assicurati di aver creato il file <strong>guida.html</strong> su GitHub.</div>`;
    }
}

function showTab(t) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    document.getElementById(t).classList.remove('hidden');
    document.getElementById('tab-'+t).classList.add('active');
    if(t === 'guida') caricaGuida();
    if(t === 'diario') mostraDiario();
}

function svuotaDiario() { 
    if(confirm("Vuoi davvero cancellare tutto lo storico?")) { 
        localStorage.removeItem('diario_paziente_app'); 
        mostraDiario(); 
    } 
}
