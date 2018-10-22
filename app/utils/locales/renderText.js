import en from './messages.en-us.json';
import de from './messages.de-de.json';
import es from './messages.es-419.json';
import fr from './messages.fr-fr.json';

export function renderText(key, locale) {
  switch(locale) {
    case 'EN':
      return en[key];
    case 'DE':
      return de[key];
    case 'ES':
      return es[key];
    case 'FR':
      return fr[key];
    default:
      return en[key];
  }
}
