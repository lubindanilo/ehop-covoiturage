import { useState } from 'react';
import { CreditCard } from 'lucide-react';

interface BankTransferSetupProps {
  onComplete: (data: {
    iban: string;
    bic: string;
    accountHolder: string;
  }) => void;
}

export const BankTransferSetup = ({ onComplete }: BankTransferSetupProps) => {
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!iban.trim() || !bic.trim() || !accountHolder.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // IBAN validation (basic format check)
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(iban.replace(/\s/g, ''))) {
      setError('IBAN invalide');
      return;
    }

    // BIC validation (basic format check)
    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.replace(/\s/g, ''))) {
      setError('BIC invalide');
      return;
    }

    onComplete({
      iban: iban.replace(/\s/g, ''),
      bic: bic.replace(/\s/g, ''),
      accountHolder
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-bold">Configuration du virement bancaire</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titulaire du compte
          </label>
          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IBAN
          </label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BIC
          </label>
          <input
            type="text"
            value={bic}
            onChange={(e) => setBic(e.target.value.toUpperCase())}
            placeholder="BNPAFRPPXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Valider
        </button>
      </form>
    </div>
  );
};