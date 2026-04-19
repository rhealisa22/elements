import type { ParsedFlight } from '../types';

// Common IATA airport codes (major + US regional)
const IATA_CODES = new Set([
  'ATL','PEK','DXB','LAX','ORD','LHR','HND','CDG','DFW','CAN',
  // US regional airports
  'ALB','ABQ','AMA','AUS','BDL','BHM','BNA','BOI','BTV','BUF',
  'BUR','BWI','CAE','CAK','CHS','CID','CLE','CMH','COS','CRP',
  'CVG','DAB','DAY','DSM','ELP','EUG','EYW','FAT','FNT','FSD',
  'FWA','GEG','GPT','GRR','GSO','GSP','GUC','HDN','HSV','ICT',
  'ILM','IND','ISP','ITH','JAC','JAX','JAN','LBB','LEX','LFT',
  'LGB','LIT','MAF','MBS','MCI','MDT','MDW','MFE','MHT','MKE',
  'MLI','MOB','MRY','MSN','MSY','MYR','OAK','OKC','OMA','ONT',
  'PBI','PDX','PHL','PIA','PIT','PNS','PSC','PSP','PVD','PWM',
  'RAP','RDU','RIC','RNO','ROA','ROC','RSW','SAN','SAT','SAV',
  'SBN','SDF','SGF','SHV','SJC','SLC','SMF','SNA','SPI','SRQ',
  'STL','SWF','SYR','TLH','TOL','TRI','TUL','TUS','TYS','VPS',
  'XNA',
  'AMS','FRA','IST','DEL','SIN','ICN','DEN','BKK','JFK','KUL',
  'SFO','MAD','CTU','SEA','MIA','BCN','MUC','YYZ','LGW','SYD',
  'PVG','SZX','BOM','GRU','MEL','HKG','EWR','SHA','MCO','PHX',
  'NRT','IAH','CLT','MNL','FCO','AUH','DOH','CGK','SVO','BOG',
  'KMG','ORY','TPE','JNB','OSL','ZRH','LAS','BOS','CPH','MXP',
  'YVR','MSP','IAD','TPA','DTW','ARN','FLL','STN','DUB','HEL',
  'VIE','LIS','ATH','BNE','PER','MAN','EDI','GLA','BHX','BRS',
  'NCL','BFS','LTN','STR','HAM','TXL','DUS','CGN','BER','LEJ',
  'PMI','AGP','VLC','SVQ','BIO','TFS','LPA','ACE','FUE','IBZ',
  'OPO','FAO','NAP','PSA','VCE','BLQ','CTA','PMO','OLB','TRN',
  'WAW','KRK','PRG','BUD','OTP','SOF','BEG','ZAG','LJU','SKP',
  'TIA','HER','SKG','RHO','CFU','CHQ','MYK','JTR','SPC','FNC',
  'RAK','CMN','TUN','CAI','ADD','NBO','DAR','CPT','DUR','ACC',
  'LOS','ABV','ALG','SSH','HRG','MRU','SEZ','TNR','MPM','WDH',
  'BKO','DKR','ABJ','CKY','FNA','ROB','OUA','NIM','LFW','COO',
  'PNR','LBV','DLA','FIH','BZV','BGF','NDJ','KGL','EBB','MGQ',
  'JIB','ASM','KRT','JUB','HGA','MBA','ZNZ','MWZ','JRO','LLW',
  'BLZ','HRE','VFA','LUN','GBE','MTS','MSU','LEW','TBU','APW',
  'CXI','TRW','NAN','SUV','PPT','AKL','WLG','CHC','ZQN','DUD',
  'POM','HIR','NOU','VLI','FUN','ROR','YAP','TKK','PNI','KSA',
  'MAJ','KWA','INU','ADL','CNS','OOL','TSV','DRW','HBA','CBR',
  'CFS','RMQ','KHH','TAE','PUS','CJU','CTS','KIX','NGO','FUK',
  'OKA','SDJ','KOJ','HIJ','OKJ','MMJ','NGS','KMJ','OIT','MYJ',
  'TAK','TKS','UBJ','GAJ','AKJ','KUH','MBE','WKJ','MMB','SHB',
  'BJS','TNA','CGO','CSX','NKG','WUH','XIY','CKG','URC','KHN',
  'TAO','DLC','HGH','NNG','HAK','SYX','LHW','XMN','FOC','WNZ',
  'HET','INC','XNN','TYN','KWL','KWE','ZUH','YNT','WEH','CGQ',
  'HRB','MDG','SHE','DSN','BAV','DAX','LYG','NTG','YNZ','HSN',
  'CMB','MLE','KTM','DAC','CCU','MAA','BLR','HYD','COK','TRV',
  'GOI','AMD','BBI','PAT','GAU','IXB','IMF','DMK','CNX','HKT',
  'USM','KBV','UTH','CEI','URT','NST','SGN','HAN','DAD','PQC',
  'CXR','VDO','HPH','REP','PNH','VTE','LPQ','RGN','MDL','NYT',
  'BWN','KCH','BKI','MYY','LBU','TWU','SDK','BTU','MKZ','SBW',
  'SUB','DPS','JOG','SOC','SRG','UPG','BPN','MDC','AMQ','TIM',
  'DJJ','MES','PLM','PKU','BTH','PGK','TJQ','KNO','DJB','PDG',
  'PTY','SJO','LIR','MGA','SAP','TGU','BZE','GUA','SAL','CUN',
  'MEX','GDL','MTY','PVR','SJD','MID','OAX','BJX','CUL','HMO',
  'TIJ','AGU','SLP','TAM','VER','CME','VSA','CTM','ZIH','ACA',
  'HAV','VRA','SCU','HOG','SNU','CYO','MBJ','KIN','NAS','FPO',
  'GGT','ELH','SDQ','PUJ','STI','POP','SJU','PSE','BQN','STT',
  'STX','SXM','ANU','BGI','POS','TAB','GND','SVD','DOM','SLU',
  'UVF','SKB','EIS','AXA','GCM','PTP','FDF','CUR','BON','AUA',
  'PAP','GEO','PBM','CCS','MAR','BLA','PMV','VLN','MDE','CLO',
  'CTG','ADZ','BOG','UIO','GYE','CUE','OCC','GPS','LIM','CUZ',
  'AQP','PIU','TRU','IQT','TCQ','JUL','SCL','CCP','PMC','ZAL',
  'IQQ','ANF','CJC','ARI','PUQ','IPC','EZE','AEP','COR','MDZ',
  'BRC','IGR','SLA','ROS','TUC','NQN','USH','FTE','MVD','ASU',
  'VVI','CBB','LPB','SRE','TDD','SRZ','GIG','CGH','BSB','SSA',
  'REC','FOR','MAO','BEL','CWB','POA','FLN','VCP','CNF','GYN',
  'SLZ','THE','NAT','JPA','MCZ','AJU','PMW','MCP','STM','TFF',
  'ORU','TJA','SUC','PSZ','RIB','BYM','MOA','ANC','FAI','JNU',
  'SIT','KTN','HNL','OGG','KOA','LIH','ITO','PPG','GUM','SPN',
  'YOW','YUL','YHZ','YQB','YWG','YEG','YYC','YXE','YQR','YXU',
  'YKF','YQT','YXY','YZF','YFB','YEV','YCB','YHY','YVP','YGL',
  'RUH','JED','DMM','MED','AHB','TIF','TUU','ABT','ELQ','HAS',
  'AMM','BEY','TLV','BGW','BSR','EBL','NJF','ISU','THR','IFN',
  'MHD','SYZ','TBZ','AWZ','KER','BND','BUZ','GBT','RAS','AZD',
  'IST','SAW','ESB','AYT','ADB','DLM','BJV','GZP','TZX','ERZ',
  'VAN','DIY','GZT','ASR','KYA','MLX','SZF','KCM','DNZ','AOE',
  'BAH','KWI','MCT','SLL','AUH','DXB','SHJ','RKT','DOH','GYD',
  'TBS','EVN','FRU','OSS','TAS','SKD','BHK','NMA','UGC','GYD',
  'ASB','CIT','ALA','TSE','NQZ','URA','AKX','GUW','PWQ','UKK',
  'DYU','LBD','KQT','KJI','MYP','CRZ','DLB',
]);

