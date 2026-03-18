# Unit of Work Plan

## Context
Greenfield Next.js monorepo (single deployable app). Units — логические модули внутри одного приложения.
Units определены на этапе Application Design. Вопросов для пользователя нет — декомпозиция очевидна из требований.

## Execution Checkboxes

- [x] Определить unit'ы (из Application Design)
- [x] Задокументировать зависимости между unit'ами
- [x] Сопоставить функциональные требования с unit'ами (вместо user stories — FR из requirements.md)
- [x] Задокументировать стратегию кода (файловая структура, greenfield)
- [x] Generate unit-of-work.md
- [x] Generate unit-of-work-dependency.md
- [x] Generate unit-of-work-story-map.md
- [x] Validate: все FR покрыты unit'ами