export const COUNTRY_CODES = [
  ['+1','USA / Canada'],['+7','Russia / Kazakhstan'],['+20','Egypt'],
  ['+27','South Africa'],['+30','Greece'],['+31','Netherlands'],
  ['+32','Belgium'],['+33','France'],['+34','Spain'],['+36','Hungary'],
  ['+39','Italy'],['+40','Romania'],['+41','Switzerland'],['+43','Austria'],
  ['+44','United Kingdom'],['+45','Denmark'],['+46','Sweden'],['+47','Norway'],
  ['+48','Poland'],['+49','Germany'],['+51','Peru'],['+52','Mexico'],
  ['+54','Argentina'],['+55','Brazil'],['+56','Chile'],['+57','Colombia'],
  ['+60','Malaysia'],['+61','Australia'],['+62','Indonesia'],['+63','Philippines'],
  ['+64','New Zealand'],['+65','Singapore'],['+66','Thailand'],['+81','Japan'],
  ['+82','South Korea'],['+84','Vietnam'],['+86','China'],['+90','Turkey'],
  ['+91','India'],['+92','Pakistan'],['+94','Sri Lanka'],['+98','Iran'],
  ['+212','Morocco'],['+213','Algeria'],['+216','Tunisia'],['+234','Nigeria'],
  ['+254','Kenya'],['+351','Portugal'],['+352','Luxembourg'],['+353','Ireland'],
  ['+354','Iceland'],['+355','Albania'],['+356','Malta'],['+357','Cyprus'],
  ['+358','Finland'],['+359','Bulgaria'],['+370','Lithuania'],['+371','Latvia'],
  ['+372','Estonia'],['+375','Belarus'],['+376','Andorra'],['+380','Ukraine'],
  ['+381','Serbia'],['+385','Croatia'],['+386','Slovenia'],['+387','Bosnia & Herz.'],
  ['+389','N. Macedonia'],['+420','Czech Republic'],['+421','Slovakia'],
  ['+852','Hong Kong'],['+880','Bangladesh'],['+886','Taiwan'],
  ['+960','Maldives'],['+961','Lebanon'],['+962','Jordan'],['+966','Saudi Arabia'],
  ['+971','UAE'],['+972','Israel'],['+974','Qatar'],['+975','Bhutan'],
  ['+977','Nepal'],['+992','Tajikistan'],['+994','Azerbaijan'],['+995','Georgia'],
  ['+996','Kyrgyzstan'],['+998','Uzbekistan']
] as const;

export const COUNTRIES = [
  'Austria','Bulgaria','Czech Republic','Germany','Hungary','Poland','Romania','Slovakia','Spain'
] as const;

export const MONTHS_LIST = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
] as const;

export interface TourFormData {
  center_name: string;
  city: string;
  country: string;
  p1_firstname: string;
  p1_lastname: string;
  p1_code: string;
  p1_phone: string;
  p1_email: string;
  p2_firstname: string;
  p2_lastname: string;
  p2_code: string;
  p2_phone: string;
  p2_email: string;
  start_day: string;
  start_month: string;
  end_day: string;
  end_month: string;
  start_day2: string;
  start_month2: string;
  end_day2: string;
  end_month2: string;
  topics: string;
  empowerments: string;
  comments: string;
}