// Common airline code to name map
const AIRLINE_NAMES: Record<string, string> = {
  'AA': 'American Airlines', 'BA': 'British Airways', 'LH': 'Lufthansa',
  'AF': 'Air France', 'KL': 'KLM', 'DL': 'Delta', 'UA': 'United',
  'EK': 'Emirates', 'QF': 'Qantas', 'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific', 'QR': 'Qatar Airways', 'EY': 'Etihad',
  'TK': 'Turkish Airlines', 'LX': 'Swiss', 'OS': 'Austrian',
  'AZ': 'ITA Airways', 'IB': 'Iberia', 'SK': 'SAS',
  'AY': 'Finnair', 'EI': 'Aer Lingus', 'TP': 'TAP Portugal',
  'AC': 'Air Canada', 'NH': 'ANA', 'JL': 'Japan Airlines',
  'CZ': 'China Southern', 'MU': 'China Eastern', 'CA': 'Air China',
  'OZ': 'Asiana', 'KE': 'Korean Air', 'GA': 'Garuda Indonesia',
  'MH': 'Malaysia Airlines', 'TG': 'Thai Airways', 'VN': 'Vietnam Airlines',
  'WN': 'Southwest', 'B6': 'JetBlue', 'NK': 'Spirit', 'F9': 'Frontier',
  'AS': 'Alaska Airlines', 'HA': 'Hawaiian Airlines', 'WS': 'WestJet',
  'FR': 'Ryanair', 'U2': 'easyJet', 'W6': 'Wizz Air',
  'VS': 'Virgin Atlantic', 'DY': 'Norwegian', 'FI': 'Icelandair',
  'LO': 'LOT', 'RO': 'TAROM', 'SU': 'Aeroflot',
  'SA': 'South African Airways', 'ET': 'Ethiopian Airlines',
  'MS': 'EgyptAir', 'AT': 'Royal Air Maroc',
  'AM': 'Aeromexico', 'AV': 'Avianca', 'LA': 'LATAM',
  'CM': 'Copa Airlines', 'AR': 'Aerolineas Argentinas',
  'G3': 'Gol', 'AD': 'Azul', 'JQ': 'Jetstar',
  'VA': 'Virgin Australia', 'NZ': 'Air New Zealand',
  'FJ': 'Fiji Airways', 'AI': 'Air India', '6E': 'IndiGo',
  'WY': 'Oman Air', 'GF': 'Gulf Air', 'SV': 'Saudia',
  'PK': 'PIA', 'UL': 'SriLankan', 'BI': 'Royal Brunei',
};

