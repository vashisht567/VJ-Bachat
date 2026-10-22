import { Category } from '../types/hisaab';

export interface ParsedVoiceResult {
  rawTranscript: string;
  categoryId?: string;
  categoryName?: string;
  amount?: number;
  quantity?: number;
  unit?: string;
  recipient?: string;
  notes?: string;
}

export function parseSpokenHisaab(transcript: string, categories: Category[]): ParsedVoiceResult {
  const text = transcript.toLowerCase();
  const result: ParsedVoiceResult = {
    rawTranscript: transcript,
    notes: transcript,
  };

  // 1. Detect Category
  if (text.includes('dudh') || text.includes('doodh') || text.includes('दूध') || text.includes('milk') || text.includes('डेयरी') || text.includes('dairy')) {
    const cat = categories.find((c) => c.id === 'dudh') || categories[0];
    result.categoryId = cat.id;
    result.categoryName = cat.nameHi || cat.name;
    result.recipient = cat.defaultRecipient || 'दूध वाला';
    result.unit = 'लीटर';
  } else if (text.includes('sabzi') || text.includes('sabji') || text.includes('सब्जी') || text.includes('सब्ज़ी') || text.includes('vegetable') || text.includes('mandi') || text.includes('मंडी') || text.includes('फल') || text.includes('fruit')) {
    const cat = categories.find((c) => c.id === 'sabzi');
    if (cat) {
      result.categoryId = cat.id;
      result.categoryName = cat.nameHi || cat.name;
      result.recipient = cat.defaultRecipient || 'सब्ज़ी मंडी';
      result.unit = 'दिन';
    }
  } else if (text.includes('auto') || text.includes('ऑटो') || text.includes('kiraya') || text.includes('किराया') || text.includes('gadi') || text.includes('गाड़ी') || text.includes('petrol') || text.includes('पेट्रोल') || text.includes('rickshaw') || text.includes('cab')) {
    const cat = categories.find((c) => c.id === 'auto');
    if (cat) {
      result.categoryId = cat.id;
      result.categoryName = cat.nameHi || cat.name;
      result.recipient = cat.defaultRecipient || 'ऑटो किराया';
      result.unit = 'चक्कर';
    }
  } else if (text.includes('kirana') || text.includes('किराना') || text.includes('ration') || text.includes('राशन') || text.includes('grocery') || text.includes('दुकान')) {
    const cat = categories.find((c) => c.id === 'kirana');
    if (cat) {
      result.categoryId = cat.id;
      result.categoryName = cat.nameHi || cat.name;
      result.recipient = cat.defaultRecipient || 'किराना स्टोर';
    }
  } else if (text.includes('maid') || text.includes('kamwali') || text.includes('कामवाली') || text.includes('बाई') || text.includes('bai')) {
    const cat = categories.find((c) => c.id === 'maid');
    if (cat) {
      result.categoryId = cat.id;
      result.categoryName = cat.nameHi || cat.name;
      result.recipient = cat.defaultRecipient || 'बाई';
    }
  } else if (text.includes('bijli') || text.includes('बिजली') || text.includes('gas') || text.includes('गैस') || text.includes('bill') || text.includes('बिल')) {
    const cat = categories.find((c) => c.id === 'bills');
    if (cat) {
      result.categoryId = cat.id;
      result.categoryName = cat.nameHi || cat.name;
      result.recipient = cat.defaultRecipient || 'बिल भुगतान';
    }
  } else if (text.includes('dawa') || text.includes('दवा') || text.includes('doctor') || text.includes('डॉक्टर') || text.includes('medicine')) {
    const cat = categories.find((c) => c.id === 'medical');
    if (cat) {
      result.categoryId = cat.id;
      result.categoryName = cat.nameHi || cat.name;
      result.recipient = cat.defaultRecipient || 'मेडिकल स्टोर';
    }
  } else {
    // Check custom categories by matching name
    for (const cat of categories) {
      if (text.includes(cat.name.toLowerCase()) || text.includes(cat.nameHi.toLowerCase())) {
        result.categoryId = cat.id;
        result.categoryName = cat.nameHi || cat.name;
        result.recipient = cat.defaultRecipient || cat.nameHi;
        break;
      }
    }
  }

  // 2. Detect Amount (Numbers like 50, 100, 250, 1500)
  // Look for patterns like "50 rupaye", "100 rs", "₹200", or standalone numbers
  const numMatches = text.match(/\b\d+(\.\d+)?\b/g);
  if (numMatches && numMatches.length > 0) {
    const numbers = numMatches.map((n) => parseFloat(n));
    // If quantity was mentioned (e.g. 1.5 or 2 litre), the larger number is likely the amount
    if (numbers.length === 1) {
      result.amount = numbers[0];
    } else if (numbers.length >= 2) {
      // e.g. "1.5 litre 99 rupaye" or "2 litre dudh 132 rupaye"
      const sorted = [...numbers].sort((a, b) => a - b);
      result.quantity = sorted[0];
      result.amount = sorted[1];
    }
  }

  // Special Hindi words for numbers
  if (!result.amount) {
    if (text.includes('sau') || text.includes('सौ') || text.includes('ek sau')) {
      result.amount = 100;
    } else if (text.includes('do sau') || text.includes('दो सौ')) {
      result.amount = 200;
    } else if (text.includes('pachas') || text.includes('पचास')) {
      result.amount = 50;
    } else if (text.includes('dedh sau') || text.includes('डेढ़ सौ')) {
      result.amount = 150;
    } else if (text.includes('paanch sau') || text.includes('पांच सौ')) {
      result.amount = 500;
    } else if (text.includes('hazar') || text.includes('हज़ार') || text.includes('ek hazar')) {
      result.amount = 1000;
    }
  }

  // Quantity detection for Milk
  if (result.categoryId === 'dudh' && !result.quantity) {
    if (text.includes('aadha') || text.includes('आधा') || text.includes('half')) {
      result.quantity = 0.5;
    } else if (text.includes('ek litre') || text.includes('1 litre') || text.includes('एक लीटर')) {
      result.quantity = 1;
    } else if (text.includes('dedh') || text.includes('डेढ़') || text.includes('1.5')) {
      result.quantity = 1.5;
    } else if (text.includes('do litre') || text.includes('2 litre') || text.includes('दो लीटर')) {
      result.quantity = 2;
    }
  }

  // If amount is not set but quantity and rate exist
  if (!result.amount && result.quantity && result.categoryId) {
    const cat = categories.find((c) => c.id === result.categoryId);
    if (cat && cat.defaultRate) {
      result.amount = result.quantity * cat.defaultRate;
    }
  }

  // Check Recipient phrase e.g. "ramu ko", "sharma ji ko"
  const recipientMatch = text.match(/([a-z\u0900-\u097F]+)\s+(ko|ko diye|ko diya|को|को दिए|को दिया)/i);
  if (recipientMatch && recipientMatch[1]) {
    const captured = recipientMatch[1].trim();
    if (captured !== 'kis' && captured !== 'kisko' && captured !== 'unko') {
      result.recipient = captured;
    }
  }

  return result;
}
