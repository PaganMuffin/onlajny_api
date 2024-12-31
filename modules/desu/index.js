

const DOMAIN = "desu-online.pl"

//FUNKCJE
export const desuUpdate = async () => {
    let items = []
    const res = await fetch(`https://${DOMAIN}`)
    const body = await new HTMLRewriter()
        .on("#content > div > div.postbody > div:nth-child(3) > div.listupd.normal > div.excstf > article > div > div.thumb > a", new getUpdateLinkTitle(items))
        .on("#content > div > div.postbody > div:nth-child(3) > div.listupd.normal > div.excstf > article > div > div.thumb > a > img", new getUpdateCover(items))
        .transform(res)
        .text()

    //console.log(await res.text());
    return items
}

export const desuLinks = async (slug) => {
    const res = await fetch(`https://${DOMAIN}/${slug}/`)
    let info = {}
    let items = []
    let next = new getOnlyHref()
    let prev = new getOnlyHref()
    let series_id = new getOnlyHref() 
    let translator = new getOnlyText()
    const body = await new HTMLRewriter() //episodeTitle, seriesTitle, number
        .on("div.entry-content > div.bixbox.mctn > p", translator ) //Tlumacz
        .on('div.megavid > div > div.item.meta > div.lm > meta[itemprop=episodeNumber]', new getNumber(info,'episode'))
        .on('h1.entry-title', new getText(info,'episode_title'))
        .on('div.ts-breadcrumb.bixbox > ol > li:nth-child(2) > a > span', new getText(info,'series_title'))
        .on('div.megavid > div > div.item.meta > div.lm > span.year > a', series_id)
        .on('div.item.video-nav > div > select > option', new getEpLinks(items,'ep'))
        .on('div.nvs > a[rel="next"]', next)
        .on('div.nvs > a[rel="prev"]', prev)
        .transform(res)
        .text()

    
    info['series_id'] = new URL(series_id.buffer).pathname.split('/')[2]
    info['next'] = next.buffer ?{
        series_id: null,
        episode_id: new URL(next.buffer).pathname.split('/')[1]
    } : null
    info['prev'] = prev.buffer ? {
        series_id: null,
        episode_id: new URL(prev.buffer).pathname.split('/')[1]
    } : null
    info['translator'] = translator.buffer
    info['items'] = items
    return info
}

export const desuSearch = async (search, cook) => {
    const form = new FormData
    form.append("action", "ts_ac_do_search");
    form.append("ts_ac_query", search);
    const config = {
        method:"POST",
        headers:{
        'Cookie':`__cfduid=${cook}`
        },
        body:form,
    }
    const res = await fetch(`https://${DOMAIN}/wp-admin/admin-ajax.php`, config)
    let json = await res.json()
    console.log(json)
    json = json.anime[0].all.map(x => {
        const f = x.post_link.split('/')
        f.pop()
        return {
        'id':f.pop(),
        'title':x.post_title,
        'provider':'desu'
        }
    })

    return json
}


export const desuSeries = async (slug) => {
    const res = await fetch(`https://${DOMAIN}/anime/${slug}/`)
    let info = {}
    let items = []
    const b = await new HTMLRewriter()
        .on('div.entry-content > p > br', new rep())
        .transform(res)
        .text()

    const res2 = new Response(b)
    const body = await new HTMLRewriter()
        .on('h1.entry-title', new getText(info,'title'))
        .on('div.entry-content > p', new getText(info,'desc'))
        .on('div.bixbox.animefull > div.bigcontent > div.thumbook > div.thumb > img', new getCover(info,'cover'))
        .on('div.eplister > ul > li > a', new getLinks(items,'slug'))
        .on('div.eplister > ul > li > a > div.epl-num', new getLinks(items,'number'))
        .on('div.eplister > ul > li > a > div.epl-title', new getLinks(items,'title'))
        //.on('div.megavid > div > div.item.meta > div.lm > span.year > a', new getLinks(items,'series_id'))
        .transform(res2)
        .text()
    //const h = await res2.text()
    items = items.sort((a, b) => parseFloat(a.number) - parseFloat(b.number))
    info['items'] = items
    return info
}
//KLASY

