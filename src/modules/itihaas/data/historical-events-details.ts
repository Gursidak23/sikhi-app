// ============================================================================
// DETAILED HISTORICAL EVENTS DATA
// ============================================================================
// Comprehensive source-attributed historical events for Sikh history
// Sources: Sri Gur Panth Prakash (Rattan Singh Bhangu), Suraj Prakash (Bhai Santokh Singh),
//          A History of the Sikhs (Khushwant Singh), SGPC Publications
// ============================================================================

import type { EventDetail } from '../components/DetailModals';

// ============================================================================
// KHALSA ESTABLISHMENT PERIOD (1699-1716)
// ============================================================================

export const KHALSA_ESTABLISHMENT_EVENTS: EventDetail[] = [
  {
    id: 'khalsa-creation',
    title: {
      pa: 'ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਾਜਣਾ',
      en: 'Creation of Khalsa Panth',
    },
    year: 1699,
    description: {
      pa: 'ਵੈਸਾਖੀ ੧੬੯੯ ਨੂੰ ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਿਰਜਣਾ',
      en: 'Creation of Khalsa Panth at Anandpur Sahib on Vaisakhi 1699',
    },
    detailedDescription: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਨੇ ਵੈਸਾਖੀ ੧੬੯੯ ਨੂੰ ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਲੱਖਾਂ ਸਿੱਖਾਂ ਦੇ ਇਕੱਠ ਵਿੱਚ ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਿਰਜਣਾ ਕੀਤੀ। ਗੁਰੂ ਜੀ ਨੇ ਸੀਸ ਮੰਗਿਆ ਅਤੇ ਪੰਜ ਸਿੱਖਾਂ ਨੇ ਆਪਣਾ ਸੀਸ ਭੇਟ ਕੀਤਾ ਜੋ ਪੰਜ ਪਿਆਰੇ ਬਣੇ। ਗੁਰੂ ਜੀ ਨੇ ਅੰਮ੍ਰਿਤ ਤਿਆਰ ਕੀਤਾ ਅਤੇ ਪੰਜਾਂ ਨੂੰ ਅੰਮ੍ਰਿਤ ਛਕਾਇਆ, ਫਿਰ ਆਪ ਉਨ੍ਹਾਂ ਤੋਂ ਅੰਮ੍ਰਿਤ ਛਕਿਆ। ਪੰਜ ਕਕਾਰ - ਕੇਸ, ਕੰਘਾ, ਕੜਾ, ਕਿਰਪਾਨ, ਕਛਹਿਰਾ - ਖਾਲਸੇ ਦੀ ਪਛਾਣ ਬਣੇ।',
      en: 'Sri Guru Gobind Singh Ji created the Khalsa Panth on Vaisakhi 1699 at Anandpur Sahib before a gathering of lakhs of Sikhs. Guru Ji asked for heads and five Sikhs offered their heads, becoming the Panj Pyare. Guru Ji prepared Amrit and administered it to the five, then received Amrit from them. The five Kakars - Kesh, Kangha, Kara, Kirpan, Kachera - became the identity of the Khalsa.',
    },
    location: {
      pa: 'ਅਨੰਦਪੁਰ ਸਾਹਿਬ',
      en: 'Anandpur Sahib',
    },
    significance: {
      pa: 'ਸਿੱਖ ਇਤਿਹਾਸ ਦੀ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਘਟਨਾ। ਖਾਲਸੇ ਨੇ ਸਿੱਖਾਂ ਨੂੰ ਇੱਕ ਵੱਖਰੀ ਪਛਾਣ ਅਤੇ ਜ਼ੁਲਮ ਵਿਰੁੱਧ ਲੜਨ ਦੀ ਸ਼ਕਤੀ ਦਿੱਤੀ।',
      en: 'Most significant event in Sikh history. The Khalsa gave Sikhs a distinct identity and the power to fight against oppression.',
    },
    keyFigures: [
      { name: { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ', en: 'Sri Guru Gobind Singh Ji' }, role: { pa: 'ਖਾਲਸੇ ਦੇ ਸਿਰਜਣਹਾਰ', en: 'Creator of Khalsa' } },
      { name: { pa: 'ਭਾਈ ਦਇਆ ਸਿੰਘ ਜੀ', en: 'Bhai Daya Singh Ji' }, role: { pa: 'ਪੰਜ ਪਿਆਰੇ', en: 'Panj Pyare' } },
      { name: { pa: 'ਭਾਈ ਧਰਮ ਸਿੰਘ ਜੀ', en: 'Bhai Dharam Singh Ji' }, role: { pa: 'ਪੰਜ ਪਿਆਰੇ', en: 'Panj Pyare' } },
      { name: { pa: 'ਭਾਈ ਹਿੰਮਤ ਸਿੰਘ ਜੀ', en: 'Bhai Himmat Singh Ji' }, role: { pa: 'ਪੰਜ ਪਿਆਰੇ', en: 'Panj Pyare' } },
      { name: { pa: 'ਭਾਈ ਮੋਹਕਮ ਸਿੰਘ ਜੀ', en: 'Bhai Mohkam Singh Ji' }, role: { pa: 'ਪੰਜ ਪਿਆਰੇ', en: 'Panj Pyare' } },
      { name: { pa: 'ਭਾਈ ਸਾਹਿਬ ਸਿੰਘ ਜੀ', en: 'Bhai Sahib Singh Ji' }, role: { pa: 'ਪੰਜ ਪਿਆਰੇ', en: 'Panj Pyare' } },
    ],
    sources: [
      { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu', year: 1841, type: 'SECONDARY' },
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
    ],
  },
  {
    id: 'banda-singh-bahadur',
    title: {
      pa: 'ਬਾਬਾ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ',
      en: 'Baba Banda Singh Bahadur',
    },
    year: 1708,
    yearEnd: 1716,
    description: {
      pa: 'ਬਾਬਾ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ ਦੀ ਅਗਵਾਈ ਵਿੱਚ ਸਿੱਖ ਰਾਜ ਦੀ ਸਥਾਪਨਾ',
      en: 'Establishment of Sikh rule under Baba Banda Singh Bahadur',
    },
    detailedDescription: {
      pa: 'ਬਾਬਾ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ (ਜਨਮ ਲਛਮਣ ਦਾਸ) ਨੂੰ ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਨੇ ੧੭੦੮ ਵਿੱਚ ਅੰਮ੍ਰਿਤ ਛਕਾਇਆ ਅਤੇ ਪੰਜਾਬ ਭੇਜਿਆ। ਉਨ੍ਹਾਂ ਨੇ ਸਰਹਿੰਦ ਫਤਹਿ ਕੀਤੀ ਅਤੇ ਵਜ਼ੀਰ ਖਾਨ ਨੂੰ ਮਾਰਿਆ ਜਿਸ ਨੇ ਛੋਟੇ ਸਾਹਿਬਜ਼ਾਦਿਆਂ ਨੂੰ ਸ਼ਹੀਦ ਕੀਤਾ ਸੀ। ਲੋਹਗੜ੍ਹ ਵਿੱਚ ਪਹਿਲਾ ਸਿੱਖ ਰਾਜ ਸਥਾਪਿਤ ਕੀਤਾ। ੧੭੧੬ ਵਿੱਚ ਗੁਰਦਾਸ ਨੰਗਲ ਵਿੱਚ ਮੁਗਲਾਂ ਦੁਆਰਾ ਘੇਰੇ ਤੋਂ ਬਾਅਦ ਸ਼ਹੀਦੀ ਪਾਈ।',
      en: 'Baba Banda Singh Bahadur (born Lachman Das) was baptized by Sri Guru Gobind Singh Ji in 1708 and sent to Punjab. He conquered Sirhind and killed Wazir Khan who had martyred the younger Sahibzadas. Established first Sikh rule at Lohgarh. In 1716, attained martyrdom after being besieged at Gurdas Nangal by Mughals.',
    },
    location: {
      pa: 'ਪੰਜਾਬ (ਸਰਹਿੰਦ, ਲੋਹਗੜ੍ਹ)',
      en: 'Punjab (Sirhind, Lohgarh)',
    },
    significance: {
      pa: 'ਪਹਿਲੇ ਸਿੱਖ ਰਾਜ ਦੀ ਸਥਾਪਨਾ। ਜ਼ਮੀਨ ਕਿਸਾਨਾਂ ਨੂੰ ਵੰਡੀ। ਜ਼ੁਲਮ ਦਾ ਬਦਲਾ ਲਿਆ।',
      en: 'Established first Sikh rule. Distributed land to farmers. Avenged the oppression.',
    },
    keyFigures: [
      { name: { pa: 'ਬਾਬਾ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ', en: 'Baba Banda Singh Bahadur' }, role: { pa: 'ਸਿੱਖ ਜਰਨੈਲ', en: 'Sikh General' } },
    ],
    sources: [
      { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu', year: 1841, type: 'SECONDARY' },
      { name: 'A History of the Sikhs Vol. 1', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
];

// ============================================================================
// MISL PERIOD (1716-1799)
// ============================================================================

export const MISL_PERIOD_EVENTS: EventDetail[] = [
  {
    id: 'misl-formation',
    title: {
      pa: 'ਮਿਸਲਾਂ ਦੀ ਸਥਾਪਨਾ',
      en: 'Formation of Misls',
    },
    year: 1716,
    yearEnd: 1799,
    description: {
      pa: 'ਬਾਰਾਂ ਸਿੱਖ ਮਿਸਲਾਂ ਦੀ ਸਥਾਪਨਾ ਅਤੇ ਰਾਜ',
      en: 'Establishment and rule of the twelve Sikh Misls',
    },
    detailedDescription: {
      pa: 'ਬਾਬਾ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ ਦੀ ਸ਼ਹੀਦੀ ਤੋਂ ਬਾਅਦ ਸਿੱਖਾਂ ਨੇ ਬਾਰਾਂ ਮਿਸਲਾਂ ਬਣਾਈਆਂ। ਹਰ ਮਿਸਲ ਦਾ ਆਪਣਾ ਮੁਖੀ (ਸਰਦਾਰ) ਸੀ। ਮੁੱਖ ਮਿਸਲਾਂ: ਸ਼ੁਕਰਚੱਕੀਆ (ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ ਦੀ), ਭੰਗੀ, ਕਨ੍ਹਈਆ, ਆਹਲੂਵਾਲੀਆ, ਰਾਮਗੜ੍ਹੀਆ, ਫੈਜ਼ੁੱਲਾਪੁਰੀਆ, ਨਕੱਈ, ਕਰੋੜਾਸਿੰਘੀਆ, ਡੱਲੇਵਾਲੀਆ, ਸ਼ਹੀਦਾਂ ਵਾਲੀ (ਫੂਲਕੀਆਂ), ਨਿਸ਼ਾਨਵਾਲੀਆ।',
      en: 'After the martyrdom of Baba Banda Singh Bahadur, Sikhs formed twelve Misls. Each Misl had its own chief (Sardar). Major Misls: Sukerchakia (Maharaja Ranjit Singh\'s), Bhangi, Kanhaiya, Ahluwalia, Ramgarhia, Faizullapuria, Nakai, Karorasinghia, Dallewalia, Shaheedan (Phulkian), Nishanwalia.',
    },
    location: {
      pa: 'ਪੰਜਾਬ',
      en: 'Punjab',
    },
    significance: {
      pa: 'ਮਿਸਲਾਂ ਨੇ ਸਿੱਖ ਰਾਜਨੀਤਕ ਤਾਕਤ ਦੀ ਨੀਂਹ ਰੱਖੀ ਅਤੇ ਮੁਗਲਾਂ ਅਤੇ ਅਫ਼ਗਾਨਾਂ ਵਿਰੁੱਧ ਲੜੀਆਂ।',
      en: 'Misls laid the foundation of Sikh political power and fought against Mughals and Afghans.',
    },
    keyFigures: [
      { name: { pa: 'ਨਵਾਬ ਕਪੂਰ ਸਿੰਘ', en: 'Nawab Kapur Singh' }, role: { pa: 'ਦਲ ਖਾਲਸਾ ਦੇ ਮੁਖੀ', en: 'Leader of Dal Khalsa' } },
      { name: { pa: 'ਸਰਦਾਰ ਜੱਸਾ ਸਿੰਘ ਆਹਲੂਵਾਲੀਆ', en: 'Sardar Jassa Singh Ahluwalia' }, role: { pa: 'ਸੁਲਤਾਨ-ਉਲ-ਕੌਮ', en: 'Sultan-ul-Qaum' } },
      { name: { pa: 'ਸਰਦਾਰ ਚੜ੍ਹਤ ਸਿੰਘ ਸ਼ੁਕਰਚੱਕੀਆ', en: 'Sardar Charat Singh Sukerchakia' }, role: { pa: 'ਸ਼ੁਕਰਚੱਕੀਆ ਮਿਸਲ ਮੁਖੀ', en: 'Sukerchakia Misl Chief' } },
    ],
    sources: [
      { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu', year: 1841, type: 'SECONDARY' },
      { name: 'A History of the Sikhs Vol. 1', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
  {
    id: 'chhota-ghallughara',
    title: {
      pa: 'ਛੋਟਾ ਘੱਲੂਘਾਰਾ',
      en: 'Chhota Ghallughara (Lesser Holocaust)',
    },
    year: 1746,
    description: {
      pa: '੧੭੪੬ ਵਿੱਚ ਕਾਹਨੂਵਾਨ ਵਿੱਚ ਹਜ਼ਾਰਾਂ ਸਿੱਖਾਂ ਦਾ ਕਤਲੇਆਮ',
      en: 'Massacre of thousands of Sikhs at Kahnuwan in 1746',
    },
    detailedDescription: {
      pa: 'ਲਖਪਤ ਰਾਏ (ਲਾਹੌਰ ਦਾ ਦੀਵਾਨ) ਨੇ ਆਪਣੇ ਭਰਾ ਜਸਪਤ ਰਾਏ ਦੀ ਮੌਤ ਦਾ ਬਦਲਾ ਲੈਣ ਲਈ ਸਿੱਖਾਂ ਉੱਤੇ ਹਮਲਾ ਕੀਤਾ। ਕਾਹਨੂਵਾਨ (ਗੁਰਦਾਸਪੁਰ) ਨੇੜੇ ੭,੦੦੦ ਤੋਂ ੧੦,੦੦੦ ਸਿੱਖ ਸ਼ਹੀਦ ਹੋਏ। ਔਰਤਾਂ ਅਤੇ ਬੱਚਿਆਂ ਨੂੰ ਵੀ ਨਹੀਂ ਬਖ਼ਸ਼ਿਆ ਗਿਆ।',
      en: 'Lakhpat Rai (Diwan of Lahore) attacked Sikhs to avenge his brother Jaspat Rai\'s death. Near Kahnuwan (Gurdaspur), 7,000 to 10,000 Sikhs were martyred. Women and children were not spared either.',
    },
    location: {
      pa: 'ਕਾਹਨੂਵਾਨ, ਗੁਰਦਾਸਪੁਰ',
      en: 'Kahnuwan, Gurdaspur',
    },
    significance: {
      pa: 'ਇਸ ਕਤਲੇਆਮ ਨੇ ਸਿੱਖਾਂ ਨੂੰ ਹੋਰ ਮਜ਼ਬੂਤ ਕੀਤਾ ਅਤੇ ਉਹ ਜਲਦੀ ਹੀ ਮੁੜ ਸੰਗਠਿਤ ਹੋ ਗਏ।',
      en: 'This massacre made Sikhs stronger and they soon reorganized.',
    },
    sources: [
      { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu', year: 1841, type: 'SECONDARY' },
      { name: 'A History of the Sikhs Vol. 1', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
  {
    id: 'wadda-ghallughara',
    title: {
      pa: 'ਵੱਡਾ ਘੱਲੂਘਾਰਾ',
      en: 'Wadda Ghallughara (Greater Holocaust)',
    },
    year: 1762,
    description: {
      pa: '੧੭੬੨ ਵਿੱਚ ਅਹਿਮਦ ਸ਼ਾਹ ਅਬਦਾਲੀ ਦੁਆਰਾ ੩੦,੦੦੦ ਤੋਂ ਵੱਧ ਸਿੱਖਾਂ ਦਾ ਕਤਲੇਆਮ',
      en: 'Massacre of over 30,000 Sikhs by Ahmad Shah Abdali in 1762',
    },
    detailedDescription: {
      pa: '੫ ਫਰਵਰੀ ੧੭੬੨ ਨੂੰ ਅਹਿਮਦ ਸ਼ਾਹ ਅਬਦਾਲੀ ਨੇ ਕੁੱਪ-ਰਹੀੜਾ (ਮਾਲੇਰਕੋਟਲਾ) ਵਿੱਚ ਸਿੱਖਾਂ ਉੱਤੇ ਹਮਲਾ ਕੀਤਾ ਜਦੋਂ ਉਹ ਔਰਤਾਂ, ਬੱਚਿਆਂ ਅਤੇ ਬਜ਼ੁਰਗਾਂ ਨਾਲ ਜਾ ਰਹੇ ਸਨ। ੩੦,੦੦੦ ਤੋਂ ੫੦,੦੦੦ ਸਿੱਖ ਸ਼ਹੀਦ ਹੋਏ। ਪਰ ਸਿੱਖਾਂ ਨੇ ਕੁਝ ਮਹੀਨਿਆਂ ਬਾਅਦ ਹੀ ਅਬਦਾਲੀ ਨੂੰ ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਹਰਾਇਆ।',
      en: 'On 5 February 1762, Ahmad Shah Abdali attacked Sikhs at Kup-Rahira (Malerkotla) when they were traveling with women, children and elderly. 30,000 to 50,000 Sikhs were martyred. But Sikhs defeated Abdali at Amritsar just a few months later.',
    },
    location: {
      pa: 'ਕੁੱਪ-ਰਹੀੜਾ, ਮਾਲੇਰਕੋਟਲਾ',
      en: 'Kup-Rahira, Malerkotla',
    },
    significance: {
      pa: 'ਸਿੱਖ ਇਤਿਹਾਸ ਦਾ ਸਭ ਤੋਂ ਵੱਡਾ ਕਤਲੇਆਮ। ਪਰ ਇਸ ਤੋਂ ਬਾਅਦ ਵੀ ਸਿੱਖ ਹੋਰ ਮਜ਼ਬੂਤ ਹੋਏ।',
      en: 'Biggest massacre in Sikh history. Yet Sikhs emerged even stronger after this.',
    },
    keyFigures: [
      { name: { pa: 'ਅਹਿਮਦ ਸ਼ਾਹ ਅਬਦਾਲੀ', en: 'Ahmad Shah Abdali' }, role: { pa: 'ਅਫ਼ਗਾਨ ਹਮਲਾਵਰ', en: 'Afghan Invader' } },
      { name: { pa: 'ਸਰਦਾਰ ਜੱਸਾ ਸਿੰਘ ਆਹਲੂਵਾਲੀਆ', en: 'Sardar Jassa Singh Ahluwalia' }, role: { pa: 'ਸਿੱਖ ਜਰਨੈਲ', en: 'Sikh General' } },
    ],
    sources: [
      { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu', year: 1841, type: 'SECONDARY' },
      { name: 'A History of the Sikhs Vol. 1', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
];

// ============================================================================
// SIKH EMPIRE (1799-1849)
// ============================================================================

export const SIKH_EMPIRE_EVENTS: EventDetail[] = [
  {
    id: 'maharaja-ranjit-singh-rule',
    title: {
      pa: 'ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ ਦਾ ਰਾਜ',
      en: 'Reign of Maharaja Ranjit Singh',
    },
    year: 1799,
    yearEnd: 1839,
    description: {
      pa: 'ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ ਦੀ ਅਗਵਾਈ ਵਿੱਚ ਸਿੱਖ ਸਾਮਰਾਜ ਦੀ ਸਥਾਪਨਾ',
      en: 'Establishment of Sikh Empire under Maharaja Ranjit Singh',
    },
    detailedDescription: {
      pa: 'ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ ਨੇ ੧੭੯੯ ਵਿੱਚ ੧੯ ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ ਲਾਹੌਰ ਜਿੱਤਿਆ ਅਤੇ ਸਿੱਖ ਸਾਮਰਾਜ ਦੀ ਸਥਾਪਨਾ ਕੀਤੀ। ਆਪ ਨੇ ਪੰਜਾਬ ਦੀਆਂ ਸਾਰੀਆਂ ਮਿਸਲਾਂ ਨੂੰ ਇਕੱਠਾ ਕੀਤਾ। ਕਸ਼ਮੀਰ, ਮੁਲਤਾਨ, ਪਿਸ਼ਾਵਰ ਅਤੇ ਖ਼ੈਬਰ ਦੱਰੇ ਤੱਕ ਰਾਜ ਵਧਾਇਆ। ਖਾਲਸਾ ਫੌਜ ਨੂੰ ਯੂਰਪੀਅਨ ਤਰਜ਼ ਤੇ ਸਿਖਲਾਈ ਦਿੱਤੀ। ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਦੀ ਸੋਨੇ ਨਾਲ ਸੇਵਾ ਕਰਵਾਈ।',
      en: 'Maharaja Ranjit Singh conquered Lahore in 1799 at age 19 and established the Sikh Empire. He unified all Misls of Punjab. Extended the empire to Kashmir, Multan, Peshawar and Khyber Pass. Trained Khalsa Army on European lines. Got Sri Harmandir Sahib covered with gold.',
    },
    location: {
      pa: 'ਲਾਹੌਰ (ਰਾਜਧਾਨੀ)',
      en: 'Lahore (Capital)',
    },
    significance: {
      pa: 'ਸਿੱਖ ਇਤਿਹਾਸ ਦਾ ਸੁਨਹਿਰਾ ਦੌਰ। ਦੁਨੀਆ ਦੀਆਂ ਸਭ ਤੋਂ ਤਾਕਤਵਰ ਫੌਜਾਂ ਵਿੱਚੋਂ ਇੱਕ ਖਾਲਸਾ ਫੌਜ ਬਣੀ। ਸਿੱਖ ਰਾਜ ਦੀ ਸਿਖਰ।',
      en: 'Golden era of Sikh history. Khalsa Army became one of the most powerful armies in the world. Zenith of Sikh rule.',
    },
    keyFigures: [
      { name: { pa: 'ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ', en: 'Maharaja Ranjit Singh' }, role: { pa: 'ਸਿੱਖ ਸਾਮਰਾਜ ਦੇ ਬਾਨੀ', en: 'Founder of Sikh Empire' } },
      { name: { pa: 'ਹਰੀ ਸਿੰਘ ਨਲਵਾ', en: 'Hari Singh Nalwa' }, role: { pa: 'ਜਰਨੈਲ', en: 'General' } },
      { name: { pa: 'ਅਕਾਲੀ ਫੂਲਾ ਸਿੰਘ', en: 'Akali Phoola Singh' }, role: { pa: 'ਨਿਹੰਗ ਜਥੇਦਾਰ', en: 'Nihang Jathedar' } },
    ],
    sources: [
      { name: 'A History of the Sikhs Vol. 1', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
      { name: 'The Sikh Religion Vol. 6', author: 'Max Arthur Macauliffe', year: 1909, type: 'SECONDARY' },
    ],
  },
  {
    id: 'anglo-sikh-wars',
    title: {
      pa: 'ਐਂਗਲੋ-ਸਿੱਖ ਯੁੱਧ',
      en: 'Anglo-Sikh Wars',
    },
    year: 1845,
    yearEnd: 1849,
    description: {
      pa: 'ਅੰਗਰੇਜ਼ਾਂ ਅਤੇ ਸਿੱਖਾਂ ਵਿਚਕਾਰ ਦੋ ਯੁੱਧ',
      en: 'Two wars between the British and the Sikhs',
    },
    detailedDescription: {
      pa: 'ਪਹਿਲਾ ਐਂਗਲੋ-ਸਿੱਖ ਯੁੱਧ (੧੮੪੫-੪੬): ਮੁੱਦਕੀ, ਫਿਰੋਜ਼ਸ਼ਾਹ, ਅਲੀਵਾਲ, ਸੋਬਰਾਉਂ ਦੀਆਂ ਲੜਾਈਆਂ। ਗੱਦਾਰੀ ਕਾਰਨ ਹਾਰ। ਦੂਜਾ ਐਂਗਲੋ-ਸਿੱਖ ਯੁੱਧ (੧੮੪੮-੪੯): ਚਿਲਿਆਂਵਾਲਾ ਅਤੇ ਗੁਜਰਾਤ ਦੀਆਂ ਲੜਾਈਆਂ। ੧੮੪੯ ਵਿੱਚ ਪੰਜਾਬ ਅੰਗਰੇਜ਼ੀ ਰਾਜ ਵਿੱਚ ਮਿਲਾਇਆ ਗਿਆ।',
      en: 'First Anglo-Sikh War (1845-46): Battles of Mudki, Ferozeshah, Aliwal, Sobraon. Lost due to treachery. Second Anglo-Sikh War (1848-49): Battles of Chillianwala and Gujrat. In 1849, Punjab was annexed to British India.',
    },
    location: {
      pa: 'ਪੰਜਾਬ',
      en: 'Punjab',
    },
    significance: {
      pa: 'ਸਿੱਖ ਸਾਮਰਾਜ ਦਾ ਅੰਤ। ਕੋਹ-ਇ-ਨੂਰ ਹੀਰਾ ਅੰਗਰੇਜ਼ਾਂ ਨੇ ਲਿਆ। ਪੰਜਾਬ ਬ੍ਰਿਟਿਸ਼ ਭਾਰਤ ਦਾ ਹਿੱਸਾ ਬਣਿਆ।',
      en: 'End of Sikh Empire. Koh-i-Noor diamond taken by British. Punjab became part of British India.',
    },
    keyFigures: [
      { name: { pa: 'ਮਹਾਰਾਜਾ ਦਲੀਪ ਸਿੰਘ', en: 'Maharaja Duleep Singh' }, role: { pa: 'ਆਖ਼ਰੀ ਸਿੱਖ ਮਹਾਰਾਜਾ', en: 'Last Sikh Maharaja' } },
      { name: { pa: 'ਸਰਦਾਰ ਸ਼ਾਮ ਸਿੰਘ ਅਟਾਰੀਵਾਲਾ', en: 'Sardar Sham Singh Attariwala' }, role: { pa: 'ਸ਼ਹੀਦ ਜਰਨੈਲ', en: 'Martyr General' } },
    ],
    sources: [
      { name: 'A History of the Sikhs Vol. 2', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
];

// ============================================================================
// COLONIAL PERIOD (1849-1947)
// ============================================================================

export const COLONIAL_PERIOD_EVENTS: EventDetail[] = [
  {
    id: 'singh-sabha-movement',
    title: {
      pa: 'ਸਿੰਘ ਸਭਾ ਲਹਿਰ',
      en: 'Singh Sabha Movement',
    },
    year: 1873,
    yearEnd: 1925,
    description: {
      pa: 'ਸਿੱਖ ਧਾਰਮਿਕ ਅਤੇ ਸਮਾਜਿਕ ਸੁਧਾਰ ਲਹਿਰ',
      en: 'Sikh religious and social reform movement',
    },
    detailedDescription: {
      pa: '੧੮੭੩ ਵਿੱਚ ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਸਿੰਘ ਸਭਾ ਦੀ ਸਥਾਪਨਾ ਹੋਈ। ਇਸ ਲਹਿਰ ਨੇ ਸਿੱਖ ਧਰਮ ਨੂੰ ਸੁਧਾਰਿਆ, ਗੁਰਮੁਖੀ ਨੂੰ ਉਤਸ਼ਾਹਿਤ ਕੀਤਾ, ਸਿੱਖ ਸਕੂਲ ਅਤੇ ਕਾਲਜ ਖੋਲ੍ਹੇ। ਭਾਈ ਵੀਰ ਸਿੰਘ, ਭਾਈ ਕਾਨ੍ਹ ਸਿੰਘ ਨਾਭਾ ਵਰਗੇ ਵਿਦਵਾਨ ਪੈਦਾ ਹੋਏ। ਖਾਲਸਾ ਕਾਲਜ ਅੰਮ੍ਰਿਤਸਰ ੧੮੯੨ ਵਿੱਚ ਸਥਾਪਿਤ।',
      en: 'Singh Sabha was established in Amritsar in 1873. This movement reformed Sikh religion, promoted Gurmukhi, opened Sikh schools and colleges. Scholars like Bhai Vir Singh, Bhai Kahn Singh Nabha emerged. Khalsa College Amritsar established in 1892.',
    },
    location: {
      pa: 'ਅੰਮ੍ਰਿਤਸਰ, ਲਾਹੌਰ',
      en: 'Amritsar, Lahore',
    },
    significance: {
      pa: 'ਸਿੱਖੀ ਦੀ ਪੁਨਰ-ਸੁਰਜੀਤੀ। ਸਿੱਖ ਪਛਾਣ ਮਜ਼ਬੂਤ ਹੋਈ। ਸਿੱਖ ਵਿੱਦਿਆ ਦਾ ਵਿਕਾਸ।',
      en: 'Revival of Sikhi. Sikh identity strengthened. Development of Sikh education.',
    },
    keyFigures: [
      { name: { pa: 'ਭਾਈ ਵੀਰ ਸਿੰਘ', en: 'Bhai Vir Singh' }, role: { pa: 'ਕਵੀ ਅਤੇ ਵਿਦਵਾਨ', en: 'Poet and Scholar' } },
      { name: { pa: 'ਭਾਈ ਕਾਨ੍ਹ ਸਿੰਘ ਨਾਭਾ', en: 'Bhai Kahn Singh Nabha' }, role: { pa: 'ਵਿਦਵਾਨ', en: 'Scholar' } },
    ],
    sources: [
      { name: 'A History of the Sikhs Vol. 2', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
  {
    id: 'gurdwara-reform-movement',
    title: {
      pa: 'ਗੁਰਦੁਆਰਾ ਸੁਧਾਰ ਲਹਿਰ',
      en: 'Gurdwara Reform Movement',
    },
    year: 1920,
    yearEnd: 1925,
    description: {
      pa: 'ਗੁਰਦੁਆਰਿਆਂ ਨੂੰ ਮਹੰਤਾਂ ਤੋਂ ਆਜ਼ਾਦ ਕਰਵਾਉਣ ਦੀ ਲਹਿਰ',
      en: 'Movement to free Gurdwaras from Mahants',
    },
    detailedDescription: {
      pa: 'ਗੁਰਦੁਆਰੇ ਮਹੰਤਾਂ (ਹਿੰਦੂ ਪੁਜਾਰੀਆਂ) ਦੇ ਕਬਜ਼ੇ ਵਿੱਚ ਸਨ। ਨਨਕਾਣਾ ਸਾਹਿਬ ਦੇ ਸਾਕੇ (੧੯੨੧) ਵਿੱਚ ਮਹੰਤ ਨਰੈਣ ਦਾਸ ਨੇ ੧੩੦ ਤੋਂ ਵੱਧ ਸਿੱਖਾਂ ਨੂੰ ਸ਼ਹੀਦ ਕੀਤਾ। ਸ਼੍ਰੋਮਣੀ ਗੁਰਦੁਆਰਾ ਪ੍ਰਬੰਧਕ ਕਮੇਟੀ (SGPC) ੧੯੨੦ ਵਿੱਚ ਬਣੀ। ੧੯੨੫ ਵਿੱਚ ਸਿੱਖ ਗੁਰਦੁਆਰਾ ਐਕਟ ਪਾਸ ਹੋਇਆ।',
      en: 'Gurdwaras were controlled by Mahants (Hindu priests). In Nankana Sahib massacre (1921), Mahant Narain Das martyred over 130 Sikhs. Shiromani Gurdwara Parbandhak Committee (SGPC) formed in 1920. Sikh Gurdwaras Act passed in 1925.',
    },
    location: {
      pa: 'ਪੰਜਾਬ',
      en: 'Punjab',
    },
    significance: {
      pa: 'ਸਿੱਖਾਂ ਨੂੰ ਗੁਰਦੁਆਰਿਆਂ ਦਾ ਕੰਟਰੋਲ ਮਿਲਿਆ। SGPC ਦੀ ਸਥਾਪਨਾ। ਅਕਾਲੀ ਦਲ ਦਾ ਜਨਮ।',
      en: 'Sikhs got control of Gurdwaras. SGPC established. Birth of Akali Dal.',
    },
    keyFigures: [
      { name: { pa: 'ਭਾਈ ਲਛਮਣ ਸਿੰਘ ਧਾਰੋਵਾਲੀ', en: 'Bhai Lachman Singh Dharowali' }, role: { pa: 'ਸ਼ਹੀਦ', en: 'Martyr' } },
      { name: { pa: 'ਮਾਸਟਰ ਤਾਰਾ ਸਿੰਘ', en: 'Master Tara Singh' }, role: { pa: 'ਅਕਾਲੀ ਨੇਤਾ', en: 'Akali Leader' } },
    ],
    sources: [
      { name: 'A History of the Sikhs Vol. 2', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
  {
    id: 'jallianwala-bagh',
    title: {
      pa: 'ਜਲ੍ਹਿਆਂਵਾਲਾ ਬਾਗ਼ ਸਾਕਾ',
      en: 'Jallianwala Bagh Massacre',
    },
    year: 1919,
    description: {
      pa: '੧੩ ਅਪ੍ਰੈਲ ੧੯੧੯ ਨੂੰ ਜਨਰਲ ਡਾਇਰ ਦੁਆਰਾ ਕਤਲੇਆਮ',
      en: 'Massacre by General Dyer on 13 April 1919',
    },
    detailedDescription: {
      pa: '੧੩ ਅਪ੍ਰੈਲ ੧੯੧੯ ਨੂੰ ਵੈਸਾਖੀ ਵਾਲੇ ਦਿਨ ਜਨਰਲ ਡਾਇਰ ਨੇ ਅੰਮ੍ਰਿਤਸਰ ਦੇ ਜਲ੍ਹਿਆਂਵਾਲਾ ਬਾਗ਼ ਵਿੱਚ ਬਿਨਾ ਚੇਤਾਵਨੀ ਗੋਲੀ ਚਲਾਈ। ੧੦੦੦ ਤੋਂ ਵੱਧ ਲੋਕ ਸ਼ਹੀਦ ਹੋਏ। ਇਸ ਸਾਕੇ ਨੇ ਭਾਰਤੀ ਸੁਤੰਤਰਤਾ ਅੰਦੋਲਨ ਨੂੰ ਤੇਜ਼ ਕੀਤਾ।',
      en: 'On 13 April 1919, Vaisakhi day, General Dyer opened fire without warning at Jallianwala Bagh in Amritsar. Over 1000 people were martyred. This massacre accelerated the Indian independence movement.',
    },
    location: {
      pa: 'ਜਲ੍ਹਿਆਂਵਾਲਾ ਬਾਗ਼, ਅੰਮ੍ਰਿਤਸਰ',
      en: 'Jallianwala Bagh, Amritsar',
    },
    significance: {
      pa: 'ਭਾਰਤੀ ਸੁਤੰਤਰਤਾ ਅੰਦੋਲਨ ਦਾ ਮੋੜ। ਊਧਮ ਸਿੰਘ ਨੇ ਬਾਅਦ ਵਿੱਚ ਬਦਲਾ ਲਿਆ।',
      en: 'Turning point of Indian independence movement. Udham Singh later took revenge.',
    },
    keyFigures: [
      { name: { pa: 'ਸ਼ਹੀਦ ਊਧਮ ਸਿੰਘ', en: 'Shaheed Udham Singh' }, role: { pa: 'ਕ੍ਰਾਂਤੀਕਾਰੀ', en: 'Revolutionary' } },
    ],
    sources: [
      { name: 'A History of the Sikhs Vol. 2', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
];

// ============================================================================
// POST-INDEPENDENCE PERIOD (1947-1984)
// ============================================================================

export const POST_INDEPENDENCE_EVENTS: EventDetail[] = [
  {
    id: 'partition-1947',
    title: {
      pa: '੧੯੪੭ ਦੀ ਵੰਡ',
      en: 'Partition of 1947',
    },
    year: 1947,
    description: {
      pa: 'ਭਾਰਤ-ਪਾਕਿਸਤਾਨ ਵੰਡ ਅਤੇ ਸਿੱਖਾਂ ਦਾ ਉਜਾੜਾ',
      en: 'India-Pakistan Partition and Sikh displacement',
    },
    detailedDescription: {
      pa: '੧੫ ਅਗਸਤ ੧੯੪੭ ਨੂੰ ਭਾਰਤ ਆਜ਼ਾਦ ਹੋਇਆ ਪਰ ਪੰਜਾਬ ਦੋ ਹਿੱਸਿਆਂ ਵਿੱਚ ਵੰਡਿਆ ਗਿਆ। ਪੱਛਮੀ ਪੰਜਾਬ ਪਾਕਿਸਤਾਨ ਵਿੱਚ ਚਲਾ ਗਿਆ। ਲੱਖਾਂ ਸਿੱਖਾਂ ਨੂੰ ਆਪਣੇ ਘਰ, ਜ਼ਮੀਨਾਂ, ਅਤੇ ਇਤਿਹਾਸਕ ਗੁਰਦੁਆਰੇ (ਨਨਕਾਣਾ ਸਾਹਿਬ, ਪੰਜਾ ਸਾਹਿਬ) ਛੱਡਣੇ ਪਏ। ਵੰਡ ਦੌਰਾਨ ੧੦ ਲੱਖ ਤੋਂ ਵੱਧ ਲੋਕ ਮਾਰੇ ਗਏ। ਸਿੱਖਾਂ ਲਈ ਇਹ ਬਹੁਤ ਵੱਡਾ ਦੁਖਾਂਤ ਸੀ।',
      en: 'On 15 August 1947, India gained independence but Punjab was divided into two. West Punjab went to Pakistan. Millions of Sikhs had to leave their homes, lands, and historic Gurdwaras (Nankana Sahib, Panja Sahib). Over 1 million people were killed during Partition. This was a great tragedy for Sikhs.',
    },
    location: {
      pa: 'ਪੰਜਾਬ',
      en: 'Punjab',
    },
    significance: {
      pa: 'ਸਿੱਖਾਂ ਦਾ ਸਭ ਤੋਂ ਵੱਡਾ ਉਜਾੜਾ। ਪੱਛਮੀ ਪੰਜਾਬ ਦੇ ਇਤਿਹਾਸਕ ਗੁਰਦੁਆਰੇ ਪਾਕਿਸਤਾਨ ਵਿੱਚ ਰਹਿ ਗਏ।',
      en: 'Greatest displacement of Sikhs. Historic Gurdwaras of West Punjab remained in Pakistan.',
    },
    keyFigures: [
      { name: { pa: 'ਮਾਸਟਰ ਤਾਰਾ ਸਿੰਘ', en: 'Master Tara Singh' }, role: { pa: 'ਅਕਾਲੀ ਨੇਤਾ', en: 'Akali Leader' } },
    ],
    sources: [
      { name: 'A History of the Sikhs Vol. 2', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
      { name: 'Train to Pakistan', author: 'Khushwant Singh', year: 1956, type: 'SECONDARY' },
    ],
  },
  {
    id: 'punjabi-suba',
    title: {
      pa: 'ਪੰਜਾਬੀ ਸੂਬਾ ਅੰਦੋਲਨ',
      en: 'Punjabi Suba Movement',
    },
    year: 1955,
    yearEnd: 1966,
    description: {
      pa: 'ਪੰਜਾਬੀ ਬੋਲਣ ਵਾਲੇ ਸੂਬੇ ਲਈ ਅੰਦੋਲਨ',
      en: 'Movement for a Punjabi-speaking state',
    },
    detailedDescription: {
      pa: 'ਅਕਾਲੀ ਦਲ ਨੇ ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਦੇ ਆਧਾਰ ਤੇ ਵੱਖਰੇ ਸੂਬੇ ਦੀ ਮੰਗ ਕੀਤੀ। ੧੯੫੫ ਤੋਂ ੧੯੬੬ ਤੱਕ ਲੰਬਾ ਸੰਘਰਸ਼ ਚੱਲਿਆ। ਮਾਸਟਰ ਤਾਰਾ ਸਿੰਘ ਅਤੇ ਸੰਤ ਫਤਹਿ ਸਿੰਘ ਨੇ ਅੰਦੋਲਨ ਦੀ ਅਗਵਾਈ ਕੀਤੀ। ੧ ਨਵੰਬਰ ੧੯੬੬ ਨੂੰ ਪੰਜਾਬ, ਹਰਿਆਣਾ, ਅਤੇ ਹਿਮਾਚਲ ਪ੍ਰਦੇਸ਼ ਵੱਖ ਕੀਤੇ ਗਏ। ਚੰਡੀਗੜ੍ਹ ਸਾਂਝੀ ਰਾਜਧਾਨੀ ਬਣੀ।',
      en: 'Akali Dal demanded a separate state based on Punjabi language. A long struggle continued from 1955 to 1966. Master Tara Singh and Sant Fateh Singh led the movement. On 1 November 1966, Punjab, Haryana, and Himachal Pradesh were separated. Chandigarh became joint capital.',
    },
    location: {
      pa: 'ਪੰਜਾਬ',
      en: 'Punjab',
    },
    significance: {
      pa: 'ਪੰਜਾਬੀ ਬੋਲਣ ਵਾਲਾ ਸੂਬਾ ਮਿਲਿਆ ਪਰ ਪੰਜਾਬ ਹੋਰ ਛੋਟਾ ਹੋ ਗਿਆ। ਚੰਡੀਗੜ੍ਹ ਦਾ ਮਸਲਾ ਅਜੇ ਵੀ ਹੱਲ ਨਹੀਂ।',
      en: 'Got Punjabi-speaking state but Punjab became smaller. Chandigarh issue still unresolved.',
    },
    keyFigures: [
      { name: { pa: 'ਮਾਸਟਰ ਤਾਰਾ ਸਿੰਘ', en: 'Master Tara Singh' }, role: { pa: 'ਅਕਾਲੀ ਨੇਤਾ', en: 'Akali Leader' } },
      { name: { pa: 'ਸੰਤ ਫਤਹਿ ਸਿੰਘ', en: 'Sant Fateh Singh' }, role: { pa: 'ਅੰਦੋਲਨਕਾਰੀ', en: 'Movement Leader' } },
    ],
    sources: [
      { name: 'A History of the Sikhs Vol. 2', author: 'Khushwant Singh', year: 1963, type: 'SECONDARY' },
    ],
  },
  {
    id: 'anandpur-sahib-resolution',
    title: {
      pa: 'ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਦਾ ਮਤਾ',
      en: 'Anandpur Sahib Resolution',
    },
    year: 1973,
    description: {
      pa: 'ਅਕਾਲੀ ਦਲ ਦਾ ਮਤਾ ਜੋ ਵੱਧ ਖੁਦਮੁਖਤਿਆਰੀ ਦੀ ਮੰਗ ਕਰਦਾ ਸੀ',
      en: 'Akali Dal resolution demanding greater autonomy',
    },
    detailedDescription: {
      pa: '੧੯੭੩ ਵਿੱਚ ਅਕਾਲੀ ਦਲ ਨੇ ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਇੱਕ ਮਤਾ ਪਾਸ ਕੀਤਾ। ਇਸ ਵਿੱਚ ਕੇਂਦਰ ਸਰਕਾਰ ਤੋਂ ਰਾਜਾਂ ਲਈ ਵੱਧ ਅਧਿਕਾਰਾਂ ਦੀ ਮੰਗ ਕੀਤੀ ਗਈ। ਚੰਡੀਗੜ੍ਹ ਅਤੇ ਪੰਜਾਬੀ ਬੋਲਣ ਵਾਲੇ ਇਲਾਕਿਆਂ ਨੂੰ ਪੰਜਾਬ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰਨ, ਪਾਣੀਆਂ ਦੇ ਹੱਕ, ਅਤੇ ਧਾਰਮਿਕ ਮਾਮਲਿਆਂ ਵਿੱਚ ਆਜ਼ਾਦੀ ਮੰਗੀ ਗਈ। ਇਹ ਮਤਾ ਭਾਰਤੀ ਸੰਘਵਾਦ ਦੇ ਸਿਧਾਂਤਾਂ ਤੇ ਆਧਾਰਿਤ ਸੀ।',
      en: 'In 1973, Akali Dal passed a resolution at Anandpur Sahib demanding greater powers for states from the central government. It demanded inclusion of Chandigarh and Punjabi-speaking areas in Punjab, water rights, and religious freedom. The resolution was based on principles of Indian federalism.',
    },
    location: {
      pa: 'ਅਨੰਦਪੁਰ ਸਾਹਿਬ',
      en: 'Anandpur Sahib',
    },
    significance: {
      pa: 'ਸਿੱਖਾਂ ਦੀਆਂ ਮੰਗਾਂ ਦਾ ਦਸਤਾਵੇਜ਼। ਅੱਗੇ ਚੱਲ ਕੇ ਵਿਵਾਦ ਦਾ ਕਾਰਨ ਬਣਿਆ।',
      en: 'Document of Sikh demands. Later became source of controversy.',
    },
    keyFigures: [
      { name: { pa: 'ਹਰਚਰਨ ਸਿੰਘ ਲੌਂਗੋਵਾਲ', en: 'Harchand Singh Longowal' }, role: { pa: 'ਅਕਾਲੀ ਪ੍ਰਧਾਨ', en: 'Akali President' } },
    ],
    sources: [
      { name: 'The Sikhs: History, Religion, and Society', author: 'W.H. McLeod', year: 1989, type: 'SECONDARY' },
    ],
  },
];

// ============================================================================
// MODERN PERIOD (1984-Present)
// ============================================================================

export const MODERN_PERIOD_EVENTS: EventDetail[] = [
  {
    id: 'operation-bluestar',
    title: {
      pa: 'ਸਾਕਾ ਨੀਲਾ ਤਾਰਾ',
      en: 'Operation Blue Star',
    },
    year: 1984,
    description: {
      pa: 'ਜੂਨ ੧੯੮੪ ਵਿੱਚ ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ ਤੇ ਫੌਜੀ ਹਮਲਾ',
      en: 'Military assault on Sri Darbar Sahib in June 1984',
    },
    detailedDescription: {
      pa: '੧ ਤੋਂ ੮ ਜੂਨ ੧੯੮੪ ਨੂੰ ਭਾਰਤੀ ਫੌਜ ਨੇ ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ (ਹਰਿਮੰਦਰ ਸਾਹਿਬ) ਅਤੇ ਅਕਾਲ ਤਖ਼ਤ ਸਾਹਿਬ ਤੇ ਹਮਲਾ ਕੀਤਾ। ਇਹ ਸਿੱਖਾਂ ਦੇ ਸਭ ਤੋਂ ਪਵਿੱਤਰ ਅਸਥਾਨ ਤੇ ਹਮਲਾ ਸੀ। ਅਕਾਲ ਤਖ਼ਤ ਸਾਹਿਬ ਤਬਾਹ ਕਰ ਦਿੱਤਾ ਗਿਆ। ਹਜ਼ਾਰਾਂ ਸ਼ਰਧਾਲੂ ਸ਼ਹੀਦ ਹੋਏ। ਸਿੱਖ ਰੈਫਰੈਂਸ ਲਾਇਬ੍ਰੇਰੀ ਸੜ ਗਈ ਜਿਸ ਵਿੱਚ ਅਨਮੋਲ ਹੱਥ-ਲਿਖਤਾਂ ਸਨ। ਇਸ ਹਮਲੇ ਨੇ ਸਿੱਖਾਂ ਦੇ ਦਿਲਾਂ ਤੇ ਡੂੰਘੇ ਜ਼ਖ਼ਮ ਕੀਤੇ।',
      en: 'From 1 to 8 June 1984, Indian Army attacked Sri Darbar Sahib (Harmandir Sahib) and Akal Takht Sahib. This was an attack on Sikhs\' holiest shrine. Akal Takht Sahib was destroyed. Thousands of pilgrims were martyred. The Sikh Reference Library was burned containing priceless manuscripts. This attack left deep wounds in Sikh hearts.',
    },
    location: {
      pa: 'ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ',
      en: 'Sri Darbar Sahib, Amritsar',
    },
    significance: {
      pa: 'ਸਿੱਖ ਇਤਿਹਾਸ ਦਾ ਸਭ ਤੋਂ ਦਰਦਨਾਕ ਸਾਕਾ। ਸਿੱਖਾਂ ਦੀ ਸਮੂਹਿਕ ਯਾਦ ਵਿੱਚ ਡੂੰਘਾ ਦੁੱਖ।',
      en: 'Most painful event in modern Sikh history. Deep trauma in collective Sikh memory.',
    },
    keyFigures: [
      { name: { pa: 'ਸੰਤ ਜਰਨੈਲ ਸਿੰਘ ਭਿੰਡਰਾਂਵਾਲੇ', en: 'Sant Jarnail Singh Bhindranwale' }, role: { pa: 'ਧਾਰਮਿਕ ਨੇਤਾ', en: 'Religious Leader' } },
    ],
    sources: [
      { name: 'A History of the Sikhs Vol. 2 (Revised Edition)', author: 'Khushwant Singh', year: 2004, type: 'SECONDARY' },
      { name: 'The Citizens Commission Report', author: 'Citizens for Democracy', year: 1985, type: 'PRIMARY' },
    ],
  },
  {
    id: 'sikh-genocide-1984',
    title: {
      pa: '੧੯੮੪ ਦਾ ਸਿੱਖ ਕਤਲੇਆਮ',
      en: 'Sikh Genocide of 1984',
    },
    year: 1984,
    description: {
      pa: 'ਨਵੰਬਰ ੧੯੮੪ ਵਿੱਚ ਸਿੱਖਾਂ ਦਾ ਕਤਲੇਆਮ',
      en: 'Massacre of Sikhs in November 1984',
    },
    detailedDescription: {
      pa: '੩੧ ਅਕਤੂਬਰ ੧੯੮੪ ਨੂੰ ਇੰਦਰਾ ਗਾਂਧੀ ਦੇ ਕਤਲ ਤੋਂ ਬਾਅਦ ਦਿੱਲੀ ਅਤੇ ਹੋਰ ਸ਼ਹਿਰਾਂ ਵਿੱਚ ਸਿੱਖਾਂ ਦਾ ਯੋਜਨਾਬੱਧ ਕਤਲੇਆਮ ਹੋਇਆ। ੩ ਦਿਨਾਂ ਵਿੱਚ ਹਜ਼ਾਰਾਂ ਸਿੱਖ ਸ਼ਹੀਦ ਕੀਤੇ ਗਏ। ਸਰਕਾਰੀ ਅੰਕੜੇ ੨੮੦੦ ਤੋਂ ਵੱਧ ਦੱਸਦੇ ਹਨ ਪਰ ਅਸਲ ਗਿਣਤੀ ਬਹੁਤ ਵੱਧ ਹੈ। ਸਿੱਖਾਂ ਦੇ ਘਰ ਸਾੜੇ ਗਏ, ਗੁਰਦੁਆਰੇ ਢਾਹੇ ਗਏ। ਇਸ ਕਤਲੇਆਮ ਲਈ ਅੱਜ ਤੱਕ ਪੂਰਾ ਇਨਸਾਫ਼ ਨਹੀਂ ਮਿਲਿਆ।',
      en: 'After the assassination of Indira Gandhi on 31 October 1984, organized massacres of Sikhs took place in Delhi and other cities. Thousands of Sikhs were martyred in 3 days. Official figures say 2800+ but actual numbers are much higher. Sikh homes were burned, Gurdwaras were demolished. Full justice for this genocide has not been achieved till date.',
    },
    location: {
      pa: 'ਦਿੱਲੀ ਅਤੇ ਹੋਰ ਸ਼ਹਿਰ',
      en: 'Delhi and other cities',
    },
    significance: {
      pa: 'ਆਜ਼ਾਦ ਭਾਰਤ ਵਿੱਚ ਸਿੱਖਾਂ ਦਾ ਸਭ ਤੋਂ ਵੱਡਾ ਕਤਲੇਆਮ। ਇਨਸਾਫ਼ ਦੀ ਲੜਾਈ ਜਾਰੀ ਹੈ।',
      en: 'Largest massacre of Sikhs in independent India. Struggle for justice continues.',
    },
    keyFigures: [],
    sources: [
      { name: 'Who Are the Guilty?', author: 'People\'s Union for Democratic Rights', year: 1984, type: 'PRIMARY' },
      { name: 'Sikhs: The Untold Agony of 1984', author: 'Harish Dhillon', year: 2015, type: 'SECONDARY' },
    ],
  },
  {
    id: 'operation-woodrose',
    title: {
      pa: 'ਆਪਰੇਸ਼ਨ ਵੁੱਡਰੋਜ਼',
      en: 'Operation Woodrose',
    },
    year: 1984,
    description: {
      pa: 'ਪੰਜਾਬ ਦੇ ਪਿੰਡਾਂ ਵਿੱਚ ਫੌਜੀ ਕਾਰਵਾਈ',
      en: 'Military operations in Punjab villages',
    },
    detailedDescription: {
      pa: 'ਆਪਰੇਸ਼ਨ ਬਲੂ ਸਟਾਰ ਤੋਂ ਬਾਅਦ ਪੰਜਾਬ ਦੇ ਪਿੰਡਾਂ ਵਿੱਚ ਵੱਡੇ ਪੱਧਰ ਤੇ ਫੌਜੀ ਕਾਰਵਾਈ ਕੀਤੀ ਗਈ। ਅੰਮ੍ਰਿਤਧਾਰੀ ਸਿੱਖ ਨੌਜਵਾਨਾਂ ਨੂੰ ਨਿਸ਼ਾਨਾ ਬਣਾਇਆ ਗਿਆ। ਹਜ਼ਾਰਾਂ ਨੌਜਵਾਨ ਗ੍ਰਿਫ਼ਤਾਰ ਕੀਤੇ ਗਏ। ਇਸ ਕਾਰਵਾਈ ਨੇ ਪੰਜਾਬ ਵਿੱਚ ਡਰ ਅਤੇ ਗੁੱਸੇ ਦਾ ਮਾਹੌਲ ਪੈਦਾ ਕੀਤਾ।',
      en: 'After Operation Blue Star, large-scale military operations were conducted in Punjab villages. Amritdhari Sikh youth were targeted. Thousands of youth were arrested. This operation created an atmosphere of fear and anger in Punjab.',
    },
    location: {
      pa: 'ਪੰਜਾਬ ਦੇ ਪਿੰਡ',
      en: 'Villages of Punjab',
    },
    significance: {
      pa: 'ਪੰਜਾਬ ਵਿੱਚ ਹਾਲਾਤ ਹੋਰ ਵਿਗੜੇ।',
      en: 'Situation in Punjab worsened further.',
    },
    keyFigures: [],
    sources: [
      { name: 'Report on Punjab', author: 'Amnesty International', year: 1991, type: 'PRIMARY' },
    ],
  },
  {
    id: 'sikh-diaspora',
    title: {
      pa: 'ਸਿੱਖ ਪਰਵਾਸ',
      en: 'Sikh Diaspora',
    },
    year: 1984,
    yearEnd: 2000,
    description: {
      pa: '੧੯੮੪ ਤੋਂ ਬਾਅਦ ਸਿੱਖਾਂ ਦਾ ਵਿਦੇਸ਼ਾਂ ਵਿੱਚ ਪਰਵਾਸ',
      en: 'Sikh migration abroad after 1984',
    },
    detailedDescription: {
      pa: '੧੯੮੪ ਦੀਆਂ ਘਟਨਾਵਾਂ ਤੋਂ ਬਾਅਦ ਬਹੁਤ ਸਾਰੇ ਸਿੱਖ ਕੈਨੇਡਾ, ਅਮਰੀਕਾ, ਇੰਗਲੈਂਡ, ਅਤੇ ਹੋਰ ਦੇਸ਼ਾਂ ਵਿੱਚ ਚਲੇ ਗਏ। ਅੱਜ ਦੁਨੀਆ ਭਰ ਵਿੱਚ ੩੦ ਲੱਖ ਤੋਂ ਵੱਧ ਸਿੱਖ ਭਾਰਤ ਤੋਂ ਬਾਹਰ ਰਹਿੰਦੇ ਹਨ। ਵਿਦੇਸ਼ੀ ਸਿੱਖ ਭਾਈਚਾਰੇ ਨੇ ਸਿੱਖੀ ਦੇ ਪ੍ਰਚਾਰ ਅਤੇ ਇਨਸਾਫ਼ ਦੀ ਲੜਾਈ ਵਿੱਚ ਅਹਿਮ ਭੂਮਿਕਾ ਨਿਭਾਈ ਹੈ।',
      en: 'After the events of 1984, many Sikhs migrated to Canada, USA, England, and other countries. Today, over 3 million Sikhs live outside India worldwide. The overseas Sikh community has played an important role in spreading Sikhi and fighting for justice.',
    },
    location: {
      pa: 'ਵਿਸ਼ਵ ਭਰ',
      en: 'Worldwide',
    },
    significance: {
      pa: 'ਸਿੱਖੀ ਦਾ ਵਿਸ਼ਵ ਭਰ ਵਿੱਚ ਪ੍ਰਸਾਰ। ਵਿਦੇਸ਼ੀ ਸਿੱਖ ਭਾਈਚਾਰੇ ਦੀ ਮਜ਼ਬੂਤੀ।',
      en: 'Spread of Sikhi worldwide. Strengthening of overseas Sikh communities.',
    },
    keyFigures: [],
    sources: [
      { name: 'Sikhs at Large', author: 'Verne A. Dusenbery', year: 2008, type: 'SECONDARY' },
    ],
  },
];

// ============================================================================
// CONTEMPORARY EVENTS (2020-Present)
// ============================================================================

export const CONTEMPORARY_EVENTS: EventDetail[] = [
  {
    id: 'farmers-protest',
    title: {
      pa: 'ਕਿਸਾਨ ਅੰਦੋਲਨ ੨੦੨੦-੨੧',
      en: 'Farmers\' Protest 2020-21',
    },
    year: 2020,
    yearEnd: 2021,
    description: {
      pa: 'ਖੇਤੀ ਕਾਨੂੰਨਾਂ ਵਿਰੁੱਧ ਕਿਸਾਨੀ ਅੰਦੋਲਨ',
      en: 'Farmers\' movement against farm laws',
    },
    detailedDescription: {
      pa: 'ਭਾਰਤ ਸਰਕਾਰ ਦੁਆਰਾ ਪਾਸ ਕੀਤੇ ਤਿੰਨ ਖੇਤੀ ਕਾਨੂੰਨਾਂ ਵਿਰੁੱਧ ਪੰਜਾਬ ਦੇ ਕਿਸਾਨਾਂ ਨੇ ਵੱਡਾ ਅੰਦੋਲਨ ਚਲਾਇਆ। ਸਿੰਘੂ, ਟਿੱਕਰੀ, ਅਤੇ ਗਾਜ਼ੀਪੁਰ ਬਾਰਡਰ ਤੇ ਲੱਖਾਂ ਕਿਸਾਨਾਂ ਨੇ ਇੱਕ ਸਾਲ ਤੋਂ ਵੱਧ ਸਮਾਂ ਧਰਨਾ ਦਿੱਤਾ। ਗੁਰਦੁਆਰਿਆਂ ਤੋਂ ਲੰਗਰ ਅਤੇ ਸੇਵਾ ਦੀ ਭਾਵਨਾ ਨੇ ਦੁਨੀਆ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕੀਤਾ। ਅੰਤ ਵਿੱਚ ਸਰਕਾਰ ਨੇ ਕਾਨੂੰਨ ਵਾਪਸ ਲਏ।',
      en: 'Punjab farmers launched a major protest against three farm laws passed by the Indian government. Lakhs of farmers sat in protest at Singhu, Tikri, and Ghazipur borders for over a year. Langar and seva from Gurdwaras impressed the world. Eventually, the government repealed the laws.',
    },
    location: {
      pa: 'ਦਿੱਲੀ ਬਾਰਡਰ',
      en: 'Delhi Borders',
    },
    significance: {
      pa: 'ਕਿਸਾਨਾਂ ਦੀ ਜਿੱਤ। ਸਿੱਖ ਸੇਵਾ ਭਾਵਨਾ ਦੀ ਵਿਸ਼ਵ ਭਰ ਵਿੱਚ ਪ੍ਰਸ਼ੰਸਾ।',
      en: 'Victory of farmers. Worldwide appreciation of Sikh spirit of seva.',
    },
    keyFigures: [],
    sources: [
      { name: 'News Reports and Documentary Evidence', author: 'Various', year: 2021, type: 'PRIMARY' },
    ],
  },
  {
    id: 'sikh-representation',
    title: {
      pa: 'ਸਿੱਖਾਂ ਦੀ ਵਿਸ਼ਵ ਪੱਧਰੀ ਪ੍ਰਤੀਨਿਧਤਾ',
      en: 'Global Sikh Representation',
    },
    year: 2020,
    description: {
      pa: 'ਸਿੱਖਾਂ ਦੀ ਵਿਸ਼ਵ ਸਿਆਸਤ ਵਿੱਚ ਵੱਧਦੀ ਭੂਮਿਕਾ',
      en: 'Growing role of Sikhs in world politics',
    },
    detailedDescription: {
      pa: 'ਅੱਜ ਸਿੱਖ ਵਿਸ਼ਵ ਭਰ ਵਿੱਚ ਮਹੱਤਵਪੂਰਨ ਅਹੁਦਿਆਂ ਤੇ ਪਹੁੰਚ ਰਹੇ ਹਨ। ਕੈਨੇਡਾ ਵਿੱਚ ਜਗਮੀਤ ਸਿੰਘ NDP ਦੇ ਨੇਤਾ ਹਨ। ਬਰਤਾਨੀਆ ਅਤੇ ਅਮਰੀਕਾ ਵਿੱਚ ਸਿੱਖ ਸੰਸਦ ਮੈਂਬਰ ਹਨ। ਸਿੱਖ ਫੌਜ, ਕਾਰੋਬਾਰ, ਅਤੇ ਹੋਰ ਖੇਤਰਾਂ ਵਿੱਚ ਉੱਚੀਆਂ ਪਦਵੀਆਂ ਤੇ ਹਨ। ਦਸਤਾਰ ਅਤੇ ਸਿੱਖ ਪਛਾਣ ਨੂੰ ਵਿਸ਼ਵ ਭਰ ਵਿੱਚ ਮਾਨਤਾ ਮਿਲ ਰਹੀ ਹੈ।',
      en: 'Today, Sikhs are reaching important positions worldwide. Jagmeet Singh is NDP leader in Canada. There are Sikh MPs in Britain and USA. Sikhs hold high positions in military, business, and other fields. Turban and Sikh identity are gaining recognition worldwide.',
    },
    location: {
      pa: 'ਵਿਸ਼ਵ ਭਰ',
      en: 'Worldwide',
    },
    significance: {
      pa: 'ਸਿੱਖੀ ਦੀ ਵਿਸ਼ਵ ਭਰ ਵਿੱਚ ਪਛਾਣ।',
      en: 'Recognition of Sikhi worldwide.',
    },
    keyFigures: [
      { name: { pa: 'ਜਗਮੀਤ ਸਿੰਘ', en: 'Jagmeet Singh' }, role: { pa: 'ਕੈਨੇਡੀਅਨ ਸਿਆਸਤਦਾਨ', en: 'Canadian Politician' } },
    ],
    sources: [
      { name: 'News Reports', author: 'Various', year: 2024, type: 'PRIMARY' },
    ],
  },
  {
    id: 'kartarpur-corridor',
    title: {
      pa: 'ਕਰਤਾਰਪੁਰ ਲਾਂਘਾ',
      en: 'Kartarpur Corridor',
    },
    year: 2019,
    description: {
      pa: 'ਗੁਰਦੁਆਰਾ ਕਰਤਾਰਪੁਰ ਸਾਹਿਬ ਲਈ ਰਾਹਦਾਰੀ',
      en: 'Corridor to Gurdwara Kartarpur Sahib',
    },
    detailedDescription: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਦੇ ੫੫੦ਵੇਂ ਪ੍ਰਕਾਸ਼ ਪੁਰਬ ਮੌਕੇ ਨਵੰਬਰ ੨੦੧੯ ਵਿੱਚ ਕਰਤਾਰਪੁਰ ਲਾਂਘਾ ਖੋਲ੍ਹਿਆ ਗਿਆ। ਇਸ ਨਾਲ ਭਾਰਤੀ ਸਿੱਖ ਬਿਨਾ ਵੀਜ਼ਾ ਪਾਕਿਸਤਾਨ ਦੇ ਕਰਤਾਰਪੁਰ ਸਾਹਿਬ ਦੇ ਦਰਸ਼ਨ ਕਰ ਸਕਦੇ ਹਨ। ਇਹ ਉਹ ਅਸਥਾਨ ਹੈ ਜਿੱਥੇ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਨੇ ਆਪਣੀ ਜ਼ਿੰਦਗੀ ਦੇ ਆਖਰੀ ੧੮ ਸਾਲ ਬਿਤਾਏ ਅਤੇ ਜੋਤੀ ਜੋਤ ਸਮਾਏ।',
      en: 'Kartarpur Corridor was opened in November 2019 on the 550th Prakash Purab of Sri Guru Nanak Dev Ji. Indian Sikhs can now visit Kartarpur Sahib in Pakistan without visa. This is the place where Guru Nanak Dev Ji spent last 18 years of life and merged with the Divine.',
    },
    location: {
      pa: 'ਕਰਤਾਰਪੁਰ ਸਾਹਿਬ, ਪਾਕਿਸਤਾਨ',
      en: 'Kartarpur Sahib, Pakistan',
    },
    significance: {
      pa: 'ਸਿੱਖਾਂ ਲਈ ਬਹੁਤ ਖੁਸ਼ੀ ਦੀ ਗੱਲ। ਵੰਡ ਤੋਂ ਬਾਅਦ ਪਹਿਲੀ ਵਾਰ ਆਸਾਨ ਪਹੁੰਚ।',
      en: 'Great joy for Sikhs. First easy access since Partition.',
    },
    keyFigures: [],
    sources: [
      { name: 'News Reports', author: 'Various', year: 2019, type: 'PRIMARY' },
    ],
  },
];

// ============================================================================
// HELPER TO GET EVENT BY ID
// ============================================================================

export const ALL_HISTORICAL_EVENTS: EventDetail[] = [
  ...KHALSA_ESTABLISHMENT_EVENTS,
  ...MISL_PERIOD_EVENTS,
  ...SIKH_EMPIRE_EVENTS,
  ...COLONIAL_PERIOD_EVENTS,
  ...POST_INDEPENDENCE_EVENTS,
  ...MODERN_PERIOD_EVENTS,
  ...CONTEMPORARY_EVENTS,
];

export function getEventById(eventId: string): EventDetail | undefined {
  return ALL_HISTORICAL_EVENTS.find(e => e.id === eventId);
}

export function getEventsByEra(eraId: string): EventDetail[] {
  switch (eraId) {
    case 'khalsa-establishment':
      return KHALSA_ESTABLISHMENT_EVENTS;
    case 'misl-period':
      return MISL_PERIOD_EVENTS;
    case 'sikh-empire':
      return SIKH_EMPIRE_EVENTS;
    case 'colonial-period':
      return COLONIAL_PERIOD_EVENTS;
    case 'post-independence':
      return POST_INDEPENDENCE_EVENTS;
    case 'modern-period':
      return MODERN_PERIOD_EVENTS;
    case 'contemporary':
      return CONTEMPORARY_EVENTS;
    default:
      return [];
  }
}