export function extractFlightsFromHtml(html: string, source: 'email' | 'screenshot' = 'email'): ParsedFlight[] {
  const flights: ParsedFlight[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || '');
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (item['@type'] === 'FlightReservation' && item.reservationFor) {
          const flight = item.reservationFor;
          flights.push({
            flightNumber: flight.flightNumber || `${flight.airline?.iataCode || ''} ${flight.flightNumber || ''}`.trim(),
            date: (flight.departureTime || '').split('T')[0] || '',
            airline: flight.airline?.name || AIRLINE_NAMES[flight.airline?.iataCode || ''] || '',
            origin: flight.departureAirport?.iataCode || '',
            destination: flight.arrivalAirport?.iataCode || '',
            departureTime: formatTime(flight.departureTime),
            arrivalTime: formatTime(flight.arrivalTime),
            confidence: 'high',
            source,
            dateDetected: true,
          });
        } else if (item['@type'] === 'Flight') {
          flights.push({
            flightNumber: item.flightNumber || '',
            date: (item.departureTime || '').split('T')[0] || '',
            airline: item.airline?.name || AIRLINE_NAMES[item.airline?.iataCode || ''] || '',
            origin: item.departureAirport?.iataCode || '',
            destination: item.arrivalAirport?.iataCode || '',
            departureTime: formatTime(item.departureTime),
            arrivalTime: formatTime(item.arrivalTime),
            confidence: 'high',
            source,
            dateDetected: true,
          });
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }

  return flights;
}

function formatTime(isoOrTime: string | undefined): string {
  if (!isoOrTime) return '';
  if (isoOrTime.includes('T')) {
    const timePart = isoOrTime.split('T')[1];
    return timePart ? timePart.substring(0, 5) : '';
  }
  return isoOrTime;
}

