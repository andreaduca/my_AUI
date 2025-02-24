# Astrazione per Applicabilità a Qualsiasi Sito

L’obiettivo principale è separare le responsabilità in moduli ben definiti, rendendo il codice altamente configurabile e indipendente dalla struttura specifica di un sito

#### Utilizzo di un Modulo Autoinvocante (IIFE)
- Isolamento:  L’uso di un Immediately Invoked Function Expression (IIFE) consente di evitare la contaminazione dello scope globale, prevenendo conflitti con altri script presenti sulla pagina.
- Iniezione Semplice: L’intero modulo può essere iniettato dinamicamente (ad esempio tramite un bookmarklet o un’estensione del browser) senza necessità di modificare il codice della pagina ospite.

Questo approccio garantisce che il nostro codice rimanga isolato, riducendo il rischio di collisioni con variabili o funzioni già presenti sul sito, e permettendo una facile integrazione in ambienti diversi.

#### Configurazione tramite Oggetto di Impostazioni

- Personalizzazione e Flessibilità: Un oggetto di configurazione centralizzato permette di specificare parametri come l’URL del backend, i tipi di eventi da monitorare, le mappature per il DOM e altre opzioni senza modificare il codice di base.
- Riutilizzabilità: Il codice diventa indipendente dal contesto, poiché le specifiche del sito (ad esempio, identificatori univoci degli elementi) possono essere definite dall’utente o dall’integrazione esterna.
```
const config = {
    backendUrl: 'https://tuo-backend.com/collect_event',
    monitoredEvents: ['click', 'mouseover'],
    // Eventuali mappature o callback per la modifica degli elementi
    domMappings: {
        // Esempio: per ogni id potenzialmente monitorato, possiamo definire delle azioni personalizzate
        // 'button1': (el, newText) => { el.innerText = newText; }
    }
};
```

Centralizzare le impostazioni permette di adattare il comportamento del modulo senza dover intervenire sul codice sorgente, facilitando l’adozione in ambienti con esigenze diverse e garantendo un’alta manutenibilità.

#### Modularità e Separazione delle Responsabilità

- Event Handling: Separare la logica di cattura degli eventi da quella di comunicazione col backend e da quella di aggiornamento del DOM.
- Riutilizzo del Codice: Ogni modulo o funzione ha una responsabilità specifica, rendendo il sistema più semplice da testare e da estendere.

##### MODULI

* Event Listener Module: Non conosce i dettagli del backend o della manipolazione del DOM, si limita a raccogliere dati sugli eventi. Definisce una funzione init che configura e gestisce i listener per gli eventi specificati (ad es. click, mouseover).
* Backend Communication: Il modulo non si preoccupa di come i dati raccolti siano usati, si limita a inviarli e a passare la risposta al modulo che si occupa del DOM. Gestisce la comunicazione asincrona con il backend, utilizzando l’API fetch per inviare dati e ricevere risposte.
* DOM Update Module: La logica di aggiornamento è separata e può essere personalizzata per diversi siti, ad esempio tramite callback o mapping configurabili. Riceve le istruzioni dal backend e modifica il DOM in base alla logica configurata o definita nei mapping.

#### Uso di Eventi Personalizzati e Pub/Sub

Utilizzando un pattern publish/subscribe, il modulo diventa estensibile: altri script sulla pagina possono iscriversi a questi eventi e reagire alle modifiche suggerite dal backend.

- Decoupling: L’utilizzo di eventi personalizzati (Custom Events) consente di implementare un meccanismo di comunicazione interna che permette ad altre parti del sito di “ascoltare” le azioni senza dover accedere direttamente alla logica interna del modulo.
- Flessibilità nell’Integrazione: Permette a sviluppatori esterni di reagire alle azioni del modello, integrandosi con le loro logiche di business.

L’architettura presentata si basa su principi di modularità, isolamento e configurabilità:
- Modularità: Ogni responsabilità (cattura eventi, comunicazione col backend, aggiornamento del DOM) è separata, facilitando la manutenzione e l’estensibilità.
- Isolamento: L’uso di un IIFE e di un oggetto di configurazione evita conflitti con altri script e rende il modulo facilmente integrabile in qualsiasi pagina web.
- figurabilità: L’oggetto di configurazione centralizzato e i mapping per il DOM permettono di adattare il comportamento del sistema alle specificità di ogni sito senza modificare il codice di base.
- Flessibilità e Pub/Sub: L’implementazione di eventi personalizzati consente a sviluppatori esterni di interagire con il modulo senza legarsi strettamente alla sua logica interna, favorendo una maggiore interoperabilità.