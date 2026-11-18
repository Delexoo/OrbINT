/* Harvester kinds and value classifiers */

    const CP_MAX = 2 * 1024 * 1024;
    const CP_KINDS = {
        txt: 1, md: 1, json: 1, html: 1, htm: 1, csv: 1, tsv: 1, xml: 1
    };
    const CP_PLAT = {
        github: 'github', gh: 'github', gitlab: 'gitlab', bitbucket: 'bitbucket',
        discord: 'discord', dc: 'discord',
        reddit: 'reddit',
        instagram: 'instagram', ig: 'instagram', insta: 'instagram',
        steam: 'steam',
        twitter: 'x', tweet: 'x', x: 'x',
        tiktok: 'tiktok',
        facebook: 'facebook', fb: 'facebook',
        linkedin: 'linkedin',
        telegram: 'telegram', tg: 'telegram', tme: 'telegram',
        snapchat: 'snapchat', snap: 'snapchat',
        twitch: 'twitch',
        youtube: 'youtube', yt: 'youtube',
        bluesky: 'bluesky', bsky: 'bluesky',
        threads: 'threads',
        mastodon: 'mastodon',
        pinterest: 'pinterest',
        whatsapp: 'whatsapp',
        signal: 'signal',
        skype: 'skype',
        slack: 'slack',
        medium: 'medium',
        patreon: 'patreon',
        twitchtv: 'twitch',
        xbox: 'xbox',
        playstation: 'playstation', psn: 'playstation',
        roblox: 'roblox',
        kick: 'kick',
        vk: 'vk', vkontakte: 'vk',
        ok: 'ok', odnoklassniki: 'ok',
        viber: 'viber'
    };
    const CP_KIND_LABEL = {
        name: 'Name',
        alias: 'Alias',
        username: 'Username',
        email: 'Email',
        phone: 'Phone',
        password: 'Password',
        dob: 'Birthday',
        date: 'Date',
        time: 'Time',
        address: 'Location',
        id: 'ID',
        company: 'Company',
        occupation: 'Occupation',
        os: 'System',
        ip: 'IP',
        domain: 'Website',
        url: 'URL',
        crypto: 'Wallet',
        plate: 'Plate',
        vehicle: 'Vehicle',
        age: 'Age',
        timezone: 'Timezone',
        vin: 'VIN'
    };
    const CP_ORDER = [
        'name', 'alias', 'username', 'email', 'phone', 'password', 'dob', 'date', 'time',
        'address', 'id', 'company', 'occupation', 'os', 'ip', 'domain', 'url', 'crypto',
        'plate', 'vehicle', 'age', 'timezone', 'vin'
    ];
    const CP_JUNK_VAL = /^(unknown|unverified|partial|null|none|n\/a|na|maybe|weak|strong|low|medium|high|true|false|yes|no|nulls?|tbd|todo|n\/a\.?|current city|username correlation|employment not confirmed|ipv4|ipv6|scatter|true|false)$/i;
    const CP_SKIP_KEY = /^(notes?|misc|flags?|status|confidence|verified|type|types|output|record|handles|usernames|accounts|contact|observed|unresolved|random|digital|devices|identity match|location match|identity|links|ids|scratchpad|overlap|identifiers?|reason|metadata|version|begin|end|query|services|visitor|pictures?|cards?|financial|decoy|skip|comment|raw data|label|labels|caption|hint|scatter|kind|category|class|column|header|property|prop|attr|attribute|item|items|entry|entries|value|values|key|keys|field|fields)$/i;
    const CP_NOISE = /^(identity|handles?|links?|ids?|scratchpad|profile|notes?|accounts?|contact|observed|identifiers?|unresolved|digital|devices?|flags?|misc|random|confidence|output|record|people|data|info|information|section|block|online|type|value|key|field|status|browser|laptop|desktop|windows|linux|firefox|unknown|possibly|maybe|high|low|medium|flight|asn|ssid|ja3|isbn|doi|json|http|https|www|admin|root|test|user|baby|kiss|uwu|adorable|the|and|for|from|with|this|that|aliases|brother|dad|mom|sister|label|wife|husband|family)$/i;
    const CP_WEAK_HANDLE = /^(ok|jpg|png|gif|com|net|org|edu|gov|html|http|https|www|null|true|false|unknown|admin|root|test|user|guest|none|nulls?|baby|kiss|uwu|ar|l|x|skip|decoy|label|value|type)$/i;
    const CP_TYPE_LABEL = /^(android id|asset tag|cell tower|ham callsign|plus code|serial number|ssh fingerprint|wi-?fi bssid|user agent|tracking number|driver license|employee id|aircraft tail|what3words|ip address|mac address|phone number|full name|date of birth|advertising id|google ads? id|d-?u-?n-?s|pnr \/ booking|passport \(test\)|imei|imsi|idfa|uuid|mmsi|imo|doi|iban|isin|swift \/ bic)$/i;
    const CP_NAME_STOP = /\b(information|profile|section|details|notes?|employment|record|device|browser|windows|linux|house|contact|account|password|username|android|asset|serial|tower|fingerprint|callsign|bssid|ssid|imei|imsi|uuid|iban|isin|swift|booking|competitor|comp[eé]titeur|licence|license|online ids?|person record|ballot|appointments?|election|basement|officials?|resources?|occupied|absentee|only|type|user)\b/i;
    const CP_MONTH = {
        jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
        apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07',
        aug: '08', august: '08', sep: '09', sept: '09', september: '09', oct: '10',
        october: '10', nov: '11', november: '11', dec: '12', december: '12'
    };
    let cpBusy = false;
    let cpBound = false;
    let cpReveal = false;
    let cpModeThumbReady = false;
    const cpEditTimers = {};

    function harvesterState() {
        if (!data.harvester || typeof data.harvester !== 'object') {
            data.harvester = (data.compiler && typeof data.compiler === 'object')
                ? data.compiler
                : { files: [], hits: [], ready: false };
        }
        if (!Array.isArray(data.harvester.files)) data.harvester.files = [];
        if (!Array.isArray(data.harvester.hits)) data.harvester.hits = [];
        if (data.harvester.view !== 'original' && data.harvester.view !== 'stripped') {
            data.harvester.view = 'split';
        }
        const split = Number(data.harvester.split);
        data.harvester.split = isFinite(split) ? Math.min(78, Math.max(22, split)) : 50;
        return data.harvester;
    }

    function cpKind(name, type) {
        const ext = String(name || '').split('.').pop().toLowerCase();
        if (ext === 'tsv') return 'csv';
        if (ext === 'vcf' || ext === 'vcard' || ext === 'eml' || ext === 'ics' || ext === 'ldif' || ext === 'yml' || ext === 'yaml') return 'txt';
        if (CP_KINDS[ext]) return ext === 'htm' ? 'html' : ext;
        const t = String(type || '').toLowerCase();
        if (t.indexOf('json') >= 0) return 'json';
        if (t.indexOf('html') >= 0) return 'html';
        if (t.indexOf('csv') >= 0) return 'csv';
        if (t.indexOf('xml') >= 0) return 'xml';
        if (t.indexOf('markdown') >= 0) return 'md';
        return 'txt';
    }

    function cpPushHit(hits, kind, value, note, platform) {
        const v = String(value || '').trim();
        if (!v || !kind) return;
        if (v.length > 240) return;
        if (CP_JUNK_VAL.test(v)) return;
        const plat = platform ? String(platform) : '';
        if (kind === 'phone') {
            const digits = v.replace(/\D/g, '');
            hits._phone = hits._phone || {};
            const seen = Object.keys(hits._phone);
            if (seen.some(function (d) { return d === digits || d.endsWith(digits) || digits.endsWith(d); })) return;
            hits._phone[digits] = 1;
        }
        const key = kind + '\0' + v.toLowerCase() + '\0' + plat;
        if (hits._seen[key]) return;
        if (kind === 'date' && hits._seen['dob\0' + v.toLowerCase() + '\0']) return;
        if (kind === 'dob') hits._seen['date\0' + v.toLowerCase() + '\0'] = 1;
        hits._seen[key] = 1;
        const hit = { kind: kind, value: v, note: note || '' };
        if (plat) hit.platform = plat;
        hits.push(hit);
    }

    function cpNormKey(key) {
        let s = String(key || '').split(';')[0];
        s = s.replace(/\(.*?\)/g, ' ');
        s = s.replace(/^[^\p{L}\p{N}@]+/u, '');
        s = s.toLowerCase();
        s = s.replace(/[`"'*_#\[\]{}<>]/g, ' ');
        s = s.replace(/[_.\/\\-]+/g, ' ');
        s = s.replace(/[^\p{L}\p{N} ]+/gu, ' ');
        s = s.replace(/\s+/g, ' ').trim();
        s = s.replace(/\s+\d+$/, '');
        s = s.replace(/\s+(of )?(father|mother|mom|dad|brother|sister|parent|отца|мамы|маме|отцу|сестры)$/u, '');
        return s;
    }

    function cpCleanValue(value) {
        let s = String(value == null ? '' : value).trim();
        s = s.replace(/<br\s*\/?>/gi, ', ');
        s = s.replace(/<[^>]+>/g, ' ');
        s = s.replace(/[█░▓▀▄■□╔╗╚╝║╠╣═┌┐└┘│┬┴┼]/g, ' ');
        s = s.replace(/^[\s,;:.\-/|`"'*_]+/, '');
        s = s.replace(/[\s,;:`"'*_]+$/, '');
        s = s.replace(/\*\*/g, '');
        s = s.replace(/[?]+$/, '');
        if (/\.$/.test(s) && !/\d\.$/.test(s)) s = s.replace(/\.+$/, '');
        s = s.replace(/\s+\([^)]*(unverified|stale|maybe|copied|already changed|mobile|home|work|cell)[^)]*\)\s*$/i, '');
        s = s.replace(/\s{2,}/g, ' ').trim();
        if (s.length > 1 && /^["'].*["']$/.test(s)) s = s.slice(1, -1).trim();
        return s;
    }

    function cpLooksLikeTypeLabel(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (!s) return false;
        if (CP_TYPE_LABEL.test(s)) return true;
        if (CP_NAME_STOP.test(s) && s.split(' ').length <= 4) return true;
        return false;
    }

    function cpLooksLikePerson(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (s.length < 4 || s.length > 90) return false;
        if (/[@:/\\]|https?/i.test(s)) return false;
        if (/\d{3,}/.test(s)) return false;
        if (cpLooksLikeTypeLabel(s)) return false;
        if (/\b(shares the|unknown|unverified|possibly)\b/i.test(s)) return false;
        const words = s.split(' ');
        if (words.length < 2 || words.length > 4) return false;
        if (words.some(function (w) { return w.replace(/[.'’\-]/g, '').length < 2; })) return false;
        if (words.length === 2 && words.every(function (w) { return w.length < 4; })) return false;
        if (!words.every(function (w) {
            return /^[\p{L}][\p{L}'’. -]{0,38}[\p{L}.]?$/u.test(w);
        })) return false;
        if (/\b(City|College|University|Polytechnic|Harbor|Heights|Northwest|State|Record|Profile|Card|Notes?|Device|Browser|Windows|Linux|Street|Strasse|Address)\b/i.test(s) && words.length <= 2) return false;
        return true;
    }

    function cpLooksLikePersonLabeled(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (cpLooksLikePerson(s)) return true;
        if (s.length < 2 || s.length > 80) return false;
        if (cpLooksLikeTypeLabel(s) || /[\d@:/\\]/.test(s)) return false;
        const words = s.split(' ');
        if (words.length < 1 || words.length > 4) return false;
        return words.every(function (w) {
            return /^[\p{L}][\p{L}'’. -]{1,58}[\p{L}.]?$/u.test(w) && w.replace(/[.'’\-]/g, '').length >= 2;
        });
    }

    function cpLooksLikeHandle(value, loose) {
        const s = String(value || '').replace(/^@/, '').trim();
        if (s.length < (loose ? 2 : 3) || s.length > 40) return false;
        if (/\s/.test(s) || /@/.test(s)) return false;
        if (/\.(com|net|org|edu|gov|io|ru|me|co)$/i.test(s)) return false;
        if (/\.(mp3|mp4|png|gif|html|exe|zip|pdf)$/i.test(s)) return false;
        if (CP_NOISE.test(s) || CP_WEAK_HANDLE.test(s)) return false;
        if (/^[A-Z]{3,}$/.test(s)) return false;
        if (/^\d+$/.test(s)) return false;
        if (!loose && s.length < 4 && !/\d/.test(s)) return false;
        return /^[A-Za-z][A-Za-z0-9._-]{1,39}$/.test(s);
    }

    function cpValidDay(y, m, d) {
        const yy = Number(y), mm = Number(m), dd = Number(d);
        if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
        if (yy < 1900 || yy > 2100) return false;
        const dt = new Date(Date.UTC(yy, mm - 1, dd));
        return dt.getUTCFullYear() === yy && dt.getUTCMonth() === mm - 1 && dt.getUTCDate() === dd;
    }

    function cpLooksLikeDate(value) {
        const s = String(value || '').trim().replace(/\s+\([^)]*\)\s*$/, '');
        let m = s.match(/^((?:19|20)\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])$/);
        if (m) return cpValidDay(m[1], m[2], m[3]);
        m = s.match(/^(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.]((?:19|20)\d{2})$/);
        if (m) return cpValidDay(m[3], m[2], m[1]);
        m = s.match(/^(0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])[-/.]((?:19|20)\d{2})$/);
        if (m) return cpValidDay(m[3], m[1], m[2]);
        if (/^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+(?:19|20)\d{2}$/i.test(s)) return true;
        if (/^\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:19|20)\d{2}$/i.test(s)) return true;
        if (/^class of (?:19|20)\d{2}$/i.test(s)) return true;
        return false;
    }

    function cpLooksLikeTime(value) {
        const s = String(value || '').trim();
        if (/^00:00(?::00)?$/.test(s)) return false;
        return /^(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(?:\s?[APap][Mm])?$/.test(s);
    }

    function cpLooksLikeEmail(value) {
        const s = String(value || '').trim();
        if (/\*/.test(s)) return false;
        return /^[A-Z0-9._%+\-]{2,}@[A-Z0-9.\-]+\.[A-Z]{2,24}$/i.test(s);
    }

    function cpLooksLikePhone(value, labeled) {
        const s = String(value || '').trim();
        const digits = s.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15) return false;
        if (/^(\d)\1{8,}$/.test(digits)) return false;
        if (/\*/.test(s)) return false;
        if (/^(?:19|20)\d{8}$/.test(digits)) return false;
        if (digits.length === 15 && !labeled) return false;
        if (!labeled) {
            if (!/[+\-().\s]/.test(s)) return false;
            if (digits.length > 13 && !/^\+/.test(s)) return false;
        }
        return true;
    }

    function cpLooksLikeId(value) {
        const s = String(value || '').trim();
        if (s.length < 4 || s.length > 48) return false;
        if (/^\d{4,24}$/.test(s)) return true;
        if (/^\d{2,3}-\d{2,8}-\d{1,2}$/.test(s)) return true;
        if (/^\d{3}-\d{2}-\d{4}$/.test(s)) return true;
        if (/^[A-Z]{1,5}-[A-Z0-9-]{2,24}$/i.test(s)) return true;
        if (/^[0-9a-f]{2}(?::[0-9a-f]{2}){5}$/i.test(s)) return true;
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return true;
        if (/^[0-9a-f]{8,32}$/i.test(s)) return true;
        return false;
    }

    function cpLooksLikeCrypto(value) {
        const s = String(value || '').trim();
        if (/^bc1[a-z0-9]{25,87}$/i.test(s)) return true;
        if (/^0x[a-fA-F0-9]{40}$/.test(s)) return true;
        return false;
    }

    function cpDateISO(value) {
        const s = String(value || '').trim().replace(/\s+\([^)]*\)\s*$/, '');
        let m = s.match(/^((?:19|20)\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])$/);
        if (m && cpValidDay(m[1], m[2], m[3])) return m[1] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[3]).padStart(2, '0');
        m = s.match(/^(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.]((?:19|20)\d{2})$/);
        if (m && Number(m[1]) > 12 && cpValidDay(m[3], m[2], m[1])) return m[3] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
        m = s.match(/^(0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])[-/.]((?:19|20)\d{2})$/);
        if (m && cpValidDay(m[3], m[1], m[2])) return m[3] + '-' + String(m[1]).padStart(2, '0') + '-' + String(m[2]).padStart(2, '0');
        m = s.match(/^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})$/i);
        if (m) {
            const mm = CP_MONTH[m[1].toLowerCase()];
            if (mm) return m[2] + '-' + mm + '-01';
        }
        m = s.match(/class of ((?:19|20)\d{2})/i);
        if (m) return m[1] + '-01-01';
        return '';
    }

    function cpStripUser(value) {
        let s = cpCleanValue(value);
        s = s.replace(/^\/?u\//i, '');
        s = s.replace(/^@/, '');
        s = s.replace(/^https?:\/\/(www\.)?(reddit\.com\/(?:user|u)|github\.com|instagram\.com|x\.com|twitter\.com|tiktok\.com|t\.me|vk\.com)\//i, '');
        s = s.replace(/\/+$/, '');
        return s;
    }

    function cpClassifyKey(key) {
        let k = cpNormKey(key);
        if (!k || CP_SKIP_KEY.test(k)) return null;
        if (CP_PLAT[k]) return { kind: 'username', platform: CP_PLAT[k] };
        if (/\btiktok/.test(k)) return { kind: 'username', platform: 'tiktok' };
        if (/\btelegram|\bтелеграм/.test(k)) return { kind: 'username', platform: 'telegram' };
        if (/\binstagram|\binsta\b/.test(k)) return { kind: 'username', platform: 'instagram' };
        if (/\bgithub\b/.test(k)) return { kind: 'username', platform: 'github' };
        if (/\bdiscord\b/.test(k)) return { kind: 'username', platform: 'discord' };
        if (/\breddit\b/.test(k)) return { kind: 'username', platform: 'reddit' };
        if (/^(вк|vkontakte|одноклассники|телеграм+а?|вайбер|тик ток)$/u.test(k)) {
            const map = { 'вк': 'vk', vkontakte: 'vk', 'одноклассники': 'ok', 'телеграм': 'telegram', 'телеграмма': 'telegram', 'вайбер': 'viber', 'тик ток': 'tiktok' };
            return { kind: 'username', platform: map[k] || k };
        }
        if (/почт|e ?mails?|mails?|correo/.test(k) && !/gmail/.test(k)) return { kind: 'email' };
        if (/\b(phone|tel|mobile|cell|telephone|номер|телефон)\b/.test(k)) return { kind: 'phone' };
        if (/^(password|passwd|pwd|passphrase|passcode|pass|парол)/.test(k) || k === 'pwd') return { kind: 'password' };
        if (/\b(dob|bday|born|birthday|birth date|date of birth|birth|рожден|naissance)\b/.test(k) || /дата рождения|fecha de nacimiento/.test(k)) return { kind: 'dob' };
        if (/^(alias|aka|handle|nickname|nick|nicks|aliases|subject|display name|main handle|old alias|other names?|alternate handle|seen usernames|nickname)$/.test(k)) return { kind: 'alias' };
        if (/^(fn|fio|фио|имя|nombre|nom|prenom|prénom|apellido|apellidos|cognome|nachname|vorname|фамилия|отчество|name|full name|real name|legal name|full legal name|person|possible name)$/u.test(k) || /\bfull legal\b/.test(k) || /^name /.test(k)) return { kind: 'name' };
        if (/^(username|user name|user|userid|user id|login|account)$/.test(k)) return { kind: 'username' };
        if (/\b(location|address|street|city|state|region|place|country|area|addr|adr|adresse|город|адрес|проживан)\b/.test(k) || /address$/.test(k) || /^adresse/.test(k)) return { kind: 'address' };
        if (/^(school|university|college|education|uni|employer|company|workplace|org|organization|job|школа)$/.test(k)) return { kind: 'company' };
        if (/^(occupation|field|role|title|trade|employment|job title)$/.test(k)) return { kind: 'occupation' };
        if (/^(os|os seen|laptop|desktop|computer os|operating system|user agent)$/.test(k) || /^os /.test(k) || k === 'browser') return { kind: 'os' };
        if (/^(created|created account|last checked|signup date|created at|id issue|id expiry|date|when|дата)$/.test(k)) return { kind: 'date' };
        if (/^(time|seen)$/.test(k)) return { kind: 'time' };
        if (/^(id|profile id|case ref|case id|ref|reference|dni|ssn|social|cuit|inn|инн|passport|паспорт|snils|снилс|imei|imsi|iccid|mac|bssid|uuid|orcid|badge|employee id|asset|asset tag|serial|serial number|dl|driver license|licence|tracking|pnr|flight|callsign|ham callsign|asn|did|android id|androidid|idfa|mmsi|imo)$/.test(k)) return { kind: 'id' };
        if (/банковск/.test(k)) return { kind: 'id' };
        if (/^(ip|ip address|ipv4|ipv6)$/.test(k)) return { kind: 'ip' };
        if (/^(url|website|site|web)$/.test(k)) return { kind: 'url' };
        if (/^(domain)$/.test(k)) return { kind: 'domain' };
        if (/^(vin)$/.test(k)) return { kind: 'vin' };
        if (/^(plate|license plate|licence plate|dominio)$/.test(k)) return { kind: 'plate' };
        if (/^(vehicle|car|make|model|brand|автомобил)/.test(k)) return { kind: 'vehicle' };
        if (/^(age|yrs?|years? old|лет)$/.test(k) || /\b(age|лет)\b/.test(k)) return { kind: 'age' };
        if (/^(timezone|time zone|tz)$/.test(k)) return { kind: 'timezone' };
        if (/crypto|wallet|btc|eth/.test(k)) return { kind: 'crypto' };
        if (/^(ssid)$/.test(k)) return { kind: 'id' };
        if (/^(geo|coordinates|what3words|plus code)$/.test(k)) return { kind: 'address' };
        if (/^(iban|swift|bic|lei|cusip|isin|ein|duns)$/.test(k)) return { kind: 'id' };
        return null;
    }

    function cpAccountFromUrl(url) {
        try {
            const u = new URL(url);
            const host = u.hostname.replace(/^www\./, '').toLowerCase();
            const path = u.pathname.replace(/\/+$/, '');
            const last = path.split('/').filter(Boolean).pop() || '';
            if (host === 'vk.com' || host === 'vk.ru') return { platform: 'vk', value: last || path.slice(1) };
            if (host === 't.me' || host === 'telegram.me') {
                const first = path.split('/').filter(Boolean)[0] || '';
                if (/^\+/.test(first) || /^\d/.test(first) || /^joinchat$/i.test(first)) return null;
                return { platform: 'telegram', value: first.replace(/^@/, '') };
            }
            if (host === 'tiktok.com') return { platform: 'tiktok', value: last.replace(/^@/, '') };
            if (host === 'ok.ru') return { platform: 'ok', value: last };
            if (host === 'instagram.com') return { platform: 'instagram', value: last.replace(/^@/, '') };
            if (host === 'github.com') return { platform: 'github', value: last };
            if (host === 'reddit.com' && /\/(u|user)\//i.test(path)) return { platform: 'reddit', value: last };
        } catch (error) {}
        return null;
    }

    function cpIsGenericKey(key) {
        const raw = String(key || '');
        const k = cpNormKey(raw);
        if (!k || CP_SKIP_KEY.test(k)) return true;
        if (/_(type|flag|status|count|index|ratio|season)$/i.test(raw)) return true;
        return false;
    }

    function cpLooksLikeJunkUrl(url) {
        try {
            const u = new URL(url);
            const h = u.hostname.replace(/^www\./, '').toLowerCase();
            if (/\.(example|invalid|test|localhost)$/.test(h)) return true;
            if (h === 'doxbin.com' || /\.doxbin\.com$/.test(h)) return true;
            if (h === 'web.archive.org' || h === 'archive.org') return true;
            if (h === 'calendar.google.com') return true;
            if (/(^|\.)google\.(com|[a-z]{2}|co\.[a-z]{2})$/.test(h) && /\/(search|maps\/contrib|calendar|url)/.test(u.pathname + u.search)) return true;
        } catch (error) {
            return true;
        }
        return false;
    }

    function cpTakePair(hits, key, value, note) {
        const raw = cpCleanValue(value);
        if (!raw) return;
        if (cpIsGenericKey(key)) return;
        if (cpNormKey(key) === 'n' && /;/.test(raw)) {
            const p = raw.split(';');
            const assembled = [p[1], p[0]].map(function (x) { return String(x || '').trim(); }).filter(Boolean).join(' ');
            if (cpLooksLikePerson(assembled)) cpPushHit(hits, 'name', assembled, note);
            return;
        }
        const cls = cpClassifyKey(key);
        if (!cls) {
            if (raw.indexOf('|') >= 0 || /(?:github|plate|imei|discord|reddit)\s*=/i.test(raw)) {
                String(raw).split(/\s*\|\s*/).forEach(function (part) {
                    const inner = cpSplitPair(part);
                    if (inner && inner.key !== key) cpTakePair(hits, inner.key, inner.value, note);
                });
            }
            if (cpLooksLikeDate(raw)) cpPushHit(hits, 'date', raw, note);
            else if (cpLooksLikeEmail(raw)) cpPushHit(hits, 'email', raw, note);
            else {
                const keyHandle = cpStripUser(key);
                if (!/_/.test(keyHandle) && cpLooksLikeHandle(keyHandle, true) && cpLooksLikePerson(raw)) {
                    cpPushHit(hits, 'alias', keyHandle, note);
                    cpPushHit(hits, 'name', raw, note);
                }
            }
            return;
        }
        let kind = cls.kind;
        let platform = cls.platform || '';
        const values = (kind === 'username' || kind === 'alias' || kind === 'email' || kind === 'name') && /[,;]/.test(raw) && raw.length < 220
            ? raw.split(/[,;]/).map(function (p) { return cpCleanValue(p); }).filter(Boolean)
            : [raw];
        values.forEach(function (item) {
            let v = item;
            let k = kind;
            let plat = platform;
            if (/^https?:\/\//i.test(v) && (k === 'username' || k === 'alias' || k === 'url' || k === 'domain')) {
                const cleanUrl = v.replace(/[),.;]+$/, '');
                if (!cpLooksLikeJunkUrl(cleanUrl)) cpPushHit(hits, 'url', cleanUrl, note);
                const acc = cpAccountFromUrl(v);
                if (acc && acc.value) {
                    k = 'username';
                    plat = acc.platform;
                    v = acc.value;
                } else if (k === 'url' || k === 'domain') {
                    return;
                }
            }
            if (k === 'username' || k === 'alias') v = cpStripUser(v);
            if (k === 'email' && !cpLooksLikeEmail(v)) return;
            if (k === 'phone' && !cpLooksLikePhone(v, true)) return;
            if (k === 'date') {
                if (cpLooksLikeTime(v) && !cpLooksLikeDate(v)) k = 'time';
                else if (!cpLooksLikeDate(v) && !cpDateISO(v)) return;
            }
            if (k === 'time' && !cpLooksLikeTime(v)) return;
            if (k === 'dob') {
                v = v.replace(/\s+\([^)]*\)\s*$/, '');
                if (!cpLooksLikeDate(v) && !/\d/.test(v)) return;
            }
            if (k === 'id') {
                if (/\s/.test(v) && /^\d/.test(v)) v = v.split(/\s+/)[0];
                if (!cpLooksLikeId(v) && !/^[A-Z0-9:+._-]{3,24}$/i.test(v) && !/^did:/i.test(v)) return;
                if (/^(xfinitywifi|netgear|linksys|default|wifi|guest|androidap)$/i.test(v)) return;
            }
            if (k === 'address') {
                if (/^(?:\d+(?:\.\d+)?)$/.test(v)) return;
                if (/^(workplace|location|unknown|tbd|none|n\/a)$/i.test(v)) return;
                if (/^[A-Za-z_]+\/[A-Za-z_]+$/.test(v)) k = 'timezone';
            }
            if (k === 'age') {
                const n = v.match(/\d{1,3}/);
                if (!n || Number(n[0]) < 1 || Number(n[0]) > 120) return;
                v = n[0];
            }
            if (k === 'os' && /Mozilla\//i.test(v)) return;
            if (k === 'name') {
                if (cpLooksLikePerson(v) || cpLooksLikePersonLabeled(v)) {
                    /* keep */
                } else if (v.length >= 4 && !/\d/.test(v) && !/\s/.test(v) && cpLooksLikeHandle(v, true)) {
                    k = 'alias';
                } else {
                    return;
                }
            }
            if (k === 'alias' && !cpLooksLikeHandle(v, true) && !cpLooksLikePerson(v)) return;
            if (k === 'username' && !cpLooksLikeHandle(v, true) && !/^\d{4,}$/.test(v) && plat !== 'vk') return;
            if ((k === 'username' || k === 'alias') && CP_NOISE.test(v)) return;
            if (k === 'crypto' && !cpLooksLikeCrypto(v) && !/^0x[a-fA-F0-9]{40,64}$/.test(v) && !/^bc1/i.test(v)) return;
            if (k === 'domain') {
                v = v.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
                if (!/\./.test(v)) return;
            }
            if ((k === 'username' || k === 'alias') && /@/.test(v) && /\./.test(v.split('@')[1] || '')) {
                k = 'email';
                plat = '';
                if (!cpLooksLikeEmail(v)) return;
            }
            if (!v || CP_JUNK_VAL.test(v)) return;
            cpPushHit(hits, k, v, note, plat);
        });
    }

