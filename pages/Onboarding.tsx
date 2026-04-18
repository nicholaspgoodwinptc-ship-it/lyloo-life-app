import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui/LayoutComponents';
import { ArrowRight, Check, Leaf } from 'lucide-react';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  // State for data collection
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [temps, setTemps] = useState(15);
  const [notifications, setNotifications] = useState({ matin: false, midi: false, soir: false });

  const GOALS_OPTIONS = [
    "Mieux gérer mon stress",
    "Améliorer mon sommeil",
    "Bouger plus au quotidien",
    "Mieux manger",
    "Retrouver de l'énergie",
    "Prendre du temps pour moi"
  ];

  const TIME_OPTIONS = [5, 10, 15, 20, 30];

  const toggleGoal = (goal: string) => {
    if (objectifs.includes(goal)) {
      setObjectifs(objectifs.filter(g => g !== goal));
    } else {
      setObjectifs([...objectifs, goal]);
    }
  };

  const handleFinish = () => {
    updateProfile({
      objectifs,
      tempsParJourMinutes: temps,
      notifications
    });
    navigate('/');
  };

  // Screen 1: Welcome
  if (step === 1) {
    return (
      <div className="min-h-screen bg-lyloo-beige flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-lyloo-vertEau/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-lyloo-vertPale/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-lyloo-vertEau to-lyloo-vertPale rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Leaf className="text-lyloo-anthracite w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-lyloo-anthracite mb-2">LYLOO</h1>
            <p className="text-xl font-medium text-lyloo-marron italic mb-6">"L'équilibre commence en douceur"</p>
            
            <p className="text-lyloo-anthracite/80 leading-relaxed max-w-xs mb-10">
                Découvrez une approche holistique qui réunit le bien-être mental et physique, avec bienveillance et à votre rythme.
            </p>

            <Button onClick={() => setStep(2)} size="lg" className="w-full max-w-xs shadow-xl shadow-lyloo-anthracite/10">
                Commencer
            </Button>
        </div>
      </div>
    );
  }

  // Common Layout for Step 2, 3, 4
  return (
    <div className="min-h-screen bg-lyloo-beige flex flex-col p-6">
      <div className="w-full bg-stone-200 h-1.5 rounded-full mb-8">
        <div className="bg-lyloo-anthracite h-1.5 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-lyloo-anthracite mb-6">Quels sont tes objectifs principaux ?</h2>
            <div className="space-y-3">
              {GOALS_OPTIONS.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${objectifs.includes(goal) ? 'border-lyloo-anthracite bg-white' : 'border-transparent bg-white/50 hover:bg-white'}`}
                >
                  <span className="font-medium text-lyloo-anthracite">{goal}</span>
                  {objectifs.includes(goal) && <div className="w-6 h-6 bg-lyloo-vertEau rounded-full flex items-center justify-center text-lyloo-anthracite"><Check size={14} strokeWidth={3} /></div>}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold text-lyloo-anthracite mb-2">Combien de temps as-tu ?</h2>
            <p className="text-lyloo-marron mb-8">Nous adapterons tes séances quotidiennes.</p>
            <div className="grid grid-cols-2 gap-4">
              {TIME_OPTIONS.map(t => (
                <button
                    key={t}
                    onClick={() => setTemps(t)}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${temps === t ? 'border-lyloo-anthracite bg-white shadow-lg' : 'border-transparent bg-white/50'}`}
                >
                    <span className="text-3xl font-bold text-lyloo-anthracite">{t}</span>
                    <span className="text-sm uppercase tracking-wide font-medium text-lyloo-marron">min</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-2xl font-bold text-lyloo-anthracite mb-6">Rappels doux</h2>
            <p className="text-lyloo-anthracite/70 mb-8">Active les moments où tu souhaites prendre soin de toi.</p>
            
            <div className="space-y-4">
               {[
                   { id: 'matin', label: 'Matin', sub: 'Routine d\'ancrage' },
                   { id: 'midi', label: 'Midi', sub: 'Pause respiration' },
                   { id: 'soir', label: 'Soir', sub: 'Relaxation' }
               ].map((item) => (
                   <div key={item.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                       <div>
                           <p className="font-bold text-lg">{item.label}</p>
                           <p className="text-sm text-lyloo-marron">{item.sub}</p>
                       </div>
                       <div 
                         onClick={() => setNotifications({...notifications, [item.id]: !notifications[item.id as keyof typeof notifications]})}
                         className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${notifications[item.id as keyof typeof notifications] ? 'bg-lyloo-vertEau' : 'bg-stone-200'}`}
                       >
                           <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${notifications[item.id as keyof typeof notifications] ? 'translate-x-6' : ''}`}></div>
                       </div>
                   </div>
               ))}
            </div>

            <p className="text-xs text-stone-400 mt-8 text-center leading-tight">
                En continuant, tu acceptes notre politique de confidentialité. Tes données sont utilisées uniquement pour personnaliser ton expérience.
            </p>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-lyloo-beige bg-opacity-90 backdrop-blur-md">
        <Button onClick={() => step < 4 ? setStep(step + 1) : handleFinish()} className="w-full" size="lg">
            {step === 4 ? "Terminer" : "Continuer"}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;