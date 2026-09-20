# Daily_News
News Selection

Notiziario personale in italiano: una selezione ragionata di notizie verificate,
con fonti consultabili e attenzione alla rilevanza per il lettore.

## Struttura

- `config/news_profile.md`: interessi, priorità e criteri editoriali.
- `news/`: archivio delle edizioni in Markdown; `.gitkeep` mantiene la directory
  nel repository finché non ci sono edizioni.

## Preparazione di un'edizione

1. Leggere il profilo editoriale in `config/news_profile.md`.
2. Consultare fonti attendibili e verificare data di pubblicazione e data dei fatti.
3. Selezionare gli sviluppi rilevanti, accorpare le duplicazioni e segnalare
   eventuali incertezze o informazioni ancora non confermate.
4. Salvare l'edizione in `news/YYYY-MM-DD.md`, indicando data e ora di aggiornamento
   con fuso `Europe/Copenhagen`.
5. Per ogni notizia includere titolo descrittivo, sintesi dei fatti, rilevanza
   e collegamenti alle fonti. Separare dichiarazioni e analisi dai fatti verificati.

Non inventare notizie, citazioni o fonti. Se non ci sono sviluppi verificati e
rilevanti, dichiararlo senza riempire l'edizione con contenuti marginali.
La struttura iniziale non contiene notizie né automazioni ricorrenti.
