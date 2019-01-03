import en from "./l10n/messages.en-us.json";
import de from "./l10n/messages.de-de.json";
import es from "./l10n/messages.es-419.json";
import fr from "./l10n/messages.fr-fr.json";

export default function renderText(key, locale) {
  switch (locale) {
    case "EN":
      return en[key];
    case "DE":
      return de[key];
    case "ES":
      return es[key];
    case "FR":
      return fr[key];
    default:
      return en[key];
  }
}
