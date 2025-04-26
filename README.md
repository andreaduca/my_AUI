Il progetto 'my_AUI' è il risultato della ristrutturazione generale di un progetto aziendale ('ReinfrceWeb'). Qui è riportato il mio lavoro di analisi del software sull'implementazione proposta dall'azienda.
 
# Obiettivi del progetto  

- **Universalità** – il sistema deve rimanere plug-and-play per qualunque web-app, senza dipendenze di dominio.  
- **Predizione** – stimare in tempo reale l’evoluzione del comportamento dell’utente.  
- **Adattamento della UI** – scegliere l’azione (es. mostrare un banner, cambiare layout…) che massimizza la UX.  

---

# Funzionamento  

1. **Osservazione** – raccolta dello stato corrente dell’interfaccia e delle interazioni dell’utente.  
2. **Pre-processamento** – costruzione del vettore di feature e della transizione, e calcolo della *reward*.  
3. **Elaborazione LSTM** – trasforma la sequenza degli stati recenti in un vettore compatto che contestualizza allo storico l'informazione attuale.
4. **DQN-RNN** – valutazione dei Q-values per orientare la scelta.  
5. **ε-greedy** – strategia di decisione.  
6. **Aggiornamento periodico** – per tenere aggiornato il modello al contesto corrente.  

---

# Analisi del Software proposto dall'azienda  

