# Backend de chat en tiempo real

API REST y Socket.IO construida con Bun, Express 5, PostgreSQL y Prisma.
Las rutas usan JWT y las operaciones de mensajes verifican que el usuario
pertenezca a la conversación.

## Requisitos e inicio

- Bun y Docker Desktop.
- Desde la raíz del proyecto, inicia PostgreSQL: `docker compose up -d`.
- Copia `.env.example` como `.env`. La cadena incluida corresponde al
  `docker-compose.yml` actual (puerto 5434).
- En `backend/`, ejecuta `bun run db:generate`; si las tablas no existen,
  ejecuta `bun run db:migrate --name init`.
- Inicia la API con `bun run dev`.

La API queda disponible en `http://localhost:3100`.

## Autenticación

Los endpoints protegidos requieren:

```http
Authorization: Bearer TU_JWT
```

Los JWT se generan con HS256, tienen una vigencia de ocho horas y el hash de
contraseña nunca aparece en las respuestas.

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/register` | Crea un usuario y entrega token. |
| POST | `/api/auth/login` | Inicia sesión y entrega token. |
| GET | `/api/users?limit=30` | Lista otros usuarios. |
| GET | `/api/health` | Comprueba PostgreSQL. |

Ejemplo de registro:

```json
{
  "name": "Junior",
  "email": "junior@example.com",
  "password": "Prueba12345"
}
```

## Conversaciones y mensajes REST

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/conversations` | Crea conversación y agrega participantes. |
| GET | `/api/conversations` | Lista conversaciones propias. |
| GET | `/api/conversations/:id/messages?limit=30&before=UUID` | Historial paginado. |
| POST | `/api/conversations/:id/messages` | Guarda y emite un mensaje. |

Crear conversación:

```json
{
  "title": "Chat de laboratorio",
  "memberIds": ["UUID_DE_ANA"]
}
```

Enviar mensaje:

```json
{
  "content": "Hola Ana"
}
```

El usuario autenticado siempre se añade a la conversación; deben existir al
menos dos participantes distintos. El historial devuelve mensajes en orden
cronológico, `nextCursor` para solicitar la página anterior y `null` cuando no
hay más resultados. Un usuario ajeno recibe `403` y no puede leer ni insertar
mensajes.

## Socket.IO

Conecta a `http://localhost:3100` usando el token:

```js
io("http://localhost:3100", { auth: { token } });
```

- `message:send`: recibe `{ conversationId, content }` y confirma con
  `{ ok, message }` o `{ ok: false, error }`.
- `message:new`: se emite a las salas de los participantes, incluido el
  emisor, después de que el mensaje se guarda.

La conexión Socket.IO valida el JWT, confirma que el usuario exista y se
desconecta al caducar el token.

## Prueba desde terminal

Con el servidor iniciado, abre una terminal por participante:

```bash
bun run test:chat "TOKEN" "ID_DE_CONVERSACION"
```

Para recuperar mensajes recibidos mientras un cliente estaba desconectado, usa
el historial REST: es la fuente de recuperación.

## Respuestas de error

- `400`: entrada inválida o cursor ajeno a la conversación.
- `401`: token ausente, inválido o credenciales incorrectas.
- `403`: el usuario no pertenece a la conversación.
- `409`: correo ya registrado.
- `503`: PostgreSQL no está disponible al consultar `/api/health`.