// City/airport name → IATA code mapping for OCR text that uses full names
const CITY_TO_IATA: Record<string, string> = {
  'albany': 'ALB', 'albuquerque': 'ABQ', 'amarillo': 'AMA',
  'new york': 'JFK', 'newark': 'EWR', 'laguardia': 'LGA',
  'los angeles': 'LAX', 'san francisco': 'SFO', 'chicago': 'ORD',
  "chicago o'hare": 'ORD', 'chicago midway': 'MDW',
  'dallas': 'DFW', 'houston': 'IAH', 'miami': 'MIA', 'atlanta': 'ATL',
  'denver': 'DEN', 'seattle': 'SEA', 'boston': 'BOS', 'phoenix': 'PHX',
  'las vegas': 'LAS', 'orlando': 'MCO', 'minneapolis': 'MSP',
  'detroit': 'DTW', 'philadelphia': 'PHL', 'charlotte': 'CLT',
  'tampa': 'TPA', 'san diego': 'SAN', 'portland': 'PDX',
  'salt lake city': 'SLC', 'nashville': 'BNA', 'austin': 'AUS',
  'washington': 'IAD', 'baltimore': 'BWI', 'honolulu': 'HNL',
  'anchorage': 'ANC', 'san jose': 'SJC', 'raleigh': 'RDU',
  'london': 'LHR', 'london heathrow': 'LHR', 'london gatwick': 'LGW',
  'london stansted': 'STN', 'london city': 'LCY', 'london luton': 'LTN',
  'paris': 'CDG', 'paris cdg': 'CDG', 'paris orly': 'ORY',
  'frankfurt': 'FRA', 'amsterdam': 'AMS', 'munich': 'MUC',
  'madrid': 'MAD', 'barcelona': 'BCN', 'rome': 'FCO', 'milan': 'MXP',
  'lisbon': 'LIS', 'dublin': 'DUB', 'zurich': 'ZRH', 'vienna': 'VIE',
  'brussels': 'BRU', 'copenhagen': 'CPH', 'oslo': 'OSL',
  'stockholm': 'ARN', 'helsinki': 'HEL', 'warsaw': 'WAW',
  'prague': 'PRG', 'budapest': 'BUD', 'athens': 'ATH',
  'istanbul': 'IST', 'moscow': 'SVO', 'manchester': 'MAN',
  'edinburgh': 'EDI', 'glasgow': 'GLA', 'birmingham': 'BHX',
  'dubai': 'DXB', 'abu dhabi': 'AUH', 'doha': 'DOH',
  'riyadh': 'RUH', 'jeddah': 'JED', 'muscat': 'MCT',
  'bahrain': 'BAH', 'kuwait': 'KWI',
  'tokyo': 'NRT', 'tokyo narita': 'NRT', 'tokyo haneda': 'HND',
  'osaka': 'KIX', 'seoul': 'ICN', 'beijing': 'PEK', 'shanghai': 'PVG',
  'hong kong': 'HKG', 'taipei': 'TPE', 'bangkok': 'BKK',
  'singapore': 'SIN', 'kuala lumpur': 'KUL', 'manila': 'MNL',
  'jakarta': 'CGK', 'delhi': 'DEL', 'new delhi': 'DEL',
  'mumbai': 'BOM', 'bangalore': 'BLR', 'chennai': 'MAA',
  'sydney': 'SYD', 'melbourne': 'MEL', 'brisbane': 'BNE',
  'perth': 'PER', 'auckland': 'AKL', 'wellington': 'WLG',
  'toronto': 'YYZ', 'vancouver': 'YVR', 'montreal': 'YUL',
  'calgary': 'YYC', 'ottawa': 'YOW', 'edmonton': 'YEG',
  'mexico city': 'MEX', 'cancun': 'CUN', 'sao paulo': 'GRU',
  'rio de janeiro': 'GIG', 'buenos aires': 'EZE', 'lima': 'LIM',
  'bogota': 'BOG', 'santiago': 'SCL', 'johannesburg': 'JNB',
  'cape town': 'CPT', 'cairo': 'CAI', 'nairobi': 'NBO',
  'casablanca': 'CMN', 'lagos': 'LOS', 'addis ababa': 'ADD',
};

