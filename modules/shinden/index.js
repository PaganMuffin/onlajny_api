const DOMAIN = 'shinden.pl'


//Funkcje

export const shindenSeries = async (cookie, series_id, endpoint) => {
    var myHeaders = new Headers();
    myHeaders.set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
    myHeaders.set("accept-language", "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7");
    myHeaders.set("cache-control", "no-cache");
    myHeaders.set("pragma", "no-cache");
    myHeaders.set("sec-fetch-dest", "document");
    myHeaders.set("sec-fetch-mode", "navigate");
    myHeaders.set("sec-fetch-site", "none");
    myHeaders.set("sec-fetch-user", "?1");
    myHeaders.set("upgrade-insecure-requests", "1");
    myHeaders.set("Cookie", cookie + " __cfduid=CHUJ_WAM_W_DUPĘ;");
    myHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36");
  
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };
  
    const urlItems = `https://${DOMAIN}/${endpoint}/${series_id}/episodes`
    const urlInfo =  `https://${DOMAIN}/${endpoint}/${series_id}`
    const [responseItems, responseInfo] = await Promise.all([fetch(urlItems,requestOptions), fetch(urlInfo,requestOptions)])
    let info = {}
    let items = []
    
    const body2 = await new HTMLRewriter()
      .on(".page-title", new getText(info,"title"))
      .on("div#description > p", new getText(info,"desc"))
      .on("section.title-cover > a", new getCover(info,"cover"))
      //.on(`section.title-small-info > dl > dd:nth-child(10)`, new getText(info,"episodes"))
      .transform(responseInfo)
      .text()

    const body = await new HTMLRewriter()
      .on("tbody.list-episode-checkboxes > tr > td:nth-child(1)", new getNumber(items,"number")) //tekst
      .on("tbody.list-episode-checkboxes > tr > td:nth-child(2)", new getNumber(items,"title")) //tekst
      .on("tbody.list-episode-checkboxes > tr > td:nth-child(3) > i", new getItems(items,"isOn")) //sprawdzenie klasy
      .on("tbody.list-episode-checkboxes > tr > td.button-group > a", new getItems(items,"episode_id")) //element
      .transform(responseItems)
      .text()
      console.log(items)
    items = items.filter((x) =>{
        if(x.isOn === true && x.episode_id){
            delete x.isOn
            x.title = x.title ? x.title : null
            return x
        }
    })
    info['series_id'] = series_id
    console.log(items)
    info['items'] = items.reverse()
  
    //const parse = await response.text()
    return info
}

