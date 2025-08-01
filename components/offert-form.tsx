
'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import PreviewModal from './preview-modal';
import EmailModal from './email-modal';
import ValidationPopup from './validation-popup';

interface OffertFormProps {
  selectedTemplate: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  vat: number;
  discount: number;
  timeEstimate: string;
}

interface FormData {
  // Företagsinfo
  companyName: string;
  companyStreet: string;
  companyPostalCode: string;
  companyCity: string;
  companyPhone: string;
  companyEmail: string;
  companyOrgNr: string;
  companyVatNr: string;
  companyWebsite: string;
  companyBankAccount: string;
  companyLogo: string;
  
  // Kundinfo
  customerName: string;
  customerCompany: string;
  customerContactPerson: string;
  customerStreet: string;
  customerPostalCode: string;
  customerCity: string;
  customerEmail: string;
  customerPhone: string;
  
  // Offertdetaljer
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  validityPeriod: string;
  
  // Produkter
  products: Product[];
  
  // Leveransvillkor
  deliveryTime: string;
  deliveryMethod: string;
  shippingCosts: string;
  deliveryAddress: string;
  deliveryAddressDifferent: boolean;
  
  // Betalningsvillkor
  paymentMethod: string;
  paymentDueDate: string;
  lateInterestRate: string;
  paymentReference: string;
  
  // ROT/RUT-avdrag
  rotDeduction: boolean;
  rutDeduction: boolean;
  deductionInfo: string;
  
  // Tilläggsinformation
  warranties: string;
  additionalTerms: string;
  specialNotes: string;
  
  // Kontaktuppgifter för frågor
  contactPersonQuestions: string;
  contactPhoneQuestions: string;
  contactEmailQuestions: string;
  
  // Äldre villkor (behålls för bakåtkompatibilitet)
  deliveryTerms: string;
  paymentTerms: string;
  otherTerms: string;
  
  // AI-genererad text
  aiGeneratedText: string;
}

const initialFormData: FormData = {
  // Företagsinfo
  companyName: '',
  companyStreet: '',
  companyPostalCode: '',
  companyCity: '',
  companyPhone: '',
  companyEmail: '',
  companyOrgNr: '',
  companyVatNr: '',
  companyWebsite: '',
  companyBankAccount: '',
  companyLogo: '',
  
  // Kundinfo
  customerName: '',
  customerCompany: '',
  customerContactPerson: '',
  customerStreet: '',
  customerPostalCode: '',
  customerCity: '',
  customerEmail: '',
  customerPhone: '',
  
  // Offertdetaljer
  quoteNumber: '',
  quoteDate: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  validityPeriod: '30 dagar',
  
  // Produkter
  products: [],
  
  // Leveransvillkor
  deliveryTime: 'Enligt överenskommelse',
  deliveryMethod: 'Standard',
  shippingCosts: '',
  deliveryAddress: '',
  deliveryAddressDifferent: false,
  
  // Betalningsvillkor
  paymentMethod: 'Faktura',
  paymentDueDate: '30 dagar',
  lateInterestRate: '8%',
  paymentReference: '',
  
  // ROT/RUT-avdrag
  rotDeduction: false,
  rutDeduction: false,
  deductionInfo: '',
  
  // Tilläggsinformation
  warranties: '',
  additionalTerms: '',
  specialNotes: '',
  
  // Kontaktuppgifter för frågor
  contactPersonQuestions: '',
  contactPhoneQuestions: '',
  contactEmailQuestions: '',
  
  // Äldre villkor (behålls för bakåtkompatibilitet)
  deliveryTerms: 'Leverans enligt överenskommelse',
  paymentTerms: '30 dagar netto',
  otherTerms: '',
  
  // AI-genererad text
  aiGeneratedText: ''
};

