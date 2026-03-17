import PocketBase from 'pocketbase';

export const sd_PB_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8090';

// Единственный инстанс (синглтон) клиента PocketBase для всего фронтенда
export const sd_pb = new PocketBase(sd_PB_URL);

// По умолчанию авто-продляем сессию
sd_pb.autoCancellation(false);
