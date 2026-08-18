# ⚡ Карта Молний России

Real-time приложение для отслеживания ударов молний на карте России с использованием данных от Blitzortung.org

## 🔥 Функции

- 🗺️ Интерактивная карта России (Leaflet + OpenStreetMap)
- ⚡ Real-time данные о молниях через API Blitzortung
- 🔊 Звуковой эффект при каждом ударе молнии ("тык")
- 🔔 Push-уведомления на ПК и телефон при молниях рядом
- 📍 Геолокация пользователя
- 🎯 Настраиваемый радиус оповещения (10-200 км)
- 📊 Статистика ударов за 5 минут
- 🧪 Демо-режим с генерацией тестовых молний

## 🚀 Быстрый старт

### Локальный запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## 📡 API Blitzortung - ИСТОЧНИКИ ДАННЫХ

### ✅ Подтверждённые рабочие endpoint'ы

**Основной источник (Европа/Западная Россия):**
```
https://data.blitzortung.org/Data_Region_7/Processed/JSON/Lightning.GeoJSON
```

**Альтернативный источник (Азия/Восточная Россия):**
```
https://data.blitzortung.org/Data_Region_6/Processed/JSON/Lightning.GeoJSON
```

### ❌ НЕ РАБОТАЮТ (устаревшие):
- `https://api.blitzortung.org/map/v1/strokes` - не существует
- `https://blitzortung-api.vercel.app/api/strikes` - deployment not found
- `https://blitzortung-api.onrender.com/api/strikes` - not found

### Официальные ресурсы Blitzortung

- **Сайт:** https://blitzortung.org
- **Live карта:** https://maps.blitzortung.org
- **Документация:** https://blitzortung.org/en/documentation.php

> ⚠️ **Важно:** SSL сертификат blitzortung.org имеет проблемы, поэтому мы используем CORS proxy для доступа к данным.

### Формат ответа API (GeoJSON)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [долгота, широта]
      },
      "properties": {
        "id": "номер",
        "time": unix_timestamp_в_секундах,
        "intensity": сила_удара_в_kA
      }
    }
  ]
}
```

## 🔧 CORS Proxy

Для обхода CORS ограничений и проблем с SSL используется публичный proxy:
```
https://api.allorigins.win/raw?url=<ENCODED_URL>
```

## 🌐 Деплой на Vercel

### Шаг 1: Подготовьте проект

```bash
cd lightning-map
npm install
npm run build
```

### Шаг 2: Залейте код на GitHub

```bash
git init
git add .
git commit -m "⚡ Lightning Map Russia"
git branch -M main
git remote add origin https://github.com/ВАШ_НИК/lightning-map.git
git push -u origin main
```

### Шаг 3: Подключите к Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите **"Add New Project"**
4. Выберите репозиторий `lightning-map`
5. Нажмите **"Deploy"**

Готово! Ваш сайт будет доступен по адресу `https://lightning-map.vercel.app`

## 📱 Уведомления

Для работы уведомлений:
1. Разрешите доступ к геолокации
2. Разрешите push-уведомления в браузере
3. Установите желаемый радиус оповещения

Уведомления работают на:
- ✅ ПК (Chrome, Firefox, Edge, Safari)
- ✅ Android (Chrome, Firefox)
- ✅ iOS (Safari)

## 🛠 Технологии

- React 18
- Vite
- Leaflet (карты)
- Axios (HTTP запросы)
- Web Audio API (звуки)
- Notification API (уведомления)

## 📝 Примечания

- Приложение автоматически переключается между Region 6 и Region 7 для полного покрытия России
- Если API недоступен, включается демо-режим с генерацией случайных молний
- Звук "тык" воспроизводится при каждом новом ударе молнии
- Данные обновляются каждые 10 секунд

---
Создано с ❤️ для отслеживания молний в России