export default function OffertForm({ selectedTemplate }: OffertFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationAction, setValidationAction] = useState<'preview' | 'email'>('preview');
  const [totalSum, setTotalSum] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [streamedText, setStreamedText] = useState('');

  // Load saved data on mount
  useEffect(() => {
    // Load user data from login - bara om användaren har sparade uppgifter
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Kontrollera om användaren har några sparade företagsuppgifter
        // Förbättrad logik: kolla att det är meningsfull data, inte bara en bokstav
        const hasCompanyData = (user.companyName && user.companyName.trim().length > 2) || 
                              (user.companyStreet && user.companyStreet.trim().length > 2) || 
                              (user.companyPhone && user.companyPhone.trim().length > 5) || 
                              (user.companyEmail && user.companyEmail.trim().length > 5) || 
                              (user.companyOrgNr && user.companyOrgNr.trim().length > 5) || 
                              (user.companyVatNr && user.companyVatNr.trim().length > 5) ||
                              (user.companyWebsite && user.companyWebsite.trim().length > 5) || 
                              (user.companyBankAccount && user.companyBankAccount.trim().length > 5);
        
        // Rensa localStorage om användaren inte har företagsdata
        if (!hasCompanyData) {
          localStorage.removeItem('companyData');
        }
        
        // Ladda bara sparade data om användaren har fyllt i något
        if (hasCompanyData) {
          setFormData(prev => ({
            ...prev,
            companyName: user.companyName || prev.companyName,
            companyStreet: user.companyStreet || prev.companyStreet,
            companyPostalCode: user.companyPostalCode || prev.companyPostalCode,
            companyCity: user.companyCity || prev.companyCity,
            companyPhone: user.companyPhone || prev.companyPhone,
            companyEmail: user.companyEmail || prev.companyEmail,
            companyOrgNr: user.companyOrgNr || prev.companyOrgNr,
            companyVatNr: user.companyVatNr || prev.companyVatNr,
            companyWebsite: user.companyWebsite || prev.companyWebsite,
            companyBankAccount: user.companyBankAccount || prev.companyBankAccount,
          }));
        }
      } catch (error) {
        console.error('Fel vid laddning av användardata:', error);
      }
    }
    
    // Ladda localStorage data EFTER att vi har kontrollerat användardata
    const savedData = localStorage.getItem('companyData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, ...parsed }));
    }
    
    // Generate quote number
    const savedQuoteNumber = localStorage.getItem('lastQuoteNumber');
    const nextNumber = savedQuoteNumber ? parseInt(savedQuoteNumber) + 1 : 1001;
    setFormData(prev => ({ ...prev, quoteNumber: `OFF-${nextNumber}` }));
  }, []);

  // Calculate total sum
  useEffect(() => {
    const total = formData.products.reduce((sum, product) => {
      const lineTotal = product.quantity * product.price;
      const discountAmount = lineTotal * (product.discount / 100);
      const afterDiscount = lineTotal - discountAmount;
      const vatAmount = afterDiscount * (product.vat / 100);
      return sum + afterDiscount + vatAmount;
    }, 0);
    setTotalSum(total);
  }, [formData.products]);

  // Save company data to localStorage
  useEffect(() => {
    const companyData = {
      companyName: formData.companyName,
      companyStreet: formData.companyStreet,
      companyPostalCode: formData.companyPostalCode,
      companyCity: formData.companyCity,
      companyPhone: formData.companyPhone,
      companyEmail: formData.companyEmail,
      companyOrgNr: formData.companyOrgNr,
      companyVatNr: formData.companyVatNr,
      companyLogo: formData.companyLogo,
      contactPersonQuestions: formData.contactPersonQuestions,
      contactPhoneQuestions: formData.contactPhoneQuestions,
      contactEmailQuestions: formData.contactEmailQuestions,
    };
    localStorage.setItem('companyData', JSON.stringify(companyData));
  }, [formData.companyName, formData.companyStreet, formData.companyPostalCode, formData.companyCity, formData.companyPhone, formData.companyEmail, formData.companyOrgNr, formData.companyVatNr, formData.companyLogo, formData.contactPersonQuestions, formData.contactPhoneQuestions, formData.contactEmailQuestions]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Spara företagsinformation till databasen om det är företagsdata
    const companyFields = [
      'companyName', 'companyStreet', 'companyPostalCode', 'companyCity',
      'companyPhone', 'companyEmail', 'companyOrgNr', 'companyVatNr',
      'companyWebsite', 'companyBankAccount'
    ];
    
    if (companyFields.includes(field)) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const companyData = {
            companyName: field === 'companyName' ? value : formData.companyName,
            companyStreet: field === 'companyStreet' ? value : formData.companyStreet,
            companyPostalCode: field === 'companyPostalCode' ? value : formData.companyPostalCode,
            companyCity: field === 'companyCity' ? value : formData.companyCity,
            companyPhone: field === 'companyPhone' ? value : formData.companyPhone,
            companyEmail: field === 'companyEmail' ? value : formData.companyEmail,
            companyOrgNr: field === 'companyOrgNr' ? value : formData.companyOrgNr,
            companyVatNr: field === 'companyVatNr' ? value : formData.companyVatNr,
            companyWebsite: field === 'companyWebsite' ? value : formData.companyWebsite,
            companyBankAccount: field === 'companyBankAccount' ? value : formData.companyBankAccount,
          };
          
          // Spara till databasen
          fetch('/api/auth/save-company', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              companyData
            }),
          }).then(response => {
            if (response.ok) {
              return response.json();
            }
          }).then(data => {
            if (data?.user) {
              // Uppdatera localStorage med nya användardata
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          }).catch(error => {
            console.error('Fel vid sparande av företagsinformation:', error);
          });
        } catch (error) {
          console.error('Fel vid hantering av användardata:', error);
        }
      }
    }
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      vat: 25,
      discount: 0,
      timeEstimate: ''
    };
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === id ? { ...product, [field]: value } : product
      )
    }));
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(product => product.id !== id)
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Företagsinformation (obligatoriska)
    if (!formData.companyName) errors.push('Företagsnamn');
    if (!formData.companyStreet) errors.push('Företagsadress (gata)');
    if (!formData.companyPostalCode) errors.push('Företagsadress (postnummer)');
    if (!formData.companyCity) errors.push('Företagsadress (ort)');
    if (!formData.companyPhone) errors.push('Företagstelefon');
    if (!formData.companyEmail) errors.push('Företags e-post');
    
    // Kundinformation (obligatoriska)
    if (!formData.customerName && !formData.customerCompany) {
      errors.push('Kundnamn eller kundföretag');
    }
    if (!formData.customerEmail) errors.push('Kund e-post');
    
    // Produkter (obligatoriska)
    if (formData.products.length === 0) {
      errors.push('Minst en produkt/tjänst');
    } else {
      // Kontrollera att alla produkter har obligatoriska fält
      formData.products.forEach((product, index) => {
        if (!product.name) errors.push(`Produktnamn för rad ${index + 1}`);
        if (product.price <= 0) errors.push(`Pris för produkt "${product.name || 'rad ' + (index + 1)}"`);
      });
    }
    
    return errors;
  };

  const handlePreview = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setValidationAction('preview');
      setShowValidation(true);
      return;
    }
    setShowPreview(true);
  };

  const handleEmail = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setValidationAction('email');
      setShowValidation(true);
      return;
    }
    setShowEmailModal(true);
  };

  const handleContinueAnyway = () => {
    setShowValidation(false);
    if (validationAction === 'preview') {
      setShowPreview(true);
    } else if (validationAction === 'email') {
      setShowEmailModal(true);
    }
  };

  const generateAIText = async () => {
  if (!formData.companyName || !formData.customerCompany) {
    alert('Fyll i företagsnamn och kundföretag för att generera AI-text');
    return;
  }

  setIsGeneratingAI(true);

  try {
    const response = await fetch('/api/generate-quote-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: formData.companyName,
        customerCompany: formData.customerCompany,
        products: formData.products
      }),
    });

    if (!response.ok) {
      throw new Error('Fel vid anrop till AI-API');
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || 'Kunde inte generera text.';
    setFormData(prev => ({ ...prev, aiGeneratedText: aiText }));
  } catch (error) {
    console.error('Error generating AI text:', error);
    alert('Fel vid generering av AI-text. Försök igen.');
  } finally {
    setIsGeneratingAI(false);
  }
};

  const clearSavedData = () => {
    if (confirm('Är du säker på att du vill rensa all sparad företagsdata?')) {
      localStorage.removeItem('companyData');
      localStorage.removeItem('lastQuoteNumber');
      setFormData(initialFormData);
    }
  };

  return (
    <div className="space-y-8">
      {/* Företagsinfo */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Företagsinformation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Företagsnamn *"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          <input
            type="text"
            placeholder="Organisationsnummer"
            value={formData.companyOrgNr}
            onChange={(e) => handleInputChange('companyOrgNr', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <input
            type="text"
            placeholder="Gatuadress *"
            value={formData.companyStreet}
            onChange={(e) => handleInputChange('companyStreet', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.companyStreet ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Postnummer *"
              value={formData.companyPostalCode}
              onChange={(e) => handleInputChange('companyPostalCode', e.target.value)}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.companyPostalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            <input
              type="text"
              placeholder="Ort *"
              value={formData.companyCity}
              onChange={(e) => handleInputChange('companyCity', e.target.value)}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.companyCity ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
          </div>
          <input
            type="tel"
            placeholder="Telefonnummer *"
            value={formData.companyPhone}
            onChange={(e) => handleInputChange('companyPhone', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.companyPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          <input
            type="email"
            placeholder="E-postadress *"
            value={formData.companyEmail}
            onChange={(e) => handleInputChange('companyEmail', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.companyEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          <input
            type="text"
            placeholder="Momsregistreringsnummer"
            value={formData.companyVatNr}
            onChange={(e) => handleInputChange('companyVatNr', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Kundinfo */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Kundinformation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Mottagarens företagsnamn"
            value={formData.customerCompany}
            onChange={(e) => handleInputChange('customerCompany', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.customerName && !formData.customerCompany ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          <input
            type="text"
            placeholder="Kontaktperson *"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.customerName && !formData.customerCompany ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          <input
            type="text"
            placeholder="Gatuadress"
            value={formData.customerStreet}
            onChange={(e) => handleInputChange('customerStreet', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Postnummer"
              value={formData.customerPostalCode}
              onChange={(e) => handleInputChange('customerPostalCode', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Ort"
              value={formData.customerCity}
              onChange={(e) => handleInputChange('customerCity', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <input
            type="tel"
            placeholder="Telefonnummer"
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <input
            type="email"
            placeholder="E-postadress *"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!formData.customerEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
        </div>
      </div>

      {/* Offertdetaljer */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Offertdetaljer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offertnummer</label>
            <input
              type="text"
              placeholder="OFF-1001"
              value={formData.quoteNumber}
              onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <input
              type="date"
              value={formData.quoteDate}
              onChange={(e) => handleInputChange('quoteDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giltig till</label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giltighetstid</label>
            <select
              value={formData.validityPeriod}
              onChange={(e) => handleInputChange('validityPeriod', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="14 dagar">14 dagar</option>
              <option value="30 dagar">30 dagar</option>
              <option value="45 dagar">45 dagar</option>
              <option value="60 dagar">60 dagar</option>
              <option value="90 dagar">90 dagar</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI-genererad text */}
      

      {/* Leveransvillkor */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Leveransvillkor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leveranstid</label>
            <input
              type="text"
              placeholder="T.ex. 2-3 veckor"
              value={formData.deliveryTime}
              onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leveranssätt</label>
            <select
              value={formData.deliveryMethod}
              onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="Standard">Standard</option>
              <option value="Express">Express</option>
              <option value="Upphämtning">Upphämtning</option>
              <option value="Egen leverans">Egen leverans</option>
              <option value="Installation på plats">Installation på plats</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fraktkostnader</label>
            <input
              type="text"
              placeholder="T.ex. 250 SEK eller Ingår"
              value={formData.shippingCosts}
              onChange={(e) => handleInputChange('shippingCosts', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="deliveryAddressDifferent"
                checked={formData.deliveryAddressDifferent}
                onChange={(e) => handleInputChange('deliveryAddressDifferent', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="deliveryAddressDifferent" className="ml-2 text-sm font-medium text-gray-700">
                Annan leveransadress
              </label>
            </div>
            {formData.deliveryAddressDifferent && (
              <textarea
                placeholder="Ange leveransadress..."
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* Betalningsvillkor */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Betalningsvillkor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Betalningsmetod</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="Faktura">Faktura</option>
              <option value="Kontant">Kontant</option>
              <option value="Kort">Kort</option>
              <option value="Bankgiro">Bankgiro</option>
              <option value="Swish">Swish</option>
              <option value="Förskottsbetalning">Förskottsbetalning</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Förfallodatum</label>
            <select
              value={formData.paymentDueDate}
              onChange={(e) => handleInputChange('paymentDueDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="Kontant">Kontant</option>
              <option value="8 dagar">8 dagar</option>
              <option value="14 dagar">14 dagar</option>
              <option value="30 dagar">30 dagar</option>
              <option value="45 dagar">45 dagar</option>
              <option value="60 dagar">60 dagar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dröjsmålsränta</label>
            <input
              type="text"
              placeholder="T.ex. 8% eller Enligt lag"
              value={formData.lateInterestRate}
              onChange={(e) => handleInputChange('lateInterestRate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Betalningsreferens</label>
            <input
              type="text"
              placeholder="T.ex. OCR-nummer"
              value={formData.paymentReference}
              onChange={(e) => handleInputChange('paymentReference', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* ROT/RUT-avdrag */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">ROT/RUT-avdrag</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rotDeduction"
                checked={formData.rotDeduction}
                onChange={(e) => handleInputChange('rotDeduction', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rotDeduction" className="ml-2 text-sm font-medium text-gray-700">
                ROT-avdrag gäller (50% på arbetskostnad)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rutDeduction"
                checked={formData.rutDeduction}
                onChange={(e) => handleInputChange('rutDeduction', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rutDeduction" className="ml-2 text-sm font-medium text-gray-700">
                RUT-avdrag gäller (50% på arbetskostnad)
              </label>
            </div>
          </div>
          {(formData.rotDeduction || formData.rutDeduction) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Information om avdrag</label>
              <textarea
                placeholder="Beskriv vad som ingår i ROT/RUT-avdraget..."
                value={formData.deductionInfo}
                onChange={(e) => handleInputChange('deductionInfo', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tilläggsinformation */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Tilläggsinformation</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Garantier</label>
            <textarea
              placeholder="T.ex. 2 års garanti på material, 1 år på arbete..."
              value={formData.warranties}
              onChange={(e) => handleInputChange('warranties', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Övriga villkor</label>
            <textarea
              placeholder="Övriga villkor och bestämmelser..."
              value={formData.additionalTerms}
              onChange={(e) => handleInputChange('additionalTerms', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Särskilda anmärkningar</label>
            <textarea
              placeholder="Särskilda anmärkningar eller kommentarer..."
              value={formData.specialNotes}
              onChange={(e) => handleInputChange('specialNotes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Kontaktuppgifter för frågor */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Kontaktuppgifter för frågor</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktperson</label>
            <input
              type="text"
              placeholder="Namn på kontaktperson"
              value={formData.contactPersonQuestions}
              onChange={(e) => handleInputChange('contactPersonQuestions', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              placeholder="Telefonnummer"
              value={formData.contactPhoneQuestions}
              onChange={(e) => handleInputChange('contactPhoneQuestions', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
            <input
              type="email"
              placeholder="E-postadress"
              value={formData.contactEmailQuestions}
              onChange={(e) => handleInputChange('contactEmailQuestions', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Produkter/Tjänster */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Produkter/Tjänster</h3>
          <button
            onClick={addProduct}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Lägg till</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benämning *</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${!product.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Antal</label>
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pris (SEK) *</label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${product.price <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moms (%)</label>
                  <select
                    value={product.vat}
                    onChange={(e) => updateProduct(product.id, 'vat', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value={0}>0%</option>
                    <option value={6}>6%</option>
                    <option value={12}>12%</option>
                    <option value={25}>25%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tidsuppskattning</label>
                  <input
                    type="text"
                    placeholder="T.ex. 2-3 timmar"
                    value={product.timeEstimate}
                    onChange={(e) => updateProduct(product.id, 'timeEstimate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex items-end justify-center">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Detaljerad beskrivning</label>
                <textarea
                  value={product.description}
                  onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                  rows={2}
                  placeholder="Beskriv varan/tjänsten i detalj..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rabatt (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={product.discount}
                    onChange={(e) => updateProduct(product.id, 'discount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Totalt inkl. moms: </span>
                    <span className="font-semibold text-gray-800">
                      {(() => {
                        const lineTotal = product.quantity * product.price;
                        const discountAmount = lineTotal * (product.discount / 100);
                        const afterDiscount = lineTotal - discountAmount;
                        const vatAmount = afterDiscount * (product.vat / 100);
                        const total = afterDiscount + vatAmount;
                        return total.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' });
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total summa */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-right">
            <span className="text-lg font-semibold text-blue-800">
              Total: {totalSum.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}
            </span>
          </div>
        </div>
      </div>

      {/* Villkor */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Villkor</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leveransvillkor</label>
            <input
              type="text"
              value={formData.deliveryTerms}
              onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Betalningsvillkor</label>
            <input
              type="text"
              value={formData.paymentTerms}
              onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Övriga villkor</label>
            <textarea
              value={formData.otherTerms}
              onChange={(e) => handleInputChange('otherTerms', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">AI-genererad offerttext</h3>
          <button
            onClick={generateAIText}
            disabled={isGeneratingAI}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>{isGeneratingAI ? 'Genererar...' : 'Generera med AI'}</span>
          </button>
        </div>
        <textarea
          placeholder="AI-genererad text kommer att visas här..."
          value={isGeneratingAI ? streamedText : formData.aiGeneratedText}
          onChange={(e) => handleInputChange('aiGeneratedText', e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handlePreview}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Förhandsgranska PDF
        </button>
        <button
          onClick={handleEmail}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Skicka via e-post
        </button>
        <button
          onClick={clearSavedData}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Rensa sparad data
        </button>
      </div>

      {/* Modals */}
      {showPreview && (
        <PreviewModal
          formData={formData}
          selectedTemplate={selectedTemplate}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showEmailModal && (
        <EmailModal
          formData={formData}
          selectedTemplate={selectedTemplate}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {showValidation && (
        <ValidationPopup
          errors={validationErrors}
          onClose={() => setShowValidation(false)}
          onContinueAnyway={handleContinueAnyway}
        />
      )}
    </div>
  );
}
