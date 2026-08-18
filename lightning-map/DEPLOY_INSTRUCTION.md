# 🚀 Инструкция по деплою на Netlify (БЕСПЛАТНО)

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
git commit -m "⚡ Lightning Map Russia - готово к деплою"

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
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
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

## 📋 Шаг 3: Проверка работы

После деплоя вы получите URL вида: `https://ваш-сайт.netlify.app`

### Что проверить:
1. 🗺️ Карта России загружается
2. ⚡ Молнии отображаются (реальные или демо)
3. 🔊 Звук "тык" при новых молниях
4. 🔔 Уведомления работают (нажмите "Уведомления ✅")
5. 📍 Геолокация определяется

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
│       └── proxy-blitzortung.js  # Serverless функция для API
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
**Решение:** Netlify Function уже настроена для обхода CORS

### Проблема: Нет реальных молний
**Решение:** Включён демо-режим (автоматически если API недоступен)

### Проблема: Не работает звук
**Решение:** Нажмите любую кнопку на странице (браузеры блокируют автовоспроизведение)

### Проблема: Не приходят уведомления
**Решение:** 
1. Проверьте разрешения браузера
2. На ПК: Chrome/Firefox/Edge поддерживают
3. На Android: Chrome поддерживает

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
| **Vercel** | 100GB | Быстрый CDN | Нет бесплатных serverless функций для CORS |
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
