import { Router, listen } from 'worktop'
import * as Cache from 'worktop/cache'
import * as CORS from 'worktop/cors' 

import {desuSeries, desuLinks, desuUpdate} from './modules/desu/index'
import {aoSeries, aoLinks} from './modules/ao/index'
import {shindenSeries, shindenGetLinkList, shindenGetPlayer} from './modules/shinden/index'
import {bundleFunctions} from './modules/bundle/index'

const API = new Router();


API.prepare = CORS.preflight({
    //origin:['localhost:3000', 'onlajny.pages.dev']
})

/////////////////////////////////////////////////////////////////////////////////
API.add('GET', '/v1/update', async (req, res) => {
    const w = (await UPDATE.get('data', {type: "json"})).items
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.end(JSON.stringify(w, null, 2));
});

API.add('GET', '/v1/search', async (req, res) => {
    const SEARCH = req.query.get('s')
    const w = await bundleFunctions.bundleSearch(SEARCH, req)
	res.end(JSON.stringify(w,null,2));
});


API.add('GET', '/v1/proxy/:base', async (req, res) => {
    const p = new URL((decodeURIComponent(escape(atob(req.params.base)))))
    if(p.hostname !== `frixysubs.pl` && p.hostname !== 'desu-online.pl' && p.hostname !== 'anime-odcinki.pl' && p.hostname !== 'cdn.shinden.eu' && p.hostname !== 'shinden.pl'){
        res.send(500, "Internal Error")
        return;
    }
    const myHeader = new Headers()
    myHeader.set('referer', p.origin + "/")
    myHeader.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36')
    const imageRequest = new Request(p.toString(), {
        headers: myHeader
    })
    return fetch(imageRequest)
})

/////////////////////////////////////////////////////////////////////////////////
API.add('GET', '/v1/series/desu/:series_id', async (req, res) => {
    const SERIES_ID = req.params.series_id
    const w = await desuSeries(SERIES_ID)
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify(w, null, 2))
})

API.add('GET', '/v1/episode/desu/:episode_id', async (req, res) => {
    const EPISODE_ID = req.params.episode_id
    const w = await desuLinks(EPISODE_ID)
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify(w, null, 2))
})


/////////////////////////////////////////////////////////////////////////////////
API.add('GET', '/v1/series/ao/:series_id', async (req, res) => {
    const SERIES_ID  = req.params.series_id
    const w = await aoSeries(SERIES_ID)
    res.setHeader('Cache-Control', 'public, max-age=300');
    //return fetch("https://api.ipify.org")
    //res.end(w)
    res.end(JSON.stringify(w, null, 2))
})

API.add('GET', '/v1/episode/ao/:series_id/:episode_id', async (req, res) => {
    const SERIES_ID = req.params.series_id
    const EPISODE_ID = req.params.episode_id
    const w = await aoLinks(SERIES_ID, EPISODE_ID)
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify(w, null, 2))
})


/////////////////////////////////////////////////////////////////////////////////

//SERIES
API.add('GET', '/v1/series/shinden/:endpoint/:series_id', async (req, res) => {
    const SERIES_ID  = req.params.series_id
    const ENDPOINT = req.params.endpoint
    if(ENDPOINT !== 'series' && ENDPOINT !== 'titles'){
        res.send(404, 'Not Found')
    } else {
        const COOKIE = JSON.parse(await SHINDEN.get('data')).cookie
        const w = await shindenSeries(COOKIE, SERIES_ID, ENDPOINT)
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.end(JSON.stringify(w, null, 2))
    }
})

//EPISODE https://shinden.pl/ENDPOINT/SERIES_ID/view/EPISODE_ID
API.add('GET', '/v1/episode/shinden/:endpoint/:series_id/:episode_id', async (req, res) => {
    const SERIES_ID  = req.params.series_id
    const EPISODE_ID  = req.params.episode_id
    const ENDPOINT = req.params.endpoint
    if(ENDPOINT !== 'episode' && ENDPOINT !== 'epek'){
        res.send(404, 'Not Found')
    } else {
        const COOKIE = JSON.parse(await SHINDEN.get('data')).cookie
        const w = await shindenGetLinkList(COOKIE, SERIES_ID, EPISODE_ID, ENDPOINT)
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.end(JSON.stringify(w, null, 2))
    }
})

API.add('GET', '/v1/player/shinden/:online_id', async (req, res) => {
    const ONLINE_ID  = req.params.online_id
    const DATA = JSON.parse(await SHINDEN.get('data'))
    const w = await shindenGetPlayer(ONLINE_ID, DATA)
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(w)
})


/////////////////////////////////////////////////////////////////////////////////
//Frixy

API.add('GET', '/v1/series/frixysubs/:id', async (req, res) => {
    const ID = req.params.id
    //https://frixysubs.pl/api/v1/getEpisodes.php?id=74
    const r = await fetch(`https://frixysubs.pl/api/v1/getEpisodes.php?id=${ID}`)
    const d = await r.json()
    const items = d.episodes.map((x, idx) => {
        return {
            "number":idx+1,
            "episode_id":x.episodeId,
            "title":x.title.replace(/&oacute;/gi, 'ó')
        }
    })
    const info = {
        "title":d.series.title.replace(/&oacute;/gi, 'ó'),
        "cover":btoa("https://frixysubs.pl/images/series/" + d.series.image),
        "desc":d.series.optionalDesc.replace(/&oacute;/gi, 'ó'),
        "series_id":ID,
        "items":items
    }
    res.end(JSON.stringify(info))
})