export const shindenGetLinkList = async (cookie, series_id, episode_id, endpoint) => {
    const url = `https://shinden.pl/${endpoint}/${series_id}/view/${episode_id}`
    //const ee = await shindenSession(request)
    // Sesja zalogowana jr4f8h04dubtoncmf4hpajemtd JUSTDOIT987
    // http://bugmenot.com/view/shinden.pl
    var myHeaders = new Headers();
    myHeaders.set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
    myHeaders.set("accept-language", "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7");
    myHeaders.set("cache-control", "no-cache");
    myHeaders.set("pragma", "no-cache");
    myHeaders.set("sec-fetch-dest", "document");
    myHeaders.set("sec-fetch-mode", "navigate");
    myHeaders.set("sec-fetch-site", "none");
    myHeaders.set("sec-fetch-user", "?1");
    myHeaders.set("upgrade-insecure-requests", "1");
    myHeaders.set("Cookie", cookie + " __cfduid=CHUJ_WAM_W_DUPĘ;");
    myHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36");
  
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };
  
    const response = await fetch(url, requestOptions)
    let seriesTitle = new getOnlyText()
    let episodeTitle = new getOnlyText()
    let next = new getOnlyHref()
    let prev = new getOnlyHref()
    let series_url = new getOnlyHref()
    let items = []
    const body = await new HTMLRewriter()
      //.on("td.ep-pl-name", new getLinkList(items,"hosting"))
      //.on("td.ep-pl-res > span", new getLinkList(items,"res"))
      //.on("td.ep-pl-alang > span.mobile-hidden", new getLinkList(items,"alang"))
      //.on("td.ep-pl-slang > span.mobile-hidden", new getLinkList(items,"slang"))
      //.on("td.ep-online-added", new getLinkList(items,"data"))
      //.on("td.ep-pl-slang", new getLinkList(items,"slang"))
      .on(`body > div.l-global-width.l-container-primary > div > h2`, episodeTitle)
      .on(`body > div.l-global-width.l-container-primary > div > h1 > a`, seriesTitle)
      .on(`body > div.l-global-width.l-container-primary > div > h2 > div > a[title="Następny epizod"]`, next)
      .on(`body > div.l-global-width.l-container-primary > div > h2 > div > a[title="Poprzedni epizod"]`, prev)
      .on(`body > div.l-global-width.l-container-primary > div > h1 > a`, series_url)
      .on("td.ep-pl-res > span", new getLinkListGroup(items,"group"))
      .on("td.ep-buttons > a", new getLinkListGroup(items,"info"))
      .transform(response)
      .text()
  
    const res2 = new Response(body)
    let base = await res2.text()
    base = base.split(`_Storage.basic =  '`)[1].split(`';`)[0]
  
      const rr = items.map((x) => {
          let h = x.info
          delete h.username
          delete h.user_id
          h['group'] = x.group
          return h
      })
  
      //console.log(episodeTitle.buffer.split('\n').pop().trim())
    return {
        'series_title': seriesTitle.buffer,
        'episode_title': episodeTitle.buffer.split('\n').pop().trim(),
        'series_id': (series_url.buffer).split("/")[2].split("-")[0],
        'series_endpoint': (series_url.buffer).split("/")[1],
        'prev': prev.buffer ? {
            endpoint:prev.buffer.split("/")[1],
            series_id:prev.buffer.split("/")[2].split("-")[0],
            episode_id:prev.buffer.split("/")[4]
        } : null ,
        'next': next.buffer ? {
            endpoint:next.buffer.split("/")[1],
            series_id:next.buffer.split("/")[2].split("-")[0],
            episode_id:next.buffer.split("/")[4]
        } : null,
        'items': rr
    }
  
  }



export const shindenGetPlayer = async (online_id, data) => {
    const req = await fetch(`https://api4.${DOMAIN}/xhr/${online_id}/player_load?auth=${data.base}`, {
      "headers": {
          "accept": "*/*",
          "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "cookie": data.cookie  + " __cfduid=CHUJ_WAM_W_DUPĘ;",
          "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
      },
      "origin":"https://"+DOMAIN,
      "method": "GET",
      });
  
    for (var pair of req.headers.entries()) {
        console.log()
    }
    let api_shinden = "s%3AwKEdLI7Y-_XtBiZUJjVZtATaQAP1Kq9u.dARq%2Fc1zb9x6%2Fm17Uubjnrs0kedbRScc5323oeXqkhk";
    try{
      api_shinden = req.headers.get('set-cookie').split("api.shinden=")[1].split(';')[0]
    } catch(e){
      
    }
  
    const req_text = parseInt(await req.text())
    const timer = req_text * 0x3e8 + 0xc8
  
    await new Promise(r => setTimeout(r, timer));
    const req2 = await fetch(`https://api4.${DOMAIN}/xhr/${online_id}/player_show?auth=${data.base}&width=746&height=-1`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": `api.shinden=${api_shinden}; ${data.cookie}  + " __cfduid=CHUJ_WAM_W_DUPĘ;"`
      },
      "body": null,
      "method": "GET",
    });
  
    const adsa = await req2.text()
    return adsa.split(`src="`)[1].split(`"`)[0]
}


//Klasy

