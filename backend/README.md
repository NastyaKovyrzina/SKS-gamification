# Backend для SKS Gamification

Локальный backend на чистом Node.js. Он хранит данные в `backend/data/db.json`, поэтому прогресс не слетает после перезагрузки страницы и перезапуска frontend.

## Запуск

Из корня проекта:

```bash
npm run backend
```

Или напрямую:

```bash
node backend/server.js
```

Сервер стартует на:

```text
http://localhost:3001
```

## Тестовые пользователи для демо

| ID | Возраст | Назначение |
|---|---:|---|
| `u50` | 50 | пользователь 50+ |
| `u60` | 60 | пользователь 60+ |
| `u70` | 70 | пользователь 70+ |

## API

### Проверка сервера

```http
GET /api/health
```

### Пользователи

```http
GET /api/users
```

### Daily Check-in

```http
POST /api/daily-checkin
Content-Type: application/json

{
  "userId": "u50"
}
```

Логика:

- если пользователь заходит впервые за день — получает `+5` бонусов;
- если заходил вчера — `streak` увеличивается;
- если пропустил день — `streak` сбрасывается до `1`;
- повторный check-in в тот же день бонус не начисляет.

### Сегодняшние квесты

```http
GET /api/quests/today?userId=u50
```

Возвращает 3 квеста с учетом возраста пользователя.

### Завершение квеста

```http
POST /api/quest/complete
Content-Type: application/json

{
  "userId": "u50",
  "questId": "q_water"
}
```

Логика:

- проверяет существование пользователя;
- проверяет существование квеста;
- проверяет возрастные ограничения;
- не дает выполнить один и тот же квест дважды за день;
- начисляет бонусы;
- обновляет баланс, уровень, прогресс и лидерборд.

### Колесо удачи

```http
POST /api/wheel/spin
Content-Type: application/json

{
  "userId": "u50"
}
```

Призы выбираются случайно с весами вероятности:

| Приз | Вес |
|---|---:|
| +3 бонуса | 35 |
| +5 бонусов | 30 |
| +10 бонусов | 20 |
| +20 бонусов | 10 |
| джекпот +50 | 5 |

Пользователь может крутить колесо один раз в день.

### Лидерборд

```http
GET /api/leaderboard
```

### История транзакций

```http
GET /api/transactions?userId=u50
```

Без `userId` вернет все транзакции:

```http
GET /api/transactions
```

## Как подключать с frontend

Пример:

```ts
const API_URL = 'http://localhost:3001';

export async function getTodayQuests(userId: string) {
  const response = await fetch(`${API_URL}/api/quests/today?userId=${userId}`);
  return response.json();
}

export async function completeQuest(userId: string, questId: string) {
  const response = await fetch(`${API_URL}/api/quest/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, questId })
  });

  return response.json();
}
```
