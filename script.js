const nutrizioneDB = [
    // Carboidrati
    { keywords: ["orzo", "farro", "avena", "quinoa"], macro: ["carboidrati", "fibre"], nome: "Cereali a basso IG" },
    { keywords: ["riso integrale", "riso basmati", "riso parboiled", "riso"], macro: ["carboidrati"], nome: "Riso" },
    { keywords: ["pasta integrale", "pasta", "spaghetti", "penne", "maccheroni"], macro: ["carboidrati"], nome: "Pasta" },
    { keywords: ["pane integrale", "pane di segale", "pane", "panino"], macro: ["carboidrati"], nome: "Pane" },
    { keywords: ["patate", "patata", "purè"], macro: ["carboidrati"], nome: "Patate" },
    { keywords: ["gallette", "galletta", "gallette di riso", "gallette di mais"], macro: ["carboidrati"], nome: "Gallette (Alto IG)" },
    { keywords: ["gallette di segale", "segale"], macro: ["carboidrati", "fibre"], nome: "Gallette di Segale" },
    
    // Legumi
    { keywords: ["lenticchie", "lenticchia"], macro: ["proteine", "carboidrati", "fibre"], nome: "Lenticchie" },
    { keywords: ["fagioli", "fagiolo"], macro: ["proteine", "carboidrati", "fibre"], nome: "Fagioli" },
    { keywords: ["ceci", "cece"], macro: ["proteine", "carboidrati", "fibre"], nome: "Ceci" },
    { keywords: ["piselli", "pisello"], macro: ["proteine", "carboidrati", "fibre"], nome: "Piselli" },
    
    // Latticini e Derivati
    { 
        keywords: ["yogurt greco", "skyr", "yogurt"], 
        macro: ["proteine"], 
        nome: "Yogurt Greco", 
        noteCliniche: "<strong>Pro:</strong> Elevato apporto di proteine ad alto valore biologico e ridotto contenuto di lattosio rispetto allo yogurt tradizionale. Ottimo potere saziante.<br><strong>Contro:</strong> Attenzione alle versioni intere (ricche di grassi saturi) e a quelle alla frutta, che nascondono zuccheri semplici aggiunti. Scegliere la versione 0% grassi bianca."
    },
    { 
        keywords: ["ricotta"], 
        macro: ["proteine", "grassi"], 
        nome: "Ricotta", 
        noteCliniche: "<strong>Pro:</strong> Le sue proteine derivano dal siero del latte, sono estremamente nobili e facili da digerire.<br><strong>Contro:</strong> Non è un formaggio ma un latticino. Se prodotta con latte intero (specie di pecora) può avere una quota lipidica rilevante."
    },
    { 
        keywords: ["formaggio spalmabile", "philadelphia", "spalmabile", "stracchino"], 
        macro: ["grassi", "proteine"], 
        nome: "Formaggio Spalmabile", 
        noteCliniche: "<strong>Pro:</strong> Morbido e facile da deglutire.<br><strong>Contro:</strong> Rapporto proteine/grassi molto sfavorevole. Spesso contiene emulsionanti, addensanti e un'alta percentuale di grassi saturi. Da consumare con forte moderazione."
    },
    { keywords: ["mozzarella", "burrata"], macro: ["proteine", "grassi saturi"], nome: "Mozzarella" },
    { keywords: ["fiocchi di latte", "cottage cheese"], macro: ["proteine"], nome: "Fiocchi di latte" },
    { keywords: ["parmigiano", "grana", "pecorino"], macro: ["proteine", "grassi saturi"], nome: "Formaggio Stagionato" },
    
    // Proteine Animali Magre
    { keywords: ["pollo", "petto di pollo", "tacchino"], macro: ["proteine"], nome: "Carne Bianca" },
    { keywords: ["pesce", "merluzzo", "salmone", "tonno", "orata", "spigola"], macro: ["proteine"], nome: "Pesce" },
    { keywords: ["uova", "uovo", "frittata"], macro: ["proteine", "grassi"], nome: "Uova" },
    
    // Verdure
    { keywords: ["zucchine", "zucchina", "insalata", "verdura", "verdure", "broccoli", "spinaci", "carote", "pomodori", "pomodoro"], macro: ["fibre"], nome: "Verdura" }
];

let alimentoRilevato = null;

