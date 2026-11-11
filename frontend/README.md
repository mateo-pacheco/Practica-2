# Chat frontend

Cliente React + Vite para el laboratorio de chat en tiempo real. Usa Tailwind CSS 4 para la interfaz, REST para autenticación, usuarios, conversaciones e historial, y Socket.IO para enviar y recibir mensajes.

## Requisitos

- Bun instalado.
- El backend ejecutándose en `http://localhost:3100`.
- El backend configurado con `CLIENT_ORIGIN=http://localhost:5173`.

## Inicio

```bash
bun install
Copy-Item .env.example .env.local
bun --bun run dev --host localhost --port 5173 --strictPort
```

`VITE_BACKEND_URL` se puede cambiar en `.env.local` si el backend usa otro host o puerto. No pongas secretos del backend en variables `VITE_*`.

## Compilación

```bash
bun --bun run build
```

## Flujo de prueba

1. Abre `http://localhost:5173` en dos perfiles del navegador.
2. Registra una cuenta en cada perfil e inicia sesión.
3. Crea una conversación desde un perfil y pulsa **Actualizar** en el otro.
4. Envía mensajes desde ambos perfiles y comprueba que llegan sin recargar.
5. Recarga las ventanas y abre la conversación para comprobar el historial persistido.
