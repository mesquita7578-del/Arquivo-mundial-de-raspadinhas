
import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, LayoutGrid, Check, AlertCircle } from 'lucide-react';
import { CategoryItem } from '../types';

interface CategoryManagerProps {
  categories: CategoryItem[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onClose, onAdd, onDelete, isAdmin }) => {
  const [newCatName, setNewCatName] = useState('');

  const handleAdd = () => {
    if (newCatName.trim()) {
      onAdd(newCatName.trim().toLowerCase());
      setNewCatName('');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
           <div className="flex items-center gap-3">
             <Tag className="w-5 h-5 text-brand-500" />
             <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Gerir Categorias</h2>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-6">
           {isAdmin && (
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Adicionar Nova Categoria</label>
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={newCatName}
                     onChange={(e) => setNewCatName(e.target.value)}
                     placeholder="Ex: Coleção Especial"
                     className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                   />
                   <button 
                     onClick={handleAdd}
                     className="bg-brand-600 hover:bg-brand-500 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95"
                   >
                     <Plus className="w-5 h-5" />
                   </button>
                </div>
             </div>
           )}

           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Categorias Ativas ({categories.length})</label>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                 {categories.map(cat => (
                   <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-800 rounded-xl group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${cat.isDefault ? 'bg-blue-500' : 'bg-brand-500'}`}></div>
                         <span className="text-sm font-black text-slate-300 uppercase tracking-tight">{cat.name}</span>
                         {cat.isDefault && <span className="text-[8px] font-black text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">SISTEMA</span>}
                      </div>
                      {!cat.isDefault && isAdmin && (
                         <button 
                           onClick={() => onDelete(cat.id)}
                           className="text-slate-600 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      )}
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-[10px] text-blue-300 leading-relaxed font-bold uppercase tracking-wide">
                 Categorias do sistema não podem ser removidas. Categorias personalizadas permitem organizar itens por séries específicas ou subgrupos de coleção.
              </p>
           </div>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-xs uppercase transition-all"
           >
             Fechar
           </button>
        </div>
      </div>
    </div>
  );
};
