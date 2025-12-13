import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Info, Sparkles, Hash, Maximize2, DollarSign, Archive, Edit2, Save, Trash2, Globe, RotateCw, MapPin, AlertTriangle, Share2, Check, User, Printer, BarChart, Layers } from 'lucide-react';
import { ScratchcardData, ScratchcardState } from '../types';

interface ImageViewerProps {
  image: ScratchcardData | null;
  onClose: () => void;
  onUpdate: (updatedImage: ScratchcardData) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  t: any;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onUpdate, onDelete, isAdmin, t }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ScratchcardData | null>(null);
  const [showingBack, setShowingBack] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    setFormData(image);
    setIsEditing(false);
    setShowingBack(false);
    setShowCopied(false);
  }, [image]);

  if (!image || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(t.deleteConfirm)) {
      onDelete(image.id);
      onClose();
    }
  };

  const handleShare = async () => {
    // Generates a mock deep link based on ID
    const shareUrl = `${window.location.origin}?id=${image.customId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar link", err);
    }
  };

  const handleChange = (field: keyof ScratchcardData, value: string | boolean) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-0 sm:p-4 bg-black/95 animate-fade-in backdrop-blur-xl">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col lg:flex-row w-full h-full lg:max-w-7xl lg:max-h-[85vh] bg-gray-900 rounded-none lg:rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
        
        {/* Image Section */}
        <div className="flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <img 
            src={showingBack ? (image.backUrl || image.frontUrl) : image.frontUrl} 
            alt={image.gameName} 
            className="max-w-full max-h-[calc(100%-4rem)] object-contain p-4 transition-transform duration-300" 
          />

          {image.backUrl && (
            <div className="absolute bottom-4 z-10 flex gap-2">
              <button 
                onClick={() => setShowingBack(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!showingBack ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {t.front}
              </button>
              <button 
                onClick={() => setShowingBack(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${showingBack ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {t.back}
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full lg:w-96 bg-gray-900 border-l border-gray-800 flex flex-col h-[40vh] lg:h-auto overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
             {isEditing ? (
               <div className="flex gap-2 w-full">
                 <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-bold transition-colors">
                   {t.cancel}
                 </button>
                 <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                   <Save className="w-3 h-3" /> {t.save}
                 </button>
               </div>
             ) : (
               <div className="flex gap-2 w-full">
                  <button 
                    onClick={handleShare}
                    className={`flex-1 border py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      showCopied 
                      ? "bg-green-900/30 text-green-400 border-green-800/50" 
                      : "bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border-blue-800/30"
                    }`}
                  >
                    {showCopied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                    {showCopied ? t.copied : t.share}
                  </button>

                  {isAdmin && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="flex-1 bg-brand-900/30 hover:bg-brand-900/50 text-brand-400 border border-brand-800/50 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" /> {t.edit}
                    </button>
                  )}
                  
                  {isAdmin && (
                    <button 
                      onClick={handleDelete}
                      className="px-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-lg transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
               </div>
             )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
               {isEditing ? (
                 <input 
                    type="text" 
                    value={formData.customId}
                    onChange={(e) => handleChange('customId', e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1 w-32 focus:border-brand-500 outline-none"
                    placeholder="ID"
                 />
               ) : (
                 <span className="font-mono text-brand-500 bg-brand-900/20 border border-brand-500/30 px-3 py-1 rounded text-sm tracking-wider">
                   {image.customId}
                 </span>
               )}
               
               {!isEditing && (
                 <div className="flex gap-2">
                   {image.isSeries && (
                     <span className="text-brand-400 bg-brand-900/30 border border-brand-800 px-2 py-0.5 rounded text-xs flex items-center gap-1" title="SET / Serie">
                       <Layers className="w-3 h-3" /> SET
                     </span>
                   )}
                   {image.aiGenerated && (
                    <span className="text-blue-400 bg-blue-900/30 border border-blue-800 px-2 py-0.5 rounded text-xs flex items-center gap-1 cursor-help" title="AI Generated">
                      <Sparkles className="w-3 h-3" /> IA
                    </span>
                   )}
                 </div>
               )}
            </div>

            {isEditing ? (
              <div className="mb-4 space-y-2">
                <input 
                  type="text" 
                  value={formData.gameName}
                  onChange={(e) => handleChange('gameName', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xl font-bold rounded px-3 py-2 focus:border-brand-500 outline-none"
                />
                <input 
                  type="text" 
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="País"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-1 focus:border-brand-500 outline-none"
                />
                <div className="flex items-center gap-2 mt-2">
                   <div 
                     className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${formData.isSeries ? 'bg-brand-500 border-brand-500' : 'border-gray-500'}`}
                     onClick={() => handleChange('isSeries', !formData.isSeries)}
                   >
                     {formData.isSeries && <Check className="w-3 h-3 text-white" />}
                   </div>
                   <label className="text-xs text-gray-400 cursor-pointer" onClick={() => handleChange('isSeries', !formData.isSeries)}>SET / Serie?</label>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-white mb-1 leading-tight">{image.gameName}</h2>
                <div className="flex items-center gap-2 text-brand-400 text-sm mb-4">
                  <Globe className="w-4 h-4" />
                  <span>{image.country} • {image.continent}</span>
                </div>
              </>
            )}
            
            <p className="text-gray-500 text-sm mb-6 flex items-center gap-1">
              {t.addedOn} {new Date(image.createdAt).toLocaleDateString()}
              {isAdmin && isEditing && <span className="text-red-400 ml-2 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {t.adminMode}</span>}
            </p>

            <div className="space-y-4">
              {/* Grid of properties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <User className="w-3 h-3" /> {t.collector || "Collector"}
                  </span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.collector || ''}
                      onChange={(e) => handleChange('collector', e.target.value)}
                      placeholder="Nome / Nome"
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:border-brand-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-200">{image.collector || 'N/A'}</p>
                  )}
                </div>

                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <Hash className="w-3 h-3" /> {t.gameNo}
                  </span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.gameNumber}
                      onChange={(e) => handleChange('gameNumber', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:border-brand-500 outline-none font-mono"
                    />
                  ) : (
                    <p className="font-mono text-gray-200">{image.gameNumber}</p>
                  )}
                </div>

                {/* Price Field */}
                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <DollarSign className="w-3 h-3" /> {t.price}
                  </span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.price || ''}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="Ex: 5€"
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:border-brand-500 outline-none"
                    />
                  ) : (
                    <p className="font-bold text-brand-400">{image.price || 'N/A'}</p>
                  )}
                </div>

                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <Archive className="w-3 h-3" /> {t.state}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="Estado"
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:border-brand-500 outline-none"
                    />
                  ) : (
                    <p className="font-bold text-gray-200">{image.state}</p>
                  )}
                </div>

                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <Maximize2 className="w-3 h-3" /> {t.size}
                  </span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.size}
                      onChange={(e) => handleChange('size', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:border-brand-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-200">{image.size}</p>
                  )}
                </div>

                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <Calendar className="w-3 h-3" /> {t.release}
                  </span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.releaseDate}
                      onChange={(e) => handleChange('releaseDate', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:border-brand-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-200">{image.releaseDate || 'Desc.'}</p>
                  )}
                </div>

                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <BarChart className="w-3 h-3" /> {t.emission}
                  </span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.emission || ''}
                      onChange={(e) => handleChange('emission', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:border-brand-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-200 text-sm truncate" title={image.emission}>{image.emission || '-'}</p>
                  )}
                </div>

                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <Printer className="w-3 h-3" /> {t.printer}
                  </span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.printer || ''}
                      onChange={(e) => handleChange('printer', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:border-brand-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-200 text-sm">{image.printer || 'Desconhecido'}</p>
                  )}
                </div>
              </div>

              {/* Full width properties */}
              <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-800 mt-4">
                <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-2">
                  <DollarSign className="w-3 h-3" /> {t.values}
                </span>
                {isEditing ? (
                  <textarea 
                    value={formData.values}
                    onChange={(e) => handleChange('values', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded px-2 py-2 focus:border-brand-500 outline-none min-h-[80px]"
                  />
                ) : (
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {image.values}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-800 bg-gray-900/50">
            <button 
              onClick={onClose}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};