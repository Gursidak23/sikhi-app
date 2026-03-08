// ============================================================================
// GURBANI TERMS GLOSSARY — Spiritual vocabulary with deep meanings
// ============================================================================

export type TermCategory =
  | 'divine-names'
  | 'spiritual'
  | 'five-thieves'
  | 'five-virtues'
  | 'practices'
  | 'key-phrases';

export interface GurbaniTerm {
  id: string;
  gurmukhi: string;
  roman: string;
  category: TermCategory;
  meaning: { pa: string; en: string; hi: string };
  deepMeaning: { pa: string; en: string; hi: string };
  usage?: { line: string; source: string };
}

export const TERM_CATEGORIES: Array<{
  id: TermCategory;
  label: { pa: string; en: string; hi: string };
  icon: string;
  color: string;
}> = [
  { id: 'divine-names', label: { pa: 'ਪ੍ਰਮਾਤਮਾ ਦੇ ਨਾਮ', en: 'Names of the Divine', hi: 'परमात्मा के नाम' }, icon: '✦', color: 'amber' },
  { id: 'spiritual', label: { pa: 'ਅਧਿਆਤਮਿਕ ਸੰਕਲਪ', en: 'Spiritual Concepts', hi: 'आध्यात्मिक अवधारणाएँ' }, icon: '☸', color: 'purple' },
  { id: 'five-thieves', label: { pa: 'ਪੰਜ ਚੋਰ', en: 'Five Thieves', hi: 'पाँच चोर' }, icon: '⚔', color: 'red' },
  { id: 'five-virtues', label: { pa: 'ਪੰਜ ਗੁਣ', en: 'Five Virtues', hi: 'पाँच गुण' }, icon: '🌸', color: 'emerald' },
  { id: 'practices', label: { pa: 'ਅਮਲ', en: 'Practices', hi: 'अमल' }, icon: '🙏', color: 'blue' },
  { id: 'key-phrases', label: { pa: 'ਮੁੱਖ ਵਾਕ', en: 'Key Phrases', hi: 'मुख्य वाक्य' }, icon: '📜', color: 'orange' },
];