// Common English 3-letter words to exclude from airport code detection
const STOP_WORDS_3 = new Set([
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
  'WAS', 'ONE', 'OUR', 'OUT', 'HAS', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW',
  'NOW', 'OLD', 'SEE', 'WAY', 'WHO', 'DID', 'GET', 'HIM', 'LET', 'SAY',
  'SHE', 'TOO', 'USE', 'DAY', 'FLY', 'AIR', 'EST', 'PST', 'CST', 'MST',
  'GMT', 'UTC', 'VIA', 'PER', 'DUE', 'SET', 'RUN', 'GOT', 'PUT', 'END',
  'FAR', 'FEW', 'BIG', 'OWN', 'WHY', 'TRY', 'ASK', 'MEN', 'RAN', 'OFF',
  'TOP', 'AGO', 'RED', 'YET', 'BOX', 'CUT', 'HOT', 'BED', 'MAP', 'CAR',
  'LOW', 'YES', 'BAD', 'BIT', 'SIT', 'TAX', 'FIT', 'WON', 'BAG', 'MET',
  'JOB', 'EAT', 'KEY', 'AGE', 'PAY', 'LAW', 'BUS', 'WAR', 'CUP', 'TEN',
  'WET', 'LOG', 'NET', 'DOG', 'DRY', 'LEG', 'HAD', 'HIT', 'RUN', 'BUY',
  'FUN', 'ROW', 'ADD', 'GAS', 'SUN', 'GUN', 'ARM', 'BIG', 'WIN', 'DIE',
  'LAY', 'MIX', 'RAW', 'GAP', 'AID', 'TIP', 'DBA', 'EST', 'JAN', 'FEB',
  'MAR', 'APR', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'MON',
  'TUE', 'WED', 'THU', 'FRI', 'SAT', 'USD', 'EUR', 'GBP', 'JPY', 'CNY',
  'REF', 'INFO', 'AVG', 'MAX', 'MIN', 'ETD', 'ETA', 'ARR', 'DEP',
]);

export function extractFlightsFromText(text: string, source: 'email' | 'screenshot' = 'email'): ParsedFlight[] {
  const flights: ParsedFlight[] = [];

  // Normalize: uppercase version for IATA/flight matching
  const upper = text.toUpperCase();
  // Keep original for city name matching
  const lower = text.toLowerCase();

  // Extract flight numbers: 2-letter airline code + 1-4 digit number
  const flightNumberRegex = /\b([A-Z]{2})\s?(\d{1,4})\b/g;
  const flightNumbers: { full: string; airline: string }[] = [];
  let fnMatch;
  while ((fnMatch = flightNumberRegex.exec(upper)) !== null) {
    const airlineCode = fnMatch[1];
    if (['AM', 'PM', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'NO', 'ID', 'TO', 'AT', 'ON', 'IN', 'BY', 'IS', 'OR', 'AN', 'IF', 'DO', 'SO', 'UP', 'US', 'NY', 'IL', 'CA', 'TX', 'FL', 'WA', 'CO', 'AZ', 'GA', 'NC', 'VA', 'PA', 'OH', 'MI', 'NJ', 'MA', 'MN', 'MO', 'MD', 'CT', 'SC', 'AL', 'LA', 'KY', 'OK', 'IA', 'UT', 'NV', 'NE', 'NM', 'HI', 'NH', 'RI', 'MT', 'DE', 'ND', 'SD', 'AK', 'WV', 'WY', 'ME', 'VT'].includes(airlineCode)) continue;
    flightNumbers.push({
      full: `${airlineCode} ${fnMatch[2]}`,
      airline: airlineCode,
    });
  }

  // Collect airport codes with their position in the text so we preserve order
  const codePositions: Map<string, number> = new Map();

  function addCode(code: string, position: number) {
    if (STOP_WORDS_3.has(code)) return;
    if (!codePositions.has(code)) {
      codePositions.set(code, position);
    }
  }

  // Strategy 1: Match known IATA codes
  const codeRegex = /\b([A-Z]{3})\b/g;
  let codeMatch;
  while ((codeMatch = codeRegex.exec(upper)) !== null) {
    if (IATA_CODES.has(codeMatch[1])) {
      addCode(codeMatch[1], codeMatch.index);
    }
  }

  // Strategy 2: City name to IATA lookup — use the city's position in text
  for (const [city, iata] of Object.entries(CITY_TO_IATA)) {
    const idx = lower.indexOf(city);
    if (idx !== -1) {
      addCode(iata, idx);
    }
  }

  // Sort by position in text to preserve origin → destination order
  const foundCodes = [...codePositions.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code);

  // Extract dates (works on original text since date regexes are case-insensitive)
  const dates = extractDates(text);

  // Extract times
  const times = extractTimes(text);

  // Fall back to today's date if OCR didn't capture the date
  const today = new Date().toISOString().split('T')[0];
  const dateDetected = dates.length > 0;
  const date = dateDetected ? dates[0] : today;

  const hasFlightNum = flightNumbers.length > 0;
  const hasTwoAirports = foundCodes.length >= 2;

  // Need: (flight number OR two airports) AND at least one airport
  if (hasFlightNum && foundCodes.length >= 1) {
    for (const fn of flightNumbers) {
      flights.push({
        flightNumber: fn.full,
        date,
        airline: AIRLINE_NAMES[fn.airline] || fn.airline,
        origin: foundCodes[0] || '',
        destination: foundCodes.length > 1 ? foundCodes[1] : '',
        departureTime: times[0] || '',
        arrivalTime: times.length > 1 ? times[1] : '',
        confidence: 'medium',
        source,
        dateDetected,
      });
    }
  } else if (hasTwoAirports) {
    flights.push({
      flightNumber: `${foundCodes[0]}-${foundCodes[1]}`,
      date,
      airline: '',
      origin: foundCodes[0],
      destination: foundCodes[1],
      departureTime: times[0] || '',
      arrivalTime: times.length > 1 ? times[1] : '',
      confidence: 'medium',
      source,
      dateDetected,
    });
  }

  return flights;
}