## Lo stato osservato  
![Screenshot 2025-04-26 at 17 31 14](https://github.com/user-attachments/assets/1018b83f-d76d-4985-846b-fa9d7ed6cab1)

Ogni “osservazione” ingloba **cinque secondi consecutivi** (array da 5 voci per `zoom`, `scrollUp`, `scrollDown`, `click`, `timeOnSite`). Ciò rompe la premessa di un MDP a passo costante: il modello dovrebbe vedere *una sola* istantanea per step, non un mini-batch interno.  


> **Nota sul passo temporale (MDP)**  
> In un Markov Decision Process ogni iterazione segue il ciclo  
> `s_t → a_t → r_{t+1}, s_{t+1}`: l’agente osserva **un solo stato** alla volta,
> prende **una sola azione** e, alla stessa frequenza, riceve ricompensa e nuovo
> stato. Accorpare i 5 secondi consecutivi in un’unica osservazione trasforma
> implicitamente il passo dell’MDP da 1 s a 5 s senza che il resto
> dell’ambiente lo sappia. Ne derivano:
>
> 1. **Granularità di controllo ridotta** – l’agente può correggersi solo ogni 5 s, perdendo eventi intermedi.  
> 2. **Credit assignment più difficile** – quando arriva una reward è ambiguo capire quale dei 5 istanti l’abbia causata.  
> 3. **Pre-processing complesso** – padding e reshaping servono solo per “spacchettare” il mini-batch interno, complicando la pipeline.
>
> Alternative consigliate:
> - inviare un solo frame per step e lasciare alla rete LSTM la memoria del passato, **oppure**
> - usare un *frame stacking* scorrevole (`t-3 … t`) ma mantenendo comunque il passo logico di 1 s.

La struttura JSON è ridondante: un oggetto radice con chiave `body`, che contiene a sua volta un altro `body`, più due copie di `user_id`. Questa annidazione superflua complica il parsing e rende poco intuitivo lo schema dei dati; in un’API REST ben progettata basterebbe un livello e nomi univoci.  

Inoltre l’agente continua a **non ricevere variabili manipolabili**: il vettore di stato è interamente “passivo”. Il risultato è un apprendimento lento, perché l’effetto di un’azione (p. es. mostrare un banner) non è immediatamente riflesso nei dati d’ingresso e va dedotto a posteriori. Bastava includere nel payload un flag “banner on/off” o simili per ridurre la *credit assignment*.  


## Sul Pre-Processamento  

I valori vengono solo riordinati e **non normalizzati**: `scrollDown` supera quota 1200 mentre `zoom` oscilla tra 0,8 e 0,9; senza scaling l’ottimizzatore privilegia le feature a grandezza maggiore.  

<img width="1028" alt="immagine" src="https://github.com/user-attachments/assets/4ecb69d3-3162-4906-877a-414d5c2588b1" />

La funzione `convert_to_tuples()` riordina le liste e le concatena, ma non scala né standardizza. La logica di padding e slicing viene "riscritta a mano", duplicando utility già presenti in `torch.nn.utils.rnn`. Separare ETL dal core RL non è solo “ordine mentale”: rende la pipeline **testabile** con unit-test mirati e facilita future ottimizzazioni (es. NumPy → PyTorch dataloader).  

---

## Front-End (Gestione dei dati)
<img width="1550" alt="immagine" src="https://github.com/user-attachments/assets/50aa6d3d-9da2-4b8b-ba92-b90e8cc7221a" />

Il tracciamento degli eventi utente è interamente incastonato dentro **HomeView.vue**: il componente, oltre a gestire la logica della pagina, si occupa anche di tutta la logica del sistema, tra cui la raccolta di tap, scroll, zoom, reward e di l'invio al backend. Così la sezione grafica e il codice di tracciamento si mescolano e diventano difficili da separare; qualunque refactor grafico costringerà a toccare anche la logica di raccolta dati. Un composable dedicato isolerebbe gli handler e renderebbe il componente di pagina più snello.

Gli *event listener* ad `addEventListener` sono staccati nello `beforeDestroy`, ma il codice richiama di nuovo `addEventListener` anziché `removeEventListener`, lasciando gli handler vivi tra mount successivi e causando **memory-leak**; lo stesso vale per gli `interval` (1 s per `updateArray`, 5 s per `getResponse`) che non vengono mai cancellati. Nelle SPA, ogni volta che l’utente entra ed esce dal componente viene creato un nuovo setInterval; col passare delle navigazioni si accumulano decine di timer attivi che continuano a inviare richieste ripetute al backend.

Gli array con lo storico (`scrollUpContainer`, `clickContainer` …) crescono a oltranza, sebbene il payload utilizzi solo `slice(-5)`: basta qualche minuto di permanenza per accumulare migliaia di elementi inutili, con impatto su memoria e GC. Un ring-buffer (lunghezza fissa 5) risolverebbe il problema mantenendo costante l’impronta RAM.

Nel markup il banner usa `v-if="true"`, quindi `this.banner` è ignorato, e gli input hanno l’attributo inesistente `@model` al posto di `v-model`; la UI appare reattiva ma i dati non viaggiano davvero fra DOM e stato, generando bug “silenziosi” che emergono solo in debug.

---

**apiData.js** gestisce i container fuori dal sistema di reattività Vue; aperte due schede, le statistiche di una confluiscono nell’altra, falsando i dati. Inoltre `deviceContainer` viene fissato al primo secondo e non cambia se l’utente ruota lo schermo, per cui il modello non percepisce il passaggio da portrait a landscape.

Il polling su `/optimize_model` è lanciato dal browser ogni 10 s (controllo su `timeContainer.slice(-1) % 10`), ma il retraining dovrebbe essere decisione del server: altrimenti basta aprire la console del dev-tools e lasciare la tab aperta per saturare la GPU del backend.  

La funzione `parseJSON()` esegue un doppio `JSON.parse(JSON.parse(...))`: oltre a essere inutile, raddoppia il costo CPU e rischia di alzare un’eccezione su payload più grandi. L’endpoint API è hard-coded su `http://localhost:5020`; in un deploy cloud occorre ricompilare l’intera app per cambiare host, quando bastava una variabile d’ambiente (`import.meta.env.VITE_API_URL`).

---

### Effetti pratici  

* **FPS in caduta**: array che crescono + handler fantasma ⇒ rendering meno fluido dopo qualche minuto.  
* **Rete intasata**: una sessione di 15 min genera ~900 call di telemetria e ~20 retrain; su mobile significa consumare banda e batteria.  
* **Dati poco affidabili/significativi**: lo scroll viene accumulato e non indica una posizione nella pagina, si sommano anche i click su elementi non cliccabili della pagina, il device non cambia mai.

---

## Accoppiamento UI ↔ logica di sistema

L’obiettivo dichiarato è fornire un motore di predizione plug-and-play, riutilizzabile in qualunque web-app.
Nell’implementazione attuale, però, la telemetria è saldamente incastrata dentro HomeView.vue:
- updateArray() conosce a priori quali feature trasmettere (scrollUp/Down, zoom …) e come impacchettarle (slice(-5)), perciò aggiungere una variabile o cambiare la finestra temporale obbliga a modificare il componente.
- Il banner di feedback è hard-coded nel template; se una nuova pagina non include quel markup, l’azione “reward” scompare e il modello resta cieco.
- Le chiamate API (/action_network, /optimize_model) partono direttamente dal componente; spostare la logica in un’altra view significherebbe duplicare codice.

Di fatto, la “demo” trascina con sé l’intero SDK: senza clonare HomeView.vue non è possibile integrare il sistema altrove.

## Back-End (`api.py`)  

Il backend accorpa in un solo file (`api.py`) oltre 500 righe che comprendono routing, business logic, accesso al DB e training. Le query SQL sono scritte “a stringa”, sparpagliate tra le funzioni, senza DAO né ORM: mantenere la persistenza (o prevenirne le SQL-injection) diventa arduo. Variabili globali mutabili (`policy_net`, liste di stato, checkpoint) convivono in un contesto multi-thread.  

In più, il training RL avviene sincrono dentro un endpoint `GET /optimize_model/<lastOptimization>`: ogni richiesta blocca il thread finché PyTorch non ha finito. Il tempo di risposta diventa imprevedibile e la pagina rischia il timeout; ad esempio una coda Celery avrebbe risolto il problema spostando il carico computazionale fuori dal ciclo HTTP.  

Hard-coding di percorsi (`Database_Utenti`, `model_checkpoints`) e nessuna variabile d’ambiente violano il *twelve-factor*; l’API restituisce lo stack-trace interno al client, esponendo dettagli del server. Infine, il salvataggio dei pesi ad ogni “miglioramento” (basato sulla somma reward degli ultimi 10 step) produce decine di file quasi identici, I/O elevato e versioning confuso.  

---

## Criticità del processo di apprendimento  

L’attuale ciclo RL presenta lacune strutturali che ne minano l’efficacia sin dalle fondamenta.


### 1. Definizione dello stato  

Lo “stato” è un aggregato passivo di variabili che l’agente **non può manipolare**: tap, scroll, zoom, tempo sul sito.  
Manca qualunque flag che rifletta le azioni del sistema (es. `banner_on`, `layout_variant`, ...), perciò dopo un intervento dell’agente l’osservazione successiva appare identica a quella precedente. La rete non ha modo di collegare causa ed effetto: il problema di _credit assignment_ diventa insolubile e il training rallenta drasticamente.  

In più, invece di un singolo frame per step si invia un blocco di cinque secondi –‐ un “mini-batch” interno che altera la cadenza MDP e introduce rumore temporale.

---

### 2. Reward quasi assente & non significativa

La ricompensa scatta soltanto quando l’utente preme “Like” o “Dislike” sul banner; se non interagisce, il valore resta a zero e non dipende né dallo stato né dall’azione eseguita. 
Se viene mostrato il banner, e l'utente lo ignora e poi lascia dislike, l'azione a monte che lo ha mostrato deve essere penalizzata. Se il banner non viene mostrato perchè il sistema prevede che in quel momento l'utente non voglia essere disturbato, allora dovrà essere premiata.

Il segnale risulta quindi:
- Raro – su minuti di navigazione si contano pochissimi click.
- Privo di metrica chiara – manca una funzione obiettivo esplicita (es. aumento del dwell-time o riduzione del bounce-rate).
- In ritardo – il feedback può arrivare molti step dopo l’azione che lo ha provocato, e non è associato all'azione scatenante.

Senza un adeguato reward shaping l’algoritmo deve procedere a tentoni per lunghi intervalli prima di ricevere un segnale informativo.

---

### 3. Strategia di training improvvisata  

La rete parte da pesi casuali (niente pre-training su dati storici) e viene aggiornata tramite l’endpoint `/optimize_model`, invocato dal browser ogni 10 s. Risultato:

| Causa | Effetto |
|---------|-------------|
| **Batch di esperienza minuscolo** | Alta varianza, rischio di divergenza |
| **Aggiornamento sincrono in HTTP** | Blocchi I/O, time-out e race condition |
| **Nessuna validazione offline** | Impossibile misurare se i pesi “migliorano” davvero |

Il *target network* non è stabile; i pesi della policy vengono sovrascritti ad ogni chiamata, con oscillazioni che impediscono la convergenza.

---

### 4. Mancanza di metrica e di test  

Il progetto non definisce KPI (CTR, dwell-time, scroll-depth) né routine di **A/B test**; di conseguenza non c’è modo di verificare se il modello, una volta in produzione, stia effettivamente migliorando la UX.  
La pipeline CI non contiene unit-test né esperimenti riproducibili.

---

### 5. Scalabilità e sicurezza del modello  

Tutto lo stato (rete, replay-buffer, statistica reward) vive in memoria RAM di un unico processo Flask. Con più worker o thread le copie dei pesi divergono; con un solo worker l’app non scala e perde resilienza. Non esiste versioning dei checkpoint: in caso di regressione non è possibile fare roll-back.

---

### In sintesi  

* Stato e non reattivo alle azioni dell'agente
* Ricompensa **sparse, ritardata e non correlata** con l’obiettivo di prodotto  
* Training **sincrono, non monitorato**, privo di replay buffer e target network  
* **Nessuna metrica** di successo, nessun test automatico, nessun piano di roll-back  

Finché questi punti non verranno risolti, il motore di apprendimento rimarrà incapace di produrre vantaggi concreti.

---

