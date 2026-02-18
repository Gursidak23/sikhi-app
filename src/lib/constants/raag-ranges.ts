/**
 * SGGS Raag Ranges — Single Source of Truth
 * ============================================================================
 * Complete mapping of all sections in Sri Guru Granth Sahib Ji.
 * Used across: Gurbani page, cached API route, seed scripts, navigation.
 * 
 * DO NOT duplicate this data elsewhere. Import from here.
 * ============================================================================
 */

export interface RaagRange {
  id: string;
  name: { pa: string; en: string };
  angStart: number;
  angEnd: number;
}

export const SGGS_RAAG_RANGES: RaagRange[] = [
  { id: 'japji', name: { pa: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', en: 'Japji Sahib' }, angStart: 1, angEnd: 8 },
  { id: 'so-dar', name: { pa: 'ਸੋ ਦਰੁ - ਸੋ ਪੁਰਖੁ', en: 'So Dar - So Purakh' }, angStart: 8, angEnd: 12 },
  { id: 'sohila', name: { pa: 'ਸੋਹਿਲਾ', en: 'Sohila' }, angStart: 12, angEnd: 13 },
  { id: 'sri-raag', name: { pa: 'ਸ੍ਰੀ ਰਾਗੁ', en: 'Sri Raag' }, angStart: 14, angEnd: 93 },
  { id: 'raag-maajh', name: { pa: 'ਰਾਗੁ ਮਾਝ', en: 'Raag Maajh' }, angStart: 94, angEnd: 150 },
  { id: 'raag-gauri', name: { pa: 'ਰਾਗੁ ਗਉੜੀ', en: 'Raag Gauri' }, angStart: 151, angEnd: 346 },
  { id: 'raag-aasaa', name: { pa: 'ਰਾਗੁ ਆਸਾ', en: 'Raag Aasaa' }, angStart: 347, angEnd: 488 },
  { id: 'raag-gujri', name: { pa: 'ਰਾਗੁ ਗੂਜਰੀ', en: 'Raag Gujri' }, angStart: 489, angEnd: 526 },
  { id: 'raag-devgandhari', name: { pa: 'ਰਾਗੁ ਦੇਵਗੰਧਾਰੀ', en: 'Raag Devgandhari' }, angStart: 527, angEnd: 536 },
  { id: 'raag-bihagra', name: { pa: 'ਰਾਗੁ ਬਿਹਾਗੜਾ', en: 'Raag Bihagra' }, angStart: 537, angEnd: 556 },
  { id: 'raag-vadhans', name: { pa: 'ਰਾਗੁ ਵਡਹੰਸੁ', en: 'Raag Vadhans' }, angStart: 557, angEnd: 594 },
  { id: 'raag-sorath', name: { pa: 'ਰਾਗੁ ਸੋਰਠਿ', en: 'Raag Sorath' }, angStart: 595, angEnd: 659 },
  { id: 'raag-dhanasri', name: { pa: 'ਰਾਗੁ ਧਨਾਸਰੀ', en: 'Raag Dhanasri' }, angStart: 660, angEnd: 695 },
  { id: 'raag-jaitsri', name: { pa: 'ਰਾਗੁ ਜੈਤਸਰੀ', en: 'Raag Jaitsri' }, angStart: 696, angEnd: 710 },
  { id: 'raag-todi', name: { pa: 'ਰਾਗੁ ਟੋਡੀ', en: 'Raag Todi' }, angStart: 711, angEnd: 718 },
  { id: 'raag-bairari', name: { pa: 'ਰਾਗੁ ਬੈਰਾੜੀ', en: 'Raag Bairari' }, angStart: 719, angEnd: 720 },
  { id: 'raag-tilang', name: { pa: 'ਰਾਗੁ ਤਿਲੰਗ', en: 'Raag Tilang' }, angStart: 721, angEnd: 727 },
  { id: 'raag-suhi', name: { pa: 'ਰਾਗੁ ਸੂਹੀ', en: 'Raag Suhi' }, angStart: 728, angEnd: 794 },
  { id: 'raag-bilaval', name: { pa: 'ਰਾਗੁ ਬਿਲਾਵਲੁ', en: 'Raag Bilaval' }, angStart: 795, angEnd: 858 },
  { id: 'raag-gond', name: { pa: 'ਰਾਗੁ ਗੋਂਡ', en: 'Raag Gond' }, angStart: 859, angEnd: 875 },
  { id: 'raag-ramkali', name: { pa: 'ਰਾਗੁ ਰਾਮਕਲੀ', en: 'Raag Ramkali' }, angStart: 876, angEnd: 974 },
  { id: 'raag-nat-narain', name: { pa: 'ਰਾਗੁ ਨਟ ਨਾਰਾਇਣ', en: 'Raag Nat Narain' }, angStart: 975, angEnd: 983 },
  { id: 'raag-mali-gaura', name: { pa: 'ਰਾਗੁ ਮਾਲੀ ਗਉੜਾ', en: 'Raag Mali Gaura' }, angStart: 984, angEnd: 988 },
  { id: 'raag-maru', name: { pa: 'ਰਾਗੁ ਮਾਰੂ', en: 'Raag Maru' }, angStart: 989, angEnd: 1106 },
  { id: 'raag-tukhari', name: { pa: 'ਰਾਗੁ ਤੁਖਾਰੀ', en: 'Raag Tukhari' }, angStart: 1107, angEnd: 1117 },
  { id: 'raag-kedara', name: { pa: 'ਰਾਗੁ ਕੇਦਾਰਾ', en: 'Raag Kedara' }, angStart: 1118, angEnd: 1124 },
  { id: 'raag-bhairav', name: { pa: 'ਰਾਗੁ ਭੈਰਉ', en: 'Raag Bhairav' }, angStart: 1125, angEnd: 1167 },
  { id: 'raag-basant', name: { pa: 'ਰਾਗੁ ਬਸੰਤੁ', en: 'Raag Basant' }, angStart: 1168, angEnd: 1196 },
  { id: 'raag-sarang', name: { pa: 'ਰਾਗੁ ਸਾਰੰਗ', en: 'Raag Sarang' }, angStart: 1197, angEnd: 1253 },
  { id: 'raag-malaar', name: { pa: 'ਰਾਗੁ ਮਲਾਰ', en: 'Raag Malaar' }, angStart: 1254, angEnd: 1293 },
  { id: 'raag-kanra', name: { pa: 'ਰਾਗੁ ਕਾਨੜਾ', en: 'Raag Kanra' }, angStart: 1294, angEnd: 1318 },
  { id: 'raag-kalyan', name: { pa: 'ਰਾਗੁ ਕਲਿਆਣ', en: 'Raag Kalyan' }, angStart: 1319, angEnd: 1326 },
  { id: 'raag-parbhati', name: { pa: 'ਰਾਗੁ ਪ੍ਰਭਾਤੀ', en: 'Raag Parbhati' }, angStart: 1327, angEnd: 1351 },
  { id: 'raag-jaijawanti', name: { pa: 'ਰਾਗੁ ਜੈਜਾਵੰਤੀ', en: 'Raag Jaijawanti' }, angStart: 1352, angEnd: 1353 },
  { id: 'salok-sahaskriti', name: { pa: 'ਸਲੋਕ ਸਹਸਕ੍ਰਿਤੀ', en: 'Salok Sahaskriti' }, angStart: 1353, angEnd: 1360 },
  { id: 'gatha', name: { pa: 'ਗਾਥਾ ਮਹਲਾ ੫', en: 'Gatha Mahala 5' }, angStart: 1360, angEnd: 1361 },
  { id: 'funhe', name: { pa: 'ਫੁਨਹੇ ਮਹਲਾ ੫', en: 'Funhe Mahala 5' }, angStart: 1361, angEnd: 1363 },
  { id: 'chaubole', name: { pa: 'ਚਉਬੋਲੇ ਮਹਲਾ ੫', en: 'Chaubole Mahala 5' }, angStart: 1363, angEnd: 1364 },
  { id: 'salok-kabir', name: { pa: 'ਸਲੋਕ ਕਬੀਰ ਜੀ', en: 'Salok Kabir Ji' }, angStart: 1364, angEnd: 1377 },
  { id: 'salok-farid', name: { pa: 'ਸਲੋਕ ਫਰੀਦ ਜੀ', en: 'Salok Farid Ji' }, angStart: 1377, angEnd: 1384 },
  { id: 'savaiye', name: { pa: 'ਸਵਈਏ', en: 'Savaiye' }, angStart: 1385, angEnd: 1409 },
  { id: 'salok-vadhik', name: { pa: 'ਸਲੋਕ ਵਾਰਾ ਤੇ ਵਧੀਕ', en: 'Salok Vaara Te Vadhik' }, angStart: 1410, angEnd: 1426 },
  { id: 'salok-mahala-9', name: { pa: 'ਸਲੋਕ ਮਹਲਾ ੯', en: 'Salok Mahala 9' }, angStart: 1426, angEnd: 1429 },
  { id: 'mundavni-ragmala', name: { pa: 'ਮੁੰਦਾਵਣੀ / ਰਾਗਮਾਲਾ', en: 'Mundavni / Ragmala' }, angStart: 1429, angEnd: 1430 },
];

/**
 * Get the Raag name for a given Ang number
 */
export function getRaagForAng(angNumber: number): { pa: string; en: string } {
  const raag = SGGS_RAAG_RANGES.find(r => angNumber >= r.angStart && angNumber <= r.angEnd);
  return raag?.name || { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ', en: 'Sri Guru Granth Sahib Ji' };
}

/**
 * Complete Nitnem Banis configuration
 * Includes all core daily prayers as per Sikh Rehat Maryada
 */
export const NITNEM_BANIS_CONFIG = [
  {
    id: 'japji',
    baniId: 2,
    name: { pa: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', en: 'Japji Sahib' },
    description: { pa: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ', en: 'Guru Nanak Dev Ji' },
    source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ ੧-੮',
    time: 'amritvela' as const,
    icon: '🌅',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'jaap',
    baniId: 3,
    name: { pa: 'ਜਾਪੁ ਸਾਹਿਬ', en: 'Jaap Sahib' },
    description: { pa: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ', en: 'Guru Gobind Singh Ji' },
    source: 'ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ ਸਾਹਿਬ',
    time: 'amritvela' as const,
    icon: '⚔️',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'tav-prasad-savaiye',
    baniId: 4,
    name: { pa: 'ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੈਯੇ', en: 'Tav-Prasad Savaiye' },
    description: { pa: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ', en: 'Guru Gobind Singh Ji' },
    source: 'ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ ਸਾਹਿਬ',
    time: 'amritvela' as const,
    icon: '🙏',
    color: 'from-amber-600 to-yellow-700',
  },
  {
    id: 'chaupai',
    baniId: 5,
    name: { pa: 'ਚੌਪਈ ਸਾਹਿਬ', en: 'Chaupai Sahib' },
    description: { pa: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ', en: 'Guru Gobind Singh Ji' },
    source: 'ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ ਸਾਹਿਬ',
    time: 'amritvela' as const,
    icon: '🛡️',
    color: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'anand',
    baniId: 10,
    name: { pa: 'ਅਨੰਦੁ ਸਾਹਿਬ', en: 'Anand Sahib' },
    description: { pa: 'ਗੁਰੂ ਅਮਰ ਦਾਸ ਜੀ', en: 'Guru Amar Das Ji' },
    source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ ੯੧੭-੯੨੨',
    time: 'amritvela' as const,
    icon: '🎉',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'rehras',
    baniId: 21,
    name: { pa: 'ਰਹਿਰਾਸ ਸਾਹਿਬ', en: 'Rehras Sahib' },
    description: { pa: 'ਸ਼ਾਮ ਦੀ ਬਾਣੀ', en: 'Evening Prayer' },
    source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ / ਦਸਮ ਗ੍ਰੰਥ',
    time: 'evening' as const,
    icon: '🌆',
    color: 'from-orange-600 to-red-600',
  },
  {
    id: 'kirtan-sohila',
    baniId: 23,
    name: { pa: 'ਕੀਰਤਨ ਸੋਹਿਲਾ', en: 'Kirtan Sohila' },
    description: { pa: 'ਰਾਤ ਦੀ ਬਾਣੀ', en: 'Night Prayer' },
    source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ ੧੨-੧੩',
    time: 'night' as const,
    icon: '🌙',
    color: 'from-indigo-600 to-purple-700',
  },
  {
    id: 'sukhmani',
    baniId: 31,
    name: { pa: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', en: 'Sukhmani Sahib' },
    description: { pa: 'ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ', en: 'Guru Arjan Dev Ji' },
    source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ ੨੬੨-੨੯੬',
    time: 'anytime' as const,
    icon: '☮️',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'asa-di-var',
    baniId: 15,
    name: { pa: 'ਆਸਾ ਦੀ ਵਾਰ', en: 'Asa Di Var' },
    description: { pa: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ', en: 'Guru Nanak Dev Ji' },
    source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ ੪੬੨-੪੭੫',
    time: 'anytime' as const,
    icon: '🎶',
    color: 'from-emerald-500 to-green-600',
  },
] as const;
