import { Router } from 'express';
import { generateConfig, getServers } from '../services/vpnService';

const router = Router();

router.get('/servers', async (req, res) => {
  const servers = await getServers();
  res.json(servers);
});

router.post('/config', async (req, res) => {
  const config = await generateConfig(req.body);
  res.json({ config });
});

export const vpnRouter = router;