API.add('GET', '/v1/episode/frixysubs/:id', async (req, res) => {
    const ID = req.params.id
    //https://frixysubs.pl/api/v1/getEpisodes.php?id=74
    const r = await fetch(`https://frixysubs.pl/api/v1/getAnimeSpecific.php?id=${ID}`)
    const d = await r.json()

    const info = {
        "series_title":d.seriesTitle,
        "episode_title":d.episode.title.replace(/&oacute;/gi, 'ó'),
        "episode":d.episode.episode,
        "series_id":d.episode.toSeriesId,
        "prev": d.episode.pervEpisode ? {"episode_id" : d.episode.pervEpisode} : null,
        "next": d.episode.nextEpisode ? {"episode_id" : d.episode.nextEpisode} : null,
        "translator" : "FrixySubs",
        "items":Object.keys(d.episode).map((x) => {
            if (d.episode[x] != "" && (x === 'cda' || x === 'dailymotion' || x === 'mega' || x === 'googledrive' || x === 'okru')) {
                return {
                    "name":x,
                    "url":providers[x](d.episode[x])
                }
            }
        }).filter(Boolean)
    }

    
    res.end(JSON.stringify(info))
})

listen(API.run)

const providers = {
    "cda":(id) => `https://ebd.cda.pl/700x440/${id}`,
    "dailymotion":(id) => `https://www.dailymotion.com/embed/video/${id}`,
    "mega": (id) => `https://mega.nz/embed/${id}`,
    "googledrive": (id) => `https://drive.google.com/file/d/${id}/preview`,
    "okru":(id) => `//ok.ru/videoembed/${id}`
}

// fetch("https://shinden.pl/api/title/search?query=Horimiy", {
// "headers": {
//   "accept": "application/json, text/javascript, */*; q=0.01",
//   "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
//   "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
//   "sec-ch-ua-mobile": "?0",
//   "sec-fetch-dest": "empty",
//   "sec-fetch-mode": "cors",
//   "sec-fetch-site": "same-origin",
//   "x-requested-with": "XMLHttpRequest",
//   "cookie": "__cfduid=dc62fdf52b4b463c66af628d6d846f0681616807350; spfp=a4820c35fcc0bb4601a4de82ed3ffe90; cb-rodo=accepted; _ga=GA1.2.1111039884.1616807659; euconsent-v2=CPDsUUvPDsUU9A9ACBPLBRCsAP_AAH_AAB5YHmNf_X__b39j-_59_9t0eY1f9_7_v-0zjhfds-8N2f_X_L8X42M7vF36pq4KuR4Eu3LBIQFlHOHUTUmw6okVrTPsak2Mr7NKJ7LEinMbe2dYGHtfn91TuZKYr_7s_9_z__-__v__79f_r-3_3_vp9X---_e_V399xLv9QPKAJMNS-AizEscCSaNKoUQIQriQ6AUAFFCMLRNYQMrgp2VwEeoIGACA1ARgRAgxBRiwCAAACAJKIgJADwQCIAiAQAAgBUgIQAETAILACwMAgAFANCxAigCECQgyOCo5TAgIkWignkrAEou9jDCEMosAKBR_RUYCJQggWAAA; _pbjs_userid_consent_data=8284758915229247; _pubcid=07b2094b-0a41-480e-9a6f-80a219900f22; cto_bidid=T6W1DF85MnpVNU52UWQyVkRIQ3pOTmZXNVdCVFpzWjZEU09vR3dSU3BVNDJoSWdRcDFhdXhaTllJa3BpZ2s2dkdaNkhBY1RCQmdMY1RRS3ZEc1olMkJodVdBc3pUcXlObWIwY1pMNCUyQnVXRWt4WDYlMkJjMEY4ZXdOZlJYTHZmMGk5c00lMkZjWUZW; cto_bundle=I42aRl8wNHZGNXF3WGlMQmtCTmJJbGl6cmJWakk2cFM2JTJGb2pMeHBDJTJCNWtwYjNDa1VqbkREQ1J2cU1YS0N0Wkh1aFRFVEYlMkJKbGNOUTBScExWQlhMRHVUNlVqejFBaklNcWR2eWcxWklxdGwwRzZhVnM1V0VETWF6bmNhNU9EQm5kdjhFTkpRUkl0eDd2ek81NVZPN3pNY1JUVGZ2TXFIQ1RkZUx1elhBZGJuTk1hSnMlM0Q; sess_shinden=j26p888r2vsq916mpcoqps9rt8"
// },
// "referrer": "https://shinden.pl/main",
// "referrerPolicy": "no-referrer-when-downgrade",
// "body": null,
// "method": "GET",
// "mode": "cors"
//);
