/* PDF text helpers */

    function pdfClean(text) {
        return String(text == null ? '' : text)
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2013\u2014]/g, '--')
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/[^\x20-\x7E]/g, function (ch) {
                try { return ch.normalize('NFKD').replace(/[^\x20-\x7E]/g, ''); } catch (error) { return ''; }
            });
    }

    function pdfSafe(text) {
        return pdfClean(text).replace(/\s+/g, ' ').trim();
    }

    function pdfEscape(text) {
        return pdfClean(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    }

    function measurePdf(text, size) {
        return pdfClean(text).length * size * 0.6;
    }

    function wrapPdf(text, maxW, size) {
        var words = pdfSafe(text).split(/\s+/).filter(Boolean);
        var lines = [];
        var line = '';
        function pushChunk(raw) {
            var chunk = '';
            for (var i = 0; i < raw.length; i++) {
                if (measurePdf(chunk + raw[i], size) > maxW && chunk) {
                    lines.push(chunk);
                    chunk = raw[i];
                } else chunk += raw[i];
            }
            line = chunk;
        }
        words.forEach(function (w) {
            if (measurePdf(w, size) > maxW) {
                if (line) lines.push(line);
                pushChunk(w);
                return;
            }
            var next = line ? line + ' ' + w : w;
            if (measurePdf(next, size) > maxW && line) {
                lines.push(line);
                line = w;
            } else line = next;
        });
        if (line) lines.push(line);
        return lines.length ? lines : [''];
    }

    function wrapWords(text, width) {
        return wrapPdf(text, width * 5.4, 10);
    }

    function latin1Pdf(str) {
        var out = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 255;
        return out;
    }

    function concatPdf(chunks) {
        var n = 0;
        var i;
        for (i = 0; i < chunks.length; i++) n += chunks[i].length;
        var out = new Uint8Array(n);
        var o = 0;
        for (i = 0; i < chunks.length; i++) {
            out.set(chunks[i], o);
            o += chunks[i].length;
        }
        return out;
    }

    function pdfChunksLength(chunks) {
        var n = 0;
        var i;
        for (i = 0; i < chunks.length; i++) n += chunks[i].length;
        return n;
    }

    function longPdfDate(raw) {
        var s = String(raw || '').trim();
        var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return s;
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return String(Number(m[3])) + ' ' + (months[Number(m[2]) - 1] || m[2]) + ' ' + m[1];
    }

    function displaySafe(raw) {
        var v = String(raw == null ? '' : raw).trim();
        if (!v) return '';
        if (/^(data:|blob:)/i.test(v)) return '';
        if (/^file:/i.test(v) || /^[a-zA-Z]:[\\/]/.test(v) || v.indexOf('\\Users\\') >= 0 || v.indexOf('/Users/') === 0 || v.indexOf('/home/') === 0) {
            return v.split(/[\\/]/).pop() || '';
        }
        return v;
    }

    function prettyPdfValue(raw) {
        var v = displaySafe(raw);
        if (!v) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
            var head = v.slice(0, 10);
            var rest = v.slice(10).trim();
            return rest ? longPdfDate(head) + ' ' + rest : longPdfDate(head);
        }
        return v;
    }

    var REPORT_HEAD = 'Open-source Reconnaissance Bureau of Intelligence';
    var REPORT_HEAD_SIZE = 12;
    var REPORT_BANNER = 'AUTHORIZED USE ONLY -- INFORMATION SUBJECT TO VERIFICATION -- DO NOT TREAT UNVERIFIED FINDINGS AS ESTABLISHED FACT';
    var REPORT_NOTICE = [
        'This record is intended strictly for **authorized investigative, research, and analytical purposes**. Access, reproduction, disclosure, and distribution should be limited to individuals with a legitimate need to review the information contained herein.',
        'Information within this record is derived primarily from publicly available and open-source material. Such information **cannot be presumed accurate**, as publicly available data may contain typographical errors, mistakes, or particulars that remain unconfirmed. Sources may also be false, misleading, outdated, incomplete, altered, misattributed, or otherwise unreliable. Accordingly, all findings should be treated as **information for consideration and further analysis**, rather than established fact, unless independently verified.',
        'The inclusion of a name, account, photograph, address, organization, relationship, identifier, or other data point does not by itself confirm identity, ownership, association, involvement, or responsibility. Similarities and apparent connections may be coincidental or the result of inaccurate source information.',
        'Information of material importance should be verified against its originating source and, where appropriate, corroborated through additional independent and reliable sources before any consequential action or conclusion is based upon it.',
        'This record should not be interpreted as establishing criminal activity, misconduct, intent, guilt, liability, or any other adverse conclusion regarding an individual or organization. Analytical notes, suspected associations, and unresolved leads should remain clearly distinguished from verified findings.',
        'Information may change after collection. Accounts may be modified, records corrected, websites removed, and circumstances altered. Dates, source references, and supporting evidence should therefore be considered when evaluating the reliability and continued relevance of any finding.'
    ];
    var REPORT_CLOSE = [
        'This record is to be kept strictly confidential. It is issued for the use of the recipient only. Copying, forwarding, posting, printing for circulation, or any other reproduction, disclosure, or distribution of this file, in whole or in part, should be limited to individuals with a legitimate need to review it for **authorized investigative, research, and analytical purposes**. Recipients are required to store it securely and to destroy or return it when it is no longer required. Unauthorized disclosure of the particulars herein is to be avoided in every case.',
        'Nothing in this file should be treated as established fact unless independently verified. Information of material importance should be checked against its originating source, and where appropriate corroborated through additional independent and reliable sources, before any consequential action or conclusion is based upon it. This record should not be interpreted as establishing criminal activity, misconduct, intent, guilt, liability, or any other adverse conclusion. Analytical notes, suspected associations, and unresolved leads remain **information for consideration and further analysis** only.'
    ];
    var REPORT_CLOSE_TITLE = 'LIMITATION OF RELIANCE';
    var REPORT_LIABILITY_TITLE = 'LIABILITY AND DISTRIBUTION DISCLAIMER';
    var REPORT_LIABILITY = [
        'This disclaimer serves as formal notice that the creator(s), developer(s), and contributors of OrbINT assume no responsibility or liability for the use, misuse, disclosure, reproduction, distribution, or dissemination of this document or the information contained within it once it has been generated, exported, downloaded, shared, or otherwise transferred outside of their control.',
        'Responsibility for the lawful handling, verification, security, and distribution of this document rests solely with the individual or organization possessing or using it. The creator(s) of OrbINT shall not be held responsible for any unauthorized disclosure, improper use, reliance upon unverified information, or consequences arising from actions taken by users or third parties.',
        'Generation of this document does not constitute verification, endorsement, or certification of the information contained herein.'
    ];
    var NICE_LABEL = {
        name: 'Name',
        dob: 'Date of birth',
        age: 'Age',
        phone: 'Telephone',
        email: 'Electronic mail',
        username: 'Username',
        address: 'Address',
        city: 'City',
        country: 'Country',
        countrycode: 'Country code',
        company: 'Employer / company',
        occupation: 'Occupation',
        domain: 'Website',
        ip: 'Internet address',
        vehicle: 'Vehicle',
        plate: 'Registration plate',
        vin: 'VIN',
        image: 'Photograph',
        password: 'Password',
        phoneos: 'Telephone system',
        os: 'Computer system',
        timezone: 'Timezone',
        crypto: 'Wallet',
        notes: 'Notes'
    };
    var FIELD_ORDER = ['name', 'dob', 'age', 'address', 'city', 'country', 'countrycode', 'phone', 'email', 'username', 'occupation', 'company', 'domain', 'ip', 'timezone', 'phoneos', 'os', 'vehicle', 'plate', 'vin', 'crypto', 'password', 'notes', 'image'];
    var SKIP_TITLES = {
        Untitled: 1, 'Untitled Card': 1, Frame: 1, Finding: 1, Question: 1, Square: 1, Circle: 1, Triangle: 1,
        Diamond: 1, Note: 1, Person: 1, Evidence: 1, Image: 1, Website: 1, Event: 1, Text: 1,
        Rectangle: 1, Capsule: 1, Document: 1, Line: 1, Arrow: 1, Embed: 1, 'Web Embed': 1
    };

    var CONF_LABEL = { confirmed: 'Confirmed', probable: 'Probable', possible: 'Possible', unconfirmed: 'Unconfirmed' };
    var METHOD_LABEL = {
        'open-web': 'Open web',
        'public-records': 'Public records',
        'subscriber-db': 'Subscriber DB',
        interview: 'Interview',
        'legal-process': 'Legal process'
    };

