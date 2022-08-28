# Progetto Piattaforme Digitali per la Gestione del Territorio - Relazione

Progetto per l'esame di Piattaforme Digitali per la Gestione del Territorio, sessione autunnale, a.a. 2021/2022  

# Web API per dati meterologici con autenticazione

## Studente:

**Nome**: Alessio  
**Cognome**: Muzi  
**Matricola**: 299329  

**Università di Urbino "Carlo Bo"  
Laurea triennale Informatica Applicata  
Piattaforme Digitali per la Gestione del Territorio  
Sessione autunnale 2021/2022**

## Introduzione

Il web service sviluppato per il progetto di esame ha come argomento d'interesse il meteo. L'API è stata sviluppata utilizzando
Git e GitHub in due branch di lavoro, denominate "*main*" e "*glitch*": il primo branch è quella principale/di rilascio,
mentre il secondo è il branch di lavoro dal sito Glitch.com. Il servizio meteo è stato sviluppato per fornire dei dati meteo, 
caricati da un amministratore di sistema, di diverse città italiane. I dati possono essere richiesti all'API RESTful da un qualsiasi 
utente. Il formato utilizzato per i dati è JSON, molto flessibile e facile da implementare.

## Descrizione del servizio

Il servizio implementato permette la raccolta e l'accesso di dati meteo in maniera digitale, per la gestione di un servizio web
meteo disponibile a un numero arbitrario di utenti. Ogni utente che si registra al servizio ottiene la possiblità di visualizzare 
i dati delle città, che possono essere modificati in ogni momento dall'amministratore di sistema. Esso effettua l'accesso tramite 
login e password. Il servizio è gestito da un amministratore che cura i dati utili.

## Casi d'uso

Considerando le caratteristiche del servizio, cioè il fatto di essere gestito completamente da un amministratore di sistema e non
collegato ad altri servizi esterni, può essere utile se per esempio dobbiamo comunicare dei dati sicuri a un limitato numero di 
persone. In questo caso l'entità che si occupa di verificare i dati è l'amministratore di sistema.

## Descrizione dell'architettura e delle scelte implementative

Il linguaggio di programmazione utilizzato è *JavaScript*. L'ambiente di lavoro è quello di NodeJS, sfruttato tramite il sito
Glitch.com, che permette sia la scrittura di codice sia il deployment continuo. Il servzio rispetta tutte le 
caratteristiche delle API RESTful. Per quanto riguarda l'autenticazione del client, sono stati usati dei JWT (*JSON Web Token*).
I package utilizzati, integrati nel progetto tramite npm (*Node Pacakge Manager*), sono:

**cookie-parser** - Utilizzata per usufruire dei cookie in fase di autenticazione.  
**js-sha256** - Utilizzata per crittare le password tramite l'algoritmo SHA 256.  
**njwt** - Utilizzata per generare il JSON Web Token.  

Per quanto riguarda il rilascio e il testing del servizio, sono stati utilizzati il già citato *Glitch.com* e *Postman.com*, 
il quale funge da client tramite richieste HTTP.

La struttura dell'API si basa su *expressJS*, un framework minimale e flessibile per NodeJS che semplifica lo sviluppo di web
services tramite un'infrastruttura robusta e ricca di funzionalità.

# Documentazione dell’API implementata

## Descrizione dei metodi (paradigma CRUD)

L'API fornisce un elenco di metodi utili a visualizzare i dati del meteo. Essi seguono le operazioni basilari **CRUD**, ovvero
**Create**, **Read**, **Update** e **Destroy**.

I metodi esposti dal servizio e i corrispetivi path sono:

<ul>
  <li> <b>POST</b> (/meteo/login) per effettuare il login al servizio tramite il sistema di Basic Authentication dell'API.
                                  i vari nomi utente e password sono contenuti nel file "server.js". Il sistema
                                  opera tramite JWT e ogni token dura per 10 minuti.</li>
  <li> <b>GET</b> (/meteo) per ottenere tutti i dati attualmente disponibili nel servizio. Questo metodo non richiede alcun
                           body ma richiede di essere autenticato dal sistema.</li>
  <li> <b>GET</b> (/meteo/meteoCitta/:id) per ottenere i dati di una specifica città tramite il campo <b>"id"</b>. Richiede di essere autenticati
                                          nel sistema </li>
  <li> <b>POST</b> (/meteo/aggiungiCitta) per aggiungere una nuova città nell'API. Questa azione è eseguibile solo dall'amministratore
                                          di sistema. Il body della richiesta deve essere un file JSON (application-JSON) in un 
                                          formato conforme.</li>
  <li> <b>DELETE</b> (/meteo/eliminaCitta/:id) per rimuovere una città dall'API tramite il campo <b>"id"</b>. Questa azione è eseguibile 
                                               solo dall'amministratore di sistema.</li>
  <li> <b>POST</b> (/meteo/modificaDato/:id/:campo/:nuovoValore) per modificare un dato di una città. Questa azione è eseguibili solo 
                                                                 dall'amministratore di sistema. La modifica avviene tramite <b>"id"</b>, 
                                                                 <b>"campo"</b> e <b>"nuovoValore"</b>. I valori accettati per campo
                                                                 sono "c, tn, tum, fa, un, umm", che rappresentano nome, temperatura,
                                                                 unità di misura della temperatura, fenomeni atmosferici, umidità e
                                                                 unità di misura dell'umidità.</li>