function analizzaPasto() {
    const input = document.getElementById('food-input').value.toLowerCase().trim();
    if (!input) return;

    alimentoRilevato = nutrizioneDB.find(item => item.keywords.some(kw => input.includes(kw)));

    let htmlFeedback = "";
    let htmlSuggerimenti = "<h4>Integrazioni consigliate:</h4>";
    
    const categorie = alimentoRilevato ? alimentoRilevato.macro : [];

    if (alimentoRilevato) {
        htmlFeedback = `<h3>Alimento Rilevato: <span style="color:var(--accent-green);">${alimentoRilevato.nome}</span></h3>
                        <p>Nutrienti principali: <strong>${categorie.join(', ')}</strong>.</p>`;
        
        // Se ci sono note cliniche (pro/contro) per questo alimento, le mostra subito
        if (alimentoRilevato.noteCliniche) {
            htmlFeedback += `<div style="background:#e8f4fd; padding:15px; border-radius:8px; margin-top:10px; font-size:0.95rem;">
                                ${alimentoRilevato.noteCliniche}
                             </div>`;
        }
    } else {
        htmlFeedback = `<h3>Alimento non classificato</h3>
                        <p>Non ho riconosciuto l'alimento, ricordati di mantenere il piatto bilanciato.</p>`;
        alimentoRilevato = { nome: input, macro: [] };
    }

    // Valutazione Clinica (LARN)
    if (!categorie.includes("fibre")) {
        htmlSuggerimenti += `<div class="alert-box">⚠️ <strong>Carenza di Fibre:</strong> Aggiungi una porzione abbondante di verdure per modulare l'assorbimento dei nutrienti.</div>`;
    }

    // Controllo Carboidrati - Priorità al Basso Indice Glicemico
    if (!categorie.includes("carboidrati")) {
        htmlSuggerimenti += `<p>⛽ <strong>Mancano Carboidrati Complessi:</strong> Necessari per l'energia. Privilegia fonti a <strong>basso indice glicemico</strong>:<br>
        <ul>
            <li><strong>Riso (Integrale/Basmati/Parboiled)</strong></li>
            <li><strong>Cereali in chicco:</strong> Orzo, Farro, Avena, Quinoa.</li>
            <li><strong>Pane Integrale o Pasta</strong></li>
        </ul></p>`;
    }

    if (!categorie.includes("proteine")) {
        htmlSuggerimenti += `<strong>💪 Mancano Proteine:</strong><ul>
            <li><strong>Fiocchi di Latte:</strong> Eccellente profilo aminoacidico con pochi grassi.</li>
            <li><strong>Legumi:</strong> Fonte proteica associata a carboidrati complessi.</li>
            <li><strong>Pesce o Carni Bianche:</strong> Elevato valore biologico.</li>
        </ul>`;
    }

    document.getElementById('feedback-card').innerHTML = htmlFeedback;
    document.getElementById('suggestions-card').innerHTML = htmlSuggerimenti;
    document.getElementById('result-area').classList.remove('hidden');
}

function caricaGuida() {
    const guida = document.getElementById('guida-contenuto');
    guida.innerHTML = `
        <div class="card">
            <h3>Indice Glicemico (IG) e Carboidrati</h3>
            <p>L'obiettivo è mantenere la stabilità glicemica ematica.</p>
            <ul>
                <li><strong>Basso IG (Consigliati):</strong> Riso integrale, basmati, orzo, farro, legumi. Rilasciano glucosio lentamente.</li>
                <li><strong>Alto IG (Da limitare):</strong> Gallette (iper-assimilabili), patate bollite, pane bianco. Provocano picchi insulinici.</li>
            </ul>
        </div>
        <div class="card">
            <h3>Classificazione Lipidica</h3>
            <p><strong>Grassi Saturi (SFA):</strong> Formaggi stagionati, spalmabili, mozzarella, burro. Da limitare per il profilo lipidico sierico.</p>
            <p><strong>Grassi Insaturi (MUFA e PUFA):</strong> Olio extravergine, pesce azzurro. Esercitano un ruolo cardioprotettivo.</p>
        </div>
        <div class="card">
            <h3>Focus Latticini: Scelte Terapeutiche</h3>
            <p>Preferire <strong>Yogurt Greco 0%</strong>, <strong>Fiocchi di Latte</strong> e <strong>Ricotta</strong>. Questi isolano le proteine (sieroproteine o caseine) allontanando gran parte dei lipidi del latte. I formaggi a pasta filata o spalmabili trattengono i lipidi o subiscono l'aggiunta di addensanti.</p>
        </div>
    `;
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.tab-bar button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById('tab-' + tabId).classList.add('active');
    if (tabId === 'guida') caricaGuida();
    if (tabId === 'diario') mostraDiario();
}

function salvaNelDiario() {
    const extra = document.getElementById('extra-input').value.trim();
    const nomeBase = alimentoRilevato.nome;
    const pastoCompleto = extra ? `${nomeBase} con ${extra}` : nomeBase;
    
    try {
        const diario = JSON.parse(localStorage.getItem('diario_pasti')) || [];
        diario.push({ testo: pastoCompleto, data: new Date().toLocaleString() });
        localStorage.setItem('diario_pasti', JSON.stringify(diario));
        
        alert("Pasto registrato nel diario clinico.");
        document.getElementById('food-input').value = "";
        document.getElementById('extra-input').value = "";
        document.getElementById('result-area').classList.add('hidden');
    } catch (e) {
        alert("Errore nel salvataggio.");
    }
}

function mostraDiario() {
    const lista = document.getElementById('diario-lista');
    try {
        const diario = JSON.parse(localStorage.getItem('diario_pasti')) || [];
        lista.innerHTML = diario.length === 0 ? "<p>Nessuna registrazione presente.</p>" : 
            diario.map(item => `<div class="card" style="border-left-color: #9b59b6;"><small>${item.data}</small><br><strong>${item.testo}</strong></div>`).reverse().join('');
    } catch (e) {
        lista.innerHTML = "<p>Impossibile caricare lo storico.</p>";
    }
}

function svuotaDiario() {
    if(confirm("Confermi la cancellazione definitiva dello storico?")) {
        localStorage.removeItem('diario_pasti');
        mostraDiario();
    }
}
