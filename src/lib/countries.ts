export interface Country {
  code: string; // ISO
  name: string;
  dial: string; // e.g. +223
  flag: string; // emoji
}

export const COUNTRIES: Country[] = [
  { code: "ML", name: "Mali", dial: "+223", flag: "🇲🇱" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "ES", name: "Espagne", dial: "+34", flag: "🇪🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "US", name: "États-Unis", dial: "+1", flag: "🇺🇸" },
  { code: "BE", name: "Belgique", dial: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", dial: "+41", flag: "🇨🇭" },
  { code: "DE", name: "Allemagne", dial: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Italie", dial: "+39", flag: "🇮🇹" },
  { code: "GB", name: "Royaume-Uni", dial: "+44", flag: "🇬🇧" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "MA", name: "Maroc", dial: "+212", flag: "🇲🇦" },
  { code: "DZ", name: "Algérie", dial: "+213", flag: "🇩🇿" },
  { code: "TN", name: "Tunisie", dial: "+216", flag: "🇹🇳" },
  { code: "SN", name: "Sénégal", dial: "+221", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫" },
  { code: "NE", name: "Niger", dial: "+227", flag: "🇳🇪" },
  { code: "GN", name: "Guinée", dial: "+224", flag: "🇬🇳" },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬" },
  { code: "BJ", name: "Bénin", dial: "+229", flag: "🇧🇯" },
  { code: "CM", name: "Cameroun", dial: "+237", flag: "🇨🇲" },
  { code: "GA", name: "Gabon", dial: "+241", flag: "🇬🇦" },
  { code: "CD", name: "RD Congo", dial: "+243", flag: "🇨🇩" },
  { code: "CG", name: "Congo", dial: "+242", flag: "🇨🇬" },
  { code: "MR", name: "Mauritanie", dial: "+222", flag: "🇲🇷" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Mali
