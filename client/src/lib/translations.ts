// German translations
const translations = {
  // App
  appTitle: 'Lager App',
  
  // Navigation
  products: 'Produkte',
  categories: 'Kategorien',
  history: 'Verlauf',
  profile: 'Profil',
  
  // Common actions
  add: 'Hinzufügen',
  edit: 'Bearbeiten',
  delete: 'Löschen',
  save: 'Speichern',
  cancel: 'Abbrechen',
  back: 'Zurück',
  search: 'Suchen...',
  menu: 'Menü',
  
  // Product related
  addProduct: 'Produkt hinzufügen',
  editProduct: 'Produkt bearbeiten',
  productName: 'Produktname',
  productNamePlaceholder: 'Produktname eingeben',
  barcode: 'Barcode',
  barcodePlaceholder: 'Barcode eingeben oder scannen',
  category: 'Kategorie',
  selectCategory: 'Kategorie auswählen',
  quantity: 'Menge',
  all: 'Alle',
  productImage: 'Produktbild',
  addPhoto: 'Foto hinzufügen',
  incrementQuantity: 'Menge erhöhen',
  decrementQuantity: 'Menge reduzieren',
  
  // Scanner
  scanBarcode: 'Barcode scannen',
  scanInstructions: 'Barcode zum Scannen in das Feld zentrieren',
  lookingUpBarcode: 'Suche Produktinformationen...',
  productInfoFound: 'Produktinformationen gefunden',
  noProductInfoFound: 'Keine Produktinformationen gefunden',
  barcodeSearchFailed: 'Fehler bei der Suche nach Barcode',
  
  // Import/export
  exportData: 'Daten exportieren',
  importData: 'Daten importieren',
  settings: 'Einstellungen',
  feature: 'Funktion',
  
  // Messages
  productCreated: 'Produkt erfolgreich hinzugefügt',
  productUpdated: 'Produkt erfolgreich aktualisiert',
  productDeleted: 'Produkt erfolgreich gelöscht',
  productRemoved: 'Produkt entfernt',
  quantityUpdated: 'Menge aktualisiert',
  productOutOfStock: 'Produkt nicht mehr auf Lager',
  exportSuccess: 'Daten erfolgreich exportiert',
  importSuccess: 'Daten erfolgreich importiert',
  noProductsFound: 'Keine Produkte gefunden',
  noSearchResults: 'Keine Ergebnisse für Ihre Suche',
  noProductsInCategory: 'Keine Produkte in dieser Kategorie',
  
  // Errors
  error: 'Fehler',
  productSaveError: 'Fehler beim Speichern des Produkts',
  exportError: 'Fehler beim Exportieren der Daten',
  importError: 'Fehler beim Importieren der Daten',
  quantityUpdateFailed: 'Fehler bei der Aktualisierung der Menge',
  barcodeScanError: 'Fehler beim Scannen des Barcodes',
  
  // Validation
  barcodeRequired: 'Barcode ist erforderlich',
  nameRequired: 'Produktname ist erforderlich',
};

/**
 * Translate key to German
 */
export function t(key: string): string {
  return key in translations 
    ? translations[key as keyof typeof translations] 
    : key;
}