class getOnlyText {
    constructor(){
        this.buffer = ''
    }
    text(text){
        this.buffer += text.text
        if(text.lastInTextNode){
            console.log(this.buffer)
        }
    }
}

class getOnlyHref {
    element(element){
        this.buffer = element.getAttribute('href')
    }
}


class getUpdateCover{
    constructor(arr){
        this.arr = arr
        this.arrIndex = 0
        this.buffer = ""
        this.url = ""
    }
    element(element){
        if(!this.arr[this.arrIndex]){
            this.arr[this.arrIndex] = {}
        }
        const obj = {
            'cover':  btoa(unescape(encodeURIComponent((element.getAttribute('src'))))),
        }
        this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
        this.arrIndex++
        this.buffer = ''
    }
}

class getUpdateLinkTitle{
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
        link = link.split('/')
        link.pop()
        link = link.pop()
        link = link.split("-")
        let num = link.pop()
        const obj = {
            'title': title,
            'slug': link.join("-"),
            'ep': num
        }
        this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
        this.arrIndex++
        this.buffer = ''
    }
}

class getEpLinks{
    constructor(arr,name){
        this.arr = arr
        this.name = name
        this.arrIndex = 0
        this.buffer = ""
        this.url = ""
    }
    element(element){
        console.log(element.hasAttribute('data-index'))
        if(element.hasAttribute('data-index') && element.getAttribute('value')){
            this.url = atob(element.getAttribute('value'))
        }
    }
    text(text){
        this.buffer += text.text
        if(text.lastInTextNode){
            if(this.buffer != "Wybierz Źródło")
            this.getAll()
        }
    }
    getAll(){
        if(!this.arr[this.arrIndex]){
            this.arr[this.arrIndex] = {}
        }
        const obj = {
            'name': this.buffer.replace("Wybierz Źródło","").trim(),
            'url':this.url.split('src="')[1].split('" ')[0]
        }
        this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
        this.arrIndex++
        this.buffer = ''
    }
}

class getNumber{
    constructor(info, name){
        this.info = info
        this.name = name
    }
    element(element){
        this.info[this.name] = (element.getAttribute('content'))
    }
}

class getLinks{
    constructor(arr, name){
        this.arr = arr
        this.name = name
        this.arrIndex = 0
        this.buffer = ''
    }
    element(element){
        if(this.name === 'slug'){
            if(!this.arr[this.arrIndex]){
                this.arr[this.arrIndex] = {}
            }
            const obj = {
                'episode_id': new URL(element.getAttribute('href')).pathname.split('/')[1],
            }
            this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
            this.arrIndex++
            this.buffer = ''
        }
    }
    text(text){
        if(this.name != 'slug'){
            this.buffer += text.text
            if(text.lastInTextNode){
                if(!this.arr[this.arrIndex]){
                    this.arr[this.arrIndex] = {}
                }
                const obj = new Object();
                obj[this.name] = this.name === "number" ? parseFloat(this.buffer) : this.buffer
                this.arr[this.arrIndex] = Object.assign(this.arr[this.arrIndex], obj)
                this.arrIndex++
                this.buffer = ''
            }
        }
    }
}


class rep{
    element(el){
        el.remove("<br /> ")
        el.after("\n")
    }
}

class getCover{
    constructor(info,name){
        this.info = info
        this.name = name
        this.buffer = ''
    }
    element(element){
        this.info[this.name] = btoa(unescape(encodeURIComponent((element.getAttribute('src')))))
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
            if(!this.info[this.name]){
                this.info[this.name] = ''
            }
            this.info[this.name] += replaceHTMLEntity(this.buffer.trim().replace('\n ',"\n"))
            this.buffer = ''
        }
    }
}

const replaceHTMLEntity = (str) => {
    return str
    .replace(/&#8230;/gi,`...`)
    .replace(/&#8222;/gi,`"`)
    .replace(/&#8221;/gi,`"`)
    .replace(/&#8226;/gi,`•`)
    .replace(/&#8212;/gi,`-`)
    .replace(/&#8211;/gi,`-`)
    .replace(/&#8217;/gi,`'`)
    .replace(/&#039;/gi,`'`)


}

