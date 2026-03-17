import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Save, Activity, Dumbbell, Utensils, Zap, Flame, Target, User } from 'lucide-react';
import { cn } from '../../../lib/sd_utils';
import { Sd_SaveNutritionModal } from '../../../components/calculator/Sd_SaveNutritionModal';

type Formula = 'mifflin' | 'harris' | 'katch';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Минимальная активность
  light: 1.375,   // Легкая активность (тренировки 1-3 раза в неделю)
  moderate: 1.55, // Умеренная активность (3-5 раз)
  active: 1.725,  // Высокая активность (6-7 раз)
  very_active: 1.9, // Экстремальная (физическая работа + тренировки)
};

export const Sd_CalculatorPage = () => {
  const [formula, setFormula] = useState<Formula>('mifflin');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number | ''>(25);
  const [weight, setWeight] = useState<number | ''>(75);
  const [height, setHeight] = useState<number | ''>(180);
  const [bodyFat, setBodyFat] = useState<number | ''>(''); // Для Katch-McArdle

  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [tefPercent, setTefPercent] = useState<number>(10); // Термический эффект пищи (обычно 10%)
  const [goalAdjustment, setGoalAdjustment] = useState<number>(0); // -20% дефицит, +15% профицит

  const [proteinPerKg, setProteinPerKg] = useState<number>(2.0);
  const [fatPerKg, setFatPerKg] = useState<number>(1.0);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // === CALCULATIONS ===
  const bmr = useMemo(() => {
    const w = Number(weight) || 0;
    const h = Number(height) || 0;
    const a = Number(age) || 0;
    const bf = Number(bodyFat) || 0;

    if (!w || !h || !a) return 0;

    if (formula === 'katch') {
      if (!bf) return 0; // Требуется процент жира
      const lbm = w * (1 - bf / 100);
      return 370 + 21.6 * lbm;
    }

    if (formula === 'mifflin') {
      const base = 10 * w + 6.25 * h - 5 * a;
      return gender === 'male' ? base + 5 : base - 161;
    }

    if (formula === 'harris') {
      if (gender === 'male') {
        return 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
      } else {
        return 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
      }
    }

    return 0;
  }, [formula, gender, age, weight, height, bodyFat]);

  const tdee = useMemo(() => {
    return bmr * ACTIVITY_MULTIPLIERS[activity];
  }, [bmr, activity]);

  const tdeeWithTef = useMemo(() => {
    return tdee + (tdee * (tefPercent / 100));
  }, [tdee, tefPercent]);

  const targetCalories = useMemo(() => {
    return tdeeWithTef + (tdeeWithTef * (goalAdjustment / 100));
  }, [tdeeWithTef, goalAdjustment]);

  const macros = useMemo(() => {
    const w = Number(weight) || 0;
    if (!w || !targetCalories) return { p: 0, f: 0, c: 0 };

    const pGrams = w * proteinPerKg;
    const fGrams = w * fatPerKg;

    const pCals = pGrams * 4;
    const fCals = fGrams * 9;

    const cCals = targetCalories - pCals - fCals;
    const cGrams = Math.max(0, cCals / 4);

    return {
      p: Math.round(pGrams),
      f: Math.round(fGrams),
      c: Math.round(cGrams)
    };
  }, [weight, targetCalories, proteinPerKg, fatPerKg]);

  return (
    <div className="w-full h-full space-y-8 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-[#FF5D8F]" />
            Калькулятор КБЖУ
          </h1>
          <p className="text-gray-500">Точный расчет норм с учетом TEF и NEAT</p>
        </div>
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="h-11 px-6 bg-[#FF5D8F] hover:bg-[#ff477e] text-white rounded-xl font-medium shadow-lg shadow-[#FF5D8F]/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Save className="w-5 h-5" />
          Сохранить клиенту
        </button>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
          className="xl:col-span-4 space-y-6"
        >
          {/* Базовые параметры */}
          <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" /> Параметры
            </h2>

            <div className="space-y-5">
              {/* Пол */}
              <div className="flex bg-gray-50 p-1 rounded-xl">
                {(['male', 'female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                      gender === g
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {g === 'male' ? 'Мужчина' : 'Женщина'}
                  </button>
                ))}
              </div>

              {/* Возраст, Рост, Вес */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">Возраст</label>
                  <input type="number" value={age} onChange={e => setAge(Number(e.target.value) || '')} className="w-full h-11 px-3 bg-gray-50 rounded-xl border border-transparent focus:border-[#FF5D8F] focus:bg-white focus:ring-2 focus:ring-[#FF5D8F]/20 transition-all outline-none font-semibold text-center" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">Рост (см)</label>
                  <input type="number" value={height} onChange={e => setHeight(Number(e.target.value) || '')} className="w-full h-11 px-3 bg-gray-50 rounded-xl border border-transparent focus:border-[#FF5D8F] focus:bg-white focus:ring-2 focus:ring-[#FF5D8F]/20 transition-all outline-none font-semibold text-center" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">Вес (кг)</label>
                  <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value) || '')} className="w-full h-11 px-3 bg-gray-50 rounded-xl border border-transparent focus:border-[#FF5D8F] focus:bg-white focus:ring-2 focus:ring-[#FF5D8F]/20 transition-all outline-none font-semibold text-center" />
                </div>
              </div>

              {/* Формула расчета */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-2">Формула расчета BMR</label>
                <select
                  value={formula}
                  onChange={(e) => setFormula(e.target.value as Formula)}
                  className="w-full h-11 px-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#FF5D8F] outline-none font-medium transition-all"
                >
                  <option value="mifflin">Mifflin-St Jeor (Рекомендуется)</option>
                  <option value="harris">Harris-Benedict (Устаревшая)</option>
                  <option value="katch">Katch-McArdle (Для спортсменов)</option>
                </select>

                {formula === 'katch' && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">% Жира</label>
                    <div className="relative">
                      <input type="number" value={bodyFat} onChange={e => setBodyFat(Number(e.target.value) || '')} placeholder="Например: 15" className="w-full h-11 pl-4 pr-8 bg-orange-50 text-orange-900 rounded-xl border border-orange-200 outline-none font-semibold" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Активность и Коэффициенты */}
          <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" /> Активность (NEAT)
            </h2>

            <div className="space-y-4">
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                className="w-full h-11 px-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#FF5D8F] outline-none font-medium transition-all mb-4"
              >
                <option value="sedentary">Сидячий (без тренировок: * 1.2)</option>
                <option value="light">Легкий (1-3 тренировки: * 1.375)</option>
                <option value="moderate">Умеренный (3-5 тренировок: * 1.55)</option>
                <option value="active">Активный (6-7 тренировок: * 1.725)</option>
                <option value="very_active">Очень активный (спортсмены: * 1.9)</option>
              </select>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-bold text-gray-700">Термический эффект пищи (TEF)</label>
                  <span className="text-xs font-bold text-[#FF5D8F] bg-[#FF5D8F]/10 px-2 py-0.5 rounded-md">+{tefPercent}%</span>
                </div>
                <input
                  type="range" min="0" max="20" step="1"
                  value={tefPercent} onChange={e => setTefPercent(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF5D8F]"
                />
                <p className="text-[11px] text-gray-400 mt-1">Обычно 10% для смешанного питания, до 15-20% при высокобелковом.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Results Dashboard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 }}
          className="xl:col-span-8 flex flex-col gap-6"
        >
          {/* Main Visualizer */}
          <div className="p-8 bg-gray-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5D8F] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 pb-2 border-b border-gray-800">
                  <Zap className="w-4 h-4" /> BMR (Базовый обмен)
                </div>
                <div className="text-4xl font-bold tracking-tight">{Math.round(bmr)} <span className="text-xl text-gray-500 font-medium">ккал</span></div>
                <p className="text-xs text-gray-500">Энергия в состоянии покоя</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 pb-2 border-b border-gray-800">
                  <Flame className="w-4 h-4" /> TDEE (Расход)
                </div>
                <div className="text-4xl font-bold tracking-tight text-[#FF5D8F]">{Math.round(tdeeWithTef)} <span className="text-xl text-[#FF5D8F]/50 font-medium">ккал</span></div>
                <p className="text-xs text-gray-500">Расход с учетом активности и TEF</p>
              </div>

              <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 text-white pb-2">
                  <span className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" /> Целевая калорийность</span>
                </div>
                <div className="text-5xl font-extrabold tracking-tight text-white">{Math.round(targetCalories)} <span className="text-2xl text-gray-400 font-medium">ккал</span></div>
              </div>
            </div>

            {/* Дефицит / Профицит Slider */}
            <div className="relative z-10 bg-black/30 p-6 rounded-2xl backdrop-blur-md border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg">Корректировка цели</h3>
                  <p className="text-sm text-gray-400">Настройте дефицит для сушки или профицит для набора</p>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-xl font-black text-lg",
                  goalAdjustment < 0 ? "bg-blue-500/20 text-blue-400" : goalAdjustment > 0 ? "bg-orange-500/20 text-orange-400" : "bg-gray-800 text-gray-300"
                )}>
                  {goalAdjustment > 0 ? '+' : ''}{goalAdjustment}%
                </div>
              </div>

              <input
                type="range" min="-30" max="30" step="1"
                value={goalAdjustment} onChange={e => setGoalAdjustment(Number(e.target.value))}
                className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #1f2937 50%, #f97316 100%)`,
                }}
              />
              <div className="flex justify-between text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">
                <span>Экстр. Дефицит (-30%)</span>
                <span>Поддержка (0%)</span>
                <span>Агрес. Набор (+30%)</span>
              </div>
            </div>
          </div>

          {/* Макронутриенты (БЖУ) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Белки */}
            <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500"><Dumbbell className="w-5 h-5" /></div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase">Белки</span>
                  <div className="text-2xl font-black text-gray-900">{macros.p}г</div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <label className="flex justify-between text-sm font-semibold text-gray-700 mb-2">Настройка (г/кг) <span className="text-rose-500">{proteinPerKg} г</span></label>
                <input type="range" min="1.0" max="3.5" step="0.1" value={proteinPerKg} onChange={e => setProteinPerKg(Number(e.target.value))} className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500" />
              </div>
            </div>

            {/* Жиры */}
            <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Utensils className="w-5 h-5" /></div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase">Жиры</span>
                  <div className="text-2xl font-black text-gray-900">{macros.f}г</div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <label className="flex justify-between text-sm font-semibold text-gray-700 mb-2">Настройка (г/кг) <span className="text-amber-500">{fatPerKg} г</span></label>
                <input type="range" min="0.5" max="2.0" step="0.1" value={fatPerKg} onChange={e => setFatPerKg(Number(e.target.value))} className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500" />
              </div>
            </div>

            {/* Углеводы */}
            <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden border-b-4 border-b-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Zap className="w-5 h-5" /></div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase">Углеводы</span>
                  <div className="text-2xl font-black text-gray-900">{macros.c}г</div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <p className="text-[12px] font-semibold text-gray-500 leading-tight">Углеводы рассчитываются по остаточному принципу от общей калорийности.</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      {isSaveModalOpen && (
        <Sd_SaveNutritionModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          plan={{
            tdee: tdeeWithTef,
            target_calories: targetCalories,
            macros,
            formula
          }}
        />
      )}
    </div>
  );
};
