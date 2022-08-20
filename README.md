# Progetto Piattaforme Digitali per la Gestione del Territorio - Relazione

Progetto per l'esame di Piattaforme Digitali per la Gestione del Territorio, sessione autunnale, a.a. 2021/2022

## Studente:

Nome: Alessio  
Cognome: Muzi  
Matricola: 299329  

Università di Urbino "Carlo Bo"  
Laurea triennale Informatica Applicata  
Piattaforme Digitali per la Gestione del Territorio  
Sessione autunnale 2021/2022

## Introduzione

Il web service sviluppato per il progetto di esame ha come argomento d'interesse il meteo. L'API è stata sviluppata utilizzando
Git e GitHub in due branch di lavoro, denominate "main" e "glitch": il primo branch è quella principale, mentre il secondo è il
branch di lavoro dal sito Glitch.com. Il servizio meteo è stato sviluppato per fornire dei dati meteo, caricati da un 
amministratore di sistema, di diverse città italiane. I dati possono essere richiesti all'API RESTful da un qualsiasi "utente".

## Descrizione del servizio

Il servizio implementato permette la raccolta e l'accesso di dati meteo in maniera digitali, per la gestione di un servizio web
meteo disponibile per un numero arbitrario di utenti. Ogni utente che si registra al servizio ottiene la possiblità di visualizzare 
i dati delle città, che possono essere modificati in ogni momento dall'amministratore di sistema. Esso effettua l'accesso tramite 
login e password.

## Descrizione dell'architettura e delle scelte implementative

Il linguaggio di programmazione utilizzato è JavaScript. L'ambiente di lavoro è quello di NodeJS, sfruttato tramite il sito
Glitch.com, che permette sia la scrittura di codice sia il deployment di web services. Il servzio rispetta tutte le 
caratteristiche delle API RESTful. Per quanto riguarda l'autenticazione del client, sono stati usati dei JWT (JSON Web Token).
I package utilizzati, integrati nel progetto tramite npm (Node Pacakge Manager), sono:

cookie-parser - Utilizzata per usufruire dei cookie in fase di autenticazione.  
js-sha256 - Utilizzata per crittare le password tramite l'algoritmo SHA 256.  
njwt - Utilizzata per generare il JSON Web Token.  

Per quanto riguarda il rilascio e il testing del servizio, sono stati utilizzati il già citato Glitch.com e Postman.com, il quale
funge da client tramite richieste HTTP.

## Documentazione dell’API implementata


## Descrizione delle modalità della messa online del servizio


## Esempio descrittivo di utilizzo del servizio Web


## Roadmap di sviluppi futuri, eventuali modifiche da effettuare