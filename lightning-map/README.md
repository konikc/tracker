# ⚡ Карта Молний России

Интерактивная карта молний для России с real-time данными от Blitzortung, звуковыми эффектами и push-уведомлениями.

## 🌟 Возможности

- 🗺️ **Интерактивная карта** - Leaflet + OpenStreetMap с фокусом на Россию
- ⚡ **Real-time данные** - Молнии от Blitzortung API (обновление каждые 10 сек)
- 🔊 **Звуковой эффект** - Тихий "тык" при каждом ударе молнии
- 🔔 **Push-уведомления** - Оповещения на ПК и телефон о молниях рядом
- 📍 **Геолокация** - Определение вашего местоположения
- 🎯 **Радиус оповещения** - Настраиваемый радиус (10-200 км)
- 📊 **Статистика** - Удары за 5 минут с разделением на реальные/демо
- 🧪 **Демо-режим** - Автоматически включается если API недоступен

## 🚀 Быстрый старт

### Локальная разработка

```bash
cd lightning-map
npm install
npm run dev
```

Откройте http://localhost:5173

### Сборка для продакшена

```bash
npm run build
npm run preview
```

## 📁 Структура проекта

```
lightning-map/
├── src/
│   ├── App.jsx          # Основной код приложения
│   └── App.css          # Стили
├── public/
│   ├── thunder.mp3      # Звук грома
│   └── favicon.svg      # Иконка
├── netlify/
│   └── functions/
│       └── proxy-blitzortung.js  # Serverless функция для API
├── netlify.toml         # Конфигурация Netlify
├── package.json
└── dist/                # Сборка (создаётся автоматически)
```

## 🌐 API Blitzortung

### Источники данных

- **Region 7 (Европа/Западная Россия):** 
  `https://data.blitzortung.org/Data_Region_7/Processed/JSON/Lightning.GeoJSON`
  
- **Region 6 (Азия/Восточная Россия):**
  `https://data.blitzortung.org/Data_Region_6/Processed/JSON/Lightning.GeoJSON`

### Документация

- Официальный сайт: https://blitzortung.org
- Live карта: https://maps.blitzortung.org
- Документация: https://blitzortung.org/en/documentation.php

### Формат данных

GeoJSON с координатами `[longitude, latitude]`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [37.6176, 55.7558]
      },
      "properties": {
        "time": 1234567890,
        "intensity": 25
      }
    }
  ]
}
```

## 🔧 Деплой на Netlify (БЕСПЛАТНО)

См. подробную инструкцию в [DEPLOY_INSTRUCTION.md](./DEPLOY_INSTRUCTION.md)

### Кратко:

1. Запушьте код на GitHub
2. Зайдите на [netlify.com](https://netlify.com)
3. Import из GitHub
4. Настройте:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Deploy!

## 🎯 Как это работает

### Обход CORS

Blitzortung API не поддерживает CORS напрямую, поэтому используем Netlify Functions:

```
Браузер → /api/blitzortung → Netlify Function → Blitzortung API
```

Serverless функция делает запрос на стороне сервера и возвращает данные с правильными CORS заголовками.

### Уведомления

1. Пользователь разрешает уведомления
2. При новой молнии вычисляется расстояние до пользователя
3. Если расстояние < радиуса - отправляется Push-уведомление
4. Воспроизводится звук "тык"

### Демо-режим

Если API недоступен, генерируются случайные молнии по территории России для демонстрации функционала.

## 📱 Мобильные уведомления

### Android
1. Откройте сайт в Chrome
2. ⋮ → "Добавить на главный экран"
3. Разрешите уведомления

### iOS
1. Откройте сайт в Safari
2. 📤 → "На экран «Домой»"
3. Уведомления работают с iOS 16.4+

## 🛠 Технологии

- **React** + Vite
- **Leaflet** - интерактивные карты
- **Netlify Functions** - serverless прокси для API
- **Web Notifications API** - push-уведомления
- **Geolocation API** - определение местоположения
- **Audio API** - воспроизведение звука

## 📝 Лицензия

MIT License

## 🙏 Благодарности

- Данные: [Blitzortung.org](https://blitzortung.org)
- Карта: [OpenStreetMap](https://openstreetmap.org)
- Иконки: SVG эмодзи

---

**Удачи с проектом!** ⚡🗺️
