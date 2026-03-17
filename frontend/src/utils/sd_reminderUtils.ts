import { sd_pb } from '../lib/sd_pocketbase';
import type { sd_Reminder } from '../types/sd_types';

type sd_ReminderTemplate = {
  title: string;
  description: string;
  type: sd_Reminder['type'];
};

export const sd_reminderTemplates: sd_ReminderTemplate[] = [
  { title: '📊 Недельный замер', description: 'Пора сделать замеры веса и объемов для отслеживания динамики.', type: 'measurement' },
  { title: '🍎 Обновить питание', description: 'Проверьте КБЖУ и внесите корректировки в план питания.', type: 'other' },
  { title: '💪 Анализ тренировки', description: 'Изучите отчет о вчерашней тренировке и дайте обратную связь.', type: 'check_in' },
  { title: '💳 Оплата участия', description: 'Сегодня день оплаты следующего месяца ведения.', type: 'payment' },
  { title: '📸 Фото-отчет', description: 'Запросите актуальные фотографии формы с трех ракурсов.', type: 'measurement' },
  { title: '😴 Сон и восстановление', description: 'Уточните самочувствие и качество сна за последнюю неделю.', type: 'check_in' },
  { title: '💊 Проверить витамины', description: 'Проконтролируйте прием назначенных добавок и БАД.', type: 'other' },
  { title: '📝 Анализ дневника', description: 'Просмотрите дневник тренировок и оцените прогрессию нагрузок.', type: 'check_in' },
  { title: '📈 Подвести итоги месяца', description: 'Сформируйте и отправьте отчет о результатах за прошедший месяц.', type: 'other' },
  { title: '🥗 Пит-стоп (читмил)', description: 'Обсудите плановый разгрузочный прием пищи.', type: 'nutrition' },
  { title: '🩺 Разминка и растяжка', description: 'Напомните о важности восстановительных процедур.', type: 'other' },
  { title: '🎯 Пересмотр целей', description: 'Проверьте, не пора ли сменить этап (сушка/набор) по текущим данным.', type: 'other' },
];

export const sd_createReminderFromTemplate = async (
  coachId: string,
  athleteId: string | null,
  templateIdx: number,
  dueDate: Date = new Date()
) => {
  const template = sd_reminderTemplates[templateIdx];
  if (!template) return null;

  try {
    const record = await sd_pb.collection('reminders').create<sd_Reminder>({
      coach_id: coachId,
      athlete_id: athleteId || undefined,
      title: template.title,
      description: template.description,
      due_date: dueDate.toISOString(),
      is_completed: false,
      type: template.type,
    });
    return record;
  } catch (err) {
    console.error('[Reminders] Create from template error:', err);
    return null;
  }
};
