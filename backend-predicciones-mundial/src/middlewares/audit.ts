import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';

export function audit(action: string, entity: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const originalJson = _res.json.bind(_res);
    _res.json = function (body: unknown) {
      if (_res.statusCode < 400) {
        const data = (body as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
        auditService.log({
          userId: req.user?.userId,
          action,
          entity,
          entityId: req.params.id as string || (data?.id as string),
          details: { method: req.method, path: req.originalUrl },
          ipAddress: req.ip,
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}
