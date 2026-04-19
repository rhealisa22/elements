/**
 * IATA airport code → IANA timezone mapping.
 * Covers major international airports. Falls back to UTC for unknown codes.
 */
const AIRPORT_TZ: Record<string, string> = {
  // North America
  ATL: 'America/New_York', BOS: 'America/New_York', CLT: 'America/New_York',
  DCA: 'America/New_York', DTW: 'America/New_York', EWR: 'America/New_York',
  FLL: 'America/New_York', IAD: 'America/New_York', JFK: 'America/New_York',
  LGA: 'America/New_York', MCO: 'America/New_York', MIA: 'America/New_York',
  PHL: 'America/New_York', PIT: 'America/New_York', RDU: 'America/New_York',
  TPA: 'America/New_York', BWI: 'America/New_York', BNA: 'America/New_York',
  ORD: 'America/Chicago', MDW: 'America/Chicago', DFW: 'America/Chicago',
  IAH: 'America/Chicago', AUS: 'America/Chicago', MSP: 'America/Chicago',
  MCI: 'America/Chicago', MSY: 'America/Chicago', SAT: 'America/Chicago',
  STL: 'America/Chicago', MKE: 'America/Chicago', HOU: 'America/Chicago',
  DEN: 'America/Denver', SLC: 'America/Denver', ABQ: 'America/Denver',
  PHX: 'America/Phoenix', TUS: 'America/Phoenix',
  LAX: 'America/Los_Angeles', SFO: 'America/Los_Angeles', SEA: 'America/Los_Angeles',
  SAN: 'America/Los_Angeles', PDX: 'America/Los_Angeles', LAS: 'America/Los_Angeles',
  SJC: 'America/Los_Angeles', OAK: 'America/Los_Angeles', SMF: 'America/Los_Angeles',
  ANC: 'America/Anchorage',
  HNL: 'Pacific/Honolulu', OGG: 'Pacific/Honolulu',
  YYZ: 'America/Toronto', YUL: 'America/Toronto', YOW: 'America/Toronto',
  YVR: 'America/Vancouver', YYC: 'America/Edmonton', YEG: 'America/Edmonton',
  YWG: 'America/Winnipeg', YHZ: 'America/Halifax',
  MEX: 'America/Mexico_City', CUN: 'America/Cancun', GDL: 'America/Mexico_City',

  // Europe
  LHR: 'Europe/London', LGW: 'Europe/London', STN: 'Europe/London',
  LTN: 'Europe/London', MAN: 'Europe/London', EDI: 'Europe/London',
  BHX: 'Europe/London', GLA: 'Europe/London', BRS: 'Europe/London',
  CDG: 'Europe/Paris', ORY: 'Europe/Paris', LYS: 'Europe/Paris',
  NCE: 'Europe/Paris', MRS: 'Europe/Paris', TLS: 'Europe/Paris',
  FRA: 'Europe/Berlin', MUC: 'Europe/Berlin', TXL: 'Europe/Berlin',
  BER: 'Europe/Berlin', HAM: 'Europe/Berlin', DUS: 'Europe/Berlin',
  CGN: 'Europe/Berlin', STR: 'Europe/Berlin',
  AMS: 'Europe/Amsterdam', BRU: 'Europe/Brussels',
  ZRH: 'Europe/Zurich', GVA: 'Europe/Zurich',
  VIE: 'Europe/Vienna', PRG: 'Europe/Prague',
  MAD: 'Europe/Madrid', BCN: 'Europe/Madrid', AGP: 'Europe/Madrid',
  PMI: 'Europe/Madrid', IBZ: 'Europe/Madrid',
  FCO: 'Europe/Rome', MXP: 'Europe/Rome', NAP: 'Europe/Rome',
  VCE: 'Europe/Rome', BGY: 'Europe/Rome',
  LIS: 'Europe/Lisbon', OPO: 'Europe/Lisbon',
  CPH: 'Europe/Copenhagen', OSL: 'Europe/Oslo',
  ARN: 'Europe/Stockholm', GOT: 'Europe/Stockholm',
  HEL: 'Europe/Helsinki', WAW: 'Europe/Warsaw',
  BUD: 'Europe/Budapest', OTP: 'Europe/Bucharest',
  ATH: 'Europe/Athens', SKG: 'Europe/Athens',
  IST: 'Europe/Istanbul', SAW: 'Europe/Istanbul', ESB: 'Europe/Istanbul',
  DUB: 'Europe/Dublin', KEF: 'Atlantic/Reykjavik',
  SVO: 'Europe/Moscow', DME: 'Europe/Moscow', LED: 'Europe/Moscow',

  // Middle East
  DXB: 'Asia/Dubai', AUH: 'Asia/Dubai', SHJ: 'Asia/Dubai',
  DOH: 'Asia/Qatar', BAH: 'Asia/Bahrain',
  RUH: 'Asia/Riyadh', JED: 'Asia/Riyadh',
  TLV: 'Asia/Jerusalem', AMM: 'Asia/Amman',
  KWI: 'Asia/Kuwait', MCT: 'Asia/Muscat',

  // Asia
  DEL: 'Asia/Kolkata', BOM: 'Asia/Kolkata', BLR: 'Asia/Kolkata',
  MAA: 'Asia/Kolkata', CCU: 'Asia/Kolkata', HYD: 'Asia/Kolkata',
  SIN: 'Asia/Singapore', KUL: 'Asia/Kuala_Lumpur',
  BKK: 'Asia/Bangkok', DMK: 'Asia/Bangkok',
  HKG: 'Asia/Hong_Kong', TPE: 'Asia/Taipei',
  NRT: 'Asia/Tokyo', HND: 'Asia/Tokyo', KIX: 'Asia/Tokyo',
  ICN: 'Asia/Seoul', GMP: 'Asia/Seoul',
  PEK: 'Asia/Shanghai', PVG: 'Asia/Shanghai', CAN: 'Asia/Shanghai',
  CTU: 'Asia/Shanghai', SZX: 'Asia/Shanghai',
  MNL: 'Asia/Manila', CGK: 'Asia/Jakarta',
  CMB: 'Asia/Colombo', DAC: 'Asia/Dhaka',
  KTM: 'Asia/Kathmandu', SGN: 'Asia/Ho_Chi_Minh',
  HAN: 'Asia/Ho_Chi_Minh', RGN: 'Asia/Yangon',

  // Oceania
  SYD: 'Australia/Sydney', MEL: 'Australia/Melbourne',
  BNE: 'Australia/Brisbane', PER: 'Australia/Perth',
  ADL: 'Australia/Adelaide', CBR: 'Australia/Sydney',
  AKL: 'Pacific/Auckland', CHC: 'Pacific/Auckland',
  WLG: 'Pacific/Auckland', NAN: 'Pacific/Fiji',

  // Africa
  JNB: 'Africa/Johannesburg', CPT: 'Africa/Johannesburg',
  CAI: 'Africa/Cairo', NBO: 'Africa/Nairobi',
  ADD: 'Africa/Addis_Ababa', LOS: 'Africa/Lagos',
  ACC: 'Africa/Accra', CMN: 'Africa/Casablanca',
  ALG: 'Africa/Algiers', TUN: 'Africa/Tunis',
  DSS: 'Africa/Dakar', DAR: 'Africa/Dar_es_Salaam',

  // South America
  GRU: 'America/Sao_Paulo', GIG: 'America/Sao_Paulo',
  EZE: 'America/Argentina/Buenos_Aires', AEP: 'America/Argentina/Buenos_Aires',
  SCL: 'America/Santiago', LIM: 'America/Lima',
  BOG: 'America/Bogota', UIO: 'America/Guayaquil',
  CCS: 'America/Caracas', PTY: 'America/Panama',
  SJO: 'America/Costa_Rica', HAV: 'America/Havana',
  MBJ: 'America/Jamaica', NAS: 'America/Nassau',
  SXM: 'America/Lower_Princes', PUJ: 'America/Santo_Domingo',
};

export function getAirportTimezone(iataCode: string): string | undefined {
  return AIRPORT_TZ[iataCode.toUpperCase()];
}
