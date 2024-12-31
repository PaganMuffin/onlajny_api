const DOMAIN = {
    desu: "desu-online.pl",
    shinden: "shinden.pl",
    ao:"anime-odcinki.pl",
    frixy:"frixysubs.pl"
}


export const bundleFunctions = {
    bundleSearch: async (search, req) => {
        let [resFrixy, resDesu, resAO, resShinden] = await Promise.all([FrixyFunctions.FrixySearch(search), desuFunctions.desuSearch(search), aoFunctions.aoSearch(search), shindenFunctions.shindenSearch(search, req)])
        const obj = [
            {
                'provider':'shinden.pl',
                'items':resShinden.slice(0,10),
            },
            {
                'provider':DOMAIN.desu,
                'items':resDesu.slice(0,10)
            },
            {
                'provider':DOMAIN.frixy,
                'items':resFrixy.slice(0,10)
            }
            //{
            //    'provider':'anime-odcinki.pl',
            //    'items':resAO.slice(0,10)
            //},
        ]
        return obj
    },
    bundleUpdate: async () => {
        const [resShinden, resDesu, resAO] = await Promise.all([shindenFunctions.shindenUpdate() ,desuFunctions.desuUpdate(), aoFunctions.aoUpdate()])
        const obj = [
            {
                'provider':DOMAIN.shinden,
                'items':resShinden
            },
            {
                'provider':DOMAIN.desu,
                'items':resDesu
            },
            //{
            //    'provider':'anime-odcinki.pl',
            //    'items':resAO
            //}
        ]
        return obj
    }
}

const desuFunctions = {
    desuSearch: async (search) => {
        const form = new FormData
        form.append("action", "ts_ac_do_search");
        form.append("ts_ac_query", search);
        const config = {
            method:"POST",
            body:form,
        }
        const res = await fetch(`https://${DOMAIN.desu}/wp-admin/admin-ajax.php`, config)
        if(res.status !== 200) return []
        let json = await res.json()
        json = json.anime[0].all.map(x => {
            const f = x.post_link.split('/')
            f.pop()
            return {
            'series_id':f.pop(),
            'title':x.post_title,
            'provider':'desu'
            }
        })
        return json
    },
    desuUpdate: async () => {
        let items = []
        const res = await fetch(`https://${DOMAIN.desu}`)
        if(res.status !== 200) return []
        const body = await new HTMLRewriter()
        //document.querySelector("#content > div > div.postbody > div:nth-child(3) > div.listupd.normal > div.excstf > article:nth-child(1) > div > div.thumb > a > img")
        .on("#content > div > div.postbody > div:nth-child(3) > div.listupd.normal > div.excstf > article > div > div.thumb > a", new desuClass.getUpdateLinkTitle(items))
        .on("#content > div > div.postbody > div:nth-child(3) > div.listupd.normal > div.excstf > article > div > div.thumb > a > img", new desuClass.getUpdateCover(items))
            .transform(res)
            .text()
    
        return items.slice(0,10)
    }
}

const FrixyFunctions = {
    FrixySearch: async (search) => {
        const r = await fetch('https://frixysubs.pl/api/v1/getAnimes.php')
        const d = await r.json()
        const info = d.animes.map(x => {
            if(x.video){
                return {
                    "episode_id":x.seriesId,
                    "title":x.title,
                    "provider":"frixysubs"
                }
            } else {
                return {
                    "series_id":x.seriesId,
                    "title":x.title,
                    "provider":"frixysubs"
                }
            }
        })
        return info.filter(x => x.title.toLowerCase().includes(search.toLowerCase()))
    }
}

const aoFunctions = {
    aoSearch: async (search) => {
        const form = new FormData
        form.append("action", "ajaxsearchlite_search");
        form.append("aslp", search);
        form.append("asid", "1");
        form.append("options", "qtranslate_lang=0&asl_gen%5B%5D=title&asl_gen%5B%5D=content&asl_gen%5B%5D=excerpt&customset%5B%5D=anime");
        const config = {
            method:"POST",
            body:form,
        }
        const res = await fetch(`https://${DOMAIN.ao}/wp-admin/admin-ajax.php`, config)
        if(res.status !== 200) return []
        let arr = []
        const body = await new HTMLRewriter()
            .on('h3 > a.asl_res_url', new aoClass.getSearchTitleUrl(arr))
            .transform(res)
            .text()
    
        return arr
    },
    aoUpdate: async () => {
        let items = []
        const res = await fetch(`https://${DOMAIN.ao}/`)
        if(res.status !== 200) return []
        const body = await new HTMLRewriter()
            .on('section#block-views-new-emitowane-block:first-of-type > div.owl-wrapper > div.owl-container > div#issued-ep > div.owl-item > div.owl-item-inner.clearfix > a', new aoClass.getUpdateTitleUrl(items))
            .on('section#block-views-new-emitowane-block:first-of-type > div.owl-wrapper > div.owl-container > div#issued-ep > div.owl-item > div.owl-item-inner.clearfix > img', new aoClass.getUpdateCover(items))
            .transform(res)
            .text()
    
        return items.slice(0,10)
    }
}
const shindenFunctions = {
    shindenSearch: async (search, req) => {
        const request = shindenFunctions.genRequest(req)
        const ff = await fetch("https://shinden.pl/api/title/search?query="+search, request)
        if(ff.status === 200){
            const dd = await ff.json()
            const res = dd.map(x => {
                if(x.type === "Anime"){
                    //console.log(x)
                    return {
                        'series_id':x.title_id,
                        'title':x.title,
                        //'url':x.title_url,
                        'endpoint':new URL(x.title_url,).pathname.split("/")[1],
                        'provider':'shinden'
                    }
                }
            })

            return  res.filter(Boolean);
        } else {
            return []
        }
    },
    shindenUpdate: async () => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "ODM5NTQ5MTc3OTE0NTg5MTk3.YJLSYg.lKvc19aUv8gLvaSFgpNejG-PxOk");
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
        };

        const r = await fetch("https://discord.com/api/v9/channels/427284898873606146/messages?limit=50", requestOptions)
        let j = await r.json()
        j = j.map(x => {
            const z = new URL(x.embeds[0].author.url).pathname.split("/")
            if(x.content == "<@&434247198407131136>")
                return {
                    "title":x.embeds[0].title + " " + x.embeds[0].author.name,
                    "series_id":z[2].split("-")[0],
                    "episode_id": z.pop(),
                    "endpoint":z[1],
                    "type": "episode",
                    "cover": btoa(x.embeds[0].thumbnail.url),
                    "provider": "shinden"
                }
        })
        return j.slice(0,10)
    },
    genRequest: (req) => {
        console.log(req)
        const gg = new Request(req.url)
        gg.headers.set('accept', 'application/json, text/javascript, */*; q=0.01')
        gg.headers.set('cookie', '__cfduid=d26374078b98c723724e7b0092a7d47581615158234;')
        gg.headers.set('referer','https://shinden.pl')
        gg.headers.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36')
        gg.headers.set('accept-language', 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7')
        return gg
    }
}
  //CLASS SECTIONS

