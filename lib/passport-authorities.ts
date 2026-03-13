export interface PassportAuthority {
  country: string;
  countryCode: string;
  authority: string;
}

export const PASSPORT_AUTHORITIES: PassportAuthority[] = [
  // Africa
  { country: "Ghana", countryCode: "GH", authority: "Ghana Immigration Service" },
  { country: "Nigeria", countryCode: "NG", authority: "Nigeria Immigration Service" },
  { country: "South Africa", countryCode: "ZA", authority: "Department of Home Affairs" },
  { country: "Kenya", countryCode: "KE", authority: "Department of Immigration Services" },
  { country: "Egypt", countryCode: "EG", authority: "Egyptian Passport Authority" },
  { country: "Morocco", countryCode: "MA", authority: "Ministry of Interior" },
  { country: "Senegal", countryCode: "SN", authority: "Direction de la Police des Étrangers" },
  { country: "Ethiopia", countryCode: "ET", authority: "Ministry of Foreign Affairs" },
  { country: "Tanzania", countryCode: "TZ", authority: "Immigration Services Department" },
  { country: "Uganda", countryCode: "UG", authority: "Directorate of Citizenship and Immigration Control" },
  
  // Europe
  { country: "United Kingdom", countryCode: "GB", authority: "HM Passport Office" },
  { country: "Germany", countryCode: "DE", authority: "Federal Foreign Office" },
  { country: "France", countryCode: "FR", authority: "Ministry of the Interior" },
  { country: "Italy", countryCode: "IT", authority: "Ministry of the Interior" },
  { country: "Spain", countryCode: "ES", authority: "Ministry of the Interior" },
  { country: "Netherlands", countryCode: "NL", authority: "Ministry of the Interior and Kingdom Relations" },
  { country: "Belgium", countryCode: "BE", authority: "Federal Public Service Foreign Affairs" },
  { country: "Switzerland", countryCode: "CH", authority: "Federal Office of Police" },
  { country: "Austria", countryCode: "AT", authority: "Federal Ministry of the Interior" },
  { country: "Sweden", countryCode: "SE", authority: "Swedish Police Authority" },
  
  // North America
  { country: "United States", countryCode: "US", authority: "U.S. Department of State" },
  { country: "Canada", countryCode: "CA", authority: "Passport Canada" },
  { country: "Mexico", countryCode: "MX", authority: "Ministry of Foreign Affairs" },
  
  // Asia
  { country: "China", countryCode: "CN", authority: "Ministry of Public Security" },
  { country: "India", countryCode: "IN", authority: "Ministry of External Affairs" },
  { country: "Japan", countryCode: "JP", authority: "Ministry of Foreign Affairs" },
  { country: "South Korea", countryCode: "KR", authority: "Ministry of Foreign Affairs" },
  { country: "Singapore", countryCode: "SG", authority: "Immigration and Checkpoints Authority" },
  { country: "Malaysia", countryCode: "MY", authority: "Immigration Department of Malaysia" },
  { country: "Thailand", countryCode: "TH", authority: "Ministry of Foreign Affairs" },
  { country: "Philippines", countryCode: "PH", authority: "Department of Foreign Affairs" },
  { country: "Indonesia", countryCode: "ID", authority: "Ministry of Foreign Affairs" },
  { country: "Vietnam", countryCode: "VN", authority: "Ministry of Public Security" },
  
  // Middle East
  { country: "Saudi Arabia", countryCode: "SA", authority: "Ministry of Interior" },
  { country: "United Arab Emirates", countryCode: "AE", authority: "Federal Authority for Identity and Citizenship" },
  { country: "Qatar", countryCode: "QA", authority: "Ministry of Interior" },
  { country: "Kuwait", countryCode: "KW", authority: "Ministry of Interior" },
  { country: "Jordan", countryCode: "JO", authority: "Ministry of Interior" },
  { country: "Lebanon", countryCode: "LB", authority: "General Security" },
  
  // Oceania
  { country: "Australia", countryCode: "AU", authority: "Australian Passport Office" },
  { country: "New Zealand", countryCode: "NZ", authority: "Department of Internal Affairs" },
  
  // South America
  { country: "Brazil", countryCode: "BR", authority: "Federal Police" },
  { country: "Argentina", countryCode: "AR", authority: "National Registry of Persons" },
  { country: "Chile", countryCode: "CL", authority: "Civil Registry and Identification Service" },
  { country: "Colombia", countryCode: "CO", authority: "Ministry of Foreign Affairs" },
  { country: "Peru", countryCode: "PE", authority: "Ministry of Foreign Affairs" },
];

export function getAuthorityByCountry(countryCode: string): string | null {
  const authority = PASSPORT_AUTHORITIES.find(auth => auth.countryCode === countryCode);
  return authority ? authority.authority : null;
}

export function searchAuthorities(query: string): PassportAuthority[] {
  const lowerQuery = query.toLowerCase();
  return PASSPORT_AUTHORITIES.filter(auth => 
    auth.country.toLowerCase().includes(lowerQuery) ||
    auth.authority.toLowerCase().includes(lowerQuery)
  );
}