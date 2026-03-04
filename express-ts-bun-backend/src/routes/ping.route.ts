import { Router } from 'express';

const router = Router();

router.get('/ping', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'pong',
      version: 'v1',
    },
  });
});

export { router as pingRouter };
