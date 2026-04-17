const db = {
    // CARBOIDRATI + FIBRE
    "pasta": ["carboidrati"], "pane": ["carboidrati"], "riso": ["carboidrati"],
    "gallette di riso": ["carboidrati"], "gallette di mais": ["carboidrati"], 
    "gallette di segale": ["carboidrati", "fibre"], "gallette di farro": ["carboidrati"],
    "patate": ["carboidrati"],
    
    // LEGUMI (Tripla natura)
    "fagioli": ["proteine", "carboidrati", "fibre"],
    "lenticchie": ["proteine", "carboidrati", "fibre"],
    "ceci": ["proteine", "carboidrati", "fibre"],
    "piselli": ["proteine", "carboidrati", "fibre"],
    
    // PROTEINE + GRASSI (Classificazione Formaggi)
    "mozzarella": ["proteine", "grassi saturi"],
    "fiocchi di latte": ["proteine", "basso contenuto grassi"],
    "ricotta": ["proteine", "grassi moderati"],
    "parmigiano": ["proteine", "grassi saturi", "colesterolo"],
    
    // VERDURE (Fibre pure)
    "zucchine": ["fibre"], "insalata": ["fibre"], "broccoli": ["fibre"], "spinaci": ["fibre"]
};

function analizzaPasto() {
    const input = document.getElementById('food-input').value.toLowerCase().trim();
    if (!input) return;

    const categorie = db[input] || [];
    let feedback = `<div class="card"><h3>${input.toUpperCase()}</h3>`;
    
    if (categorie.length > 0) {
        feedback += `<p>Contiene: ${categorie.join(', ')}.</p>`;
    }

    let suggerimenti = "<h4>Analisi del Piatto:</h4>";

    // Alert Fibre
    if (!categorie.includes("fibre")) {
        suggerimenti += `<p style="color:var(--warning-soft)">⚠️ <strong>Carenza di Fibre:</strong> Questo pasto è povero di fibre. Aggiungi verdura o legumi per aiutare l'intestino e l'indice glicemico.</p>`;
    }

    // Alert Carboidrati
    if (!categorie.includes("carboidrati")) {
        suggerimenti += `<p>⛽ <strong>Reminder:</strong> Aggiungi energia con pane, patate o <strong>gallette (riso, mais, segale)</strong>.</p>`;
    }

    // Suggerimento Proteine e focus Formaggi
    if (!categorie.includes("proteine")) {
        suggerimenti += `<strong>💪 Scegli una proteina:</strong><ul>
            <li><strong>Fiocchi di Latte:</strong> Scelta migliore della mozzarella. Contengono meno calorie e pochissimi grassi saturi, pur essendo ricchi di proteine (caseine).</li>
            <li><strong>Pesce o Pollo:</strong> Proteine magre.</li>
            <li><strong>Legumi:</strong> Ottimi perché ti danno anche fibre e carboidrati complessi.</li>
        </ul>`;
    }

    document.getElementById('feedback-card').innerHTML = feedback;
    document.getElementById('suggestions-card').innerHTML = suggerimenti;
    document.getElementById('result-area').classList.remove('hidden');
}

// Popolamento automatico della Guida Medica
function caricaGuida() {
    const guida = document.getElementById('guida-contenuto');
    guida.innerHTML = `
        <div class="card">
            <h3>I Grassi: Buoni vs Cattivi</h3>
            <p><strong>Saturi (Burro, Formaggi grassi, Carne rossa):</strong> Se eccessivi, aumentano il colesterolo LDL e il rischio cardiovascolare.</p>
            <p><strong>Insaturi (Olio d'oliva, Pesce, Noci):</strong> Proteggono il cuore. Preferisci sempre questi.</p>
        </div>
        <div class="card">
            <h3>Eccesso di Carboidrati</h3>
            <p>Troppi carboidrati (specialmente zuccheri semplici) causano picchi di insulina che possono portare a insulino-resistenza e aumento di peso viscerale.</p>
        </div>
        <div class="card">
            <h3>Il potere dei Legumi</h3>
            <p>Sono alimenti "completi": contengono <strong>proteine vegetali</strong>, <strong>carboidrati a lento rilascio</strong> e moltissime <strong>fibre</strong>, fondamentali per la salute del microbiota.</p>
        </div>
    `;
}