function extractDates(text: string): string[] {
  const dates: string[] = [];

  // ISO: 2026-03-07
  const isoRegex = /\b(\d{4}-\d{2}-\d{2})\b/g;
  let m;
  while ((m = isoRegex.exec(text)) !== null) dates.push(m[1]);

  // DD Mon YYYY: 07 Mar 2026
  const dmy = /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b/gi;
  while ((m = dmy.exec(text)) !== null) {
    dates.push(formatDateParts(m[3], m[2], m[1]));
  }

  // Mon DD, YYYY: Mar 07, 2026
  const mdy = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/gi;
  while ((m = mdy.exec(text)) !== null) {
    dates.push(formatDateParts(m[3], m[1], m[2]));
  }

  // DD/MM/YYYY or MM/DD/YYYY — assume DD/MM
  const slash = /\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/g;
  while ((m = slash.exec(text)) !== null) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    dates.push(`${m[3]}-${month}-${day}`);
  }

  return dates;
}

function formatDateParts(year: string, month: string, day: string): string {
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const m = months[month.toLowerCase().substring(0, 3)] || '01';
  return `${year}-${m}-${day.padStart(2, '0')}`;
}

function extractTimes(text: string): string[] {
  const times: string[] = [];

  // HH:MM (24h)
  const t24 = /\b(\d{1,2}):(\d{2})\b/g;
  let m;
  while ((m = t24.exec(text)) !== null) {
    const h = parseInt(m[1]);
    if (h >= 0 && h <= 23) {
      times.push(`${m[1].padStart(2, '0')}:${m[2]}`);
    }
  }

  // H:MM am/pm
  const t12 = /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/gi;
  while ((m = t12.exec(text)) !== null) {
    let h = parseInt(m[1]);
    const isPM = m[3].toLowerCase() === 'pm';
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    times.push(`${h.toString().padStart(2, '0')}:${m[2]}`);
  }

  return [...new Set(times)];
}

export function extractFlights(
  htmlBody: string | null,
  textBody: string | null,
  source: 'email' | 'screenshot' = 'email'
): ParsedFlight[] {
  const flights: ParsedFlight[] = [];

  // Try JSON-LD from HTML first (highest confidence)
  if (htmlBody) {
    flights.push(...extractFlightsFromHtml(htmlBody, source));
  }

  // If no structured data found, try regex on text body
  if (flights.length === 0 && textBody) {
    flights.push(...extractFlightsFromText(textBody, source));
  }

  // Also try regex on HTML text content if no results yet
  if (flights.length === 0 && htmlBody) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlBody, 'text/html');
    const plainText = doc.body?.textContent || '';
    flights.push(...extractFlightsFromText(plainText, source));
  }

  return flights;
}
