import { Router } from 'express';

const topics = ['comida', 'cine', 'musica', 'tecnologia', 'deportes', 'paises', 'animales', 'videojuegos', 'objetos', 'lugares'];

const router = Router();

router.get('/topics', (_req, res) => {
  res.json(topics);
});

export default router;
