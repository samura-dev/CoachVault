import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Mail, MessageCircle, FileText, ChevronDown, Rocket } from 'lucide-react';

const sd_faqData = [
  { q: 'Как добавить первого клиента?', a: 'Перейдите в раздел "Клиенты" и нажмите кнопку "Добавить клиента" в правом верхнем углу. Заполните имя, цель и стартовый вес.' },
  { q: 'Сколько стоит подписка?', a: 'В данный момент Coach Vault находится в стадии бета-тестирования, поэтому все функции доступны абсолютно бесплатно.' },
  { q: 'Как изменить цель клиента?', a: 'Откройте страницу клиента, нажмите на иконку цели в заголовке или перейдите в редактирование профиля клиента (в разработке).' },
  { q: 'Ваши данные в безопасности?', a: 'Да, мы используем надежное шифрование и базу данных PocketBase. Ваши данные доступны только вам как тренеру.' },
  { q: 'Как часто нужно делать замеры?', a: 'Мы рекомендуем делать основные замеры раз в неделю в одно и то же время, чтобы динамика была максимально точной.' },
  { q: 'Есть ли мобильная версия?', a: ' Coach Vault отлично работает в браузере на телефоне. Полноценное мобильное приложение запланировано на конец года.' },
  { q: 'Как создать заметку о клиенте?', a: 'На странице клиента перейдите в раздел "Заметки" и нажмите "+ Добавить". Вы можете выбрать тип заметки для удобства.' },
  { q: 'Можно ли экспортировать отчеты?', a: 'Функция экспорта прогресса в PDF и Excel сейчас находится в разработке и появится в ближайших обновлениях.' },
  { q: 'Что делать, если я забыл пароль?', a: 'Вы можете восстановить доступ через форму входа, нажав "Забыли пароль?", или написать нам в поддержку.' },
  { q: 'Как связаться с поддержкой?', a: 'Вы можете написать нам в Telegram-чат или на электронную почту. Мы отвечаем максимально быстро!' },
];

const Sd_FAQItem = ({ question, answer, sd_isOpen, onToggle }: { question: string; answer: string; sd_isOpen: boolean; onToggle: () => void }) => {
  return (
    <div className="border-b border-gray-100 last:border-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-bold text-gray-800 group-hover:text-[var(--accent)] transition-colors pr-4">{question}</span>
        <div className={`p-1.5 rounded-lg bg-gray-50 group-hover:bg-orange-50 transition-colors ${sd_isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[var(--accent)] transition-all" />
        </div>
      </button>
      <AnimatePresence>
        {sd_isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="pb-5 pt-0 text-gray-500 text-sm leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sd_HelpPage = () => {
  const [sd_activeIndex, setSd_ActiveIndex] = useState<number | null>(null);

  const sd_handleToggle = (index: number) => {
    setSd_ActiveIndex(sd_activeIndex === index ? null : index);
  };
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 text-center py-10"
      >
        <div className="w-20 h-20 bg-gradient-to-tr from-orange-100 to-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-inner">
          <HelpCircle className="w-10 h-10 text-[var(--accent)]" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">Поддержка</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">Как мы можем вам помочь сегодня?</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-full text-orange-600 text-sm font-bold shadow-sm"
        >
          <Rocket className="w-4 h-4" />
          Beta Version: Бесплатно для всех пользователей
        </motion.div>
      </motion.div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FileText, title: 'Документация', desc: 'Руководства и база знаний', link: '#' },
          { icon: MessageCircle, title: 'Онлайн-чат', desc: 'Служба поддержки в Telegram', link: 'https://t.me/samura_dev' },
          { icon: Mail, title: 'Email', desc: 'samura.dev@mail.ru', link: 'mailto:samura.dev@mail.ru' },
        ].map((card, i) => (
          <motion.a
            key={i}
            href={card.link}
            target={card.link.startsWith('http') ? '_blank' : undefined}
            rel={card.link.startsWith('http') ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
            whileHover={{ scale: 1.05, y: -4, borderColor: 'var(--accent)' }}
            whileTap={{ scale: 0.95 }}
            className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all text-center flex flex-col items-center group"
          >
            <div className="w-14 h-14 bg-gray-50 group-hover:bg-orange-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[var(--accent)] transition-all duration-300 mb-5 shadow-inner">
              <card.icon className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-gray-900 group-hover:text-[var(--accent)] transition-colors">{card.title}</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">{card.desc}</p>
          </motion.a>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-8 lg:p-12 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm relative overflow-hidden mt-8"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">Часто задаваемые вопросы</h2>
              <div className="w-12 h-1.5 bg-[var(--accent)] rounded-full mt-3" />
            </div>
            <p className="text-gray-500 text-sm max-w-xs font-medium">Не нашли ответ на свой вопрос? Мы всегда готовы помочь в чате или по почте.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">
            {/* Left Column (items 1-5) */}
            <div className="space-y-0">
              {sd_faqData.slice(0, 5).map((faq, i) => (
                <Sd_FAQItem
                  key={`faq-l-${i}`}
                  question={faq.q}
                  answer={faq.a}
                  sd_isOpen={sd_activeIndex === i}
                  onToggle={() => sd_handleToggle(i)}
                />
              ))}
            </div>

            {/* Right Column (items 6-10) */}
            <div className="space-y-0">
              {sd_faqData.slice(5).map((faq, i) => (
                <Sd_FAQItem
                  key={`faq-r-${i}`}
                  question={faq.q}
                  answer={faq.a}
                  sd_isOpen={sd_activeIndex === i + 5}
                  onToggle={() => sd_handleToggle(i + 5)}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
