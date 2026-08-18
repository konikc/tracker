# 📖 Полная инструкция по развёртыванию на Vercel

## ✅ Что уже сделано

Проект полностью готов к развёртыванию! Все файлы созданы в папке `/workspace/lightning-map`.

---

## 🚀 Шаг 1: Проверка проекта

Убедитесь, что проект работает локально:

```bash
cd /workspace/lightning-map
npm install
npm run dev
```

Откройте браузер по адресу http://localhost:5173

---

## 🚀 Шаг 2: Загрузка на GitHub

### Вариант А: Через терминал

```bash
cd /workspace/lightning-map

# Инициализация git (если ещё не сделана)
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "⚡ Lightning Map Russia - Initial commit"

# Создание главной ветки
git branch -M main

# Добавление удалённого репозитория (замените YOUR_USERNAME на ваш ник GitHub)
git remote add origin https://github.com/YOUR_USERNAME/lightning-map.git

# Отправка кода на GitHub
git push -u origin main
```

### Вариант Б: Через GitHub Desktop

1. Скачайте [GitHub Desktop](https://desktop.github.com/)
2. Откройте папку проекта в GitHub Desktop
3. Нажмите "Commit to main"
4. Нажмите "Publish repository"
5. Назовите репозиторий `lightning-map`
6. Нажмите "Publish"

---

## 🚀 Шаг 3: Развёртывание на Vercel

### Способ 1: Через веб-интерфейс (рекомендуется)

1. **Перейдите на Vercel**
   - Откройте https://vercel.com
   - Войдите через GitHub (кнопка "Continue with GitHub")

2. **Создайте новый проект**
   - Нажмите кнопку **"Add New Project"**
   - Выберите **"Import Git Repository"**

3. **Выберите репозиторий**
   - Найдите ваш репозиторий `lightning-map`
   - Нажмите **"Import"**

4. **Настройте проект**
   - **Framework Preset**: Vite (определится автоматически)
   - **Root Directory**: оставьте как есть (`./`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Задеплойте**
   - Нажмите **"Deploy"**
   - Подождите 1-2 минуты пока идёт сборка

6. **Готово!**
   - Ваш сайт доступен по адресу: `https://lightning-map-YOUR_USERNAME.vercel.app`
   - Ссылку можно изменить в настройках проекта

### Способ 2: Через Vercel CLI

```bash
# Установите Vercel CLI глобально
npm install -g vercel

# Войдите в Vercel
vercel login

# Перейдите в папку проекта
cd /workspace/lightning-map

# Задеплойте
vercel --prod
```

---

## ⚙️ Настройки Vercel (опционально)

### Изменение домена

1. Зайдите в проект на Vercel
2. Перейдите в **Settings → Domains**
3. Добавьте свой домен или измените subdomain

### Автоматическое обновление

При каждом пуше в ветку `main` проект будет автоматически обновляться на Vercel.

### Переменные окружения

Если понадобится добавить API ключи:

1. Зайдите в проект на Vercel
2. Перейдите в **Settings → Environment Variables**
3. Добавьте нужные переменные

---

## 🔧 Решение проблем

### Ошибка сборки

Если сборка не проходит:

```bash
cd /workspace/lightning-map
npm install
npm run build
```

Проверьте ошибки в выводе команды.

### CORS ошибки при запросах к API

Blitzortung API может блокировать запросы с некоторых доменов. Решение:

1. Создайте файл `vercel.json` в корне проекта:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/blitzortung/:path*",
      "destination": "https://data.blitzortung.org/Data_Region_7/Processed/JSON/Lightning.GeoJSON"
    }
  ]
}
```

2. Обновите `src/App.jsx` для использования proxy через Vercel (опционально):

```javascript
// Если прямой запрос блокируется, используйте proxy Vercel
const apiUrl = '/blitzortung/Lightning.GeoJSON?t=' + now
```

3. Закоммитьте и отправьте изменения:
```bash
git add vercel.json
git commit -m "Add Vercel CORS headers and proxy"
git push
```

### Уведомления не работают

Для работы уведомлений сайт должен быть на HTTPS (Vercel предоставляет автоматически) и пользователь должен разрешить уведомления в браузере.

---

## 📱 Мобильные уведомления

### Android

1. Откройте сайт в Chrome
2. Нажмите меню (три точки)
3. Выберите "Добавить на главный экран"
4. Разрешите уведомления

### iOS (iPhone/iPad)

1. Откройте сайт в Safari
2. Нажмите кнопку "Поделиться"
3. Выберите "На экран «Домой»"
4. Откройте настройки iPhone → Safari → Уведомления
5. Разрешите уведомления для сайта

---

## 🎯 Финальная проверка

После развёртывания проверьте:

- [ ] Карта отображается и центрирована на России
- [ ] Появляются молнии (реальные или демо)
- [ ] Звук работает при клике на страницу
- [ ] Кнопка "Моё место" запрашивает геолокацию
- [ ] Уведомления запрашивают разрешение
- [ ] Статистика обновляется

---

## 📞 Поддержка

Если возникли вопросы:

1. Проверьте консоль браузера (F12) на ошибки
2. Посмотрите логи сборки в Vercel Dashboard
3. Убедитесь что все файлы загружены на GitHub

---

**Удачи с развёртыванием! ⚡🗺️**
