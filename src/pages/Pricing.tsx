import { useState } from 'react';
import { Euro, CreditCard, ArrowRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your_publishable_key');

export const Pricing = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    // Implement Stripe payment
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Forfait et Paiements</h1>

      {/* Balance Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Solde actuel</h2>
          <span className="text-2xl font-bold text-indigo-600">25,00 €</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handlePayment}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <CreditCard className="h-5 w-5" />
            <span>Recharger</span>
          </button>
          <button
            className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Euro className="h-5 w-5" />
            <span>Retirer</span>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Historique des transactions</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Trajet avec John Doe</div>
                <div className="text-sm text-gray-500">15 février 2024</div>
              </div>
              <span className="font-medium text-green-600">+5,00 €</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};