</ul>

Tutte le seguenti richieste vengono effettuate tramite il protocollo HTTP e l'intestazione contiene il content-type <b>'application/json'</b>.

Formato del body JSON:

<pre>{
   "citta": nomeCitta,
   "data": "data" (in formato stringa ISO 8601: "YYYY-MM-DDTHH:MM:SS.mmmZ",
   "temperatura":{
      "numero": temperatura,
      "UM": unita_di_misura
   },
   "fenomeniAtmosferici": tipo_di_fenomeno,
   "umidita":{
      "numero": umidita,
      "UM": unita_di_misura
   }
}</pre>

## Descrizione delle modalità della messa online del servizio e dei servizi utilizzati

Il servizio è stato sviluppato e messo online tramite <i>a</i>. L'endpoint di partenza è: "https://progettopdgt-alessiomuzi-meteo.glitch.me/".

Durante lo sviluppo del servizio, sono stati utilizzati molte altre risore web:

<ul>
  <li> <b>ExpressJS</b> (https://expressjs.com/en/4x/api.html) per leggere la documentazione dell'API. </li>
  <li> <b>JSONPlaceholder</b> (https://jsonplaceholder.typicode.com/) per dei file JSON generici. </li>
  <li> <b>Postman</b> (https://web.postman.co/workspace/e546bc24-1681-4ec0-89d5-8f83f863405a) per effettuare richieste HTTP e
                      per avere funzione di client.</li>
  <li> <b>Coding Tools: sha256</b> (https://coding.tools/sha256) per crittare l'hash per la Basic Auth.</li>
  <li> il già citato <b>Glitch.com</b> per lo sviluppo e rilascio continuo.</li>
</ul>

## Esempio descrittivo di utilizzo del servizio Web

Una collezione di richieste HTTP predefinite sono disponibili nel workspace Postman precedentemente citato.

Esempio di utilizzo del servizio web:

**Login:**
<img src="https://cdn.glitch.global/ec544d33-c9fa-4d45-b8c9-3b05a4fa6504/1.JPG?v=1661101848060" alt="Esempio login">

**Visualizzazione di tutti i dati:**
<img src="https://cdn.glitch.global/ec544d33-c9fa-4d45-b8c9-3b05a4fa6504/2.JPG?v=1661101848925" alt="Esempio visuallizzazione tutti dati">

**Visualizzazione dei dati di una singola città:**
<img src="https://cdn.glitch.global/ec544d33-c9fa-4d45-b8c9-3b05a4fa6504/3.JPG?v=1661101851415" alt="Esempio visualizzazione dati di una città">

**Aggiunta dei dati di una città:**
<img src="https://cdn.glitch.global/ec544d33-c9fa-4d45-b8c9-3b05a4fa6504/4.JPG?v=1661101854023" alt="Esempio aggiunta città">

**Rimozione di una città:**
<img src="https://cdn.glitch.global/ec544d33-c9fa-4d45-b8c9-3b05a4fa6504/5.JPG?v=1661101855089" alt="Esempio rimozione città">

## Roadmap di sviluppi futuri, eventuali modifiche da effettuare

Nonostante il servizio web sia stato completato e sia interamente funzionante, sono molte le aggiunte e modifiche che possono
essere effettuate: sviluppo di un client in PHP/HTML con CD su Heroku, integrazione con API come OpenWeatherAPI (che però farebbe
perdere di utilità all'amministratore di sistema), utilizzo di un database SQL, generazione randomica degli hash per l'autenticazione...


**Link utili:** 

- Repository Github https://github.com/AlessioMuzi/Progetto-PDGT
- Repository Glitch.com: Repository Glitch: https://glitch.com/edit/#!/progettopdgt-alessiomuzi-meteo
- Endpoint web service: https://progettopdgt-alessiomuzi-meteo.glitch.me/
- Client Postman: https://web.postman.co/workspace/e546bc24-1681-4ec0-89d5-8f83f863405a