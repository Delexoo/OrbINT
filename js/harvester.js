/* Harvester page */

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

    function cpSplitPair(line) {
        let s = String(line || '').trim();
        if (!s || s.length > 800) return null;
        if (/^#\s*skip\b/i.test(s) || /^\/\/\s*seen\b/i.test(s)) return null;
        if (/^[=\-#*_/~]{3,}$/.test(s)) return null;
        if (/[█░▓▀▄■□╔╗╚╝║╠╣═]/.test(s)) return null;
        if (/^\[(?:\?|\+|-)\]/.test(s)) return null;
        if (/^\[(?:user@|root@)/i.test(s) || /\$\s+cat\s+/i.test(s)) return null;
        s = s.replace(/^[^\p{L}\p{N}@\/]+/u, '');
        if (/^\/\//.test(s) || /^#\s*skip\b/i.test(s) || /^decoy\b/i.test(s)) return null;
        s = s.replace(/^[-*+>]+(?:\s+)/, '');
        s = s.replace(/^#{1,6}\s+/, '');
        if (/^(?:user@|root@)/i.test(s)) return null;
        if (/^\|?\s*-{2,}\s*\|/.test(s)) return null;
        if (/^\|/.test(s)) {
            const cells = s.split('|').map(function (c) { return c.trim(); }).filter(function (c) {
                return c && !/^:?-{2,}:?$/.test(c);
            });
            if (cells.length >= 2 && !/^(type|value|key|field)$/i.test(cells[0])) {
                return { key: cells[0], value: cells.slice(1).join(' | ') };
            }
            return null;
        }
        let m = s.match(/^([A-Za-z][\w .-]{0,48})(?:;[^=:\n]{0,80})?\s*:\s*(.+)$/);
        if (m && !/^(BEGIN|END|VERSION)$/i.test(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^[*`"_]*([\p{L}][\p{L}\p{N} ._/-]{0,48}?)[*`"_]*\s*\??\s*(?:\.{2,}\s*)?(?::{1,3}|={1,2}|-{1,2}>|→|=>)\s*(.+)$/u);
        if (m) return { key: m[1], value: m[2] };
        m = s.match(/^([\p{L}][\p{L}\p{N} ._/-]{0,40})\s{2,}(\S.*)$/u);
        if (m && cpClassifyKey(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^((?:[\p{L}][\p{L}'’.-]*\s+){0,2}[\p{L}][\p{L}'’.-]{1,32})\s+([^\s].{0,180})$/u);
        if (m && cpClassifyKey(m[1]) && !/^[\/—–]/.test(m[2]) && !/^(is|was|were|are|the|a|an|to|of|and)\b/i.test(m[2]) && m[2].split(/\s+/).length <= 14) {
            return { key: m[1], value: m[2] };
        }
        m = s.match(/^([\p{L}][\p{L}\p{N}._-]{1,32})\?\s+(.+)$/u);
        if (m && cpClassifyKey(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^([\p{L}][\p{L}\p{N}._-]{1,40})\s+\/\s+(.+)$/u);
        if (m) return { key: m[1], value: m[2] };
        m = s.match(/^([A-Za-z][A-Za-z0-9._-]{2,32})\s+[—–]\s+(?:possibly\s+)?(.+)$/i);
        if (m) return { key: 'alias', value: m[1], extra: m[2] };
        return null;
    }

    function cpScanPairs(hits, text, note) {
        const lines = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const pair = cpSplitPair(line);
            if (!pair) continue;
            let val = pair.value;
            const cls = cpClassifyKey(pair.key);
            if (cls && cls.kind === 'address' && !String(val).trim()) {
                const extra = [];
                while (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1]) && !cpSplitPair(lines[i + 1].trim())) {
                    extra.push(lines[++i].trim());
                }
                val = extra.join(', ');
            }
            cpTakePair(hits, pair.key, val, note);
            if (pair.extra) {
                const extra = cpCleanValue(String(pair.extra).replace(/^possibly\s+/i, '').replace(/\.+$/, ''));
                if (cpLooksLikePerson(extra)) cpPushHit(hits, 'name', extra, note);
            }
        }
    }

    function cpScanPatterns(hits, text, note) {
        const src = String(text || '');
        if (!src) return;
        const email = src.match(/[A-Z0-9._%+\-]{2,}@[A-Z0-9.\-]+\.[A-Z]{2,24}/gi) || [];
        email.forEach(function (v) {
            if (cpLooksLikeEmail(v)) cpPushHit(hits, 'email', v, note);
        });
        const url = src.match(/\bhttps?:\/\/[^\s<>"'`]+/gi) || [];
        url.forEach(function (v) {
            const clean = v.replace(/[),.;]+$/, '');
            if (cpLooksLikeJunkUrl(clean)) return;
            cpPushHit(hits, 'url', clean, note);
            const acc = cpAccountFromUrl(clean);
            if (acc && acc.value && (cpLooksLikeHandle(acc.value, true) || /^(id)?\d+$/i.test(acc.value))) {
                cpPushHit(hits, 'username', acc.value, note, acc.platform);
            }
        });
        const tme = src.match(/\bt\.me\/([A-Za-z][A-Za-z0-9_]{3,32})\b/gi) || [];
        tme.forEach(function (v) {
            const h = v.replace(/^t\.me\//i, '');
            if (cpLooksLikeHandle(h, true)) cpPushHit(hits, 'username', h, note, 'telegram');
        });
        const ip = src.match(/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g) || [];
        ip.forEach(function (v) {
            if (/^0\.|^255\.|127\.0\.0\.1|\.0\.0\.0$/.test(v)) return;
            if (/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(v)) return;
            cpPushHit(hits, 'ip', v, note);
        });
        const ipv6 = src.match(/\b(?:[0-9a-f]{1,4}:){2,7}[0-9a-f:.]+\b/gi) || [];
        ipv6.forEach(function (v) {
            if (/::/.test(v) && v.length >= 10) cpPushHit(hits, 'ip', v, note);
        });
        const phone = src.match(/\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g) || [];
        phone.forEach(function (v) {
            if (cpLooksLikePhone(v, false)) cpPushHit(hits, 'phone', v, note);
        });
        const phoneUs = src.match(/\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g) || [];
        phoneUs.forEach(function (v) {
            if (cpLooksLikePhone(v, false)) cpPushHit(hits, 'phone', v, note);
        });
        const reddit = src.match(/\b\/?u\/[A-Za-z0-9_-]{3,32}\b/g) || [];
        reddit.forEach(function (v) {
            if (/\b(?:GET|POST|PUT|HEAD|DELETE)\s+\//i.test(src) && new RegExp('\\b(?:GET|POST) /u/' + cpStripUser(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(src)) return;
            cpPushHit(hits, 'username', cpStripUser(v), note, 'reddit');
        });
        const discord = src.match(/\b[A-Za-z][A-Za-z0-9._-]{2,31}#\d{4}\b/g) || [];
        discord.forEach(function (v) { cpPushHit(hits, 'username', v, note, 'discord'); });
        const at = src.match(/(^|[^\w])@([A-Za-z][A-Za-z0-9._]{2,31})\b/g) || [];
        at.forEach(function (v) {
            const h = cpStripUser(v.replace(/^[^@]+/, ''));
            if (!cpLooksLikeHandle(h)) return;
            if (new RegExp('@' + h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':').test(src)) return;
            cpPushHit(hits, 'username', h, note);
        });
        const seenT = src.match(/\bseen\s+((?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?)/gi) || [];
        seenT.forEach(function (v) {
            const t = v.replace(/^seen\s+/i, '');
            if (cpLooksLikeTime(t)) cpPushHit(hits, 'time', t, note);
        });
        const btc = src.match(/\bbc1[a-z0-9]{25,87}\b/gi) || [];
        btc.forEach(function (v) { cpPushHit(hits, 'crypto', v, note); });
        const eth = src.match(/\b0x[a-fA-F0-9]{40}\b/g) || [];
        eth.forEach(function (v) { cpPushHit(hits, 'crypto', v, note); });
        const ids = src.match(/\b(?:EMP|AST|SF|NT|VT|FI|VN|EL|ID)-[A-Z0-9]{2,10}\b/g) || [];
        ids.forEach(function (v) { cpPushHit(hits, 'id', v, note); });
        String(src).split('\n').forEach(function (line) {
            const m = String(line).match(/^\s*(?:[-*+]|\d+[.)])?\s*[`*_]*((?:19|20)\d{2}[-/.](?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\d|3[01])|(?:0?[1-9]|[12]\d|3[01])[./](?:0?[1-9]|1[0-2])[./](?:19|20)\d{2})\b/);
            if (m && cpLooksLikeDate(m[1])) cpPushHit(hits, 'date', m[1], note);
        });
        const ages = src.match(/\b(?:age\s*[:=]?\s*)?(\d{1,3})\s*(?:years?\s+old|yrs?\.?\s*old|лет)\b/gi) || [];
        ages.forEach(function (v) {
            const n = String(v).match(/\d{1,3}/);
            if (n && Number(n[0]) >= 1 && Number(n[0]) <= 120) cpPushHit(hits, 'age', n[0], note);
        });
        const ageEq = src.match(/\bage\s*[:=]\s*(\d{1,3})\b/gi) || [];
        ageEq.forEach(function (v) {
            const n = String(v).match(/\d{1,3}/);
            if (n && Number(n[0]) >= 1 && Number(n[0]) <= 120) cpPushHit(hits, 'age', n[0], note);
        });
    }

    function cpScanEmbeddedJson(hits, text, note) {
        const src = String(text || '');
        if (src.indexOf('{') < 0) return;
        let n = 0;
        for (let i = 0; i < src.length && n < 12; i++) {
            if (src.charAt(i) !== '{') continue;
            let depth = 0;
            let j = i;
            let inStr = false;
            let esc = false;
            for (; j < src.length && j - i < 80000; j++) {
                const c = src.charAt(j);
                if (inStr) {
                    if (esc) esc = false;
                    else if (c === '\\') esc = true;
                    else if (c === '"') inStr = false;
                    continue;
                }
                if (c === '"') inStr = true;
                else if (c === '{') depth += 1;
                else if (c === '}') {
                    depth -= 1;
                    if (depth === 0) {
                        try {
                            cpWalkJson(hits, JSON.parse(src.slice(i, j + 1)), '');
                            n += 1;
                            i = j;
                        } catch (error) {}
                        break;
                    }
                }
            }
        }
    }

    function cpLooksLikeLogLine(line) {
        return /^(?:(?:\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+) \S+ \S+ \[[^\]]+\] "[A-Z]+ /i.test(String(line || '').trim());
    }

    function cpLooksLikeArtLine(line) {
        const s = String(line || '');
        const useful = (s.match(/[\p{L}\p{N}]/gu) || []).length;
        if (useful >= 8) return false;
        if (/[█░▓▀▄■□╔╗╚╝║╠╣═]/.test(s) && useful < 6) return true;
        if (s.length >= 50) {
            const noisy = (s.match(/[#%*=_\-|:+~.,;\\/<>]/g) || []).length;
            if (useful < 10 && noisy / s.length > 0.42) return true;
        }
        return false;
    }

    function cpStripArt(line) {
        return String(line || '')
            .replace(/[█░▓▀▄■□╔╗╚╝║╠╣═┌┐└┘│┬┴┼]/g, ' ')
            .replace(/[»↳]+/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function cpLooksLikeAddressLine(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (s.length < 12 || s.length > 140) return false;
        if (/https?:/i.test(s) || cpLooksLikeEmail(s)) return false;
        if (!/\d/.test(s)) return false;
        if (/(улиц|проспект|бульвар|переулок|\bдом\b|\bул\.|street|\bst\.|\bave\b|avenue|\broad\b|\brd\.|\bway\b|drive|\bdr\.|\blane|\bln\.|\bblvd\b|\brue\b|strasse|\bplaza\b|\bcourt\b|\bapt\b|\bsuite\b)/i.test(s)) return true;
        if (/^\d{5,6}\s*,/.test(s)) return true;
        return /\d{1,6}\s+[\p{L}].+\b(way|street|ave|road|drive|lane|blvd|court|улиц)/iu.test(s);
    }

    function cpPrepareText(text) {
        const lines = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        const logLines = [];
        const kept = [];
        lines.forEach(function (line) {
            if (cpLooksLikeArtLine(line)) return;
            if (cpLooksLikeLogLine(line)) {
                logLines.push(line);
                return;
            }
            kept.push(cpStripArt(line));
        });
        return {
            signals: kept.join('\n'),
            logLines: logLines,
            dropLogs: logLines.length >= 12
        };
    }

    function cpScanLogLines(hits, lines, note) {
        if (!lines || !lines.length || lines.length >= 12) return;
        lines.forEach(function (line) {
            const m = String(line).trim().match(/^((?:\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+) \S+ (\S+) \[/);
            if (!m) return;
            if (!/^0\.|^255\.|127\.0\.0\.1|\.0\.0\.0$/.test(m[1]) && !/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(m[1])) {
                cpPushHit(hits, 'ip', m[1], note);
            }
            if (m[2] && m[2] !== '-' && cpLooksLikeHandle(m[2], true)) cpPushHit(hits, 'username', m[2], note);
        });
    }

    function cpScanStandalone(hits, text, note) {
        String(text || '').split('\n').forEach(function (line) {
            const s = String(line || '').trim();
            if (!s || s.length > 140 || /^https?:/i.test(s) || cpSplitPair(s)) return;
            if (cpLooksLikeDate(s)) {
                const y = Number((s.match(/(?:19|20)\d{2}/) || [])[0]);
                if (y >= 1920 && y <= 2018) cpPushHit(hits, 'dob', s, note);
                else if (y >= 2019) cpPushHit(hits, 'date', s, note);
                return;
            }
            const titled = s.split(/\s+/);
            const nameCase = titled.length >= 2 && titled.every(function (w) {
                const core = w.replace(/[.'’-]/g, '');
                if (!core) return false;
                return core === core.toUpperCase() || /^[\p{Lu}][\p{Ll}'’-]*$/u.test(w) || /^[\p{Lu}]+$/u.test(core);
            });
            if (nameCase && !/[.?!]$/.test(s) && !/^(no|the|a|an|this|that|not)\b/i.test(s) && cpLooksLikePerson(s)) {
                cpPushHit(hits, 'name', s.replace(/\s+/g, ' '), note);
            } else if (cpLooksLikeAddressLine(s)) cpPushHit(hits, 'address', s, note);
        });
    }

    function cpScanAll(hits, text, note) {
        const prepared = cpPrepareText(text);
        cpScanEmbeddedJson(hits, prepared.signals, note);
        cpScanPairs(hits, prepared.signals, note);
        cpScanStandalone(hits, prepared.signals, note);
        cpScanPatterns(hits, prepared.signals, note);
        cpScanLogLines(hits, prepared.logLines, note);
    }

    function cpParseCsv(text, sep) {
        const rows = [];
        let row = [];
        let cell = '';
        let q = false;
        const delim = sep || ',';
        const src = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        for (let i = 0; i < src.length; i++) {
            const ch = src[i];
            if (q) {
                if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
                else if (ch === '"') q = false;
                else cell += ch;
            } else if (ch === '"') q = true;
            else if (ch === delim) { row.push(cell); cell = ''; }
            else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
            else cell += ch;
        }
        if (cell || row.length) { row.push(cell); rows.push(row); }
        return rows.filter(function (r) { return r.some(function (c) { return String(c).trim(); }); });
    }

    function cpWalkJson(hits, val, path) {
        if (val == null) return;
        if (typeof val !== 'object') {
            const seg = String(path || '').split('.').pop().replace(/\[\d+\]/g, '');
            if (/^(timestamp|type|version|metadata|label|scatter|kind|category)$/i.test(seg)) return;
            if (/^Mozilla\//i.test(String(val))) return;
            cpTakePair(hits, seg, String(val), 'json');
            if (cpLooksLikeEmail(String(val)) || /^https?:\/\//i.test(String(val)) || /^\+?\d[\d\s().-]{8,}$/.test(String(val))) {
                cpScanPatterns(hits, String(val), 'json');
            }
            return;
        }
        if (Array.isArray(val)) {
            val.forEach(function (item, i) {
                cpWalkJson(hits, item, path ? path + '[' + i + ']' : '[' + i + ']');
            });
            return;
        }
        if ((val.prenom || val.firstname || val.first_name || val.given_name) && (val.nom || val.lastname || val.last_name || val.family_name || val.apellido)) {
            const full = cpCleanValue(String(val.prenom || val.firstname || val.first_name || val.given_name) + ' ' + String(val.nom || val.lastname || val.last_name || val.family_name || val.apellido));
            if (cpLooksLikePerson(full) || cpLooksLikePersonLabeled(full)) cpPushHit(hits, 'name', full, 'json');
        }
        if ((val.label != null || val.key != null) && val.value != null && typeof val.value !== 'object') {
            cpTakePair(hits, String(val.key != null ? val.key : val.label), String(val.value), 'json');
        }
        if (val.service && (val.username || val.handle || val.user || val.id)) {
            cpTakePair(hits, String(val.service), String(val.username || val.handle || val.user || val.id), 'json');
        }
        Object.keys(val).forEach(function (k) {
            if (/^(label|key|value|type|scatter)$/i.test(k) && val.value != null && (val.label != null || val.key != null)) return;
            cpWalkJson(hits, val[k], path ? path + '.' + k : k);
        });
    }

    function cpScanJsRecord(hits, src) {
        const re = /(?:^|[{\s,])([A-Za-z_]\w{1,32})\s*:\s*["']([^"']{1,160})["']/g;
        let m;
        while ((m = re.exec(String(src || '')))) {
            cpTakePair(hits, m[1], m[2], 'script');
        }
    }

    function cpDecodeHtml(text) {
        return String(text || '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'");
    }

    function cpStripMarkup(raw) {
        return cpDecodeHtml(String(raw || '')
            .replace(/<script[\s\S]*?<\/script>/gi, '\n')
            .replace(/<style[\s\S]*?<\/style>/gi, '\n')
            .replace(/<!--[\s\S]*?-->/g, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|li|h[1-6]|tr|section|pre|blockquote)>/gi, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim());
    }

    function cpHtml(raw, hits) {
        const src = String(raw || '');
        const scripts = src.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
        scripts.forEach(function (block) {
            const inner = block.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
            cpScanJsRecord(hits, inner);
            cpScanAll(hits, inner, 'script');
        });
        const df = /data-field=["']([^"']+)["'][^>]*>([^<]*)/gi;
        let m;
        while ((m = df.exec(src))) cpTakePair(hits, m[1], cpDecodeHtml(m[2]), 'html');
        const mail = /mailto:([^"'>\s]+)/gi;
        while ((m = mail.exec(src))) cpPushHit(hits, 'email', decodeURIComponent(m[1]), 'html');
        const heads = /<h[1-6][^>]*>([^<]+)/gi;
        while ((m = heads.exec(src))) {
            const t = cpCleanValue(cpDecodeHtml(m[1]));
            if (CP_NOISE.test(t) || /^(profile card|data record|person record|signal frame)$/i.test(t)) {
                /* section title */
            } else if (cpLooksLikeHandle(t)) {
                cpPushHit(hits, 'alias', t, 'heading');
            } else if (cpLooksLikePerson(t)) {
                cpPushHit(hits, 'name', t, 'heading');
            }
        }
        cpScanAll(hits, cpStripMarkup(src), 'html');
        return { text: cpStripMarkup(src) };
    }

    function cpXml(raw, hits) {
        const src = String(raw || '');
        const tag = /<([A-Za-z_][\w:.-]*)\b[^>]*>([^<]{1,200})<\/\1>/g;
        let m;
        while ((m = tag.exec(src))) cpTakePair(hits, m[1].split(':').pop(), m[2], 'xml');
        const attr = /\b([A-Za-z_][\w:.-]*)=["']([^"']{1,200})["']/g;
        while ((m = attr.exec(src))) {
            if (/^(class|style|xmlns|id|width|height|type)$/i.test(m[1])) continue;
            cpTakePair(hits, m[1], m[2], 'xml');
        }
        cpScanAll(hits, cpStripMarkup(src), 'xml');
        return { text: cpStripMarkup(src) };
    }

    function cpJson(raw, hits) {
        let parsed = null;
        let error = '';
        try { parsed = JSON.parse(raw); }
        catch (e) { error = e.message || 'Invalid JSON'; }
        if (parsed != null) cpWalkJson(hits, parsed, '');
        else cpScanAll(hits, raw, 'json');
        return { error: error };
    }

    function cpMd(raw, hits) {
        cpScanAll(hits, raw, 'markdown');
        return { text: raw };
    }

    function cpCsv(raw, hits) {
        const first = String(raw || '').split(/\r?\n/, 1)[0] || '';
        const sep = first.split('\t').length > first.split(',').length ? '\t' : ',';
        const grid = cpParseCsv(raw, sep);
        if (grid.length >= 2) {
            const head = grid[0].map(function (c) { return String(c).trim(); });
            grid.slice(1).forEach(function (row) {
                row.forEach(function (cell, i) {
                    const key = head[i] || '';
                    if (key) cpTakePair(hits, key, cell, 'csv');
                    else cpScanPatterns(hits, cell, 'csv');
                });
            });
        } else {
            grid.forEach(function (row) {
                row.forEach(function (cell) { cpScanAll(hits, cell, 'csv'); });
            });
        }
        return {};
    }

    function cpTxt(raw, hits) {
        cpScanAll(hits, raw, 'text');
        return { text: raw };
    }

    function cpFinishHits(hits) {
        const plat = {};
        hits.forEach(function (h) {
            if (h.platform) plat[h.value.toLowerCase()] = 1;
        });
        const kept = hits.filter(function (h) {
            if (h.kind === 'name' && (cpLooksLikeTypeLabel(h.value) || !cpLooksLikePerson(h.value) && !cpLooksLikePersonLabeled(h.value))) return false;
            if (h.kind === 'url' && cpLooksLikeJunkUrl(h.value)) return false;
            if (h.platform || h.kind !== 'username') return true;
            return !plat[h.value.toLowerCase()];
        });
        kept.sort(function (a, b) {
            const ia = CP_ORDER.indexOf(a.kind);
            const ib = CP_ORDER.indexOf(b.kind);
            if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
            const pa = a.platform || '';
            const pb = b.platform || '';
            if (pa !== pb) return pa < pb ? -1 : 1;
            return a.value.toLowerCase() < b.value.toLowerCase() ? -1 : 1;
        });
        return kept;
    }

    function harvestOne(file, raw) {
        const kind = cpKind(file.name, file.type);
        const hits = [];
        hits._seen = {};
        if (kind === 'html') cpHtml(raw, hits);
        else if (kind === 'xml') cpXml(raw, hits);
        else if (kind === 'json') cpJson(raw, hits);
        else if (kind === 'md') cpMd(raw, hits);
        else if (kind === 'csv') cpCsv(raw, hits);
        else cpTxt(raw, hits);
        delete hits._seen;
        delete hits._phone;
        return {
            id: uid('cp'),
            name: file.name || 'untitled',
            kind: kind,
            size: file.size || raw.length,
            raw: raw,
            hits: cpFinishHits(hits)
        };
    }

    function mergeHarvesterHits(files) {
        const hits = [];
        hits._seen = {};
        files.forEach(function (file) {
            (file.hits || []).forEach(function (hit) {
                cpPushHit(hits, hit.kind, hit.value, hit.note || file.name, hit.platform);
            });
        });
        delete hits._seen;
        delete hits._phone;
        return cpFinishHits(hits);
    }

    function setHarvesterBusy(on, title, hint) {
        cpBusy = !!on;
        const load = $('harvesterLoad');
        const drop = $('harvesterDrop');
        if (load) {
            load.hidden = !on;
            const t = $('harvesterLoadTitle');
            const h = $('harvesterLoadHint');
            if (t && title) t.textContent = title;
            if (h && hint) h.textContent = hint;
        }
        if (drop) drop.setAttribute('aria-busy', on ? 'true' : 'false');
    }

    function hideHarvesterDownload() {
        const menu = $('harvesterDownloadMenu');
        if (menu) menu.hidden = true;
    }

    function harvesterSplitPct() {
        const n = Number(harvesterState().split);
        return isFinite(n) ? Math.min(78, Math.max(22, n)) : 50;
    }

    function applyHarvesterSplit(pct, persist) {
        const n = Math.round(Math.min(78, Math.max(22, Number(pct))) * 10) / 10;
        harvesterState().split = n;
        document.querySelectorAll('.cp-diff:not(.is-single)').forEach(function (el) {
            el.style.setProperty('--cp-split', n + '%');
            const g = el.querySelector('.cp-split-gutter');
            if (g) {
                g.setAttribute('aria-valuenow', String(Math.round(n)));
                g.setAttribute('aria-valuetext', Math.round(n) + '% original');
            }
        });
        if (persist) schedulePersist();
    }

    function splitPctFromPointer(gutter, clientX) {
        const body = gutter.closest('.cp-diff-body') || gutter.parentNode;
        const rect = body.getBoundingClientRect();
        if (!rect.width) return harvesterSplitPct();
        const minPx = Math.min(160, rect.width * 0.22);
        const x = Math.min(rect.width - minPx, Math.max(minPx, clientX - rect.left));
        return (x / rect.width) * 100;
    }

    function harvesterView() {
        const view = harvesterState().view;
        return view === 'original' || view === 'stripped' ? view : 'split';
    }

    function setHarvesterView(view) {
        const next = view === 'original' || view === 'stripped' ? view : 'split';
        const st = harvesterState();
        if (st.view === next) {
            harvesterSummary();
            return;
        }
        st.view = next;
        renderHarvester();
        schedulePersist();
    }

    function harvesterSummary() {
        const st = harvesterState();
        const n = (st.files || []).length;
        const el = $('harvesterCount');
        const view = harvesterView();
        if (el) {
            el.querySelectorAll('[data-cp-view]').forEach(function (btn) {
                const on = btn.getAttribute('data-cp-view') === view;
                btn.setAttribute('aria-checked', on ? 'true' : 'false');
                btn.classList.toggle('is-on', on);
            });
        }
        const dl = $('harvesterDownloadBtn');
        const cpy = $('harvesterCopyBtn');
        const ins = $('harvesterInspectBtn');
        const clr = $('harvesterClearBtn');
        const on = !!(st.ready && n);
        if (dl) dl.disabled = !on;
        if (cpy) cpy.disabled = !on;
        if (ins) ins.disabled = !on;
        if (clr) clr.disabled = !on;
    }

    function cpEsc(text) {
        return esc(text);
    }

    function cpHitLabel(hit) {
        if (hit.platform) {
            const p = hit.platform;
            return p === 'github' ? 'GitHub' : p === 'x' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1);
        }
        return CP_KIND_LABEL[hit.kind] || hit.kind;
    }

    function cpHitLine(hit) {
        return cpHitLabel(hit) + ': ' + hit.value;
    }

    function cpTokenAt(line, at, len) {
        const src = String(line || '');
        const left = at > 0 ? src.charAt(at - 1) : '';
        const right = at + len < src.length ? src.charAt(at + len) : '';
        const word = /[A-Za-z0-9_.-]/;
        if (left && word.test(left)) return false;
        if (right && word.test(right)) return false;
        return true;
    }

    function cpHasHint(line, hint) {
        const src = String(line || '');
        const low = src.toLowerCase();
        const h = String(hint || '').toLowerCase();
        if (h.length < 2) return false;
        let from = 0;
        let at;
        while ((at = low.indexOf(h, from)) >= 0) {
            const left = at === 0 || !/[A-Za-z0-9]/.test(src.charAt(at - 1));
            const right = at + h.length >= src.length || !/[A-Za-z0-9]/.test(src.charAt(at + h.length));
            if (left && right) return true;
            from = at + 1;
        }
        return false;
    }

    function cpHitHints(hit) {
        const hints = [];
        function add(s) {
            const t = String(s || '').toLowerCase().trim();
            if (t.length >= 2 && hints.indexOf(t) < 0) hints.push(t);
        }
        add(cpHitLabel(hit));
        if (hit.platform) add(hit.platform);
        if (hit.kind && hit.kind !== 'username') add(hit.kind);
        const extra = {
            email: ['e-mail', 'mail'],
            phone: ['tel', 'mobile', 'cell', 'telephone'],
            dob: ['dob', 'd.o.b', 'birthday', 'birth date', 'date of birth', 'born', 'birth'],
            address: ['location', 'city', 'addr'],
            alias: ['aka', 'nick', 'nickname'],
            name: ['full name', 'real name', 'display name', 'display_name', 'legal name'],
            domain: ['website', 'url', 'site'],
            date: ['timestamp', 'created']
        };
        (extra[hit.kind] || []).forEach(add);
        return hints;
    }

    function cpMarkInLine(line, value) {
        const src = String(line || '');
        const needle = String(value || '');
        if (!src || !needle) return cpEsc(src);
        const low = src.toLowerCase();
        const want = needle.toLowerCase();
        let from = 0;
        let at = -1;
        while ((from = low.indexOf(want, from)) >= 0) {
            if (cpTokenAt(src, from, needle.length)) {
                at = from;
                break;
            }
            from += 1;
        }
        if (at < 0) return '<span class="cp-x">' + cpEsc(src) + '</span>';
        const before = src.slice(0, at);
        const mid = src.slice(at, at + needle.length);
        const after = src.slice(at + needle.length);
        return (before ? '<span class="cp-x">' + cpEsc(before) + '</span>' : '') +
            '<span class="cp-keep">' + cpEsc(mid) + '</span>' +
            (after ? '<span class="cp-x">' + cpEsc(after) + '</span>' : '');
    }

    function cpHitsOnLine(line, hits, used) {
        const src = String(line || '');
        const low = src.toLowerCase();
        const tokenHits = [];
        hits.forEach(function (hit, i) {
            if (used[i]) return;
            const v = String(hit.value || '');
            if (v.length < 2) return;
            const want = v.toLowerCase();
            let from = 0;
            let at = -1;
            while ((from = low.indexOf(want, from)) >= 0) {
                if (cpTokenAt(src, from, v.length)) {
                    at = from;
                    break;
                }
                from += 1;
            }
            if (at < 0) return;
            const hinted = cpHitHints(hit).some(function (h) { return cpHasHint(src, h); });
            tokenHits.push({ i: i, hit: hit, at: at, len: v.length, hinted: hinted });
        });
        const hinted = tokenHits.filter(function (item) { return item.hinted; });
        const pool = hinted.length ? hinted : tokenHits;
        pool.sort(function (a, b) {
            if (b.len !== a.len) return b.len - a.len;
            return a.at - b.at;
        });
        const taken = [];
        const found = [];
        pool.forEach(function (item) {
            const overlap = taken.some(function (t) {
                return !(item.at + item.len <= t.at || t.at + t.len <= item.at);
            });
            if (overlap) return;
            taken.push(item);
            found.push(item);
        });
        found.sort(function (a, b) { return a.at - b.at; });
        return found;
    }

    function cpBuildSplit(raw, hits) {
        const lines = String(raw || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        const list = hits || [];
        const used = [];
        const rows = [];
        let lnL = 0;
        let lnR = 0;
        lines.forEach(function (line) {
            lnL += 1;
            const matched = cpHitsOnLine(line, list, used);
            if (!matched.length) {
                rows.push({
                    lnum: lnL,
                    ltext: line,
                    lhtml: cpEsc(line),
                    lkind: 'del',
                    rnum: '',
                    rtext: '',
                    rhtml: '',
                    rkind: 'empty'
                });
                return;
            }
            matched.forEach(function (item, j) {
                used[item.i] = 1;
                lnR += 1;
                const right = cpHitLine(item.hit);
                const rightHtml = '<span class="cp-lab">' + cpEsc(cpHitLabel(item.hit)) + '</span><span class="cp-sep">: </span><span class="cp-val">' + cpEsc(item.hit.value) + '</span>';
                if (j === 0) {
                    rows.push({
                        lnum: lnL,
                        ltext: line,
                        lhtml: cpMarkInLine(line, item.hit.value),
                        lkind: 'del',
                        rnum: lnR,
                        rtext: right,
                        rhtml: rightHtml,
                        rkind: 'add'
                    });
                } else {
                    rows.push({
                        lnum: '',
                        ltext: '',
                        lhtml: '',
                        lkind: 'empty',
                        rnum: lnR,
                        rtext: right,
                        rhtml: rightHtml,
                        rkind: 'add'
                    });
                }
            });
        });
        list.forEach(function (hit, i) {
            if (used[i]) return;
            lnR += 1;
            const right = cpHitLine(hit);
            rows.push({
                lnum: '',
                ltext: '',
                lhtml: '',
                lkind: 'empty',
                rnum: lnR,
                rtext: right,
                rhtml: '<span class="cp-lab">' + cpEsc(cpHitLabel(hit)) + '</span><span class="cp-sep">: </span><span class="cp-val">' + cpEsc(hit.value) + '</span>',
                rkind: 'add'
            });
        });
        return rows;
    }

    function cpDiffCell(kind, num, html, sign) {
        const empty = kind === 'empty';
        const cls = empty ? 'cp-empty' : (kind === 'add' ? 'cp-add' : (kind === 'del' ? 'cp-del' : 'cp-ctx'));
        const numHtml = empty || num === '' ? '' : String(num);
        const signHtml = empty ? '' : '<span class="cp-sign" aria-hidden="true">' + sign + '</span>';
        const body = empty ? '' : '<span class="cp-line">' + (html || '') + '</span>';
        return '<td class="cp-num ' + cls + '">' + numHtml + '</td>' +
            '<td class="cp-signcol ' + cls + '">' + signHtml + '</td>' +
            '<td class="cp-code ' + cls + '">' + body + '</td>';
    }

    function cpCounts(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []);
        let plus = 0;
        let minus = 0;
        rows.forEach(function (row) {
            if (row.lkind === 'del') minus += 1;
            if (row.rkind === 'add') plus += 1;
        });
        return { plus: plus, minus: minus, rows: rows };
    }

    function cpGutterText(raw) {
        const n = Math.max(1, String(raw || '').split('\n').length);
        let out = '';
        for (let i = 1; i <= n; i++) out += i + '\n';
        return out;
    }

    function renderEditor(file) {
        const i = file && file._i != null ? file._i : 0;
        const raw = String(file.raw || '');
        return '<div class="cp-editor-shell">' +
            '<pre class="cp-editor-gutter" aria-hidden="true">' + cpGutterText(raw) + '</pre>' +
            '<textarea class="cp-editor" data-cp-file="' + i + '" spellcheck="false" placeholder="Type or paste. Identifiers show on the right." aria-label="Edit ' + cpEsc(file.name || 'untitled.txt') + '">' +
            cpEsc(raw) + '</textarea></div>';
    }

    function renderStrippedBody(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []).filter(function (row) {
            return row.rkind === 'add';
        });
        if (!rows.length) {
            return '<div class="cp-strip-row cp-strip-empty">' +
                '<div class="cp-num cp-empty"></div><div class="cp-signcol cp-empty"></div>' +
                '<div class="cp-code cp-empty">No names, accounts, dates, or other identifiers in this file.</div></div>';
        }
        return rows.map(function (row, i) {
            return '<div class="cp-strip-row" style="--cp-i:' + i + '">' +
                '<div class="cp-num cp-add">' + row.rnum + '</div>' +
                '<div class="cp-signcol cp-add"><span class="cp-sign" aria-hidden="true">+</span></div>' +
                '<div class="cp-code cp-add"><span class="cp-line">' + (row.rhtml || '') + '</span></div>' +
                '</div>';
        }).join('');
    }

    function renderStrippedTable(file) {
        return '<div class="cp-pane-label"><span class="cp-th-pip" aria-hidden="true"></span>Stripped</div>' +
            '<div class="cp-strip-rows">' + renderStrippedBody(file) + '</div>';
    }

    function renderSplitDiff(file) {
        const i = file && file._i != null ? file._i : 0;
        const c = cpCounts(file);
        return '<section class="cp-diff" data-cp-card="' + i + '" style="--cp-split:' + harvesterSplitPct() + '%" aria-label="Split view">' +
            cpFileChrome(file, '<span class="cp-diff-stat"><span class="cp-diff-plus">+' + c.plus + '</span><span class="cp-diff-minus">−' + c.minus + '</span></span>') +
            '<div class="cp-diff-body">' +
            '<div class="cp-orig-pane">' +
            '<div class="cp-pane-label"><span class="cp-th-pip" aria-hidden="true"></span>Original</div>' +
            renderEditor(file) + '</div>' +
            '<div class="cp-ext-pane">' + renderStrippedTable(file) + '</div>' +
            '<div class="cp-split-gutter" role="separator" aria-orientation="vertical" aria-label="Resize original and stripped" title="Drag to resize" aria-valuemin="22" aria-valuemax="78" aria-valuenow="' + Math.round(harvesterSplitPct()) + '" tabindex="0"></div>' +
            '</div></section>';
    }

    function cpFileChrome(file, statHtml) {
        const i = file && file._i != null ? file._i : 0;
        return '<header class="cp-diff-head">' +
            '<label class="cp-diff-file">' +
            '<svg class="cp-file-ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4.5 1.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V6.207a1.5 1.5 0 0 0-.44-1.06L9.854 2.44A1.5 1.5 0 0 0 8.793 2H4.5v-.5ZM4 3a.5.5 0 0 1 .5-.5H8v2.5A1.5 1.5 0 0 0 9.5 6.5H12V13a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 13V3Zm8.146 2.5H9.5a.5.5 0 0 1-.5-.5V2.854L12.146 5.5Z"/></svg>' +
            '<input class="cp-file-name" data-cp-name="' + i + '" value="' + cpEsc(file.name || 'untitled.txt') + '" spellcheck="false" aria-label="File name"></label>' +
            '<span class="cp-diff-actions">' +
            '<button type="button" class="cp-copy-btn" data-cp-copy="' + i + '">Copy</button>' +
            (statHtml || '') +
            '</span></header>';
    }

    function cpMarkHitsInLine(line, matched) {
        const src = String(line || '');
        if (!matched.length) return cpEsc(src);
        const marks = matched.slice().sort(function (a, b) { return a.at - b.at; });
        let html = '';
        let cursor = 0;
        marks.forEach(function (item) {
            if (item.at < cursor) return;
            if (item.at > cursor) html += cpEsc(src.slice(cursor, item.at));
            html += '<span class="cp-keep">' + cpEsc(src.slice(item.at, item.at + item.len)) + '</span>';
            cursor = item.at + item.len;
        });
        if (cursor < src.length) html += cpEsc(src.slice(cursor));
        return html;
    }

    function renderOriginalDoc(file) {
        const i = file && file._i != null ? file._i : 0;
        const lines = String(file.raw || '').split('\n').length;
        return '<section class="cp-diff is-single is-original" data-cp-card="' + i + '" aria-label="Original document">' +
            cpFileChrome(file, '<span class="cp-diff-stat">' + lines + (lines === 1 ? ' line' : ' lines') + '</span>') +
            '<div class="cp-orig-pane">' +
            '<div class="cp-pane-label"><span class="cp-th-pip" aria-hidden="true"></span>Original</div>' +
            renderEditor(file) + '</div></section>';
    }

    function renderStrippedDoc(file) {
        const i = file && file._i != null ? file._i : 0;
        const rows = cpBuildSplit(file.raw, file.hits || []).filter(function (row) { return row.rkind === 'add'; });
        return '<section class="cp-diff is-single is-stripped" data-cp-card="' + i + '" aria-label="Stripped document">' +
            cpFileChrome(file, '<span class="cp-diff-stat"><span class="cp-diff-plus">+' + rows.length + '</span></span>') +
            '<div class="cp-ext-pane">' + renderStrippedTable(file) + '</div></section>';
    }

    function renderHarvesterFile(file, i) {
        if (file) file._i = i;
        const view = harvesterView();
        if (view === 'original') return renderOriginalDoc(file);
        if (view === 'stripped') return renderStrippedDoc(file);
        return renderSplitDiff(file);
    }

    function renderHarvester() {
        const drop = $('harvesterDrop');
        const result = $('harvesterResult');
        const st = harvesterState();
        harvesterSummary();
        if (!drop || !result) return;
        if (!st.ready || !(st.files || []).length) {
            drop.hidden = false;
            result.hidden = true;
            result.innerHTML = '';
            return;
        }
        drop.hidden = true;
        result.hidden = false;
        const reveal = cpReveal && !reduceMotion();
        cpReveal = false;
        result.innerHTML = '<div class="cp-stack' + (reveal ? ' cp-in' : '') + '">' + (st.files || []).map(renderHarvesterFile).join('') + '</div>';
        if (reveal) {
            result.querySelectorAll('.cp-strip-row').forEach(function (row, i) {
                row.style.setProperty('--cp-i', String(i));
            });
        }
        applyHarvesterSplit(harvesterSplitPct(), false);
    }

    function syncHarvesterGutter(ta) {
        if (!ta) return;
        const g = ta.parentNode && ta.parentNode.querySelector('.cp-editor-gutter');
        if (!g) return;
        const next = cpGutterText(ta.value);
        if (g.textContent !== next) g.textContent = next;
        g.scrollTop = ta.scrollTop;
    }

    function patchHarvesterCard(index) {
        const st = harvesterState();
        const file = st.files && st.files[index];
        if (!file) return;
        file._i = index;
        const card = document.querySelector('[data-cp-card="' + index + '"]');
        if (!card) return;
        const view = harvesterView();
        const stat = card.querySelector('.cp-diff-stat');
        if (view === 'original') {
            const lines = String(file.raw || '').split('\n').length;
            if (stat) stat.textContent = lines + (lines === 1 ? ' line' : ' lines');
            return;
        }
        const c = cpCounts(file);
        if (view === 'stripped') {
            if (stat) stat.innerHTML = '<span class="cp-diff-plus">+' + c.plus + '</span>';
        } else if (stat) {
            stat.innerHTML = '<span class="cp-diff-plus">+' + c.plus + '</span><span class="cp-diff-minus">−' + c.minus + '</span>';
        }
        const body = card.querySelector('.cp-strip-rows');
        if (body) body.innerHTML = renderStrippedBody(file);
    }

    function applyHarvesterEdit(index, raw) {
        const st = harvesterState();
        const prev = st.files && st.files[index];
        if (!prev) return;
        let text = String(raw == null ? '' : raw);
        if (text.length > CP_MAX) text = text.slice(0, CP_MAX);
        if (prev.raw === text) {
            patchHarvesterCard(index);
            return;
        }
        const next = harvestOne({ name: prev.name, type: prev.kind, size: text.length }, text);
        next.id = prev.id;
        next.kind = prev.kind || next.kind;
        next.name = prev.name;
        st.files[index] = next;
        st.hits = mergeHarvesterHits(st.files);
        st.at = new Date().toISOString();
        patchHarvesterCard(index);
        schedulePersist();
    }

    function onHarvesterEditorInput(ta) {
        const i = parseInt(ta.getAttribute('data-cp-file'), 10);
        if (isNaN(i)) return;
        syncHarvesterGutter(ta);
        clearTimeout(cpEditTimers[i]);
        cpEditTimers[i] = setTimeout(function () {
            applyHarvesterEdit(i, ta.value);
        }, 160);
    }

    function renameHarvesterFile(index, name) {
        const st = harvesterState();
        const file = st.files && st.files[index];
        if (!file) return;
        let next = String(name || '').trim() || 'untitled.txt';
        if (next.length > 120) next = next.slice(0, 120);
        if (file.name === next) return;
        file.name = next;
        st.at = new Date().toISOString();
        schedulePersist();
    }

    function newHarvesterFile(raw) {
        if (cpBusy) return;
        const text = String(raw || '');
        const harvested = harvestOne({ name: 'untitled.txt', type: 'text/plain', size: text.length }, text);
        const st = harvesterState();
        if (!Array.isArray(st.files)) st.files = [];
        st.files.push(harvested);
        st.hits = mergeHarvesterHits(st.files);
        st.ready = true;
        st.at = new Date().toISOString();
        if (st.view === 'stripped') st.view = 'split';
        hideHarvesterDownload();
        renderHarvester();
        schedulePersist();
        const editors = document.querySelectorAll('.cp-editor');
        const last = editors[editors.length - 1];
        if (last) {
            last.focus();
            const end = last.value.length;
            last.setSelectionRange(end, end);
        }
    }

    function readHarvesterFile(file) {
        return new Promise(function (resolve, reject) {
            if (file.size > CP_MAX) {
                reject(new Error(file.name + ' is larger than 2 MB'));
                return;
            }
            const reader = new FileReader();
            reader.onload = function () { resolve(String(reader.result || '')); };
            reader.onerror = function () { reject(new Error('Could not read ' + file.name)); };
            reader.readAsText(file);
        });
    }

    function ingestHarvesterFiles(list) {
        const files = Array.prototype.slice.call(list || []).filter(Boolean);
        if (!files.length || cpBusy) return;
        hideHarvesterDownload();
        setHarvesterBusy(true, 'Harvesting', 'Keeping names, accounts, dates — cutting the rest…');
        const started = Date.now();
        Promise.all(files.map(function (file) {
            return readHarvesterFile(file).then(function (raw) { return harvestOne(file, raw); });
        })).then(function (harvested) {
            const wait = Math.max(0, 520 - (Date.now() - started));
            setTimeout(function () {
                const st = harvesterState();
                st.files = harvested;
                st.hits = mergeHarvesterHits(harvested);
                st.ready = true;
                st.at = new Date().toISOString();
                setHarvesterBusy(false);
                cpReveal = true;
                renderHarvester();
                schedulePersist();
            }, wait);
        }).catch(function (error) {
            setHarvesterBusy(false);
            const drop = $('harvesterDrop');
            if (drop) {
                const strong = drop.querySelector('strong');
                if (strong) strong.textContent = error.message || 'Could not harvest that file';
            }
        });
    }

    function openHarvesterPicker() {
        const input = $('harvesterFile');
        if (input) input.click();
    }

    function clearHarvester() {
        if (cpBusy) return;
        const st = harvesterState();
        if (!st.ready && !(st.files || []).length) return;
        hideHarvesterDownload();
        st.files = [];
        st.hits = [];
        st.ready = false;
        st.at = '';
        const input = $('harvesterFile');
        if (input) input.value = '';
        const drop = $('harvesterDrop');
        if (drop) {
            const strong = drop.querySelector('strong');
            if (strong) strong.textContent = 'Drop or write a file. Keeps names, dates, accounts, passwords, times, age, and other key data.';
        }
        renderHarvester();
        schedulePersist();
    }

    function cpPlainLine(text) {
        const s = String(text == null ? '' : text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ');
        return s.length ? s : '(blank line)';
    }

    function harvesterDiffText(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []);
        const kept = [];
        const cut = [];
        rows.forEach(function (row) {
            if (row.rkind === 'add') {
                kept.push({
                    fact: row.rtext,
                    line: row.lnum,
                    source: row.ltext
                });
            }
            if (row.lkind === 'del' && row.rkind === 'empty') {
                cut.push({ line: row.lnum, text: row.ltext });
            }
        });
        const origLines = rows.filter(function (row) { return row.lkind === 'del'; }).length;
        const out = [];
        out.push('HARVESTER COMPARISON');
        out.push('File: ' + (file.name || 'untitled'));
        out.push('Kept: ' + kept.length + (kept.length === 1 ? ' extracted identifier' : ' extracted identifiers'));
        out.push('Not kept: ' + cut.length + (cut.length === 1 ? ' original line' : ' original lines') + ' with no identifier');
        out.push('Original lines shown: ' + origLines);
        out.push('');
        out.push('======== KEPT ========');
        if (!kept.length) out.push('(nothing was extracted)');
        kept.forEach(function (item, i) {
            out.push((i + 1) + '. + ' + item.fact);
            if (item.source) out.push('   from original line ' + item.line + ': ' + cpPlainLine(item.source));
            else out.push('   not tied to a single original line');
        });
        out.push('');
        out.push('======== NOT KEPT ========');
        if (!cut.length) out.push('(every original line contributed an identifier)');
        cut.forEach(function (item) {
            out.push('- line ' + item.line + ': ' + cpPlainLine(item.text));
        });
        out.push('');
        out.push('======== FULL SPLIT TABLE ========');
        out.push('Orig#  Original                                      Ext#   Extracted');
        rows.forEach(function (row) {
            const lnum = row.lnum === '' || row.lnum == null ? '    ' : String(row.lnum);
            const rnum = row.rnum === '' || row.rnum == null ? '    ' : String(row.rnum);
            const left = row.lkind === 'empty' ? '' : '- ' + cpPlainLine(row.ltext);
            const right = row.rkind === 'empty' ? '' : '+ ' + cpPlainLine(row.rtext);
            const note = row.rkind === 'add' ? '  [kept]' : (row.lkind === 'del' ? '  [not kept]' : '');
            out.push(lnum + '  ' + left);
            out.push(rnum + '  ' + right + note);
            out.push('');
        });
        return out.join('\n').replace(/\n{3,}/g, '\n\n');
    }

    function cpMarkCopied(btn, ok) {
        if (!btn) return;
        const idle = btn.getAttribute('data-cp-idle') || 'Copy';
        btn.setAttribute('data-cp-idle', idle);
        btn.textContent = ok ? 'Copied' : 'Copy failed';
        clearTimeout(btn._cpCopyT);
        btn._cpCopyT = setTimeout(function () {
            btn.textContent = btn.getAttribute('data-cp-idle') || 'Copy';
        }, 1500);
    }

    function cpWriteClipboard(text, btn) {
        const done = function (ok) { cpMarkCopied(btn, ok); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () {
                done(cpExecCopy(text));
            });
            return;
        }
        done(cpExecCopy(text));
    }

    function cpExecCopy(text) {
        let ok = false;
        function onCopy(event) {
            if (!event.clipboardData) return;
            event.preventDefault();
            event.clipboardData.setData('text/plain', text);
            ok = true;
        }
        document.addEventListener('copy', onCopy);
        try { document.execCommand('copy'); } catch (error) {}
        document.removeEventListener('copy', onCopy);
        if (ok) return true;
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:0;left:0;width:2px;height:2px;opacity:0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
            ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return !!ok;
        } catch (error) {
            return false;
        }
    }

    function copyHarvesterDiff(fileIndex, btn) {
        const st = harvesterState();
        const files = st.files || [];
        if (!st.ready || !files.length) return;
        let text = '';
        if (fileIndex != null && files[fileIndex]) text = harvesterDiffText(files[fileIndex]);
        else text = files.map(harvesterDiffText).join('\n\n' + '----------------------------------------' + '\n\n');
        cpWriteClipboard(text, btn);
    }

    function harvesterExport(fmt) {
        const st = harvesterState();
        if (!st.ready || !(st.files || []).length) return;
        const files = st.files;
        const hits = st.hits || [];
        let name = (files[0] && files[0].name ? files[0].name.replace(/\.[^.]+$/, '') : 'harvested') + '-harvested';
        let body = '';
        let type = 'text/plain';
        function row(h) {
            return {
                kind: h.platform ? h.platform : h.kind,
                value: h.value,
                field: h.kind,
                platform: h.platform || ''
            };
        }
        if (fmt === 'json') {
            type = 'application/json';
            body = JSON.stringify({ facts: hits.map(row) }, null, 2);
            name += '.json';
        } else if (fmt === 'csv') {
            type = 'text/csv';
            body = 'kind,value,platform\n' + hits.map(function (h) {
                return [h.platform || h.kind, h.value, h.platform || ''].map(function (c) {
                    const s = String(c || '');
                    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
                }).join(',');
            }).join('\n');
            name += '.csv';
        } else if (fmt === 'xml') {
            type = 'application/xml';
            body = '<?xml version="1.0" encoding="UTF-8"?>\n<harvested>\n' +
                hits.map(function (h) {
                    return '  <fact kind="' + esc(h.kind) + '"' + (h.platform ? ' platform="' + esc(h.platform) + '"' : '') + '>' + esc(h.value) + '</fact>';
                }).join('\n') + '\n</harvested>\n';
            name += '.xml';
        } else if (fmt === 'html') {
            type = 'text/html';
            body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(name) + '</title></head><body>' +
                '<h1>Harvested facts</h1><ul>' + hits.map(function (h) {
                    return '<li><b>' + esc(cpHitLabel(h)) + '</b> ' + esc(h.value) + '</li>';
                }).join('') + '</ul></body></html>';
            name += '.html';
        } else if (fmt === 'md') {
            body = '# Harvested facts\n\n' + hits.map(function (h) {
                return '- **' + cpHitLabel(h) + ':** ' + h.value;
            }).join('\n') + '\n';
            name += '.md';
        } else {
            body = hits.map(function (h) {
                return cpHitLabel(h) + ': ' + h.value;
            }).join('\n') + '\n';
            name += '.txt';
        }
        const blob = new Blob([body], { type: type + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

    const CP_FIELD = {
        email: 'email',
        phone: 'phone',
        username: 'username',
        alias: 'username',
        name: 'name',
        address: 'address',
        ip: 'ip',
        domain: 'domain',
        crypto: 'crypto',
        dob: 'dob',
        company: 'company',
        occupation: 'occupation',
        os: 'os',
        password: 'password',
        plate: 'plate',
        vehicle: 'vehicle',
        age: 'age',
        timezone: 'timezone',
        vin: 'vin',
        url: 'domain'
    };

    function inspectHarvester() {
        const st = harvesterState();
        if (!st.ready) return;
        const hits = st.hits || [];
        const names = (st.files || []).map(function (f) { return f.name; }).join(', ');
        if (host && (host.addFactSlot || host.addFact)) {
            const file = host.addFactSlot || host.addFact;
            hits.forEach(function (hit) {
                if (hit.kind === 'date' || hit.kind === 'time' || hit.kind === 'id') return;
                const field = CP_FIELD[hit.kind];
                if (!field) return;
                const extra = { source: 'harvester', method: 'file-harvest', quiet: true };
                if (hit.platform) extra.platform = hit.platform;
                file(field, hit.value, extra);
            });
            const ids = hits.filter(function (h) { return h.kind === 'id'; }).map(function (h) { return h.value; });
            if (ids.length) file('notes', 'IDs: ' + ids.join(', '), { source: 'harvester', method: 'file-harvest', quiet: true });
            const note = 'Harvested ' + names + ' — ' + hits.length + ' fact' + (hits.length === 1 ? '' : 's') + ' kept.';
            file('notes', note, { source: 'harvester', method: 'file-harvest', quiet: true });
            if (host.flushFacts) host.flushFacts();
        }
        schedulePersist();
        setPage('orbit');
    }

    function bindHarvester() {
        if (cpBound) return;
        const view = $('harvesterView');
        const drop = $('harvesterDrop');
        if (!view || !drop) return;
        cpBound = true;
        function over(event) {
            event.preventDefault();
            drop.classList.add('is-over');
        }
        function leave(event) {
            event.preventDefault();
            drop.classList.remove('is-over');
        }
        view.addEventListener('dragover', over);
        view.addEventListener('dragenter', over);
        view.addEventListener('dragleave', leave);
        view.addEventListener('drop', function (event) {
            event.preventDefault();
            drop.classList.remove('is-over');
            const files = event.dataTransfer && event.dataTransfer.files;
            if (files && files.length) {
                ingestHarvesterFiles(files);
                return;
            }
            const text = event.dataTransfer && event.dataTransfer.getData('text/plain');
            if (text) newHarvesterFile(text);
        });
        let cpSplitDrag = null;
        function onSplitMove(event) {
            if (!cpSplitDrag) return;
            applyHarvesterSplit(splitPctFromPointer(cpSplitDrag, event.clientX), false);
        }
        function onSplitUp() {
            if (!cpSplitDrag) return;
            cpSplitDrag = null;
            document.body.classList.remove('cp-splitting');
            window.removeEventListener('pointermove', onSplitMove);
            window.removeEventListener('pointerup', onSplitUp);
            applyHarvesterSplit(harvesterSplitPct(), true);
        }
        view.addEventListener('pointerdown', function (event) {
            const g = event.target.closest('.cp-split-gutter');
            if (!g || event.button) return;
            event.preventDefault();
            cpSplitDrag = g;
            document.body.classList.add('cp-splitting');
            window.addEventListener('pointermove', onSplitMove);
            window.addEventListener('pointerup', onSplitUp);
        });
        view.addEventListener('dblclick', function (event) {
            if (!event.target.closest('.cp-split-gutter')) return;
            applyHarvesterSplit(50, true);
        });
        view.addEventListener('input', function (event) {
            const ta = event.target.closest('.cp-editor');
            if (ta) {
                onHarvesterEditorInput(ta);
                return;
            }
            const name = event.target.closest('.cp-file-name');
            if (name) {
                const i = parseInt(name.getAttribute('data-cp-name'), 10);
                if (!isNaN(i)) renameHarvesterFile(i, name.value);
            }
        });
        view.addEventListener('focusout', function (event) {
            const ta = event.target.closest && event.target.closest('.cp-editor');
            if (!ta) return;
            const i = parseInt(ta.getAttribute('data-cp-file'), 10);
            if (isNaN(i)) return;
            clearTimeout(cpEditTimers[i]);
            applyHarvesterEdit(i, ta.value);
        });
        view.addEventListener('scroll', function (event) {
            if (event.target && event.target.classList && event.target.classList.contains('cp-editor')) {
                syncHarvesterGutter(event.target);
            }
        }, true);
        view.addEventListener('keydown', function (event) {
            const ta = event.target.closest('.cp-editor');
            if (ta && event.key === 'Tab') {
                event.preventDefault();
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(end);
                ta.selectionStart = ta.selectionEnd = start + 2;
                onHarvesterEditorInput(ta);
                return;
            }
            const g = event.target.closest('.cp-split-gutter');
            if (!g) return;
            const step = event.shiftKey ? 8 : 3;
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                applyHarvesterSplit(harvesterSplitPct() - step, true);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                applyHarvesterSplit(harvesterSplitPct() + step, true);
            } else if (event.key === 'Home') {
                event.preventDefault();
                applyHarvesterSplit(50, true);
            }
        });
        window.addEventListener('resize', function () {
            if (!harvesterState().ready) return;
            applyHarvesterSplit(harvesterSplitPct(), false);
        });
        document.addEventListener('click', function (event) {
            const mode = event.target.closest('#harvesterCount [data-cp-view]');
            if (mode) {
                setHarvesterView(mode.getAttribute('data-cp-view'));
                return;
            }
            if (event.target.closest('#harvesterUploadBtn, #harvesterDropBtn')) {
                openHarvesterPicker();
                return;
            }
            if (event.target.closest('#harvesterNewBtn, #harvesterDropNewBtn')) {
                newHarvesterFile('');
                return;
            }
            if (event.target.closest('#harvesterDownloadBtn')) {
                const menu = $('harvesterDownloadMenu');
                if (menu) menu.hidden = !menu.hidden;
                return;
            }
            if (event.target.closest('[data-cp-fmt]')) {
                harvesterExport(event.target.getAttribute('data-cp-fmt'));
                hideHarvesterDownload();
                return;
            }
            if (event.target.closest('#harvesterCopyBtn')) {
                copyHarvesterDiff(null, event.target.closest('#harvesterCopyBtn'));
                return;
            }
            const copyOne = event.target.closest('[data-cp-copy]');
            if (copyOne) {
                const i = parseInt(copyOne.getAttribute('data-cp-copy'), 10);
                copyHarvesterDiff(isNaN(i) ? null : i, copyOne);
                return;
            }
            if (event.target.closest('#harvesterInspectBtn')) {
                inspectHarvester();
                return;
            }
            if (event.target.closest('#harvesterClearBtn')) {
                clearHarvester();
                return;
            }
            if (!event.target.closest('.cp-dl')) hideHarvesterDownload();
        });
        document.addEventListener('keydown', function (event) {
            const btn = event.target.closest('#harvesterCount [data-cp-view]');
            if (!btn) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
            const order = ['split', 'original', 'stripped'];
            const i = order.indexOf(btn.getAttribute('data-cp-view'));
            let next = i;
            if (event.key === 'ArrowRight') next = (i + 1) % order.length;
            else if (event.key === 'ArrowLeft') next = (i + order.length - 1) % order.length;
            else if (event.key === 'Home') next = 0;
            else next = order.length - 1;
            event.preventDefault();
            setHarvesterView(order[next]);
            const focus = document.querySelector('#harvesterCount [data-cp-view="' + order[next] + '"]');
            if (focus) focus.focus();
        });
    }