export const GURBANI_TERMS: GurbaniTerm[] = [
  // ═══════════════════════════════════════════
  // NAMES OF THE DIVINE
  // ═══════════════════════════════════════════
  {
    id: 'waheguru',
    gurmukhi: 'ਵਾਹਿਗੁਰੂ',
    roman: 'Waheguru',
    category: 'divine-names',
    meaning: { pa: 'ਪ੍ਰਮਾਤਮਾ — ਅਦਭੁੱਤ ਗੁਰੂ', en: 'The Wondrous Enlightener — God in Sikhi', hi: 'अद्भुत गुरु — सिख धर्म में ईश्वर' },
    deepMeaning: {
      pa: 'ਵਾਹ (ਹੈਰਾਨੀ, ਅਚੰਭਾ) + ਗੁਰੂ (ਹਨੇਰੇ ਤੋਂ ਚਾਨਣ ਵੱਲ ਲੈ ਜਾਣ ਵਾਲਾ)। ਜਦੋਂ ਇਨਸਾਨ ਪ੍ਰਮਾਤਮਾ ਦੀ ਕੁਦਰਤ ਦੇਖ ਕੇ ਹੈਰਾਨ ਹੁੰਦਾ ਹੈ ਤਾਂ ਉਹ "ਵਾਹਿਗੁਰੂ" ਕਹਿੰਦਾ ਹੈ।',
      en: 'Wah (wonderment) + Guru (dispeller of darkness). It is an exclamation of awe at the divine — when the soul perceives the infinite beauty and order of creation, it spontaneously utters "Waheguru." It represents both the path and the destination of spiritual realization.',
      hi: 'वाह (विस्मय) + गुरु (अंधकार से प्रकाश की ओर ले जाने वाला)। जब आत्मा सृष्टि की अनंत सुंदरता देखती है तो स्वतः "वाहेगुरू" कहती है।'
    },
    usage: { line: 'ਵਾਹਿਗੁਰੂ ਵਾਹਿਗੁਰੂ ਵਾਹਿਗੁਰੂ ਵਾਹਿ ਜੀਉ', source: 'ਭਾਈ ਗੁਰਦਾਸ ਜੀ, ਵਾਰ 1' },
  },
  {
    id: 'akaal-purakh',
    gurmukhi: 'ਅਕਾਲ ਪੁਰਖ',
    roman: 'Akaal Purakh',
    category: 'divine-names',
    meaning: { pa: 'ਕਾਲ ਤੋਂ ਪਰੇ, ਸਦੀਵੀ ਹਸਤੀ', en: 'The Timeless Being — beyond birth and death', hi: 'काल से परे, शाश्वत सत्ता' },
    deepMeaning: {
      pa: 'ਅ (ਬਿਨਾ) + ਕਾਲ (ਸਮਾਂ/ਮੌਤ) + ਪੁਰਖ (ਹਸਤੀ)। ਜੋ ਸਮੇਂ ਦੀਆਂ ਸੀਮਾਵਾਂ ਤੋਂ ਪਰੇ ਹੈ — ਨਾ ਜੰਮਦਾ, ਨਾ ਮਰਦਾ।',
      en: 'A (without) + Kaal (time/death) + Purakh (being). The One who transcends the limitations of time — neither born nor dying, existing before creation and after dissolution. This name reminds us that the divine is not bound by the cycle that governs all creation.',
      hi: 'अ (बिना) + काल (समय/मृत्यु) + पुरख (सत्ता)। जो समय की सीमाओं से परे है — न जन्मता, न मरता।'
    },
    usage: { line: 'ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ', source: 'ਮੂਲ ਮੰਤਰ, ਜਪੁ ਜੀ ਸਾਹਿਬ' },
  },
  {
    id: 'satnam',
    gurmukhi: 'ਸਤਿਨਾਮੁ',
    roman: 'Satinaam',
    category: 'divine-names',
    meaning: { pa: 'ਜਿਸ ਦਾ ਨਾਮ ਸੱਚ ਹੈ', en: 'Whose Name/Identity is Truth', hi: 'जिसका नाम सत्य है' },
    deepMeaning: {
      pa: 'ਸਤਿ (ਸੱਚ, ਸਦੀਵੀ ਹਕੀਕਤ) + ਨਾਮੁ (ਨਾਂ/ਹੋਂਦ)। ਪ੍ਰਮਾਤਮਾ ਦੀ ਹੋਂਦ ਹੀ ਸੱਚ ਹੈ, ਬਾਕੀ ਸਭ ਅਸਥਾਈ ਅਤੇ ਬਦਲਣ ਵਾਲਾ ਹੈ।',
      en: 'Sat (truth, eternal reality) + Naam (name/identity/essence). God\'s very existence IS truth. While everything in the material world is transient and changeable, the divine essence remains the only permanent reality. Meditating on Satinaam means aligning oneself with ultimate truth.',
      hi: 'सत (सत्य, शाश्वत वास्तविकता) + नाम (नाम/अस्तित्व)। ईश्वर का अस्तित्व ही सत्य है, बाकी सब अस्थायी है।'
    },
    usage: { line: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ', source: 'ਮੂਲ ਮੰਤਰ, ਜਪੁ ਜੀ ਸਾਹਿਬ' },
  },
  {
    id: 'nirankaar',
    gurmukhi: 'ਨਿਰੰਕਾਰ',
    roman: 'Nirankaar',
    category: 'divine-names',
    meaning: { pa: 'ਰੂਪ ਰਹਿਤ, ਆਕਾਰ ਤੋਂ ਪਰੇ', en: 'The Formless One', hi: 'निराकार, रूप रहित' },
    deepMeaning: {
      pa: 'ਨਿਰ (ਬਿਨਾ) + ਅੰਕਾਰ (ਆਕਾਰ/ਰੂਪ)। ਪ੍ਰਮਾਤਮਾ ਕਿਸੇ ਰੂਪ ਵਿੱਚ ਸੀਮਤ ਨਹੀਂ। ਹਰ ਥਾਂ, ਹਰ ਜੀਵ ਵਿੱਚ ਹੈ ਪਰ ਕਿਸੇ ਇੱਕ ਸ਼ਕਲ ਵਿੱਚ ਨਹੀਂ।',
      en: 'Nir (without) + Ankaar (form/shape). God cannot be contained in any image, idol, or physical form. The divine pervades all creation yet transcends every shape and form. This is a core Sikh teaching — worship the formless, not representations.',
      hi: 'निर (बिना) + अंकार (आकार/रूप)। ईश्वर किसी रूप में सीमित नहीं। हर जगह, हर जीव में है पर किसी एक आकार में नहीं।'
    },
    usage: { line: 'ਨਿਰੰਕਾਰ ਆਕਾਰ ਆਪਿ ਨਿਰਗੁਨ ਸਰਗੁਨ ਏਕ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 250' },
  },
  {
    id: 'karta-purakh',
    gurmukhi: 'ਕਰਤਾ ਪੁਰਖੁ',
    roman: 'Karta Purakh',
    category: 'divine-names',
    meaning: { pa: 'ਕਰਨ ਵਾਲਾ, ਸਿਰਜਣਹਾਰ', en: 'The Creator Being — doer of all', hi: 'कर्ता, सृजनहार' },
    deepMeaning: {
      pa: 'ਕਰਤਾ (ਕਰਨ ਵਾਲਾ) + ਪੁਰਖੁ (ਹਸਤੀ)। ਸਮੁੱਚੀ ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਰਚਨਹਾਰ ਅਤੇ ਪਾਲਣਹਾਰ। ਸਭ ਕੁਝ ਉਸ ਦੇ ਹੁਕਮ ਵਿੱਚ ਹੋ ਰਿਹਾ ਹੈ।',
      en: 'Karta (doer/creator) + Purakh (being/entity). The active creative force behind all existence. Unlike a passive creator, Karta Purakh is continuously creating, sustaining, and dissolving — an ever-active presence. We are instruments; the true doer is the divine.',
      hi: 'कर्ता (करने वाला) + पुरख (सत्ता)। सम्पूर्ण सृष्टि का रचनाकार और पालनकर्ता।'
    },
    usage: { line: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ', source: 'ਮੂਲ ਮੰਤਰ, ਜਪੁ ਜੀ ਸਾਹਿਬ' },
  },

  // ═══════════════════════════════════════════
  // SPIRITUAL CONCEPTS
  // ═══════════════════════════════════════════
  {
    id: 'hukam',
    gurmukhi: 'ਹੁਕਮ',
    roman: 'Hukam',
    category: 'spiritual',
    meaning: { pa: 'ਰੱਬੀ ਹੁਕਮ, ਕੁਦਰਤ ਦਾ ਨਿਯਮ', en: 'Divine Will / Cosmic Order', hi: 'ईश्वरीय आदेश, प्रकृति का नियम' },
    deepMeaning: {
      pa: 'ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਹੁਕਮ ਵਿੱਚ ਚੱਲ ਰਹੀ ਹੈ। ਕੁਝ ਵੀ ਹੁਕਮ ਤੋਂ ਬਾਹਰ ਨਹੀਂ। ਜੋ ਹੁਕਮ ਨੂੰ ਸਮਝ ਲੈਂਦਾ ਹੈ ਉਹ ਹਉਮੈ ਤੋਂ ਮੁਕਤ ਹੋ ਜਾਂਦਾ ਹੈ।',
      en: 'Everything in creation operates under Hukam — the divine cosmic order. Nothing exists outside of it. Understanding Hukam means accepting that joy and sorrow, birth and death, all flow from the same source. It is not fatalism but recognizing the interconnected divine plan. One who truly understands Hukam is freed from ego.',
      hi: 'सारी सृष्टि हुकम में चल रही है। कुछ भी हुकम से बाहर नहीं। जो हुकम को समझ लेता है वह अहंकार से मुक्त हो जाता है।'
    },
    usage: { line: 'ਹੁਕਮੈ ਅੰਦਰਿ ਸਭੁ ਕੋ ਬਾਹਰਿ ਹੁਕਮ ਨ ਕੋਇ', source: 'ਜਪੁ ਜੀ ਸਾਹਿਬ, ਪਉੜੀ 1' },
  },
  {
    id: 'naam',
    gurmukhi: 'ਨਾਮ',
    roman: 'Naam',
    category: 'spiritual',
    meaning: { pa: 'ਪ੍ਰਮਾਤਮਾ ਦਾ ਨਾਮ, ਬ੍ਰਹਮ ਚੇਤਨਾ', en: 'Divine Name / God-consciousness', hi: 'ईश्वर का नाम, ब्रह्म चेतना' },
    deepMeaning: {
      pa: 'ਨਾਮ ਸਿਰਫ਼ ਇੱਕ ਸ਼ਬਦ ਨਹੀਂ — ਇਹ ਪ੍ਰਮਾਤਮਾ ਦੀ ਹਜ਼ੂਰੀ ਦਾ ਅਨੁਭਵ ਹੈ। ਨਾਮ ਜਪਣਾ ਮਤਲਬ ਹਰ ਸਾਹ ਨਾਲ ਪ੍ਰਮਾਤਮਾ ਨੂੰ ਯਾਦ ਰੱਖਣਾ।',
      en: 'Naam is not merely a word or label — it is the essence of the divine vibrating through all creation. It is the experience of God-consciousness in every breath, every moment. Naam Japna (reciting the Name) is one of the three pillars of Sikhi. Through Naam, the mind is cleansed of ego, the soul awakens, and one merges with the infinite.',
      hi: 'नाम सिर्फ एक शब्द नहीं — यह ईश्वर की उपस्थिति का अनुभव है। नाम जपना अर्थात हर साँस में ईश्वर को याद रखना।'
    },
    usage: { line: 'ਨਾਮ ਕੇ ਧਾਰੇ ਸਗਲੇ ਜੰਤ', source: 'ਸੁਖਮਨੀ ਸਾਹਿਬ, ਅੰਗ 284' },
  },
  {
    id: 'simran',
    gurmukhi: 'ਸਿਮਰਨ',
    roman: 'Simran',
    category: 'spiritual',
    meaning: { pa: 'ਯਾਦ, ਧਿਆਨ, ਪ੍ਰਮਾਤਮਾ ਦੀ ਯਾਦ', en: 'Remembrance / Meditation on the Divine', hi: 'स्मरण, ध्यान, ईश्वर की याद' },
    deepMeaning: {
      pa: 'ਸਿਮਰਨ ਸਿਰਫ਼ ਬੈਠ ਕੇ ਧਿਆਨ ਨਹੀਂ — ਇਹ ਹਰ ਪਲ ਪ੍ਰਮਾਤਮਾ ਦੀ ਹੋਂਦ ਨੂੰ ਮਹਿਸੂਸ ਕਰਨਾ ਹੈ। ਚੱਲਦੇ, ਬੋਲਦੇ, ਕੰਮ ਕਰਦੇ — ਹਰ ਸਮੇਂ।',
      en: 'More than seated meditation, Simran is a state of continuous divine remembrance. It is keeping awareness of the Creator while walking, talking, working, and breathing. Through persistent Simran, the mind is purified, fears dissolve, and one experiences the divine presence in all things. It transforms ordinary life into worship.',
      hi: 'सिमरन केवल बैठकर ध्यान नहीं — यह हर पल ईश्वर के अस्तित्व को महसूस करना है।'
    },
    usage: { line: 'ਸਿਮਰਿ ਸਿਮਰਿ ਸਿਮਰਿ ਸੁਖੁ ਪਾਵਹਿ', source: 'ਸੁਖਮਨੀ ਸਾਹਿਬ, ਅੰਗ 262' },
  },
  {
    id: 'sangat',
    gurmukhi: 'ਸੰਗਤ',
    roman: 'Sangat',
    category: 'spiritual',
    meaning: { pa: 'ਸਾਧ ਸੰਗਤ, ਪਵਿੱਤਰ ਇਕੱਠ', en: 'Holy Congregation / Community of seekers', hi: 'साध संगत, पवित्र सभा' },
    deepMeaning: {
      pa: 'ਜਿਵੇਂ ਲੋਹਾ ਪਾਰਸ ਛੂਹ ਕੇ ਸੋਨਾ ਬਣ ਜਾਂਦਾ ਹੈ, ਉਵੇਂ ਸੰਗਤ ਵਿੱਚ ਬੈਠ ਕੇ ਮਨੁੱਖ ਬਦਲ ਜਾਂਦਾ ਹੈ। ਇਕੱਲੇ ਚੱਲਣਾ ਔਖਾ ਹੈ, ਸੰਗਤ ਸਾਥ ਦਿੰਦੀ ਹੈ।',
      en: 'Just as iron is transformed to gold by the philosopher\'s stone, a person is transformed by sitting in Sangat. The company you keep shapes your mind and soul. Sangat provides support, inspiration, and collective spiritual energy — the journey is not meant to be walked alone. In Gurdwara, Sangat sits as equals before the Guru Granth Sahib.',
      hi: 'जैसे लोहा पारस छूकर सोना बन जाता है, वैसे ही संगत में बैठकर मनुष्य बदल जाता है।'
    },
    usage: { line: 'ਸਤਸੰਗਤਿ ਕੈਸੀ ਜਾਣੀਐ ॥ ਜਿਥੈ ਏਕੋ ਨਾਮੁ ਵਖਾਣੀਐ', source: 'ਸ੍ਰੀ ਰਾਗੁ, ਅੰਗ 72' },
  },
  {
    id: 'maya',
    gurmukhi: 'ਮਾਇਆ',
    roman: 'Maya',
    category: 'spiritual',
    meaning: { pa: 'ਭੁਲੇਖਾ, ਦੁਨਿਆਵੀ ਮੋਹ', en: 'Illusion / Material attachment', hi: 'माया, भ्रम, सांसारिक मोह' },
    deepMeaning: {
      pa: 'ਮਾਇਆ ਪੈਸਾ ਹੀ ਨਹੀਂ — ਹਰ ਉਹ ਚੀਜ਼ ਜੋ ਸਾਨੂੰ ਪ੍ਰਮਾਤਮਾ ਤੋਂ ਦੂਰ ਕਰੇ। ਧਨ, ਰੂਪ, ਤਾਕਤ, ਸ਼ੋਹਰਤ — ਸਭ ਅਸਥਾਈ। ਮਾਇਆ ਦੇ ਤਿੰਨ ਗੁਣ ਹਨ: ਰਜੋ, ਤਮੋ, ਸਤੋ।',
      en: 'Maya is not just money or wealth — it is everything that creates the illusion of separation from the divine. It has three qualities (gunas): Rajo (passion/desire), Tamo (darkness/ignorance), and Sato (virtue/goodness). Even virtue can become Maya when it feeds ego. True liberation means seeing through Maya while living within it — being a lotus in muddy water.',
      hi: 'माया सिर्फ पैसा नहीं — हर वह चीज़ जो हमें ईश्वर से दूर करे। माया के तीन गुण: रजो, तमो, सतो।'
    },
    usage: { line: 'ਏਹ ਮਾਇਆ ਜਿਤੁ ਹਰਿ ਵਿਸਰੈ ਮੋਹੁ ਉਪਜੈ ਭਾਉ ਦੂਜਾ ਲਾਇਆ', source: 'ਅਨੰਦ ਸਾਹਿਬ, ਅੰਗ 921' },
  },
  {
    id: 'gurmukh',
    gurmukhi: 'ਗੁਰਮੁਖ',
    roman: 'Gurmukh',
    category: 'spiritual',
    meaning: { pa: 'ਗੁਰੂ ਵੱਲ ਮੂੰਹ ਕਰਨ ਵਾਲਾ', en: 'One who faces the Guru / God-oriented', hi: 'गुरु की ओर मुख करने वाला' },
    deepMeaning: {
      pa: 'ਗੁਰ (ਗੁਰੂ) + ਮੁਖ (ਮੂੰਹ/ਦਿਸ਼ਾ)। ਜੋ ਗੁਰੂ ਦੀ ਸਿੱਖਿਆ ਅਨੁਸਾਰ ਜੀਵਨ ਜੀਉਂਦਾ ਹੈ। ਮਨਮੁਖ ਦੇ ਉਲਟ — ਜੋ ਆਪਣੇ ਮਨ ਪਿੱਛੇ ਲੱਗਦਾ ਹੈ।',
      en: 'Gur (Guru) + Mukh (face/direction). One whose life is oriented toward the Guru\'s teachings. The opposite of Manmukh (self-oriented). A Gurmukh sees the divine in all, serves selflessly, lives truthfully, and remains in constant remembrance. It is the ideal state of being in Sikhi — not a title but a way of living.',
      hi: 'गुर (गुरु) + मुख (मुँह/दिशा)। जो गुरु की शिक्षा अनुसार जीवन जीता है। मनमुख के विपरीत।'
    },
    usage: { line: 'ਗੁਰਮੁਖਿ ਨਾਮੁ ਜਪਹੁ ਮਨ ਮੇਰੇ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 560' },
  },

  // ═══════════════════════════════════════════
  // FIVE THIEVES
  // ═══════════════════════════════════════════
  {
    id: 'kaam',
    gurmukhi: 'ਕਾਮ',
    roman: 'Kaam',
    category: 'five-thieves',
    meaning: { pa: 'ਕਾਮਨਾ, ਵਾਸ਼ਨਾ', en: 'Lust / Uncontrolled desire', hi: 'काम, वासना' },
    deepMeaning: {
      pa: 'ਸਿਰਫ਼ ਸ਼ਰੀਰਕ ਵਾਸ਼ਨਾ ਨਹੀਂ — ਕਿਸੇ ਵੀ ਚੀਜ਼ ਦੀ ਬੇਕਾਬੂ ਲਾਲਸਾ। ਜਦੋਂ ਇੱਛਾ ਜ਼ਰੂਰਤ ਤੋਂ ਵੱਧ ਜਾਂਦੀ ਹੈ ਤਾਂ ਉਹ ਕਾਮ ਬਣ ਜਾਂਦੀ ਹੈ।',
      en: 'Not merely physical lust — Kaam is any uncontrolled craving or desire that enslaves the mind. When a natural need becomes an obsessive want, it becomes Kaam. It blinds judgment, disrupts relationships, and distances the soul from the divine. The antidote is channeling desires through discipline and remembrance.',
      hi: 'सिर्फ शारीरिक वासना नहीं — किसी भी चीज़ की बेकाबू लालसा। जब इच्छा ज़रूरत से अधिक हो जाए तो वह काम बन जाती है।'
    },
    usage: { line: 'ਕਾਮੁ ਕ੍ਰੋਧੁ ਅਹੰਕਾਰੁ ਤਜੀਅਲੇ', source: 'ਗਉੜੀ, ਅੰਗ 219' },
  },
  {
    id: 'krodh',
    gurmukhi: 'ਕ੍ਰੋਧ',
    roman: 'Krodh',
    category: 'five-thieves',
    meaning: { pa: 'ਗੁੱਸਾ, ਕ੍ਰੋਧ', en: 'Anger / Wrath', hi: 'क्रोध, गुस्सा' },
    deepMeaning: {
      pa: 'ਕ੍ਰੋਧ ਅੱਗ ਵਾਂਗ ਹੈ — ਪਹਿਲਾਂ ਆਪਣੇ ਆਪ ਨੂੰ ਸਾੜਦਾ ਹੈ, ਫਿਰ ਦੂਜਿਆਂ ਨੂੰ। ਇਹ ਸੋਚਣ ਦੀ ਸ਼ਕਤੀ ਖੋਹ ਲੈਂਦਾ ਹੈ ਅਤੇ ਰਿਸ਼ਤੇ ਤਬਾਹ ਕਰਦਾ ਹੈ।',
      en: 'Krodh is like fire — it burns the one who holds it first, then others. It robs you of rational thought, destroys relationships, and creates a cycle of violence. In Gurbani, anger often arises from unfulfilled desires (Kaam) or threatened ego (Ahankaar). The remedy is patience (Dheeraj), compassion (Daya), and understanding that everything happens within Hukam.',
      hi: 'क्रोध आग के समान है — पहले स्वयं को जलाता है, फिर दूसरों को। यह सोचने की शक्ति छीन लेता है।'
    },
    usage: { line: 'ਕ੍ਰੋਧੁ ਨ ਕਰਿ ਭਾਈ ਜਗਤ ਗੁਰੁ ਵਿਆਪਿਆ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 1327' },
  },
  {
    id: 'lobh',
    gurmukhi: 'ਲੋਭ',
    roman: 'Lobh',
    category: 'five-thieves',
    meaning: { pa: 'ਲਾਲਚ, ਹੋਰ ਦੀ ਲਾਲਸਾ', en: 'Greed / Avarice', hi: 'लोभ, लालच' },
    deepMeaning: {
      pa: 'ਲੋਭ "ਹੋਰ, ਹੋਰ, ਹੋਰ" ਦੀ ਅਵਾਜ਼ ਹੈ ਜੋ ਕਦੇ ਸ਼ਾਂਤ ਨਹੀਂ ਹੁੰਦੀ। ਜਿੰਨਾ ਮਿਲੇ ਓਨਾ ਹੋਰ ਚਾਹੀਦਾ। ਸੰਤੋਖ ਇਸ ਦਾ ਇਲਾਜ ਹੈ।',
      en: 'Lobh is the voice of "more, more, more" that is never satisfied. No amount of wealth, possessions, or achievements can fill the void of greed. It creates anxiety, dishonesty, and exploitation of others. Guru Nanak Dev Ji taught that Santokh (contentment) is the antidote — not poverty, but being grateful for what one has while working honestly.',
      hi: 'लोभ "और, और, और" की आवाज़ है जो कभी शांत नहीं होती। संतोष इसका इलाज है।'
    },
    usage: { line: 'ਲੋਭੁ ਲਹਰਿ ਸਭੁ ਸੁਆਣੁ ਹੈ ਪੂਜਾ ਕਰਹਿ ਭੀ ਪੂਜੀ ਖਾਇ', source: 'ਵਾਰ ਮਾਝ, ਅੰਗ 146' },
  },
  {
    id: 'moh',
    gurmukhi: 'ਮੋਹ',
    roman: 'Moh',
    category: 'five-thieves',
    meaning: { pa: 'ਮੋਹ, ਜ਼ਿਆਦਾ ਲਗਾਅ', en: 'Attachment / Excessive worldly bonds', hi: 'मोह, अत्यधिक लगाव' },
    deepMeaning: {
      pa: 'ਪਿਆਰ ਅਤੇ ਮੋਹ ਵਿੱਚ ਫ਼ਰਕ ਹੈ। ਪਿਆਰ ਆਜ਼ਾਦ ਕਰਦਾ ਹੈ, ਮੋਹ ਬੰਨ੍ਹਦਾ ਹੈ। ਮੋਹ ਵਿੱਚ ਡਰ ਹੈ — ਗੁਆਚ ਜਾਣ ਦਾ ਡਰ। ਗੁਰਬਾਣੀ ਕਹਿੰਦੀ ਹੈ ਕਿ ਸੱਚਾ ਪਿਆਰ ਕਰੋ, ਮੋਹ ਛੱਡੋ।',
      en: 'Love and Moh are different. Love liberates; Moh binds. Moh contains fear — the fear of losing what you cling to. Attachment to family, possessions, status, or even one\'s own body creates suffering. Gurbani does not teach detachment from the world but detachment from the FEAR of loss — love everyone but know that ultimately all belongs to the Creator.',
      hi: 'प्रेम और मोह में अंतर है। प्रेम मुक्त करता है, मोह बाँधता है। मोह में डर है — खो देने का डर।'
    },
    usage: { line: 'ਮੋਹ ਠਗਉਲੀ ਪਾਈਐ ਮਨਮੁਖਿ ਸੋਝੀ ਨ ਪਾਇ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 643' },
  },
  {
    id: 'ahankaar',
    gurmukhi: 'ਅਹੰਕਾਰ',
    roman: 'Ahankaar',
    category: 'five-thieves',
    meaning: { pa: 'ਹੰਕਾਰ, ਹਉਮੈ', en: 'Pride / Ego', hi: 'अहंकार, घमंड' },
    deepMeaning: {
      pa: 'ਪੰਜ ਚੋਰਾਂ ਵਿੱਚੋਂ ਸਭ ਤੋਂ ਖ਼ਤਰਨਾਕ। ਅਹੰਕਾਰ ਕਹਿੰਦਾ ਹੈ "ਮੈਂ ਕੁਝ ਹਾਂ" — ਪ੍ਰਮਾਤਮਾ ਤੋਂ ਵੱਖਰਾ। ਜਦੋਂ ਤੱਕ ਹਉਮੈ ਹੈ, ਪ੍ਰਮਾਤਮਾ ਨਾਲ ਮਿਲਾਪ ਨਹੀਂ ਹੋ ਸਕਦਾ।',
      en: 'The most dangerous of the five thieves. Ahankaar says "I am something separate" — creating the fundamental illusion of separation from the divine. It is the root of all other vices: desire arises from ego, anger arises from wounded ego, greed from ego\'s need for more, attachment from ego\'s fear. Nimrata (humility) is the antidote. As Guru Nanak said, only when "I" dies does truth enter.',
      hi: 'पाँच चोरों में सबसे खतरनाक। अहंकार कहता है "मैं कुछ हूँ" — ईश्वर से अलग। जब तक अहंकार है, ईश्वर से मिलन नहीं।'
    },
    usage: { line: 'ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ ਦਾਰੂ ਭੀ ਇਸੁ ਮਾਹਿ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 466' },
  },

  // ═══════════════════════════════════════════
  // FIVE VIRTUES
  // ═══════════════════════════════════════════
  {
    id: 'sat',
    gurmukhi: 'ਸੱਤ',
    roman: 'Sat',
    category: 'five-virtues',
    meaning: { pa: 'ਸੱਚ, ਸੱਚਾਈ', en: 'Truth / Truthful living', hi: 'सत्य, सच्चाई' },
    deepMeaning: {
      pa: 'ਸੱਤ ਸਿਰਫ਼ ਝੂਠ ਨਾ ਬੋਲਣਾ ਨਹੀਂ — ਸੱਚ ਅਨੁਸਾਰ ਜੀਣਾ ਹੈ। ਸੱਚੀ ਕਮਾਈ, ਸੱਚੇ ਰਿਸ਼ਤੇ, ਸੱਚੀ ਸੋਚ। ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਕਹਿੰਦੇ ਹਨ "ਸੱਚ ਉੱਚਾ ਹੈ, ਪਰ ਸੱਚ ਅਨੁਸਾਰ ਜੀਣਾ ਹੋਰ ਵੀ ਉੱਚਾ ਹੈ।"',
      en: 'Sat is not just not-lying — it is living in alignment with truth. Honest earning, truthful relationships, authentic thinking. Guru Nanak said: "Truth is high, but truthful living is even higher." It means having the courage to speak truth, live truth, and stand for truth even when it is difficult.',
      hi: 'सत्य केवल झूठ न बोलना नहीं — सच्चाई अनुसार जीना है। गुरु नानक कहते हैं, "सच ऊँचा है, पर सच अनुसार जीना और ऊँचा।"'
    },
    usage: { line: 'ਸਚਹੁ ਓਰੈ ਸਭੁ ਕੋ ਉਪਰਿ ਸਚੁ ਆਚਾਰੁ', source: 'ਜਪੁ ਜੀ ਸਾਹਿਬ, ਪਉੜੀ 38' },
  },
  {
    id: 'santokh',
    gurmukhi: 'ਸੰਤੋਖ',
    roman: 'Santokh',
    category: 'five-virtues',
    meaning: { pa: 'ਸੰਤੋਖ, ਤ੍ਰਿਪਤੀ', en: 'Contentment / Inner satisfaction', hi: 'संतोष, तृप्ति' },
    deepMeaning: {
      pa: 'ਸੰਤੋਖ ਆਲਸ ਨਹੀਂ — ਮਿਹਨਤ ਕਰੋ ਪਰ ਨਤੀਜਾ ਪ੍ਰਮਾਤਮਾ ਤੇ ਛੱਡੋ। ਜੋ ਮਿਲਿਆ ਉਸ ਵਿੱਚ ਖ਼ੁਸ਼ ਰਹੋ। ਲੋਭ ਦਾ ਇਲਾਜ ਸੰਤੋਖ ਹੈ।',
      en: 'Santokh is not laziness or complacency — it is working hard while leaving results to the divine. Be happy with what you have while striving for betterment. It is the antidote to Lobh (greed). A contented mind is a peaceful mind, and from peace comes the clarity to perceive the divine.',
      hi: 'संतोष आलस्य नहीं — मेहनत करो पर परिणाम ईश्वर पर छोड़ो। जो मिला उसमें प्रसन्न रहो।'
    },
    usage: { line: 'ਸੰਤੋਖੁ ਥੀਆ ਨਦਰੀ ਆਇਆ', source: 'ਜਪੁ ਜੀ ਸਾਹਿਬ' },
  },
  {
    id: 'daya',
    gurmukhi: 'ਦਇਆ',
    roman: 'Daya',
    category: 'five-virtues',
    meaning: { pa: 'ਦਇਆ, ਤਰਸ, ਕਰੁਣਾ', en: 'Compassion / Mercy', hi: 'दया, करुणा' },
    deepMeaning: {
      pa: 'ਦਇਆ ਸਿਰਫ਼ ਤਰਸ ਨਹੀਂ — ਦੂਜੇ ਦਾ ਦਰਦ ਸਮਝ ਕੇ ਉਸ ਲਈ ਕੁਝ ਕਰਨਾ। ਸਾਰੇ ਜੀਵ ਉਸੇ ਪ੍ਰਮਾਤਮਾ ਦੇ ਹਨ — ਇਹ ਸਮਝ ਆਉਣ ਨਾਲ ਦਇਆ ਆਪੇ ਆ ਜਾਂਦੀ ਹੈ। ਕ੍ਰੋਧ ਦਾ ਇਲਾਜ ਦਇਆ ਹੈ।',
      en: 'Daya is not just feeling sorry — it is feeling another\'s pain and acting to help. When you truly understand that all beings are children of the same Creator, compassion flows naturally. It is the antidote to Krodh (anger). Compassion extends to all living beings — humans, animals, and nature.',
      hi: 'दया सिर्फ तरस नहीं — दूसरे का दर्द समझकर उसके लिए कुछ करना। सभी जीव उसी ईश्वर के हैं। क्रोध का इलाज दया है।'
    },
    usage: { line: 'ਦਇਆ ਜਾਣੈ ਜੀਅ ਕੀ ਕਿਛੁ ਪੁੰਨੁ ਦਾਨੁ ਕਰੇਇ', source: 'ਜਪੁ ਜੀ ਸਾਹਿਬ, ਪਉੜੀ 28' },
  },
  {
    id: 'nimrata',
    gurmukhi: 'ਨਿਮਰਤਾ',
    roman: 'Nimrata',
    category: 'five-virtues',
    meaning: { pa: 'ਨਿਮਰਤਾ, ਹਲੀਮੀ', en: 'Humility / Gentle strength', hi: 'विनम्रता, नम्रता' },
    deepMeaning: {
      pa: 'ਨਿਮਰਤਾ ਕਮਜ਼ੋਰੀ ਨਹੀਂ — ਇਹ ਸਭ ਤੋਂ ਵੱਡੀ ਤਾਕਤ ਹੈ। ਜਿਵੇਂ ਫਲ ਨਾਲ ਲੱਦਿਆ ਬੂਟਾ ਝੁਕ ਜਾਂਦਾ ਹੈ, ਉਵੇਂ ਗਿਆਨ ਵਾਲਾ ਇਨਸਾਨ ਨਿਮਰ ਹੁੰਦਾ ਹੈ। ਅਹੰਕਾਰ ਦਾ ਇਲਾਜ।',
      en: 'Nimrata is not weakness — it is the greatest strength. Like a fruit-laden tree bends low, a person full of wisdom becomes humble. It is the antidote to Ahankaar (ego). Guru Angad Dev Ji said: "Nimrata is the highest virtue of all." Humility opens the door to learning, growing, and receiving grace.',
      hi: 'नम्रता कमज़ोरी नहीं — यह सबसे बड़ी ताकत है। जैसे फल से लदा पेड़ झुक जाता है, वैसे ज्ञानी व्यक्ति विनम्र होता है।'
    },
    usage: { line: 'ਮਿਠਤੁ ਨੀਵੀ ਨਾਨਕਾ ਗੁਣ ਚੰਗਿਆਈਆ ਤਤੁ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 470' },
  },
  {
    id: 'pyaar',
    gurmukhi: 'ਪਿਆਰ',
    roman: 'Pyaar',
    category: 'five-virtues',
    meaning: { pa: 'ਪ੍ਰੇਮ, ਮੁਹੱਬਤ', en: 'Divine Love / Unconditional love', hi: 'प्रेम, मुहब्बत' },
    deepMeaning: {
      pa: 'ਸਿੱਖੀ ਵਿੱਚ ਪਿਆਰ ਦਾ ਮਤਲਬ ਸਭ ਜੀਵਾਂ ਨਾਲ ਪ੍ਰੇਮ — ਬਿਨਾ ਕਿਸੇ ਸ਼ਰਤ। ਜਦੋਂ ਤੁਸੀਂ ਹਰ ਜੀਵ ਵਿੱਚ ਪ੍ਰਮਾਤਮਾ ਦੇਖਦੇ ਹੋ ਤਾਂ ਪਿਆਰ ਆਪੇ ਆ ਜਾਂਦਾ ਹੈ। ਮੋਹ ਦਾ ਇਲਾਜ ਨਿਰਸੁਆਰਥ ਪਿਆਰ ਹੈ।',
      en: 'In Sikhi, Pyaar means love for all beings — without condition. When you see the Creator in every creation, love flows naturally. It is the antidote to Moh (attachment). Unlike Moh which clings out of fear, Pyaar gives freely. As Guru Nanak said: "Those who have loved have found God."',
      hi: 'सिखी में प्यार का अर्थ सभी जीवों से प्रेम — बिना किसी शर्त के। जब आप हर जीव में ईश्वर देखते हैं तो प्यार स्वतः आ जाता है।'
    },
    usage: { line: 'ਜਿਨ ਪ੍ਰੇਮ ਕੀਓ ਤਿਨ ਹੀ ਪ੍ਰਭ ਪਾਇਓ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ' },
  },

  // ═══════════════════════════════════════════
  // PRACTICES
  // ═══════════════════════════════════════════
  {
    id: 'amrit-vela',
    gurmukhi: 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ',
    roman: 'Amrit Vela',
    category: 'practices',
    meaning: { pa: 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ — ਸਵੇਰ ਦਾ ਪਵਿੱਤਰ ਸਮਾਂ', en: 'The Ambrosial Hours — early morning meditation time', hi: 'अमृत वेला — सुबह का पवित्र समय' },
    deepMeaning: {
      pa: 'ਅੰਮ੍ਰਿਤ (ਅਮਰ ਕਰਨ ਵਾਲਾ) + ਵੇਲਾ (ਸਮਾਂ)। ਰਾਤ ਦੇ ਆਖ਼ਰੀ ਪਹਿਰ (3-6 AM) ਨੂੰ ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਕਹਿੰਦੇ ਹਨ। ਇਸ ਸਮੇਂ ਕੁਦਰਤ ਸ਼ਾਂਤ ਹੁੰਦੀ ਹੈ, ਮਨ ਸ਼ਾਂਤ ਹੁੰਦਾ ਹੈ — ਸਿਮਰਨ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ।',
      en: 'Amrit (nectar of immortality) + Vela (time). The hours before dawn (approximately 3-6 AM) when the world is still and the mind is naturally calm. This is considered the most potent time for meditation and connecting with the divine. The stillness of nature mirrors the stillness needed in the mind for spiritual practice.',
      hi: 'अमृत (अमर करने वाला) + वेला (समय)। सुबह 3-6 बजे — प्रकृति शांत, मन शांत — सिमरन का सर्वोत्तम समय।'
    },
    usage: { line: 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ', source: 'ਜਪੁ ਜੀ ਸਾਹਿਬ, ਪਉੜੀ 4' },
  },
  {
    id: 'nitnem',
    gurmukhi: 'ਨਿਤਨੇਮ',
    roman: 'Nitnem',
    category: 'practices',
    meaning: { pa: 'ਰੋਜ਼ਾਨਾ ਦੀ ਪਾਠ ਦੀ ਮਰਿਆਦਾ', en: 'Daily prayers / spiritual discipline', hi: 'दैनिक पाठ की मर्यादा' },
    deepMeaning: {
      pa: 'ਨਿਤ (ਰੋਜ਼) + ਨੇਮ (ਨਿਯਮ)। ਸਿੱਖ ਦੀ ਰੋਜ਼ਾਨਾ ਬਾਣੀ: ਸਵੇਰੇ ਜਪੁ ਜੀ, ਜਾਪ ਜੀ, ਤਵਪ੍ਰਸਾਦਿ ਸਵੱਏ; ਸ਼ਾਮ ਨੂੰ ਰਹਿਰਾਸ; ਰਾਤ ਨੂੰ ਕੀਰਤਨ ਸੋਹਿਲਾ। ਜਿਵੇਂ ਸਰੀਰ ਨੂੰ ਰੋਟੀ ਚਾਹੀਦੀ ਹੈ, ਰੂਹ ਨੂੰ ਨਿਤਨੇਮ ਚਾਹੀਦਾ ਹੈ।',
      en: 'Nit (daily) + Nem (discipline/rule). The daily prayers a Sikh recites: Japji Sahib, Jaap Sahib, Tav Prasad Savaiye in the morning; Rehraas in the evening; Kirtan Sohila at night. Just as the body needs food daily, the soul needs Nitnem. It is not ritual but daily nourishment for the spirit — maintaining constant connection with the Guru\'s wisdom.',
      hi: 'नित (रोज़) + नेम (नियम)। सिख का दैनिक पाठ: सुबह जपुजी, जाप, सवैये; शाम रहिरास; रात कीर्तन सोहिला।'
    },
    usage: { line: 'ਗੁਰ ਸਤਿਗੁਰ ਕਾ ਜੋ ਸਿਖੁ ਅਖਾਏ ਸੁ ਭਲਕੇ ਉਠਿ ਹਰਿ ਨਾਮੁ ਧਿਆਵੈ', source: 'ਗਉੜੀ ਕੀ ਵਾਰ, ਅੰਗ 305' },
  },
  {
    id: 'sewa',
    gurmukhi: 'ਸੇਵਾ',
    roman: 'Sewa',
    category: 'practices',
    meaning: { pa: 'ਨਿਰਸੁਆਰਥ ਸੇਵਾ', en: 'Selfless Service', hi: 'निःस्वार्थ सेवा' },
    deepMeaning: {
      pa: 'ਸੇਵਾ ਸਿੱਖੀ ਦੇ ਤਿੰਨ ਥੰਮ੍ਹਾਂ ਵਿੱਚੋਂ ਇੱਕ ਹੈ (ਨਾਮ ਜਪਣਾ, ਕਿਰਤ ਕਰਨਾ, ਵੰਡ ਛਕਣਾ)। ਦੂਜਿਆਂ ਦੀ ਸੇਵਾ ਕਰਨਾ ਪ੍ਰਮਾਤਮਾ ਦੀ ਸੇਵਾ ਹੈ — ਕਿਉਂਕਿ ਹਰ ਜੀਵ ਵਿੱਚ ਉਹੀ ਜੋਤ ਹੈ।',
      en: 'Sewa is one of the three pillars of Sikhi (Naam Japna, Kirat Karna, Vand Chakna). Serving others IS serving God — because every being carries the same divine light. True Sewa is done without expectation of reward, recognition, or return. It benefits the server as much as the served — dissolving ego and opening the heart.',
      hi: 'सेवा सिखी के तीन स्तंभों में से एक है। दूसरों की सेवा करना ईश्वर की सेवा है — क्योंकि हर जीव में वही ज्योत है।'
    },
    usage: { line: 'ਵਿਚਿ ਦੁਨੀਆ ਸੇਵ ਕਮਾਈਐ ॥ ਤਾ ਦਰਗਹ ਬੈਸਣੁ ਪਾਈਐ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 26' },
  },
  {
    id: 'langar',
    gurmukhi: 'ਲੰਗਰ',
    roman: 'Langar',
    category: 'practices',
    meaning: { pa: 'ਗੁਰੂ ਕਾ ਲੰਗਰ — ਸਾਂਝੀ ਰਸੋਈ', en: 'Community Kitchen — free shared meal', hi: 'गुरु का लंगर — सामुदायिक रसोई' },
    deepMeaning: {
      pa: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਨੇ ਸ਼ੁਰੂ ਕੀਤਾ। ਜਾਤ-ਪਾਤ, ਅਮੀਰ-ਗਰੀਬ, ਰਾਜਾ-ਰੰਕ — ਸਭ ਇੱਕ ਪੰਗਤ ਵਿੱਚ ਬੈਠ ਕੇ ਖਾਂਦੇ ਹਨ। ਲੰਗਰ ਸਿਰਫ਼ ਖਾਣਾ ਨਹੀਂ — ਬਰਾਬਰੀ ਦਾ ਅਮਲੀ ਸਬੂਤ ਹੈ।',
      en: 'Started by Guru Nanak Dev Ji. Caste, wealth, status, religion — all dissolve when everyone sits together in Pangat (rows) to share a meal. Langar is not just food — it is equality in action. The richest and poorest eat the same food, sitting on the same floor. It teaches that no one is above or below another. It is the world\'s largest ongoing free food service.',
      hi: 'गुरु नानक देव जी ने शुरू किया। जाति-पाती, अमीर-गरीब — सब एक पंगत में बैठकर खाते हैं। लंगर समानता का व्यावहारिक प्रमाण है।'
    },
    usage: { line: 'ਪਹਿਲਾ ਪੰਗਤ ਪਿਛੋਂ ਸੰਗਤ', source: 'ਸਿੱਖ ਰਹਿਤ' },
  },
  {
    id: 'ardaas',
    gurmukhi: 'ਅਰਦਾਸ',
    roman: 'Ardaas',
    category: 'practices',
    meaning: { pa: 'ਬੇਨਤੀ, ਪ੍ਰਾਰਥਨਾ', en: 'Formal Prayer / Supplication', hi: 'प्रार्थना, विनती' },
    deepMeaning: {
      pa: 'ਫ਼ਾਰਸੀ ਸ਼ਬਦ "ਅਰਜ਼-ਦਾਸ਼ਤ" ਤੋਂ। ਸਿੱਖ ਕਿਸੇ ਵੀ ਕੰਮ ਤੋਂ ਪਹਿਲਾਂ ਅਤੇ ਬਾਅਦ ਅਰਦਾਸ ਕਰਦਾ ਹੈ। ਇਹ ਗੁਰੂ ਅੱਗੇ ਬੇਨਤੀ ਹੈ — ਤਾਕਤ, ਬਖ਼ਸ਼ਿਸ਼, ਅਤੇ ਸਰਬੱਤ ਦੇ ਭਲੇ ਲਈ।',
      en: 'From Persian "arz-dasht" (petition/request). Sikhs perform Ardaas before and after any significant action. It is a humble petition before the Guru — asking for strength, forgiveness, and the welfare of ALL humanity. The Ardaas always ends with: "Nanak Naam Chardhi Kala, Tere Bhane Sarbat Da Bhala" — may all beings prosper by Your will.',
      hi: 'फ़ारसी शब्द "अर्ज़-दाश्त" से। सिख किसी भी कार्य से पहले और बाद अरदास करता है — शक्ति, क्षमा, और सर्वभूत हित के लिए।'
    },
    usage: { line: 'ਪ੍ਰਿਥਮ ਭਗਉਤੀ ਸਿਮਰਿ ਕੈ ਗੁਰ ਨਾਨਕ ਲਈ ਧਿਆਇ', source: 'ਅਰਦਾਸ (ਸਿੱਖ ਪ੍ਰਾਰਥਨਾ)' },
  },

  // ═══════════════════════════════════════════
  // KEY PHRASES
  // ═══════════════════════════════════════════
  {
    id: 'ik-onkaar',
    gurmukhi: 'ੴ',
    roman: 'Ik Onkaar',
    category: 'key-phrases',
    meaning: { pa: 'ਇੱਕ ਓਅੰਕਾਰ — ਇੱਕ ਪ੍ਰਮਾਤਮਾ ਹੈ', en: 'There is One Creator / One Universal God', hi: 'इक ओंकार — एक ईश्वर है' },
    deepMeaning: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਦਾ ਪਹਿਲਾ ਸ਼ਬਦ। ਇੱਕ (੧) + ਓਅੰਕਾਰ (ਬ੍ਰਹਮ ਧੁਨੀ)। ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਇੱਕ ਪ੍ਰਮਾਤਮਾ ਵਿੱਚੋਂ ਨਿਕਲੀ, ਇੱਕ ਵਿੱਚ ਹੀ ਹੈ, ਅਤੇ ਇੱਕ ਵਿੱਚ ਹੀ ਸਮਾ ਜਾਵੇਗੀ। ਨਾ ਹਿੰਦੂ ਦਾ ਰੱਬ ਵੱਖ, ਨਾ ਮੁਸਲਮਾਨ ਦਾ — ਸਭ ਦਾ ਇੱਕੋ ਹੈ।',
      en: 'The opening symbol of Sri Guru Granth Sahib Ji. Ik (one, represented by numeral ੧) + Onkaar (the primal vibration/Creator). All of creation emerged from ONE source, exists within that ONE, and will merge back into that ONE. There is no Hindu God vs. Muslim God — the Creator of all is one and the same. This is the foundational principle of Sikhi.',
      hi: 'श्री गुरु ग्रंथ साहिब जी का पहला शब्द। इक (एक) + ओंकार (ब्रह्म ध्वनि)। सारी सृष्टि एक ईश्वर से निकली, एक में है, एक में ही समा जाएगी।'
    },
    usage: { line: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ', source: 'ਮੂਲ ਮੰਤਰ, ਜਪੁ ਜੀ ਸਾਹਿਬ' },
  },
  {
    id: 'sat-sri-akaal',
    gurmukhi: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ',
    roman: 'Sat Sri Akaal',
    category: 'key-phrases',
    meaning: { pa: 'ਪ੍ਰਮਾਤਮਾ ਸੱਚ ਹੈ, ਸਦੀਵੀ ਹੈ', en: 'God is the Ultimate Truth — Sikh greeting', hi: 'ईश्वर सत्य है, शाश्वत है' },
    deepMeaning: {
      pa: 'ਸਤਿ (ਸੱਚ) + ਸ੍ਰੀ (ਸਤਿਕਾਰ) + ਅਕਾਲ (ਕਾਲ ਤੋਂ ਪਰੇ)। ਸਿੱਖਾਂ ਦੀ ਫ਼ਤਹਿ — ਮੌਤ ਤੋਂ ਡਰ ਨਹੀਂ, ਕਿਉਂਕਿ ਸੱਚ ਕਦੇ ਮਰਦਾ ਨਹੀਂ। ਜਦੋਂ ਸਿੱਖ ਇੱਕ ਦੂਜੇ ਨੂੰ ਮਿਲਦੇ ਹਨ ਤਾਂ "ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਹਿ" ਜਾਂ "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ" ਕਹਿੰਦੇ ਹਨ।',
      en: 'Sat (truth) + Sri (respect/divine) + Akaal (timeless/beyond death). The Sikh greeting and battle cry — there is no fear of death because Truth never dies. When Sikhs meet, they affirm this fundamental reality: the only eternal thing is truth. It is both a greeting and a declaration of faith.',
      hi: 'सत (सत्य) + श्री (सम्मान) + अकाल (काल से परे)। सिखों का अभिवादन — मृत्यु से भय नहीं, क्योंकि सत्य कभी नहीं मरता।'
    },
    usage: { line: 'ਜੋ ਬੋਲੇ ਸੋ ਨਿਹਾਲ — ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ!', source: 'ਸਿੱਖ ਜੈਕਾਰਾ' },
  },
  {
    id: 'chardi-kala',
    gurmukhi: 'ਚੜ੍ਹਦੀ ਕਲਾ',
    roman: 'Chardi Kala',
    category: 'key-phrases',
    meaning: { pa: 'ਸਦਾ ਚੜ੍ਹਦੀ ਕਲਾ, ਉੱਚਾ ਹੌਸਲਾ', en: 'Ever-rising spirit / Optimistic resilience', hi: 'सदा चढ़ता हौसला, ऊँचा उत्साह' },
    deepMeaning: {
      pa: 'ਚੜ੍ਹਦੀ (ਉੱਪਰ ਜਾਂਦੀ) + ਕਲਾ (ਸ਼ਕਤੀ/ਹੌਸਲਾ)। ਸਿੱਖ ਦਾ ਮੂਲ ਸੁਭਾਅ — ਮੁਸ਼ਕਲ ਵਿੱਚ ਵੀ ਹੌਸਲਾ ਨਾ ਹਾਰਨਾ। ਹਰ ਅਰਦਾਸ ਵਿੱਚ "ਨਾਨਕ ਨਾਮ ਚੜ੍ਹਦੀ ਕਲਾ" ਕਹਿੰਦੇ ਹਾਂ — ਪ੍ਰਮਾਤਮਾ ਦੇ ਨਾਮ ਨਾਲ ਸਦਾ ਊੱਚੀ ਆਤਮਾ।',
      en: 'Chardi (ascending/rising) + Kala (energy/spirit). The essential Sikh disposition — maintaining high spirits and resilience even in the face of adversity. Every Ardaas ends with "Nanak Naam Chardi Kala" — through God\'s Name, may our spirit always ascend. It is not blind optimism but a deep faith that whatever happens is within Hukam, and the soul can remain joyful through it all.',
      hi: 'चढ़दी (ऊपर जाती) + कला (शक्ति/हौसला)। सिख का मूल स्वभाव — मुश्किल में भी हौसला न हारना। हर अरदास में "नानक नाम चढ़दी कला" कहते हैं।'
    },
    usage: { line: 'ਨਾਨਕ ਨਾਮ ਚੜ੍ਹਦੀ ਕਲਾ, ਤੇਰੇ ਭਾਣੇ ਸਰਬੱਤ ਦਾ ਭਲਾ', source: 'ਅਰਦਾਸ (ਸਿੱਖ ਪ੍ਰਾਰਥਨਾ)' },
  },
  {
    id: 'kirat-karo',
    gurmukhi: 'ਕਿਰਤ ਕਰੋ',
    roman: 'Kirat Karo',
    category: 'key-phrases',
    meaning: { pa: 'ਇਮਾਨਦਾਰੀ ਨਾਲ ਕਮਾਈ ਕਰੋ', en: 'Earn an honest living', hi: 'ईमानदारी से कमाई करो' },
    deepMeaning: {
      pa: 'ਕਿਰਤ (ਮਿਹਨਤ/ਕਮਾਈ) + ਕਰੋ (ਕਰੋ)। ਸਿੱਖੀ ਵਿੱਚ ਸੰਨਿਆਸ ਲੈ ਕੇ ਦੁਨੀਆ ਛੱਡਣਾ ਨਹੀਂ — ਦੁਨੀਆ ਵਿੱਚ ਰਹਿ ਕੇ ਇਮਾਨਦਾਰੀ ਨਾਲ ਕੰਮ ਕਰਨਾ ਪੂਜਾ ਹੈ। ਮਿਹਨਤ ਦੀ ਕਮਾਈ ਵਿੱਚ ਬਰਕਤ ਹੈ।',
      en: 'Kirat (work/labor) + Karo (do). Sikhi rejects renunciation — working honestly in the world IS worship. One of the three pillars. It means earning through ethical, hard work without exploitation or deception. The dignity of labor is honored; no work is beneath anyone. A Sikh who works honestly and remembers God has found the path.',
      hi: 'किरत (मेहनत/कमाई) + करो। सिखी में संन्यास नहीं — दुनिया में रहकर ईमानदारी से काम करना ही पूजा है।'
    },
    usage: { line: 'ਘਾਲਿ ਖਾਇ ਕਿਛੁ ਹਥਹੁ ਦੇਇ ॥ ਨਾਨਕ ਰਾਹੁ ਪਛਾਣਹਿ ਸੇਇ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 1245' },
  },
  {
    id: 'vand-chakna',
    gurmukhi: 'ਵੰਡ ਛਕਣਾ',
    roman: 'Vand Chakna',
    category: 'key-phrases',
    meaning: { pa: 'ਵੰਡ ਕੇ ਛਕਣਾ — ਸਾਂਝਾ ਕਰਨਾ', en: 'Share with others — communal sharing', hi: 'बाँटकर खाना — साझा करना' },
    deepMeaning: {
      pa: 'ਵੰਡ (ਵੰਡਣਾ) + ਛਕਣਾ (ਖਾਣਾ)। ਤੀਜਾ ਥੰਮ੍ਹ — ਆਪਣੀ ਕਮਾਈ ਵਿੱਚੋਂ ਲੋੜਵੰਦਾਂ ਨਾਲ ਸਾਂਝਾ ਕਰਨਾ। ਦਸਵੰਧ (ਦਸਵਾਂ ਹਿੱਸਾ) ਦੇਣ ਦੀ ਪਰੰਪਰਾ ਇਸੇ ਸਿਧਾਂਤ ਤੋਂ ਆਈ ਹੈ। ਲੰਗਰ ਵੰਡ ਛਕਣੇ ਦਾ ਸਭ ਤੋਂ ਵੱਡਾ ਅਮਲੀ ਰੂਪ ਹੈ।',
      en: 'Vand (share/distribute) + Chakna (consume). The third pillar — share your earnings with those in need. The tradition of Dasvandh (giving one-tenth of income) comes from this principle. Langar is the greatest practical expression of Vand Chakna. It teaches that what we have is not truly "ours" but entrusted to us by the Creator to share.',
      hi: 'वंड (बाँटना) + छकना (खाना)। तीसरा स्तंभ — अपनी कमाई में से ज़रूरतमंदों को देना। दसवंध और लंगर इसी सिद्धांत के व्यावहारिक रूप हैं।'
    },
    usage: { line: 'ਘਾਲਿ ਖਾਇ ਕਿਛੁ ਹਥਹੁ ਦੇਇ', source: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 1245' },
  },
  {
    id: 'mool-mantar',
    gurmukhi: 'ਮੂਲ ਮੰਤਰ',
    roman: 'Mool Mantar',
    category: 'key-phrases',
    meaning: { pa: 'ਮੂਲ ਮੰਤਰ — ਸਿੱਖੀ ਦਾ ਬੁਨਿਆਦੀ ਵਿਸ਼ਵਾਸ', en: 'Root Mantra — the foundational belief of Sikhi', hi: 'मूल मंत्र — सिखी का मौलिक विश्वास' },
    deepMeaning: {
      pa: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ — ਇਹ ਸੰਖੇਪ ਵਿੱਚ ਪੂਰੀ ਸਿੱਖੀ ਹੈ। ਇੱਕ ਰੱਬ ਹੈ, ਉਸ ਦਾ ਨਾਂ ਸੱਚ ਹੈ, ਉਹ ਬਣਾਉਣ ਵਾਲਾ ਹੈ, ਨਿਡਰ ਹੈ, ਵੈਰ ਰਹਿਤ ਹੈ, ਕਾਲ ਤੋਂ ਪਰੇ ਹੈ, ਜੂਨ ਵਿੱਚ ਨਹੀਂ ਆਉਂਦਾ, ਆਪਣੇ ਆਪ ਤੋਂ ਹੈ, ਅਤੇ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦਾ ਹੈ।',
      en: 'Ik Onkaar Satinaam Karta Purakh Nirbhau Nirvair Akaal Moorat Ajooni Saibhang Gur Prasaad. This is the complete essence of Sikhi in one declaration: One Creator whose name is Truth, the Creative Being, without fear, without enmity, timeless form, beyond the cycle of birth, self-existent, realized through the Guru\'s grace. Every attribute in the Mool Mantar describes both the nature of God and the ideal state of the human soul.',
      hi: 'इक ओंकार सतिनाम कर्ता पुरख निरभउ निरवैर अकाल मूरत अजूनी सैभं गुर प्रसाद — यह संक्षेप में पूरी सिखी है।'
    },
    usage: { line: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ', source: 'ਜਪੁ ਜੀ ਸਾਹਿਬ — ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਅੰਗ 1' },
  },
];
