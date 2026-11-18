/* Extra field presets, custom fields, labels */
        const EXTRA_PRESETS = [
            // Identity
            { id: 'social', label: 'Social', placeholder: 'URL or handle', group: 'identity' },
            { id: 'alias', label: 'Alias', placeholder: 'Other name', group: 'identity' },
            { id: 'nickname', label: 'Nickname', placeholder: 'Handle or nickname', group: 'identity' },
            { id: 'middle', label: 'Middle name', placeholder: 'Middle name', group: 'identity' },
            { id: 'maiden', label: "Mother's maiden name", placeholder: 'Previous surname', group: 'identity' },
            { id: 'formername', label: 'Former name', placeholder: 'Previous legal name', group: 'identity' },
            { id: 'aka', label: 'AKA', placeholder: 'Also known as', group: 'identity' },
            { id: 'family', label: 'Family', placeholder: 'Relative or associate', group: 'identity' },
            { id: 'spouse', label: 'Spouse / partner', placeholder: 'Name', group: 'identity' },
            { id: 'child', label: 'Child', placeholder: 'Name', group: 'identity' },
            { id: 'parent', label: 'Parent', placeholder: 'Name', group: 'identity' },
            { id: 'sibling', label: 'Sibling', placeholder: 'Name', group: 'identity' },
            { id: 'roommate', label: 'Roommate', placeholder: 'Name', group: 'identity' },
            { id: 'employercontact', label: 'Work contact', placeholder: 'Colleague or HR', group: 'identity' },
            { id: 'gender', label: 'Gender', placeholder: 'As publicly stated', group: 'identity' },
            { id: 'pronouns', label: 'Pronouns', placeholder: 'he/him, they/them…', group: 'identity' },
            { id: 'nationality', label: 'Nationality', placeholder: 'Citizenship or origin', group: 'identity' },
            { id: 'ethnicity', label: 'Ethnicity', placeholder: 'As publicly stated', group: 'identity' },
            { id: 'religion', label: 'Religion', placeholder: 'As publicly stated', group: 'identity' },
            { id: 'language', label: 'Language', placeholder: 'Spoken language', group: 'identity' },
            { id: 'accent', label: 'Accent', placeholder: 'Speech note', group: 'identity' },
            { id: 'school', label: 'School', placeholder: 'School or university', group: 'identity' },
            { id: 'degree', label: 'Degree', placeholder: 'Degree or certification', group: 'identity' },
            { id: 'graduation', label: 'Graduation year', placeholder: 'YYYY', group: 'identity' },
            { id: 'military', label: 'Military', placeholder: 'Service or unit', group: 'identity' },
            { id: 'rank', label: 'Rank', placeholder: 'Military or org rank', group: 'identity' },
            { id: 'bio', label: 'Bio', placeholder: 'Public bio text', group: 'identity' },
            { id: 'signature', label: 'Signature', placeholder: 'Name style or mark', group: 'identity' },
            { id: 'avatar', label: 'Avatar URL', placeholder: 'Profile image URL', group: 'identity' },

            // Person / physical
            { id: 'height', label: 'Height', placeholder: 'e.g. 5\'10" or 178 cm', group: 'person' },
            { id: 'weight', label: 'Weight', placeholder: 'e.g. 165 lb', group: 'person' },
            { id: 'build', label: 'Build', placeholder: 'Slim, athletic, heavy…', group: 'person' },
            { id: 'eyecolor', label: 'Eye color', placeholder: 'Brown, blue, hazel…', group: 'person' },
            { id: 'haircolor', label: 'Hair color', placeholder: 'Color', group: 'person' },
            { id: 'hairstyle', label: 'Hair style', placeholder: 'Length or style', group: 'person' },
            { id: 'skintone', label: 'Skin tone', placeholder: 'Description', group: 'person' },
            { id: 'facialhair', label: 'Facial hair', placeholder: 'Beard, clean-shaven…', group: 'person' },
            { id: 'tattoo', label: 'Tattoo', placeholder: 'Location and design', group: 'person' },
            { id: 'piercing', label: 'Piercing', placeholder: 'Location', group: 'person' },
            { id: 'scar', label: 'Scar / mark', placeholder: 'Visible mark', group: 'person' },
            { id: 'disability', label: 'Disability / aid', placeholder: 'As observed or stated', group: 'person' },
            { id: 'glasses', label: 'Glasses', placeholder: 'Yes / style', group: 'person' },
            { id: 'clothing', label: 'Clothing', placeholder: 'Last seen wearing', group: 'person' },
            { id: 'appearance', label: 'Appearance', placeholder: 'Build, hair, clothing', group: 'person' },
            { id: 'voice', label: 'Voice', placeholder: 'Tone or sample note', group: 'person' },
            { id: 'gait', label: 'Gait / walk', placeholder: 'How they move', group: 'person' },
            { id: 'handed', label: 'Handedness', placeholder: 'Left / right', group: 'person' },
            { id: 'bloodtype', label: 'Blood type', placeholder: 'A+, O−…', group: 'person' },
            { id: 'allergy', label: 'Allergy', placeholder: 'Known allergy', group: 'person' },
            { id: 'pet', label: 'Pet', placeholder: 'Animal or name', group: 'person' },
            { id: 'hobby', label: 'Hobby', placeholder: 'Interest or sport', group: 'person' },
            { id: 'habit', label: 'Habit', placeholder: 'Routine or pattern', group: 'person' },
            { id: 'personality', label: 'Personality', placeholder: 'Observed traits', group: 'person' },

            // Sensitive / SPII
            { id: 'ssn', label: 'SSN / national ID', placeholder: 'Only if already public', group: 'spii', caution: 'Sensitive identifier. File only from lawful public sources.' },
            { id: 'passport', label: 'Passport no.', placeholder: 'Number or country', group: 'spii', caution: 'Sensitive travel ID. File only from lawful public sources.' },
            { id: 'driverslicense', label: "Driver's license", placeholder: 'Number or state', group: 'spii', caution: 'Sensitive ID. File only from lawful public sources.' },
            { id: 'stateid', label: 'State ID', placeholder: 'Number or state', group: 'spii' },
            { id: 'taxid', label: 'Tax ID / EIN', placeholder: 'TIN, EIN, VAT…', group: 'spii' },
            { id: 'medicare', label: 'Health ID', placeholder: 'Member or policy ID', group: 'spii', caution: 'Health data is highly sensitive.' },
            { id: 'medical', label: 'Medical note', placeholder: 'Publicly known condition', group: 'spii', caution: 'Health data is highly sensitive.' },
            { id: 'biometric', label: 'Biometric', placeholder: 'Fingerprint, face ID note', group: 'spii', caution: 'Biometric data is highly sensitive.' },
            { id: 'dna', label: 'DNA / genealogy', placeholder: 'Kit or match note', group: 'spii', caution: 'Genetic data is highly sensitive.' },
            { id: 'creditcard', label: 'Card (last 4)', placeholder: '•••• 1234', group: 'spii', caution: 'Never store full card numbers.' },
            { id: 'bankaccount', label: 'Bank account', placeholder: 'Last digits or bank', group: 'spii', caution: 'Financial account data is sensitive.' },
            { id: 'routing', label: 'Routing number', placeholder: 'ABA / sort code', group: 'spii' },
            { id: 'iban', label: 'IBAN', placeholder: 'International account', group: 'spii' },
            { id: 'pin', label: 'PIN', placeholder: 'Only if already leaked', group: 'spii', caution: 'Credential. Do not use to sign in.' },
            { id: 'securityq', label: 'Security question', placeholder: 'Question or answer', group: 'spii' },
            { id: 'recoveryemail', label: 'Recovery email', placeholder: 'Backup email', group: 'spii' },
            { id: 'recoveryphone', label: 'Recovery phone', placeholder: 'Backup number', group: 'spii' },
            { id: 'seedphrase', label: 'Seed phrase', placeholder: 'Only if already exposed', group: 'spii', caution: 'Wallet seed. Extremely sensitive.' },
            { id: 'privatekey', label: 'Private key', placeholder: 'Only if already exposed', group: 'spii', caution: 'Cryptographic key. Extremely sensitive.' },
            { id: 'apikey', label: 'API key', placeholder: 'Token or key ID', group: 'spii' },
            { id: 'session', label: 'Session / cookie', placeholder: 'Token note', group: 'spii' },
            { id: 'voterid', label: 'Voter ID', placeholder: 'ID or precinct', group: 'spii' },
            { id: 'casenumber', label: 'Court case no.', placeholder: 'Docket or case ID', group: 'spii' },
            { id: 'inmate', label: 'Inmate ID', placeholder: 'Booking or DOC number', group: 'spii' },

            // Contact
            { id: 'phone2', label: 'Alt phone', placeholder: 'Second number', group: 'contact' },
            { id: 'phone3', label: 'Work phone', placeholder: 'Office or desk', group: 'contact' },
            { id: 'phonevoip', label: 'VoIP / Google Voice', placeholder: 'Number', group: 'contact' },
            { id: 'fax', label: 'Fax', placeholder: 'Fax number', group: 'contact' },
            { id: 'extension', label: 'Ext.', placeholder: 'PBX extension', group: 'contact' },
            { id: 'carrier', label: 'Carrier', placeholder: 'Verizon, T-Mobile…', group: 'contact' },
            { id: 'sms', label: 'SMS / text', placeholder: 'Number or thread note', group: 'contact' },
            { id: 'pager', label: 'Pager', placeholder: 'Pager number', group: 'contact' },
            { id: 'whatsappnum', label: 'WhatsApp number', placeholder: '+1…', group: 'contact' },

            // Life
            { id: 'birthplace', label: 'Birthplace', placeholder: 'City or hospital', group: 'life' },
            { id: 'birthyear', label: 'Birth year', placeholder: 'YYYY', group: 'life' },
            { id: 'zodiac', label: 'Zodiac', placeholder: 'Sign', group: 'life' },
            { id: 'anniversary', label: 'Anniversary', placeholder: 'Date', group: 'life' },
            { id: 'deathdate', label: 'Date of death', placeholder: 'If deceased', group: 'life' },
            { id: 'marital', label: 'Marital status', placeholder: 'Single, married…', group: 'life' },
            { id: 'children', label: 'Children count', placeholder: 'Number', group: 'life' },
            { id: 'education', label: 'Education level', placeholder: 'HS, BA, PhD…', group: 'life' },
            { id: 'employerhistory', label: 'Past employer', placeholder: 'Previous workplace', group: 'life' },
            { id: 'criminal', label: 'Criminal record', placeholder: 'Public case note', group: 'life' },
            { id: 'lawsuit', label: 'Lawsuit', placeholder: 'Civil case note', group: 'life' },
            { id: 'obituary', label: 'Obituary', placeholder: 'URL or text', group: 'life' },

            // Online
            { id: 'email2', label: 'Alt email', placeholder: 'Second email', group: 'online' },
            { id: 'emailwork', label: 'Work email', placeholder: 'name@company.com', group: 'online' },
            { id: 'emailschool', label: 'School email', placeholder: '.edu address', group: 'online' },
            { id: 'telegram', label: 'Telegram', placeholder: '@username or t.me', group: 'online' },
            { id: 'discord', label: 'Discord', placeholder: 'user#0000 or handle', group: 'online' },
            { id: 'skype', label: 'Skype', placeholder: 'Skype name', group: 'online' },
            { id: 'signal', label: 'Signal', placeholder: 'Public mention', group: 'online' },
            { id: 'matrix', label: 'Matrix / Element', placeholder: '@user:server', group: 'online' },
            { id: 'irc', label: 'IRC', placeholder: 'nick or channel', group: 'online' },
            { id: 'pgp', label: 'PGP', placeholder: 'Key ID or fingerprint', group: 'online' },
            { id: 'sshkey', label: 'SSH key', placeholder: 'Fingerprint or URL', group: 'online' },
            { id: 'useragent', label: 'Browser user agent', placeholder: 'Browser string', group: 'online' },
            { id: 'browser', label: 'Browser', placeholder: 'Chrome, Safari…', group: 'online' },
            { id: 'cookie', label: 'Cookie / tracker', placeholder: 'ID or note', group: 'online' },
            { id: 'forum', label: 'Forum', placeholder: 'Board or profile URL', group: 'online' },
            { id: 'blog', label: 'Blog', placeholder: 'URL', group: 'online' },
            { id: 'portfolio', label: 'Portfolio', placeholder: 'Site URL', group: 'online' },
            { id: 'dating', label: 'Dating profile', placeholder: 'Site or handle', group: 'online' },
            { id: 'gaming', label: 'Gaming ID', placeholder: 'Gamertag or Steam', group: 'online' },
            { id: 'nft', label: 'NFT / wallet ENS', placeholder: 'ENS or collection', group: 'online' },
            { id: 'tor', label: 'Tor / onion', placeholder: '.onion or note', group: 'online' },
            { id: 'pastebin', label: 'Paste', placeholder: 'Paste URL', group: 'online' },
            { id: 'leak', label: 'Breach / leak', placeholder: 'Source or dump name', group: 'online' },
            { id: 'darkweb', label: 'Dark web mention', placeholder: 'Market or alias', group: 'online' },

            // Device
            { id: 'imei', label: 'IMEI', placeholder: '15-digit IMEI', group: 'device' },
            { id: 'meid', label: 'MEID', placeholder: 'Device MEID', group: 'device' },
            { id: 'imsi', label: 'IMSI', placeholder: 'SIM IMSI', group: 'device' },
            { id: 'iccid', label: 'ICCID', placeholder: 'SIM card ID', group: 'device' },
            { id: 'phoneimei', label: 'Phone model', placeholder: 'iPhone 15, Pixel…', group: 'device' },
            { id: 'serial', label: 'Serial number', placeholder: 'Device serial', group: 'device' },
            { id: 'udid', label: 'UDID / device ID', placeholder: 'Mobile device ID', group: 'device' },
            { id: 'androidid', label: 'Android ID', placeholder: 'SSAID or GAID', group: 'device' },
            { id: 'idfa', label: 'IDFA / IDFV', placeholder: 'Apple ad ID', group: 'device' },
            { id: 'mac', label: 'MAC', placeholder: 'AA:BB:CC:DD:EE:FF', group: 'device', caution: 'Vendor from the OUI, plus any log or record that already has this address.' },
            { id: 'bluetooth', label: 'Bluetooth MAC', placeholder: 'BT address', group: 'device' },
            { id: 'wifimac', label: 'Wi-Fi BSSID', placeholder: 'AP MAC', group: 'device' },
            { id: 'osversion', label: 'OS version', placeholder: 'Build or version', group: 'device' },
            { id: 'browserfp', label: 'Browser fingerprint', placeholder: 'Hash or note', group: 'device' },
            { id: 'canvasfp', label: 'Canvas fingerprint', placeholder: 'Hash', group: 'device' },
            { id: 'screen', label: 'Screen', placeholder: '1920×1080', group: 'device' },
            { id: 'timezone_device', label: 'Device timezone', placeholder: 'Offset or zone', group: 'device' },
            { id: 'language_device', label: 'Device language', placeholder: 'en-US…', group: 'device' },
            { id: 'battery', label: 'Battery', placeholder: '% or note', group: 'device' },
            { id: 'carrier_device', label: 'SIM carrier', placeholder: 'Carrier on device', group: 'device' },
            { id: 'vpn', label: 'VPN / proxy', placeholder: 'Provider or IP', group: 'device' },
            { id: 'router', label: 'Router', placeholder: 'Model or MAC', group: 'device' },
            { id: 'iot', label: 'IoT device', placeholder: 'Camera, TV, etc.', group: 'device' },
            { id: 'laptop', label: 'Laptop / PC', placeholder: 'Make and model', group: 'device' },
            { id: 'tablet', label: 'Tablet', placeholder: 'Make and model', group: 'device' },
            { id: 'wearable', label: 'Wearable', placeholder: 'Watch or band', group: 'device' },
            { id: 'camera', label: 'Camera', placeholder: 'Make / EXIF model', group: 'device' },
            { id: 'drone', label: 'Drone', placeholder: 'Model or registration', group: 'device' },
            { id: 'uuid', label: 'UUID', placeholder: 'ID or GUID', group: 'device' },
            { id: 'installid', label: 'App install ID', placeholder: 'App-specific ID', group: 'device' },

            // Employment
            { id: 'title', label: 'Job title', placeholder: 'Role or title', group: 'entity' },
            { id: 'department', label: 'Department', placeholder: 'Team or division', group: 'entity' },
            { id: 'industry', label: 'Industry', placeholder: 'Sector', group: 'entity' },
            { id: 'ein', label: 'Company ID', placeholder: 'EIN, CRN, or filing no.', group: 'entity' },
            { id: 'duns', label: 'D-U-N-S', placeholder: 'DUNS number', group: 'entity' },
            { id: 'trademark', label: 'Trademark', placeholder: 'Mark or serial', group: 'entity' },
            { id: 'linkedinurl', label: 'LinkedIn URL', placeholder: 'Profile URL', group: 'entity' },
            { id: 'badge', label: 'Badge / employee ID', placeholder: 'ID number', group: 'entity' },
            { id: 'office', label: 'Office', placeholder: 'Building or floor', group: 'entity' },
            { id: 'salary', label: 'Salary band', placeholder: 'Public range only', group: 'entity' },
            { id: 'callsign', label: 'Callsign', placeholder: 'Radio or ham call', group: 'entity' },
            { id: 'asn', label: 'ASN', placeholder: 'AS12345', group: 'entity' },
            { id: 'vessel', label: 'Vessel', placeholder: 'Name or IMO', group: 'entity' },
            { id: 'aircraft', label: 'Aircraft', placeholder: 'Tail number', group: 'entity' },
            { id: 'nonprofit', label: 'Nonprofit', placeholder: 'Org name', group: 'entity' },
            { id: 'brand', label: 'Brand', placeholder: 'Product or brand', group: 'entity' },
            { id: 'license_pro', label: 'Professional license', placeholder: 'License no. or board', group: 'entity' },
            { id: 'union', label: 'Union / guild', placeholder: 'Organization', group: 'entity' },

            // Finance
            { id: 'bank', label: 'Bank', placeholder: 'Institution name', group: 'finance' },
            { id: 'paypal', label: 'PayPal', placeholder: 'Email or username', group: 'finance' },
            { id: 'venmo', label: 'Venmo', placeholder: '@handle', group: 'finance' },
            { id: 'cashapp', label: 'Cash App', placeholder: '$cashtag', group: 'finance' },
            { id: 'zelle', label: 'Zelle', placeholder: 'Email or phone', group: 'finance' },
            { id: 'wise', label: 'Wise / Revolut', placeholder: 'Handle or email', group: 'finance' },
            { id: 'stock', label: 'Stock / ticker', placeholder: 'Symbol or broker', group: 'finance' },
            { id: 'crypto_wallet', label: 'Wallet address', placeholder: '0x… or bc1…', group: 'finance' },
            { id: 'crypto_tx', label: 'TX hash', placeholder: 'Transaction ID', group: 'finance' },
            { id: 'exchange', label: 'Exchange', placeholder: 'Binance, Coinbase…', group: 'finance' },
            { id: 'einvoice', label: 'Invoice', placeholder: 'Number or URL', group: 'finance' },
            { id: 'donation', label: 'Donation / tip', placeholder: 'Link or handle', group: 'finance' },

            // Location
            { id: 'city', label: 'City', placeholder: 'City', group: 'location' },
            { id: 'country', label: 'Country', placeholder: 'Country', group: 'location' },
            { id: 'postal', label: 'Postal', placeholder: 'ZIP or postal code', group: 'location' },
            { id: 'region', label: 'Region', placeholder: 'State, province, county', group: 'location' },
            { id: 'county', label: 'County', placeholder: 'County', group: 'location' },
            { id: 'neighborhood', label: 'Neighborhood', placeholder: 'Area or district', group: 'location' },
            { id: 'landmark', label: 'Landmark', placeholder: 'Place or building', group: 'location' },
            { id: 'poi', label: 'POI', placeholder: 'Point of interest', group: 'location' },
            { id: 'geo', label: 'Coordinates', placeholder: 'lat, lng', group: 'location' },
            { id: 'pluscode', label: 'Plus Code', placeholder: 'Open Location Code', group: 'location' },
            { id: 'w3w', label: 'What3words', placeholder: 'word.word.word', group: 'location' },
            { id: 'timezone_loc', label: 'Local timezone', placeholder: 'Zone at location', group: 'location' },
            { id: 'property', label: 'Property / parcel', placeholder: 'APN or address', group: 'location' },
            { id: 'landlord', label: 'Landlord', placeholder: 'Owner or manager', group: 'location' },
            { id: 'mailing', label: 'Mailing address', placeholder: 'PO box or mail', group: 'location' },
            { id: 'previous_addr', label: 'Previous address', placeholder: 'Former residence', group: 'location' },
            { id: 'workplace_addr', label: 'Work address', placeholder: 'Office location', group: 'location' },
            { id: 'celltower', label: 'Cell tower', placeholder: 'CID / LAC note', group: 'location' },

            // Travel
            { id: 'hotel', label: 'Hotel', placeholder: 'Hotel or stay', group: 'travel' },
            { id: 'airport', label: 'Airport', placeholder: 'IATA or name', group: 'travel' },
            { id: 'flight', label: 'Flight', placeholder: 'Flight number', group: 'travel' },
            { id: 'airline', label: 'Airline', placeholder: 'Carrier', group: 'travel' },
            { id: 'pnr', label: 'PNR / booking', placeholder: 'Confirmation code', group: 'travel' },
            { id: 'visa', label: 'Visa', placeholder: 'Type or country', group: 'travel' },
            { id: 'border', label: 'Border crossing', placeholder: 'Port or date', group: 'travel' },
            { id: 'passportstamp', label: 'Entry stamp', placeholder: 'Country / date', group: 'travel' },
            { id: 'cruise', label: 'Cruise / ship', placeholder: 'Ship or booking', group: 'travel' },
            { id: 'rentalcar', label: 'Rental car', placeholder: 'Company or plate', group: 'travel' },
            { id: 'rideshare', label: 'Rideshare', placeholder: 'Uber / Lyft note', group: 'travel' },
            { id: 'loyalty', label: 'Loyalty / FF', placeholder: 'Frequent flyer no.', group: 'travel' },

            // Evidence / other
            { id: 'audio', label: 'Audio', placeholder: 'URL or upload', group: 'evidence', file: 'audio/*' },
            { id: 'record', label: 'Record', placeholder: 'Case or document', group: 'evidence' },
            { id: 'barcode', label: 'Barcode', placeholder: 'UPC, QR, or URL', group: 'evidence' },
            { id: 'color', label: 'Color', placeholder: 'Color or paint', group: 'evidence' },
            { id: 'document', label: 'Document', placeholder: 'Title or exhibit', group: 'evidence' },
            { id: 'hash', label: 'Hash', placeholder: 'MD5, SHA, or file hash', group: 'evidence' },
            { id: 'filename', label: 'Filename', placeholder: 'File name', group: 'evidence' },
            { id: 'video', label: 'Video', placeholder: 'URL or upload name', group: 'evidence' },
            { id: 'screenshot', label: 'Screenshot', placeholder: 'URL or note', group: 'evidence' },
            { id: 'exif', label: 'EXIF', placeholder: 'Camera or GPS note', group: 'evidence' },
            { id: 'metadata', label: 'Metadata', placeholder: 'File or page meta', group: 'evidence' },
            { id: 'weapon', label: 'Weapon', placeholder: 'Type or serial (public)', group: 'evidence' },
            { id: 'firearm', label: 'Firearm serial', placeholder: 'Only if public record', group: 'evidence' },
            { id: 'drug', label: 'Substance', placeholder: 'Public case note', group: 'evidence' },
            { id: 'evidence_bag', label: 'Exhibit ID', placeholder: 'Bag or tag', group: 'evidence' },
            { id: 'photo_id', label: 'Photo ID note', placeholder: 'Doc type seen', group: 'evidence' },
            { id: 'vehicle_color', label: 'Vehicle color', placeholder: 'Paint color', group: 'evidence' },
            { id: 'vehicle_make', label: 'Vehicle make', placeholder: 'Ford, Toyota…', group: 'evidence' },
            { id: 'vehicle_model', label: 'Vehicle model', placeholder: 'Model name', group: 'evidence' },
            { id: 'vehicle_year', label: 'Vehicle year', placeholder: 'YYYY', group: 'evidence' },

            // Notes / casework
            { id: 'source', label: 'Source', placeholder: 'Where this came from', group: 'notes' },
            { id: 'quote', label: 'Quote', placeholder: 'Public statement', group: 'notes' },
            { id: 'event', label: 'Event', placeholder: 'Date or incident', group: 'notes' },
            { id: 'keyword', label: 'Keyword', placeholder: 'Search term', group: 'notes' },
            { id: 'hashtag', label: 'Hashtag', placeholder: '#tag', group: 'notes' },
            { id: 'mention', label: 'Mention', placeholder: '@account or name', group: 'notes' },
            { id: 'date', label: 'Date', placeholder: 'When', group: 'notes' },
            { id: 'status', label: 'Status', placeholder: 'Open, linked, dead end', group: 'notes' },
            { id: 'confidence', label: 'Confidence', placeholder: 'Low / med / high', group: 'notes' },
            { id: 'theory', label: 'Theory', placeholder: 'Working hypothesis', group: 'notes' },
            { id: 'lead', label: 'Lead', placeholder: 'Next step', group: 'notes' },
            { id: 'deadend', label: 'Dead end', placeholder: 'What failed', group: 'notes' },
            { id: 'priority', label: 'Priority', placeholder: 'P1 / P2 / P3', group: 'notes' },
            { id: 'tag', label: 'Tag', placeholder: 'Case tag', group: 'notes' },
            { id: 'timeline', label: 'Timeline', placeholder: 'Sequence note', group: 'notes' },
            { id: 'witness', label: 'Witness', placeholder: 'Name or handle', group: 'notes' },
            { id: 'tipster', label: 'Tipster', placeholder: 'Anonymous tip note', group: 'notes' },
            { id: 'media_outlet', label: 'Media outlet', placeholder: 'Press source', group: 'notes' }
        ];
        const ADDED_KEY = 'osint-added-fields';

        function buildAddedField(spec) {
            const base = spec.cloneOf || spec.id;
            const extra = EXTRA_PRESETS.find((item) => item.id === spec.id);
            return {
                id: spec.id,
                label: spec.label,
                placeholder: spec.placeholder || 'Value',
                group: spec.group || 'custom',
                parent: spec.parent || '',
                cloneOf: spec.cloneOf || '',
                file: spec.file || (extra && extra.file) || '',
                custom: !!spec.custom,
                caution: spec.caution || (extra && extra.caution) || '',
                leads: (v, fact) => {
                    if (DEEP_LINKS[base]) return DEEP_LINKS[base](v, fact);
                    const source = FIELDS.find((item) => item.id === base && item !== spec);
                    if (source && source.leads) return source.leads(v, fact);
                    if (DEEP_LINKS[spec.id]) return DEEP_LINKS[spec.id](v, fact);
                    return engineSet(quoted(v));
                }
            };
        }

        function loadAddedSpecs() {
            try {
                const raw = JSON.parse(localStorage.getItem(ADDED_KEY) || '[]');
                return Array.isArray(raw) ? raw : [];
            } catch (error) {
                return [];
            }
        }

        function addedFieldSpecs() {
            return FIELDS.filter((field) => !STOCK_IDS.has(field.id)).map((field) => ({
                id: field.id,
                label: field.label,
                placeholder: field.placeholder,
                group: field.group || 'custom',
                parent: field.parent || '',
                cloneOf: field.cloneOf || '',
                file: field.file || '',
                custom: !!field.custom
            }));
        }

        function saveAddedFields() {
            try { localStorage.setItem(ADDED_KEY, JSON.stringify(addedFieldSpecs())); } catch (error) {}
            if (typeof queueLibrarySync === 'function') queueLibrarySync();
        }

        function isUrlFieldSpec(spec) {
            if (!spec || !spec.id) return false;
            return spec.id === 'url' || spec.cloneOf === 'url' || String(spec.id).indexOf('url-') === 0;
        }

        loadAddedSpecs().forEach((spec) => {
            if (!spec || !spec.id || isUrlFieldSpec(spec) || FIELDS.some((field) => field.id === spec.id)) return;
            FIELDS.push(buildAddedField(spec));
        });
        if (loadAddedSpecs().some(isUrlFieldSpec)) saveAddedFields();

        const LABEL_KEY = 'osint-field-labels';

        function storedFieldLabels() {
            try {
                const raw = JSON.parse(localStorage.getItem(LABEL_KEY) || '{}');
                return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
            } catch (error) {
                return {};
            }
        }

        function saveFieldLabel(id, label) {
            const map = storedFieldLabels();
            map[id] = label;
            try { localStorage.setItem(LABEL_KEY, JSON.stringify(map)); } catch (error) {}
            if (typeof queueLibrarySync === 'function') queueLibrarySync();
        }

        function applyStoredFieldLabels() {
            const map = storedFieldLabels();
            Object.keys(map).forEach((id) => {
                const field = fieldById(id);
                const name = String(map[id] || '').trim().slice(0, 28);
                if (field && name) field.label = name;
            });
            document.querySelectorAll('.node').forEach((node) => {
                const field = fieldById(node.dataset.field);
                const label = node.querySelector('label');
                if (field && label) label.textContent = field.label;
            });
        }

        function applyFieldLabel(id, label) {
            const field = fieldById(id);
            const name = String(label || '').trim().slice(0, 28);
            if (!field || !name) return;
            field.label = name;
            const node = document.querySelector('.node[data-field="' + id + '"]');
            const el = node && node.querySelector('label');
            if (el) el.textContent = name;
            saveFieldLabel(id, name);
            if (!STOCK_IDS.has(id)) saveAddedFields();
            if (typeof renderProfile === 'function') renderProfile();
        }

        const FIND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 8h.01"/></svg>';
        const DEEP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>';
        const MORE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>';
        const DUP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/><path d="M14.5 12.5v6M11.5 15.5h6"/></svg>';

