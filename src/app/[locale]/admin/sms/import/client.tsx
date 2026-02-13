'use client';

import { useState, useCallback } from 'react';
import {
  Upload, FileText, ArrowRight, Download, Check, X, AlertCircle,
  ChevronDown, Users, Phone, User, RefreshCw, Send
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface CSVImportClientProps {
  locale: string;
}

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

interface FieldMapping {
  firstName: string;
  lastName: string;
  gender: string;
  phone1: string;
  phone2: string;
  phone3: string;
}

interface MappedContact {
  firstName: string;
  lastName: string;
  gender: string;
  phone1: string;
  phone2: string;
  phone3: string;
}

const TARGET_FIELDS = [
  { key: 'firstName', label: 'Prénom', required: true },
  { key: 'lastName', label: 'Nom', required: true },
  { key: 'gender', label: 'Genre', required: false },
  { key: 'phone1', label: 'Téléphone 1', required: true },
  { key: 'phone2', label: 'Téléphone 2', required: false },
  { key: 'phone3', label: 'Téléphone 3', required: false },
];

export function CSVImportClient({ locale }: CSVImportClientProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'filter' | 'preview' | 'complete'>('upload');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    firstName: '',
    lastName: '',
    gender: '',
    phone1: '',
    phone2: '',
    phone3: '',
  });
  const [mappedContacts, setMappedContacts] = useState<MappedContact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zeroFilterField, setZeroFilterField] = useState<string>('');

  // Parse CSV file
  const parseCSV = (text: string): ParsedData => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('Le fichier est vide');
    }

    // Detect delimiter (comma, semicolon, or tab)
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes(';') && !firstLine.includes(',')) {
      delimiter = ';';
    } else if (firstLine.includes('\t') && !firstLine.includes(',') && !firstLine.includes(';')) {
      delimiter = '\t';
    }

    // Parse headers
    const headers = parseCSVLine(firstLine, delimiter);
    
    // Parse rows
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i], delimiter);
      if (values.length > 0) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }
    }

    return { headers, rows };
  };

  // Parse a single CSV line handling quotes
  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  };

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.rows.length === 0) {
          throw new Error('Aucune donnée trouvée dans le fichier');
        }

        setParsedData(data);
        
        // Auto-detect field mappings
        const autoMapping: FieldMapping = {
          firstName: '',
          lastName: '',
          gender: '',
          phone1: '',
          phone2: '',
          phone3: '',
        };

        const lowerHeaders = data.headers.map(h => h.toLowerCase().trim());
        
        // Try to auto-match common field names
        lowerHeaders.forEach((header, index) => {
          const originalHeader = data.headers[index];
          
          // First name patterns
          if (/^(pr[ée]nom|first\s*name|firstname|prenom)$/i.test(header)) {
            autoMapping.firstName = originalHeader;
          }
          // Last name patterns
          if (/^(nom|last\s*name|lastname|surname|family\s*name)$/i.test(header)) {
            autoMapping.lastName = originalHeader;
          }
          // Gender patterns
          if (/^(genre|gender|sexe|sex|civilit[ée])$/i.test(header)) {
            autoMapping.gender = originalHeader;
          }
          // Phone 1 patterns
          if (/^(t[ée]l[ée]phone\s*1?|phone\s*1?|mobile\s*1?|num[ée]ro\s*1?|tel\s*1?|portable\s*1?)$/i.test(header) && !autoMapping.phone1) {
            autoMapping.phone1 = originalHeader;
          }
          // Phone 2 patterns
          if (/^(t[ée]l[ée]phone\s*2|phone\s*2|mobile\s*2|num[ée]ro\s*2|tel\s*2|portable\s*2)$/i.test(header)) {
            autoMapping.phone2 = originalHeader;
          }
          // Phone 3 patterns
          if (/^(t[ée]l[ée]phone\s*3|phone\s*3|mobile\s*3|num[ée]ro\s*3|tel\s*3|portable\s*3)$/i.test(header)) {
            autoMapping.phone3 = originalHeader;
          }
        });

        setFieldMapping(autoMapping);
        setStep('mapping');
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la lecture du fichier');
      }
    };

    reader.onerror = () => {
      setError('Erreur lors de la lecture du fichier');
    };

    reader.readAsText(file, 'UTF-8');
  }, []);

  // Apply mapping and generate preview
  const applyMapping = () => {
    if (!parsedData) return;

    // Validate required fields
    if (!fieldMapping.firstName || !fieldMapping.lastName || !fieldMapping.phone1) {
      setError('Veuillez mapper les champs obligatoires: Prénom, Nom et Téléphone 1');
      return;
    }

    setError(null);

    const contacts: MappedContact[] = parsedData.rows.map(row => ({
      firstName: row[fieldMapping.firstName] || '',
      lastName: row[fieldMapping.lastName] || '',
      gender: fieldMapping.gender ? (row[fieldMapping.gender] || '') : '',
      phone1: row[fieldMapping.phone1] || '',
      phone2: fieldMapping.phone2 ? (row[fieldMapping.phone2] || '') : '',
      phone3: fieldMapping.phone3 ? (row[fieldMapping.phone3] || '') : '',
    })).filter(contact => contact.firstName || contact.lastName || contact.phone1);

    setMappedContacts(contacts);
    setStep('filter');
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Prénom', 'Nom', 'Genre', 'Téléphone 1', 'Téléphone 2', 'Téléphone 3'];
    const rows = mappedContacts.map(c => [
      c.firstName,
      c.lastName,
      c.gender,
      c.phone1,
      c.phone2,
      c.phone3,
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_formatted_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStep('complete');
  };

  // Get phone numbers for SMS campaign
  const getPhoneNumbers = (): string[] => {
    const phones: string[] = [];
    mappedContacts.forEach(c => {
      if (c.phone1) phones.push(c.phone1);
      if (c.phone2) phones.push(c.phone2);
      if (c.phone3) phones.push(c.phone3);
    });
    return [...new Set(phones)].filter(p => p.length >= 10);
  };

  // Filter contacts without any phone number
  const filterContactsWithoutPhone = () => {
    const filtered = mappedContacts.filter(c => c.phone1 || c.phone2 || c.phone3);
    setMappedContacts(filtered);
    setStep('preview');
  };

  // Filter rows where selected field has value "0"
  const filterZeroValues = () => {
    if (!zeroFilterField || !parsedData) return;
    
    // We need to filter based on original CSV data, then re-map
    const filteredRows = parsedData.rows.filter(row => {
      const value = row[zeroFilterField];
      return value !== '0' && value !== '0.0' && value !== '0,0';
    });
    
    // Update parsed data
    setParsedData({ ...parsedData, rows: filteredRows });
    
    // Re-apply mapping to filtered data
    const newMappedContacts = filteredRows.map(row => ({
      firstName: fieldMapping.firstName ? row[fieldMapping.firstName] || '' : '',
      lastName: fieldMapping.lastName ? row[fieldMapping.lastName] || '' : '',
      gender: fieldMapping.gender ? row[fieldMapping.gender] || '' : '',
      phone1: fieldMapping.phone1 ? row[fieldMapping.phone1] || '' : '',
      phone2: fieldMapping.phone2 ? row[fieldMapping.phone2] || '' : '',
      phone3: fieldMapping.phone3 ? row[fieldMapping.phone3] || '' : '',
    }));
    
    setMappedContacts(newMappedContacts);
  };

  // Get count of rows with zero in selected field
  const getZeroValueCount = (): number => {
    if (!zeroFilterField || !parsedData) return 0;
    return parsedData.rows.filter(row => {
      const value = row[zeroFilterField];
      return value === '0' || value === '0.0' || value === '0,0';
    }).length;
  };

  // Get count of contacts without phone
  const contactsWithoutPhone = mappedContacts.filter(c => !c.phone1 && !c.phone2 && !c.phone3).length;

  // Copy phone numbers to clipboard
  const copyPhoneNumbers = () => {
    const phones = getPhoneNumbers();
    navigator.clipboard.writeText(phones.join('\n'));
    alert(`${phones.length} numéros copiés dans le presse-papiers!`);
  };

  // Reset and start over
  const reset = () => {
    setStep('upload');
    setFileName('');
    setParsedData(null);
    setFieldMapping({
      firstName: '',
      lastName: '',
      gender: '',
      phone1: '',
      phone2: '',
      phone3: '',
    });
    setMappedContacts([]);
    setError(null);
    setZeroFilterField('');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Import CSV</h1>
                <p className="text-gray-600 mt-1">Importez et formatez vos contacts depuis un fichier CSV</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href={`/${locale}/admin/sms`}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  ← Marketing SMS
                </Link>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center mt-6 space-x-4 overflow-x-auto">
              {['upload', 'mapping', 'filter', 'preview', 'complete'].map((s, index) => (
                <div key={s} className="flex items-center flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ? 'bg-primary-600 text-white' :
                    ['upload', 'mapping', 'filter', 'preview', 'complete'].indexOf(step) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {['upload', 'mapping', 'filter', 'preview', 'complete'].indexOf(step) > index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${step === s ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                    {s === 'upload' && 'Upload'}
                    {s === 'mapping' && 'Mapping'}
                    {s === 'filter' && 'Filtrer'}
                    {s === 'preview' && 'Aperçu'}
                    {s === 'complete' && 'Terminé'}
                  </span>
                  {index < 4 && <ArrowRight className="w-4 h-4 mx-4 text-gray-300" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center">
                <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Importer un fichier CSV</h2>
                <p className="text-gray-600 mb-6">
                  Sélectionnez un fichier CSV contenant vos contacts. Le fichier peut avoir n'importe quels noms de colonnes.
                </p>

                <label className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium cursor-pointer transition-colors">
                  <FileText className="w-5 h-5 mr-2" />
                  Choisir un fichier CSV
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <p className="text-sm text-gray-500 mt-4">
                  Formats supportés: CSV (séparateur virgule, point-virgule ou tabulation)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 'mapping' && parsedData && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Mapper les colonnes</h2>
                    <p className="text-gray-600 mt-1">
                      Fichier: <span className="font-medium">{fileName}</span> • {parsedData.rows.length} lignes détectées
                    </p>
                  </div>
                  <button
                    onClick={reset}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TARGET_FIELDS.map((field) => (
                    <div key={field.key} className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <select
                        value={fieldMapping[field.key as keyof FieldMapping]}
                        onChange={(e) => setFieldMapping(prev => ({
                          ...prev,
                          [field.key]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="">-- Sélectionner --</option>
                        {parsedData.headers.map((header) => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Preview of first few rows */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Aperçu des données (5 premières lignes)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          {parsedData.headers.map((header) => (
                            <th key={header} className="px-3 py-2 text-left text-gray-700 font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.rows.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            {parsedData.headers.map((header) => (
                              <td key={header} className="px-3 py-2 text-gray-600">
                                {row[header] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={applyMapping}
                    className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Appliquer le mapping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Filter */}
          {step === 'filter' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Filtrer les contacts</h2>
                    <p className="text-gray-600 mt-1">
                      Supprimez les lignes sans numéro de téléphone
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('mapping')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ← Modifier le mapping
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700">{mappedContacts.length}</p>
                    <p className="text-sm text-blue-600">Contacts total</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">
                      {mappedContacts.length - contactsWithoutPhone}
                    </p>
                    <p className="text-sm text-green-600">Avec téléphone</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-700">{contactsWithoutPhone}</p>
                    <p className="text-sm text-red-600">Sans téléphone</p>
                  </div>
                </div>

                {/* Zero value filter */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-6">
                  <h3 className="text-sm font-medium text-purple-800 mb-3">
                    Filtrer les lignes avec valeur "0"
                  </h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={zeroFilterField}
                      onChange={(e) => setZeroFilterField(e.target.value)}
                      className="flex-1 px-3 py-2 border border-purple-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Sélectionner un champ --</option>
                      {parsedData?.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                    {zeroFilterField && getZeroValueCount() > 0 && (
                      <button
                        onClick={filterZeroValues}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Supprimer {getZeroValueCount()} ligne(s)
                      </button>
                    )}
                  </div>
                  {zeroFilterField && (
                    <p className="text-sm text-purple-700 mt-2">
                      {getZeroValueCount() > 0 
                        ? `${getZeroValueCount()} ligne(s) ont la valeur "0" dans "${zeroFilterField}"`
                        : `Aucune ligne avec "0" dans "${zeroFilterField}"`
                      }
                    </p>
                  )}
                </div>

                {contactsWithoutPhone > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                      <div>
                        <p className="text-amber-800 font-medium">
                          {contactsWithoutPhone} contact(s) n'ont aucun numéro de téléphone
                        </p>
                        <p className="text-amber-700 text-sm mt-1">
                          Ces contacts ne pourront pas recevoir de SMS. Cliquez sur "Supprimer les lignes sans téléphone" pour les retirer.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview of contacts without phone */}
                {contactsWithoutPhone > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Contacts sans téléphone (aperçu)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-red-50">
                            <th className="px-3 py-2 text-left text-gray-700 font-medium">Prénom</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-medium">Nom</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-medium">Tél. 1</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-medium">Tél. 2</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-medium">Tél. 3</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mappedContacts
                            .filter(c => !c.phone1 && !c.phone2 && !c.phone3)
                            .slice(0, 10)
                            .map((contact, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="px-3 py-2 text-gray-600">{contact.firstName || '-'}</td>
                                <td className="px-3 py-2 text-gray-600">{contact.lastName || '-'}</td>
                                <td className="px-3 py-2 text-gray-400">-</td>
                                <td className="px-3 py-2 text-gray-400">-</td>
                                <td className="px-3 py-2 text-gray-400">-</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {contactsWithoutPhone > 10 && (
                        <p className="text-sm text-gray-500 mt-2">
                          ... et {contactsWithoutPhone - 10} autres
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('preview')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Garder tous les contacts
                  </button>
                  {contactsWithoutPhone > 0 ? (
                    <button
                      onClick={filterContactsWithoutPhone}
                      className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Supprimer {contactsWithoutPhone} ligne(s) sans téléphone
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep('preview')}
                      className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Aperçu des contacts formatés</h2>
                    <p className="text-gray-600 mt-1">
                      {mappedContacts.length} contacts • {getPhoneNumbers().length} numéros de téléphone uniques
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setStep('filter')}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      ← Retour au filtre
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700">{mappedContacts.length}</p>
                    <p className="text-sm text-blue-600">Contacts</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">{getPhoneNumbers().length}</p>
                    <p className="text-sm text-green-600">Tél. uniques</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <Phone className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700">
                      {mappedContacts.filter(c => c.phone1).length}
                    </p>
                    <p className="text-sm text-purple-600">Avec Tél. 1</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg text-center">
                    <Phone className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-700">
                      {mappedContacts.filter(c => c.phone2).length}
                    </p>
                    <p className="text-sm text-amber-600">Avec Tél. 2</p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-lg text-center">
                    <Phone className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-teal-700">
                      {mappedContacts.filter(c => c.phone3).length}
                    </p>
                    <p className="text-sm text-teal-600">Avec Tél. 3</p>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">#</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">Prénom</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">Nom</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">Genre</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">Téléphone 1</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">Téléphone 2</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">Téléphone 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappedContacts.slice(0, 100).map((contact, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-400">{index + 1}</td>
                          <td className="px-3 py-2 text-gray-900">{contact.firstName || '-'}</td>
                          <td className="px-3 py-2 text-gray-900">{contact.lastName || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{contact.gender || '-'}</td>
                          <td className="px-3 py-2 text-gray-900 font-mono">{contact.phone1 || '-'}</td>
                          <td className="px-3 py-2 text-gray-600 font-mono">{contact.phone2 || '-'}</td>
                          <td className="px-3 py-2 text-gray-600 font-mono">{contact.phone3 || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mappedContacts.length > 100 && (
                    <p className="text-center text-gray-500 py-3">
                      ... et {mappedContacts.length - 100} autres contacts
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={copyPhoneNumbers}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Copier les numéros
                  </button>
                  <button
                    onClick={exportCSV}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </button>
                  <button
                    onClick={() => {
                      // Store contacts in sessionStorage for SMS page
                      const smsContacts = mappedContacts.map(c => ({
                        phone: c.phone1 || c.phone2 || c.phone3,
                        firstName: c.firstName,
                        lastName: c.lastName,
                        phone2: c.phone2,
                        phone3: c.phone3,
                      })).filter(c => c.phone);
                      sessionStorage.setItem('smsImportedContacts', JSON.stringify(smsContacts));
                      window.location.href = `/${locale}/admin/sms?imported=true`;
                    }}
                    className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer SMS à ces contacts
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Export terminé!</h2>
              <p className="text-gray-600 mb-6">
                Votre fichier CSV formaté a été téléchargé avec {mappedContacts.length} contacts.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={reset}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Importer un autre fichier
                </button>
                <Link
                  href={`/${locale}/admin/sms`}
                  className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Envoyer une campagne SMS
                </Link>
              </div>
            </div>
          )}

          {/* Help Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-blue-800 font-medium">Comment ça marche?</h3>
                <ol className="mt-2 text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Uploadez votre fichier CSV (peu importe les noms de colonnes)</li>
                  <li>Mappez chaque colonne de votre fichier vers les champs souhaités</li>
                  <li>Vérifiez l'aperçu des données formatées</li>
                  <li>Exportez le nouveau CSV avec uniquement les colonnes nécessaires</li>
                  <li>Utilisez les numéros pour vos campagnes SMS marketing</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
