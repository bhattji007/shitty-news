// Regenerates data/vendors.json: 400 fake cookie vendors, alphabetical, deterministic.
// Mix of "X Data Sciences Pvt Ltd", plausible adtech, and one that is just "Ramesh".
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

let a = 1947;
const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]!;

const A = ['Aarav','Abhinav','AdKulfi','Adorbit','Agrawal','Ambika','Anand','Apsara','Arihant','Balaji','Bhagwati','Bharat','BidNaka','Bidwala','Chandan','Chirag','ClickDhaba','Cookiewala','Crestline','DataMandi','Deccan','Dhanlaxmi','Durga','Ekta','Ganesh','Gupta','Hanuman','Indus','Jai Mata Di','Jugaad','Kaveri','Krishna','Lakshmi','Mahalaxmi','Maruti Nandan','Nirmal','Om Sai','Pixelnagar','Pragati','Rathi','ReachKart','Sai Kripa','Shree','Shubh Labh','Siddhi Vinayak','Swastik','TrackBazaar','Trimurti','Udaan','Vardhman','Vishwas','Yash','Zenith','Quantix','Retargetly','AudienceSetu','Pinnacle','Omnibid','Sharma','Verma','Mehta','Iyer','Nair','Reddy','Chowdhury','Bose','Kulkarni','Deshpande','Joshi','Trivedi'];
const B = ['Data Sciences Pvt Ltd','Infotech Pvt. Ltd.','Adtech Solutions Pvt Ltd','Media Networks LLP','Digital Marketing Pvt. Ltd.','Data Analytics Pvt Ltd','Ad Exchange','SSP Ltd.','DSP Technologies','Consultancy Services','Softech Pvt Ltd','Audience Cloud Inc.','Retargeting GmbH','Enterprises','Telesoft India Pvt Ltd','Insights B.V.','Programmatic Ltd.','Data Sciences Pvt Ltd','Cookie Consultants OPC'];
const P = ['Store and/or access information on a device','Personalised advertising','Measure advertising performance','Create profiles for personalised content','Use precise geolocation data','Actively scan device characteristics','Match and combine data from other sources','Link different devices','Understand audiences through statistics','Develop and improve services','Deliver and present advertising'];
const R = ['30 days','365 days','730 days','3650 days','Session','9999 days','Until further notice'];

const names = new Set<string>();
names.add('Ramesh');
while (names.size < 400) names.add(`${pick(A)} ${pick(B)}`);
const vendors = [...names].sort((x, y) => x.localeCompare(y)).map((name) => ({ name, purpose: pick(P), retention: pick(R) }));
writeFileSync(resolve(import.meta.dirname, '../data/vendors.json'), JSON.stringify(vendors, null, 1));
console.log(vendors.length, 'vendors; Ramesh at #', vendors.findIndex((v) => v.name === 'Ramesh') + 1);
