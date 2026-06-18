import React, { useState, useRef } from 'react';
import Icon from './ui/Icon';

// ServiceMatch — recomendador de servicio por foto (simulado, sin IA real).
// Props: { services, onSelectService(serviceId), onSkip }
const ServiceMatch = ({ services = [], onSelectService, onSkip }) => {
  const [step, setStep] = useState(1); // 1: upload, 2: analyzing, 3: result
  const [imageUrl, setImageUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [recommended, setRecommended] = useState(null);
  const fileInputRef = useRef(null);

  // Elección determinística del servicio recomendado a partir del nombre del archivo.
  const pickService = (name) => {
    if (!services.length) return null;
    const seed = (name || 'sin-foto').length;
    const index = seed % services.length;
    return services[index];
  };

  const runAnalysis = (name) => {
    setStep(2);
    setTimeout(() => {
      setRecommended(pickService(name));
      setStep(3);
    }, 1800);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setFileName(file.name);
    runAnalysis(file.name);
  };

  const handleSkipPhoto = () => {
    setImageUrl(null);
    setFileName('');
    runAnalysis('');
  };

  const justification = recommended
    ? `Según tu tipo de rostro y tu estilo, detectamos rasgos que combinan muy bien con este servicio. ${recommended.name} es la opción que mejor realza tu look.`
    : '';

  return (
    <div className="glass rounded-2xl border-2 border-gold-400 shadow-modal overflow-hidden">
      {/* Keyframes para la animación de escaneo */}
      <style>{`
        @keyframes sm-scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .sm-scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
          box-shadow: 0 0 16px 4px rgba(212,175,55,0.6);
          animation: sm-scan 1.2s ease-in-out infinite alternate;
        }
        @keyframes sm-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .sm-pulse { animation: sm-pulse 1.2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gold-400/40">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge-gold inline-flex items-center gap-1">
            <Icon name="sparkles" className="w-3.5 h-3.5" />
            ServiceMatch
          </span>
        </div>
        <h3 className="page-title text-xl text-secondary">Encontrá tu servicio ideal</h3>
        <p className="text-sm text-primary-500 mt-1">
          Subí una foto y te recomendamos el servicio perfecto para vos.
        </p>
      </div>

      <div className="p-6 md:p-8 min-h-[320px]">
        {/* Paso 1: Subir imagen */}
        {step === 1 && (
          <div className="animate-fade-in flex flex-col items-center text-center">
            <label
              htmlFor="service-match-file"
              className="w-full max-w-md cursor-pointer rounded-2xl border-2 border-dashed border-gold-400 bg-gold-50 hover:bg-gold-100 transition-colors p-8 flex flex-col items-center gap-3 lift"
            >
              <span className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center text-gold-600">
                <Icon name="eye" className="w-7 h-7" />
              </span>
              <span className="font-semibold text-secondary">Subí una foto tuya</span>
              <span className="text-xs text-primary-500">
                Formatos JPG o PNG. La imagen no se almacena.
              </span>
            </label>
            <input
              id="service-match-file"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-3 w-full max-w-md my-5">
              <span className="flex-1 h-px bg-primary-200" />
              <span className="section-label text-primary-400">o</span>
              <span className="flex-1 h-px bg-primary-200" />
            </div>

            <button
              id="service-match-skip-photo"
              onClick={handleSkipPhoto}
              className="btn-secondary"
            >
              Analizar sin foto
            </button>

            {onSkip && (
              <button
                id="service-match-skip"
                onClick={onSkip}
                className="mt-3 text-sm text-primary-500 hover:text-secondary transition-colors"
              >
                Ver todos los servicios
              </button>
            )}
          </div>
        )}

        {/* Paso 2: Analizando */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col items-center text-center">
            <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden border-2 border-gold-400 bg-primary-50">
              {imageUrl ? (
                <img src={imageUrl} alt="Foto a analizar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-300">
                  <Icon name="user" className="w-24 h-24" />
                </div>
              )}
              <div className="sm-scan-line" />
              <div className="absolute inset-0 bg-gold-400/5" />
            </div>
            <div className="flex items-center gap-2 mt-5 text-gold-600 sm-pulse">
              <Icon name="sparkles" className="w-5 h-5" />
              <span className="font-semibold">Analizando tus rasgos...</span>
            </div>
            <p className="text-xs text-primary-400 mt-1">Esto toma unos segundos</p>
          </div>
        )}

        {/* Paso 3: Resultado */}
        {step === 3 && recommended && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Preview */}
              <div className="w-full sm:w-40 flex-shrink-0">
                <div className="aspect-square rounded-2xl overflow-hidden border-2 border-gold-400 bg-primary-50">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Tu foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-300">
                      <Icon name="user" className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>

              {/* Recomendación */}
              <div className="flex-1 w-full">
                <span className="badge-gold inline-flex items-center gap-1 mb-3">
                  <Icon name="sparkles" className="w-3.5 h-3.5" />
                  Tu match
                </span>
                <h4 className="page-title text-2xl text-secondary">{recommended.name}</h4>

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-sm text-primary-500">
                    <Icon name="clock" className="w-4 h-4" />
                    {recommended.duration} min
                  </span>
                  <span className="text-2xl font-bold text-gold">
                    ${recommended.price?.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-gold-50 border border-gold-400/40 p-4">
                  <p className="text-sm text-secondary leading-relaxed">{justification}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    id="service-match-select"
                    onClick={() => onSelectService?.(recommended.id)}
                    className="btn-gold"
                  >
                    <Icon name="check-circle" className="w-4 h-4 mr-1.5 inline-block" />
                    Elegir este servicio
                  </button>
                  <button
                    id="service-match-see-all"
                    onClick={onSkip}
                    className="btn-secondary"
                  >
                    Ver todos los servicios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceMatch;
