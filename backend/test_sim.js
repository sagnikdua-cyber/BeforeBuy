import { rankAlternatives } from './src/services/alternativeRankingService.js';

const main = { title: 'Samsung Galaxy S25 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)', extractedPrice: 129999, source: 'Samsung' };
const candidates = [
  { title: 'Samsung Galaxy S25 Ultra 5G (Titanium Black, 12GB RAM, 256GB Storage)', extractedPrice: 128999, source: 'Amazon' },
  { title: 'Samsung Galaxy S25 Ultra 5G (Titanium Gray, 12GB RAM, 512GB Storage)', extractedPrice: 139999, source: 'Samsung' },
  { title: 'Apple iPhone 17 Pro Max (256GB, Black Titanium)', extractedPrice: 144900, source: 'Flipkart' },
  { title: 'Samsung Galaxy S25 Plus 5G (12GB RAM, 256GB Storage)', extractedPrice: 99999, source: 'Amazon' },
  { title: 'Karap Case for Samsung Galaxy S25 Ultra', extractedPrice: 499, source: 'Karap' }
];

console.log(JSON.stringify(rankAlternatives(main, candidates), null, 2));
