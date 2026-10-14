import React, { useState } from 'react';
import { Service } from '../types';
import { Plus, Trash2, Check, Clock, Scissors } from 'lucide-react';

interface PricingTabProps {
  services: Service[];
  onUpdatePrice: (id: number, newPrice: number) => void;
  onAddService: (service: Omit<Service, 'id'>) => void;
  onDeleteService: (id: number) => void;
}

export const PricingTab: React.FC<PricingTabProps> = ({
  services,
  onUpdatePrice,
  onAddService,
  onDeleteService,
}) => {
  const [editedPrices, setEditedPrices] = useState<Record<number, string>>({});
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('30');

  const handlePriceChange = (id: number, val: string) => {
    setEditedPrices((prev) => ({ ...prev, [id]: val }));
  };

  const handleSavePrice = (id: number) => {
    const val = editedPrices[id];
    if (val !== undefined) {
      const p = parseFloat(val);
      if (!isNaN(p) && p >= 0) {
        onUpdatePrice(id, p);
        setEditedPrices((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(newPrice);
    const dur = parseInt(newDuration, 10);
    if (!newName.trim() || isNaN(p) || p <= 0) return;

    onAddService({
      name: newName.trim(),
      price: p,
      duration: isNaN(dur) || dur <= 0 ? 30 : dur,
    });

    setNewName('');
    setNewPrice('');
    setNewDuration('30');
  };

  return (
    <div className="space-y-5">
      {/* Services List Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Hizmetler & Fiyat Listesi</h2>
            <p className="text-[11px] text-gray-500">Fiyatları anında güncelleyebilir ve yeni hizmet ekleyebilirsiniz.</p>
          </div>
          <span className="text-[11px] font-bold bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
            {services.length} Hizmet
          </span>
        </div>

        <div className="space-y-2">
          {services.map((s) => {
            const currentVal = editedPrices[s.id] !== undefined ? editedPrices[s.id] : String(s.price);
            const isChanged = editedPrices[s.id] !== undefined && parseFloat(editedPrices[s.id]) !== s.price;

            return (
              <div
                key={s.id}
                className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black text-amber-400 flex items-center justify-center shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{s.name}</h4>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {s.duration} dk
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={currentVal}
                      onChange={(e) => handlePriceChange(s.id, e.target.value)}
                      className="w-20 p-1.5 text-xs bg-white border border-gray-200 rounded-lg text-center font-bold focus:outline-none focus:border-black"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">
                      ₺
                    </span>
                  </div>

                  {isChanged && (
                    <button
                      onClick={() => handleSavePrice(s.id)}
                      className="px-2.5 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg hover:bg-gray-800 transition"
                    >
                      Kaydet
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`"${s.name}" hizmetini silmek istediğinize emin misiniz?`)) {
                        onDeleteService(s.id);
                      }
                    }}
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 flex items-center justify-center transition"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Service Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Yeni Hizmet Ekle
        </h3>
        <form onSubmit={handleCreateService} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              required
              placeholder="Hizmet Adı (Örn: Cilt Bakımı)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <input
              type="number"
              required
              placeholder="Fiyat (₺)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Süre (dk)"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:border-black"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition shadow-sm"
            >
              Hizmeti Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