//animedesu fucntions
const desuClass = {
    getUpdateCover: class{
        constructor(arr){
            this.arr = arr
            this.arrIndex = 0
            this.buffer = ""
            this.url = ""
        }
        element(element){
          const link = element.getAttribute('src')
          if(!this.arr[this.arrIndex]){
            this.arr[this.arrIndex] = {}
          }
          const obj = {
            'cover': btoa(unescape(encodeURIComponent(link))),
            'provider':'desu'
          }
          this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
          this.arrIndex++
          this.buffer = ''
        }
    },
    getUpdateLinkTitle: class{
        constructor(arr, name){
            this.arr = arr
            this.name = name
            this.arrIndex = 0
            this.buffer = ""
            this.url = ""
          }
          element(element){
            let link = element.getAttribute('href')
            let title = element.getAttribute('title')
            
            if(!this.arr[this.arrIndex]){
              this.arr[this.arrIndex] = {}
            }
            const isSeries = new URL(link).pathname.split("/")[1] === 'anime'
            link = link.split('/')
            link.pop()
            link = link.pop()
            link = link.split("-")
            let num = link.pop()
            //console.log(link.join("-")+"-"+num)
            let obj = null
            if(isSeries){
                obj = {
                  'title': utilities.replaceHTMLEntity(title),
                  'series_id':  new URL(element.getAttribute('href')).pathname.split('/')[2],
                  'type': isSeries ? 'series' : 'episode'
                }

            } else {
                obj = {
                    'title': utilities.replaceHTMLEntity(title),
                    'episode_id':  new URL(element.getAttribute('href')).pathname.split('/')[1],
                    'type': isSeries ? 'series' : 'episode'
                }
            }
            this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
            this.arrIndex++
            this.buffer = ''
          }
    }
}

//anime-odcinki fucntions
const aoClass = {
  getSearchTitleUrl: class {
    constructor(arr){
        this.arr = arr
        this.arrIndex = 0
        this.buffer = ''
        this.id = ''
    }
    element(element){
        this.id = element.getAttribute('href').split('/').pop()
    }
  
    text(text){
        this.buffer += text.text
        if(text.lastInTextNode){
            this.buffer = this.buffer.replace('\n', "").trim()
            if(this.buffer){
                this.setAll()
            }
        }
    }
    setAll(){
        if(!this.arr[this.arrIndex]){
            this.arr[this.arrIndex] = {}
        }
        this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], {
            'series_id':this.id,
            'title':this.buffer,
            'provider':'ao',
        })
        this.arrIndex++
        this.buffer = ''
    }
  },
  getUpdateTitleUrl: class {
    constructor(arr){
        this.arr = arr
        this.buffer = ''
        this.arrIndex = 0
        this.url = ''
    }
    text(text){
        this.buffer += text.text
        if(text.lastInTextNode){
            this.getAll()
        }
    }
    element(element){
        this.url = element.getAttribute('href')
    }
    getAll(){
        if(!this.arr[this.arrIndex]){
            this.arr[this.arrIndex] = {}
        }
        this.url = this.url.split('/')
        let num = this.url.pop()
        let slug = this.url.pop()
        this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], {
            'title':utilities.replaceHTMLEntity(this.buffer),
            'series_id':`${slug}`,
            'episode_id':num,
            'provider':'ao',
            'type':'episode'
        })
        this.arrIndex++
        this.buffer = ''
        this.url = ''
    }
  },
  getUpdateCover: class {
    constructor(arr){
        this.arr = arr
        this.buffer = ''
        this.arrIndex = 0
        this.url = ''
    }
    element(element){
        if(!this.arr[this.arrIndex]){
            this.arr[this.arrIndex] = {}
        }
        this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], {
            'cover':btoa(unescape(encodeURIComponent((element.getAttribute('src').replace('-200x200', ''))))),
        })
        this.arrIndex++
    }
  }
}



//shinden fucntions
const shindenClass = {

}


const utilities = {
  replaceHTMLEntity: (str) => {
    return str
      .replace(/&#8230;/gi,`...`)
      .replace(/&#8222;/gi,`"`)
      .replace(/&#8221;/gi,`"`)
      .replace(/&#8226;/gi,`•`)
      .replace(/&#8212;/gi,`-`)
      .replace(/&#8211;/gi,`-`)
      .replace(/&#038;/gi,`&`)
      .replace(/&#8217;/gi,`'`)
  }
}