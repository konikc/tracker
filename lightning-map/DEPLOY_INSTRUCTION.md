# 🚀 Инструкция по деплою на Netlify (БЕСПЛАТНО)

## ⚠️ ВАЖНО: Исправлена ошибка "Page Not Found"

Если вы получили ошибку 404 на Netlify, выполните следующие шаги:

---

## Почему Netlify лучше Vercel для этого проекта:
- ✅ **Netlify Functions** - встроенные serverless функции для обхода CORS
- ✅ **Бесплатный тариф** - 100GB bandwidth, 125k function invocations/month
- ✅ **Автоматический HTTPS** 
- ✅ **Continuous Deployment** из GitHub
- ✅ **Мгновенный деплой**

---

## 📋 Шаг 1: Подготовка репозитория

```bash
cd /workspace/lightning-map

# Инициализация Git
git init
git add .
git commit -m "⚡ Lightning Map Russia - исправлен деплой на Netlify"

# Создаём репозиторий на GitHub и пушим
git branch -M main
git remote add origin https://github.com/ВАШ_НИК/lightning-map.git
git push -u origin main
```

---

## 📋 Шаг 2: Деплой на Netlify

### Вариант A: Через веб-интерфейс (рекомендуется)

1. **Зайдите на [netlify.com](https://netlify.com)**
2. **Войдите через GitHub** (или зарегистрируйтесь)
3. **Нажмите "Add new site" → "Import an existing project"**
4. **Выберите GitHub** и авторизуйтесь
5. **Найдите ваш репозиторий** `lightning-map`
6. **Настройте сборку:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions` (автоматически определяется)
7. **Нажмите "Deploy site"**

### Вариант B: Через Netlify CLI

```bash
# Установите Netlify CLI
npm install -g netlify-cli

# Авторизуйтесь
netlify login

# Деплой
cd /workspace/lightning-map
netlify deploy --prod
```

---

## 🔧 ИСПРАВЛЕНИЕ ОШИБКИ 404

Если после деплоя вы видите **"Page Not Found"**:

### Причина:
Netlify не может найти `index.html` потому что:
1. Неправильно указана папка публикации
2. Отсутствует файл `netlify.toml`
3. Функции не собрались правильно

### Решение:

✅ **Проверьте настройки в панели Netlify:**

1. Зайдите в **Site settings** → **Build & deploy**
2. Нажмите **Edit settings**
3. Убедитесь что:
   - **Base directory:** (пусто)
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
   - **Build command:** `npm run build`

✅ **Проверьте наличие файлов:**

```bash
cd /workspace/lightning-map
ls -la dist/index.html           # должен существовать
ls -la netlify.toml              # должен существовать
ls -la netlify/functions/        # должна быть папка с функциями
```

✅ **Пересоберите и запушьте:**

```bash
cd /workspace/lightning-map
npm run build
git add .
git commit -m "🔧 Fix: пересборка для Netlify"
git push origin main
```

✅ **В панели Netlify:**
1. Зайдите в **Deploys**
2. Нажмите **Trigger deploy** → **Clear cache and deploy site**

---

## 📋 Шаг 3: Проверка работы

После деплоя вы получите URL вида: `https://ваш-сайт.netlify.app`

### Что проверить:
1. 🗺️ Карта России загружается
2. ⚡ Молнии отображаются (реальные или демо)
3. 🔊 Звук "тык" при новых молниях
4. 🔔 Уведомления работают (нажмите "Уведомления ✅")
5. 📍 Геолокация определяется

### Проверка API:
Откройте консоль браузера (F12) и проверьте:
- Нет ли ошибок CORS
- Запрос на `/api/blitzortung` возвращает данные

---

## 🔧 Как это работает

### Структура проекта:
```
lightning-map/
├── src/
│   ├── App.jsx          # Основной код приложения
│   └── App.css          # Стили
├── public/
│   └── thunder.mp3      # Звук грома
├── netlify/
│   └── functions/
│       ├── proxy-blitzortung.js  # Serverless функция для API (ES6 модуль)
│       └── package.json          # Конфигурация bundler'а
├── netlify.toml         # Конфигурация Netlify
├── package.json
└── dist/                # Сборка (создаётся автоматически)
```

### API Flow:
```
Браузер → /api/blitzortung → Netlify Function → Blitzortung API → Браузер
                          (обходит CORS)
```

---

## 🌐 API Blitzortung

### Официальные источники данных:
- **Region 7 (Европа/Западная Россия):** 
  `https://data.blitzortung.org/Data_Region_7/Processed/JSON/Lightning.GeoJSON`
  
- **Region 6 (Азия/Восточная Россия):**
  `https://data.blitzortung.org/Data_Region_6/Processed/JSON/Lightning.GeoJSON`

### Документация:
- Сайт: https://blitzortung.org
- Live карта: https://maps.blitzortung.org
- Документация: https://blitzortung.org/en/documentation.php

### Важно:
- Данные обновляются каждые ~10 секунд
- Формат: GeoJSON с координатами `[longitude, latitude]`
- Бесплатно для некоммерческого использования

---

## 🎯 Полезные функции

### 1. Push-уведомления
- Работают на ПК и Android
- Требуют разрешения браузера
- Оповещают о молниях в радиусе X км

### 2. Геолокация
- Автоматически определяет ваше местоположение
- Показывает расстояние до молний

### 3. Настройки
- 🔊 Вкл/выкл звук
- 🔔 Вкл/выкл уведомления
- 📍 Радиус оповещения (10-200 км)

### 4. Статистика
- Ударов за 5 минут
- Разделение на реальные и демо данные

---

## ❓ Troubleshooting

### Проблема: CORS ошибки
**Решение:** Netlify Function уже настроена для обхода CORS. Проверьте что функция развернулась в панели Netlify → Functions

### Проблема: Нет реальных молний
**Решение:** Включён демо-режим (автоматически если API недоступен). Проверьте логи функций в панели Netlify

### Проблема: Не работает звук
**Решение:** Нажмите любую кнопку на странице (браузеры блокируют автовоспроизведение)

### Проблема: Не приходят уведомления
**Решение:** 
1. Проверьте разрешения браузера
2. На ПК: Chrome/Firefox/Edge поддерживают
3. На Android: Chrome поддерживает

### Проблема: Page Not Found (404)
**Решение:** См. раздел "ИСПРАВЛЕНИЕ ОШИБКИ 404" выше

---

## 📱 Мобильные уведомления

### Android:
1. Откройте сайт в Chrome
2. Нажмите ⋮ → "Добавить на главный экран"
3. Разрешите уведомления
4. Получайте оповещения как нативное приложение

### iOS:
1. Откройте сайт в Safari
2. Нажмите 📤 → "На экран «Домой»"
3. Уведомления работают с iOS 16.4+

---

## 💰 Бесплатные альтернативы

| Платформа | Бесплатный лимит | Плюсы | Минусы |
|-----------|------------------|-------|--------|
| **Netlify** | 100GB + 125k функций | Serverless функции, простой деплой | - |
| **Vercel** | 100GB | Быстрый CDN | Проблемы с CORS без функций |
| **GitHub Pages** | Безлимит | Простой хостинг | Нет serverless функций |
| **Cloudflare Pages** | Безлимит | Быстрый CDN | Сложнее настройка функций |

**Рекомендация:** Netlify - лучший выбор для этого проекта!

---

## 🎉 Готово!

Ваш сайт с картой молний России теперь доступен онлайн! ⚡🗺️

**Следующие шаги:**
1. Поделитесь ссылкой с друзьями
2. Добавьте свой домен (бесплатно на Netlify)
3. Следите за статистикой в панели Netlify

Удачи! 🚀
