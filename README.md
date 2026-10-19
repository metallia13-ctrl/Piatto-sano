# Piatto sano

App web per comporre pasti equilibrati partendo da quello che hai in dispensa.

- **Profilo**: sesso, età, altezza, peso, attività e obiettivo (dimagrimento, mantenimento, aumento massa). Il fabbisogno è stimato con la formula di Mifflin‑St Jeor.
- **Piatto**: scegli un alimento e ottieni macro per 100 g e porzione consigliata per il pasto, in grammi, a occhio o in misurini.
- **Diario**: registra cosa mangi, giorno per giorno. Ti avvisa se un gruppo di alimenti supera le frequenze settimanali della piramide della dieta mediterranea e delle linee guida CREA (carne rossa, salumi, carne bianca, uova, patate, formaggi, dolci), ti ricorda pesce e legumi e controlla i limiti giornalieri dell’OMS (frutta e verdura, grassi, grassi saturi, zuccheri liberi, sale).
- **Dispensa**: segna cosa hai in casa e fai comporre il piatto in automatico. Gli alimenti che mancano si cercano su [Open Food Facts](https://world.openfoodfacts.org).

Funziona offline (tranne la ricerca di nuovi alimenti) e si installa sul telefono come un’app.

## Pubblicarla con GitHub Pages

1. Crea un nuovo repository su GitHub (per esempio `piatto-sano`), pubblico.
2. Carica tutti i file di questa cartella nella radice del repository (*Add file → Upload files*).
3. Vai in *Settings → Pages*, alla voce *Source* scegli *Deploy from a branch*, poi il branch `main` e la cartella `/ (root)`. Salva.
4. Dopo un paio di minuti l’app è online su `https://<tuo-utente>.github.io/piatto-sano/`.

## Installarla su Android

Apri l’indirizzo con Chrome, poi menu ⋮ → *Aggiungi a schermata Home* (o *Installa app*).

## Aggiornamenti

Quando modifichi i file, aumenta la versione in `sw.js` (per esempio `piatto-sano-v2` → `piatto-sano-v3`), così i telefoni scaricano la nuova versione.

## Dati

Profilo, dispensa, piatto e diario restano nel browser del dispositivo (localStorage). Dal Profilo puoi esportare e importare un backup in JSON.

## Avvertenze

I valori nutrizionali sono medi e indicativi. L’app non sostituisce il parere di un medico o di un nutrizionista.
