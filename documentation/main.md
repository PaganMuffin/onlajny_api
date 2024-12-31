# Onlajny.pl REST API Dokumentacja

# Ogólne endpointy API

Wyszukiwanie tytuły na wspieranych serwisach.

**URL** : `/search`

**Metoda** : `GET`

## Udane zapytanie

**Code** : `200 OK`

**Przykład zapytania i odpowiedzi**

Dla wyszukania serii Horimiya

`/search?s=Horimiya`

```json
[
  {
    "provider": "shinden.pl", //Adres serwisu z którego pochodzą wyniki
    "items": [ //Tablica znalezionych wyników
      {
        "series_id": "57214", //ID Serii w serwisie
        "title": "Horimiya", //Tytuł serii
        "endpoint": "series", //Endpoint TYLKO SHINDEN
        "provider": "shinden" //Z jakiego serwisu pochodzi wynik
      }
    ]
  },
  {
    "provider": "desu-online.pl",
    "items": [
      {
        "series_id": "horimiya",
        "title": "Horimiya",
        "provider": "desu"
      }
    ]
  },
  {
    "provider": "anime-odcinki.pl",
    "items": [
      {
        "series_id": "horimiya",
        "title": "Horimiya",
        "provider": "ao"
      }
    ]
  }
]
```

Ostatnio zaktualizowane/dodane pozycje w wspieranych serwisach [desu-online.pl, animep-odcinki.pl]

**URL** : `/update`

**Metoda** : `GET`

## Udane zapytanie

**Code** : `200 OK`

**Przykład zapytania i odpowiedzi**

`/update`

```json
[
  {
    "provider": "desu-online.pl", //Adres serwisu z którego pochodzą wyniki
    "items": [
      {
        "title": "Tropical-Rouge! Precure Odcinek 5", //Tytuł odcinku
        "episode_id": "tropical-rouge-precure-odcinek-5", //ID odcinka/serii w serwisie
        "type": "episode", //Typ elementu. series lub episode
        "cover": "aHR0cHM6Ly9kZXN1LW9ubGluZS5wbC93cC1jb250ZW50L3VwbG9hZHMvMjAyMS8wMy8xMTA5MDctMjEyeDMwMC53ZWJw", //Adres okładki zakodowany pzy pomocy base64
        "provider": "desu" //Z jakiego serwisu pochodzi wynik
      }
    ]
  },
  {
    "provider": "anime-odcinki.pl",
    "items": [
      {
        "cover": "aHR0cHM6Ly9hbmltZS1vZGNpbmtpLnBsL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDIxLzA0LzEwOTkxM2wucG5n", //Adres okładki zakodowany pzy pomocy base64
        "title": "Hetalia World★Stars 01 PL", //Tytuł odcinku
        "series_id": "hetalia-world%e2%98%85stars", //ID Serii w serwisie
        "episode_id": "1", //ID odcinka w serwisie
        "provider": "ao", //Z jakiego serwisu pochodzi wynik
        "type": "episode" //Typ elementu. series lub episode
      } 
    ]
  }
]
```

## Informacja
``type:series`` występuje tylko w przypadku serwisu desu-online.pl

Proxy dla okładek

**URL** : `/proxy/:base64`

**Metoda** : `GET`

## Udane zapytanie

**Code** : `200 OK`

**Przykład zapytania i odpowiedzi**

`/proxy//aHR0cHM6Ly9zaGluZGVuLnBsL3Jlcy9pbWFnZXMvZ2VudWluZS8zMDQwNzcuanBn`

Zwraca okładke