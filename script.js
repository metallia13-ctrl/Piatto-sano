// ============================================================
// CONFIGURAZIONE
// ============================================================
const SHEET_ID = '1WwWvH2q5zlKgC0pZaR6zruLbhOaNV5W1v8cEIo9XwYc';
const ALIMENTI_URL = `[docs.google.com](https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0)`;

const GIULIA_SHEET_ID = '1hSMX4IAtoX2M7BbIPvgVODCCqMY7HUWdt_MGKLpBbvE';
const GIULIA_SHEET_URL = `[docs.google.com](https://docs.google.com/spreadsheets/d/${GIULIA_SHEET_ID}/export?format=csv)`;

// ============================================================
// VARIABILI GLOBALI
// ============================================================
let nutrizioneDB = [];
let consigliGiuliaDB = [];
let alimentoRilevato = null;
let macroPresenti = [];

// ============================================================
// CARICAMENTO DATABASE
// ============================================================
async function caricaDatabase() {
    try {
        const ts = new Date().getTime();

        // Alimenti
        const res1 = await fetch(`${ALIMENTI_URL}&t=${ts}`);
        const data1 = await res1.text();
        nutrizioneDB = data1.split('\n').slice(1).map(r => {
            r = r.trim();
            if (!r) return null;
            const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (c.length < 4) return null;
            return {
                keywords: c[0].replace(/"/g, '').toLowerCase().split(';').map(k => k.trim()),
                nome: c[1].replace(/"/g, '').trim(),
                macro: c[2].replace(/"/g, '').toLowerCase().split(';').map(m => m.trim()),
                note: c[3].replace(/"/g, '').trim(),
                punteggio: parseInt(c[4]) || 5,
                abbinamento: c[5] ? c[5].replace(/"/g, '').trim() : ''
            };
        }).filter(i => i);

        // Consigli Giulia
        const res2 = await fetch(`${GIULIA_SHEET_URL}&t=${ts}`);
        const data2 = await res2.text();
        consigliGiuliaDB = data2.split('\n').slice(1).map(r => {
            r = r.trim();
            if (!r) return null;
            const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return c.length >= 2
                ? { al: c[0].replace(/"/g, '').toLowerCase().trim(), txt: c[1].replace(/"/g, '').trim() }
                : null;
        }).filter(i => i);

        document.getElementById('loading-msg').innerText = '● App pronta';
    } catch (e) {
        document.getElementById('loading-msg').innerText = '⚠️ Errore sincronizzazione dati';
    }
}

window.onload = caricaDatabase;

// ============================================================
// FASCIA ORARIA
// ============================================================
function getFascia() {
    const h = new Date().getHours();
    if (h >= 6 && h < 11) return 'Colazione';
    if (h >= 11 && h < 15) return 'Pranzo';
    if (h >= 15 && h < 18) return 'Merenda';
    return 'Cena';
}

// ============================================================
// SEMAFORO VISIVO
// ============================================================
function aggiornasSemaforo(macro) {
    const semaforo = document.getElementById('semaforo');
    if (!semaforo) return;

    const stati = [
        { chiave: 'proteine', label: 'Proteine', emoji: '🍗' },
        { chiave: 'carboidrati', label: 'Carboidrati', emoji: '🍚' },
        { chiave: 'fibre', label: 'Verdure', emoji: '🥦' }
    ];

    semaforo.innerHTML = stati.map(s => {
        const presente = macro.includes(s.chiave);
        const colore = presente ? '#27ae60' : '#e0e0e0';
        const testoColore = presente ? '#27ae60' : '#999';
        return `
            <div style="text-align:center; flex:1;">
                <div style="width:54px; height:54px; border-radius:50%; background:${colore};
                            margin:0 auto; display:flex; align-items:center; justify-content:center;
                            font-size:1.5rem; transition: background 0.4s;">
                    ${s.emoji}
                </div>
                <small style="color:${testoColore}; font-weight:bold; display:block; margin-top:4px;">
                    ${s.label}
                </small>
            </div>`;
    }).join('');
}

// ============================================================
// ANALISI PASTO
// ============================================================
function analizzaPasto() {
    const input = document.getElementById('food-input').value.toLowerCase().trim();
    if (!input) return;

    alimentoRilevato = nutrizioneDB.find(item =>
        item.keywords.some(kw => input.includes(kw) || kw.includes(input))
    );

    const resArea = document.getElementById('result-area');
    const feedback = document.getElementById('feedback-card');
    const giuliaCard = document.getElementById('giulia-consiglia-card');
    const giuliaText = document.getElementById('giulia-consiglia-text');

    aggiornasSemaforo([]);

    if (alimentoRilevato) {
        macroPresenti = [...alimentoRilevato.macro];

        const notaLattosio = alimentoRilevato.note.toLowerCase().includes('lattosi')
            ? `<div class="alert-box" style="border-color:#e74c3c; background:#fdedec;">
                   ⚠️ <strong>Ricorda di prendere la Lattasi</strong> prima di mangiare questo alimento.
               </div>`
            : '';

        const abbinamento = alimentoRilevato.abbinamento
            ? `<div class="alert-box" style="border-color:#27ae60; background:#e9f7ef;">
                   ✅ <strong>Si abbina bene con:</strong> ${alimentoRilevato.abbinamento}
               </div>`
            : '';

        feedback.innerHTML = `
            <h3>${alimentoRilevato.nome}</h3>
            <p>Nutrienti principali: <strong>${alimentoRilevato.macro.join(', ')}</strong></p>
            <div class="alert-box" style="border-color:#3498db; background:#e8f4fd;">${alimentoRilevato.note}</div>
            ${notaLattosio}
            ${abbinamento}
        `;

    } else {
        macroPresenti = [];
        feedback.innerHTML = `<h3>Alimento non in lista</h3><p>Usa i consigli sotto per bilanciare il pasto.</p>`;
        alimentoRilevato = { nome: input.charAt(0).toUpperCase() + input.slice(1), macro: [], abbinamento: '' };
    }

    // Consigli Giulia
    const consiglio = consigliGiuliaDB.find(c =>
        input.includes(c.al) || c.al.includes(input) ||
        (alimentoRilevato && alimentoRilevato.nome.toLowerCase().includes(c.al))
    );
    if (consiglio) {
        giuliaText.innerText = consiglio.txt;
        giuliaCard.classList.remove('hidden');
    } else {
        giuliaCard.classList.add('hidden');
    }

    mostraSuggerimentiMacro(macroPresenti);
    aggiornasSemaforo(macroPresenti);
    resArea.classList.remove('hidden');
}

// ============================================================
// SUGGERIMENTI MACRONUTRIENTI
// ============================================================
function mostraSuggerimentiMacro(macro) {
    const sugg = document.getElementById('suggestions-card');
    let htmlSugg = '<h4>Come completare il pasto:</h4>';
    let tuttoPresente = true;

    const categorie = [
        { chiave: 'fibre', label: 'Verdure o Fibre', colore: '#27ae60', sfondo: '#e9f7ef', emoji: '🥦' },
        { chiave: 'carboidrati', label: 'Carboidrati', colore: '#f39c12', sfondo: '#fef5e7', emoji: '🍚' },
        { chiave: 'proteine', label: 'Proteine', colore: '#9b59b6', sfondo: '#f4ecf7', emoji: '🍗' }
    ];

    categorie.forEach(cat => {
        if (!macro.includes(cat.chiave)) {
            tuttoPresente = false;

            const esempi = nutrizioneDB
                .filter(a => a.macro.includes(cat.chiave))
                .sort((a, b) => a.punteggio - b.punteggio)
                .slice(0, 4)
                .map(a => `<span style="display:inline-block; background:#fff; border:1px solid ${cat.colore};
                            border-radius:12px; padding:3px 12px; margin:3px; font-size:0.85rem;">
                            ${a.nome}
                           </span>`)
                .join('');

            htmlSugg += `
                <div class="alert-box" style="border-color:${cat.colore}; background:${cat.sfondo};">
                    ${cat.emoji} <strong>Aggiungi ${cat.label}:</strong><br>
                    <div style="margin-top:8px;">${esempi}</div>
                </div>`;
        }
    });

    if (tuttoPresente) {
        htmlSugg = `
            <div style="text-align:center; padding:24px; background:#e9f7ef; border-radius:12px; margin-top:10px;">
                <div style="font-size:3rem;">🎉</div>
                <h3 style="color:#27ae60; margin:8px 0;">Ottimo! Pasto completo!</h3>
                <p style="color:#2d3436; margin:0;">Hai tutti i nutrienti necessari. Brava!</p>
            </div>`;
    }

    sugg.innerHTML = htmlSugg;
}

// ============================================================
// SALVA NEL DIARIO
// ============================================================
function salvaNelDiario() {
    const extra = document.getElementById('extra-input').value.trim();
    const nome = alimentoRilevato ? alimentoRilevato.nome : document.getElementById('food-input').value;
    const pasto = extra ? `${nome} con ${extra}` : nome;

    const ora = new Date();
    const oraStr = ora.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const dataStr = ora.toLocaleDateString('it-IT');
    const fascia = getFascia();

    const diario = JSON.parse(localStorage.getItem('diario_paziente_app')) || [];
    diario.push({
        txt: pasto,
        data: `${dataStr} ${oraStr}`,
        dataISO: ora.toISOString(),
        fascia: fascia
    });
    localStorage.setItem('diario_paziente_app', JSON.stringify(diario));

    alert(`Pasto salvato! (${fascia} - ${oraStr})`);
    document.getElementById('food-input').value = '';
    document.getElementById('extra-input').value = '';
    document.getElementById('result-area').classList.add('hidden');
    aggiornasSemaforo([]);
}

// ============================================================
// DIARIO
// ============================================================
function mostraDiario() {
    const lista = document.getElementById('diario-lista');
    const diario = JSON.parse(localStorage.getItem('diario_paziente_app')) || [];
    lista.innerHTML = diario.length
        ? diario.map(i => `
            <div class="card">
                <small>${i.data}${i.fascia ? ' — ' + i.fascia : ''}</small><br>
                <strong>${i.txt}</strong>
            </div>`).reverse().join('')
        : '<p>Nessun pasto registrato.</p>';
}

// ============================================================
// GUIDA
// ============================================================
async function caricaGuida() {
    const guida = document.getElementById('guida-contenuto');
    guida.innerHTML = '<p>Caricamento guida clinica...</p>';
    try {
        const ts = new Date().getTime();
        const response = await fetch(`guida.html?v=${ts}`);
        if (!response.ok) throw new Error('File non trovato');
        const html = await response.text();
        guida.innerHTML = html;
    } catch (e) {
        guida.innerHTML = `<div class="card">⚠️ Errore. Assicurati di aver creato il file <strong>guida.html</strong> su GitHub.</div>`;
    }
}

// ============================================================
// NAVIGAZIONE TAB
// ============================================================
function showTab(t) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    document.getElementById(t).classList.remove('hidden');
    document.getElementById('tab-' + t).classList.add('active');
    if (t === 'guida') caricaGuida();
    if (t === 'diario') mostraDiario();
}

function svuotaDiario() {
    if (confirm('Vuoi davvero cancellare tutto lo storico?')) {
        localStorage.removeItem('diario_paziente_app');
        mostraDiario();
    }
}