class getLinkListGroup {
    constructor(arr,name){
        this.arr = arr
        this.name = name
        this.arrIndex = 0
    }
    element(element){
        if(this.name == 'group'){
            if(!this.arr[this.arrIndex]){
                this.arr[this.arrIndex] = {}
            }
            const obj = new Object();
            //obj[this.name] =  `https://shinden.pl` + element.getAttribute('href')
            obj[this.name] = element.getAttribute('title') !== "unknown" ? element.getAttribute('title') : null
            this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
            this.buffer = ''
            this.arrIndex++
        } else if (this.name == 'info') {
            if(!this.arr[this.arrIndex]){
            this.arr[this.arrIndex] = {}
            }
            const obj = new Object();
            //obj[this.name] =  `https://shinden.pl` + element.getAttribute('href')
            obj[this.name] = JSON.parse(element.getAttribute('data-episode'))
            this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
            this.buffer = ''
            this.arrIndex++
        } else if(this.name == 'url') {
            const obj = new Object();
            console.log(element.getAttribute('src'))
            obj[this.name] = element.getAttribute('src')
            this.arr = obj
        }
    }
  }

class getOnlyText {
    constructor(arr, name){
        this.buffer = ''
    }
   text(text){
       this.buffer += text.text
   }
}

class getOnlyHref {
   element(element){
       this.buffer = element.getAttribute('href')
   }
}

class getNumber {
    constructor(arr, name){
      this.arr = arr
      this.name = name
      this.c = -1
      this.buffer = ''
    }
    text(text){
        this.buffer += text.text
        if(text.lastInTextNode){
            if(!this.arr[this.c]){
                this.arr[this.c] = {}
            }
            const obj = new Object();
            //obj[this.name] =  `https://shinden.pl` + element.getAttribute('href')
            obj[this.name] = this.buffer
            this.arr[this.c] = Object.assign(this.arr[this.c], obj)
            this.buffer = ''
        }
    }
    element(e){
        this.c++
    }
}

class getItems {
    constructor(arr,name){
        this.arr = arr
        this.name = name
        this.arrIndex = 0
        this.buffer = ''
    }
    text(text){
        if(this.name === 'title'){
            //console.log(text, this.arrIndex)
            this.buffer += text.text
            if(text.lastInTextNode){
                if(!this.arr[this.arrIndex]){
                    this.arr[this.arrIndex] = {}
                }
                const obj = new Object();
                obj[this.name] = this.name === "number" ? parseInt(this.buffer) : this.buffer
                this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
                //console.log(this.buffer)
                this.buffer = ''
                this.arrIndex++
            }
        }
    }
    element(element){
        if(this.name === 'isOn'){
            if(!this.arr[this.arrIndex]){
                this.arr[this.arrIndex] = {}
            }
            const obj = new Object();
            //console.log(element.getAttribute('class').includes('fa-check'))
            obj[this.name] = element.getAttribute('class').includes('fa-check') ? true : false
            this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
            this.buffer = ''
            this.arrIndex++
        }
        if(this.name == 'episode_id'){
            if(!this.arr[this.arrIndex]){
                this.arr[this.arrIndex] = {}
            }
            const obj = new Object();
            const obj2 = new Object();
            //obj[this.name] =  `https://shinden.pl` + element.getAttribute('href')
            obj[this.name] = element.getAttribute('href').split('/').pop()
            obj['endpoint'] = element.getAttribute('href').split('/')[1]
            this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
            this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj2)
            this.buffer = ''
            this.arrIndex++
        }
    }
}

class getText {
    constructor(info,name){
        this.info = info
        this.buffer = ''
        this.name = name
    }
    text(text){
        this.buffer += text.text
        if(text.lastInTextNode){
            if(this.buffer.replace("Anime: ","").trim()){
                this.info[this.name] = this.buffer.replace("Anime: ","").trim()
                this.buffer = ''
            }
        }
    }
}

class getCover {
    constructor(info,name){
        this.info = info
        this.name = name
    }
    element(element){
        this.info[this.name] =  btoa(unescape(encodeURIComponent((`https://shinden.pl` + element.getAttribute('href')))))
    }
}