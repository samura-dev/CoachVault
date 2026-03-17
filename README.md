<div align="center" style="margin-bottom: 20px;">
  <h1>Coach Vault</h1>
  <p><b>Высокопроизводительная B2B SaaS-система для тренеров и профессиональных коучей.</b></p>

  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Zustand-4A4A55?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/PocketBase-B8DDE3?style=for-the-badge&logo=pocketbase&logoColor=16161a" alt="PocketBase" />
</div>

## Обзор проекта

**Coach Vault** закрывает полный цикл ведения клиентов: от проектирования индивидуальных тренировочных макроциклов до детальной аналитики результативности. Проект разрабатывался с жестким акцентом на производительность, безопасность данных (Zero Trust) и современный адаптивный интерфейс.

## Ключевой функционал

- **Analytical Dashboard:** Агрегация тренерской статистики в реальном времени. Индексация активности клиентов, вычисление выполнения планов и общей загруженности.
- **Athletes CRM:** Полноценный реестр клиентов (Active, Paused, Archived). Ведение изолированных приватных заметок, отслеживание антропометрии и логирование результатов в ретроспективе.
- **Advanced Program Builder:** Кастомизируемый конструктор макро- и микроциклов с поддержкой клонирования шаблонов.
- **Dynamic Metric System:** Модульная матрица метрик (Подходы, Повторения, RPE, Темп, Отдых) — настройки сохраняются индивидуально для каждого тренировочного аккаунта.
- **Audit & Activity Log:** Система внутреннего аудита, логирующая все CRUD-операции.

## Архитектура и стек технологий

Проект организован в монорепозиторий, разделяя клиентскую и серверную логику, но обеспечивая абсолютную консистентность схемы данных.

### Frontend
Слой представления реализован как SPA (Single Page Application).
- **Core:** React 18, TypeScript, Vite.
- **State Management:** Zustand (реактивность без лишнего бойлерплейта).
- **Styling:** Vanilla CSS (CSS Modules) с внедрением кастомного Glassmorphism UI (использование GPU-ускоренных фильтров).
- **Data Visualization:** Recharts (для графиков прогресса).

### Backend
Серверная часть базируется на **PocketBase** — высокопроизводительном Go-решении с встроенной базой SQLite.
- **Tenant Isolation:** Архитектура Row-Level Security (RLS) и JS-хуки, полностью изолирующие данные разных коучей. Запросы физически отсекают чужую информацию на уровне БД.
- **API Security:** Предотвращение ID-спуфинга через валидацию связей коллекций на этапе `createRule`.
