/** ISO codes for flagcdn.com — avoids Windows rendering flag emoji as "AU", "TR", etc. */
export const TEAM_FLAG_ISO: Record<string, string> = {
  Algeria: "dz", Argentina: "ar", Australia: "au", Austria: "at",
  Belgium: "be", "Bosnia-Herzegovina": "ba", Brazil: "br", Canada: "ca",
  "Cape Verde Islands": "cv", Colombia: "co", "Congo DR": "cd", Croatia: "hr",
  "Curaçao": "cw", Czechia: "cz", "Czech Republic": "cz", Ecuador: "ec",
  Egypt: "eg", England: "gb-eng", France: "fr", Germany: "de", Ghana: "gh",
  Haiti: "ht", Iran: "ir", Iraq: "iq", "Ivory Coast": "ci",
  Japan: "jp", Jordan: "jo", Mexico: "mx", Morocco: "ma",
  Netherlands: "nl", "New Zealand": "nz", Norway: "no", Panama: "pa",
  Paraguay: "py", Portugal: "pt", Qatar: "qa", "Saudi Arabia": "sa",
  Scotland: "gb-sct", Senegal: "sn", "South Africa": "za",
  "South Korea": "kr", Spain: "es", Sweden: "se", Switzerland: "ch",
  Tunisia: "tn", Turkey: "tr", USA: "us", "United States": "us",
  Uruguay: "uy", Uzbekistan: "uz",
};

/** Reverse map from Portuguese display names to English keys used in TEAM_FLAG_ISO */
export const PT_TO_EN_FLAG: Record<string, string> = {
  "Argélia": "Algeria", "África do Sul": "South Africa", "Austrália": "Australia",
  "Áustria": "Austria", "Bélgica": "Belgium", "Bósnia-Herzegovina": "Bosnia-Herzegovina",
  "Brasil": "Brazil", "Canadá": "Canada", "Cabo Verde": "Cape Verde Islands",
  "Colômbia": "Colombia", "Congo RD": "Congo DR", "Croácia": "Croatia",
  "Curaçao": "Curaçao", "Tchéquia": "Czech Republic", "Equador": "Ecuador",
  "Egito": "Egypt", "Inglaterra": "England", "França": "France",
  "Alemanha": "Germany", "Gana": "Ghana", "Irã": "Iran", "Iraque": "Iraq",
  "Costa do Marfim": "Ivory Coast", "Japão": "Japan", "Jordânia": "Jordan",
  "México": "Mexico", "Marrocos": "Morocco", "Países Baixos": "Netherlands",
  "Nova Zelândia": "New Zealand", "Noruega": "Norway", "Panamá": "Panama",
  "Paraguai": "Paraguay", "Arábia Saudita": "Saudi Arabia", "Escócia": "Scotland",
  "Coreia do Sul": "South Korea", "Espanha": "Spain", "Suécia": "Sweden",
  "Suíça": "Switzerland", "Tunísia": "Tunisia", "Turquia": "Turkey",
  "Estados Unidos": "United States", "Uzbequistão": "Uzbekistan",
};

export function flagIsoForTeam(name: string): string | null {
  const en = PT_TO_EN_FLAG[name] ?? name;
  return TEAM_FLAG_ISO[en] ?? null;
}

export function flagCdnUrl(iso: string, size: 20 | 40 = 40): string {
  return `https://flagcdn.com/w${size}/${iso}.png`;
}
