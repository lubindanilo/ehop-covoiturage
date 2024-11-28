// Update labels in RideForm component
<AddressAutocomplete
  label="Départ"
  value={formData.from}
  onChange={(value, coords) => handleAddressChange('from', value, coords)}
  required
/>

<AddressAutocomplete
  label="Arrivée"
  value={formData.to}
  onChange={(value, coords) => handleAddressChange('to', value, coords)}
  required
/>

<label className="block text-sm font-medium text-gray-700 mb-1">Date</label>

<label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>

<label className="block text-sm font-medium text-gray-700 mb-1">Places disponibles</label>

{routeDetails && (
  <div className="flex justify-between text-sm text-gray-600">
    <span>Distance : {routeDetails.distance}</span>
    <span>Durée : {routeDetails.duration}</span>
  </div>
)}

<button
  type="submit"
  disabled={loading || !isFormValid}
  className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
>
  {loading ? 'Création...' : 'Créer le trajet'}
</button>