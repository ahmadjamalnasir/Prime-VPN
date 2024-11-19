import { Router } from 'express';
import { register, login, validateToken } from '../services/authService';

const router = Router();

router.post('/register', async (req, res) => {
  const result = await register(req.body);
  res.json(result);
});

router.post('/login', async (req, res) => {
  const result = await login(req.body);
  res.json(result);
});

export const authRouter = router;
