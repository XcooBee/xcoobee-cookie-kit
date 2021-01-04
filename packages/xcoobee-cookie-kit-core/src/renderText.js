import en from "./l10n/messages.en-us.json";
import de from "./l10n/messages.de-de.json";
import es from "./l10n/messages.es-419.json";
import fr from "./l10n/messages.fr-fr.json";

export default function renderText(key, locale) {
  switch (locale) {
    case "en-us":
      return en[key];
    case "de-de":
      return de[key];
    case "es-419":
      return es[key];
    case "fr-fr":
      return fr[key];
    default:
      return en[key];
  }
}
