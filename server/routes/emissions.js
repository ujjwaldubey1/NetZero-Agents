import express from 'express';
import fs from 'fs';
import { authRequired } from '../middleware/auth.js';
import { extractEmissions } from '../services/aiExtractor.js';
import EmissionRecord from '../models/EmissionRecord.js';
import LedgerEvent from '../models/LedgerEvent.js';
import DataCenter from '../models/DataCenter.js';

const buildRouter = (upload) => {
  const router = express.Router();
  const dataCenterFilter = (user) => {
    if (user.role === 'operator') return { ownerId: user.id };
    if (user.role === 'vendor') return { vendorIds: user.id };
    if (user.role === 'staff') return { staffIds: user.id };
    return {};
  };
  const toSlug = (value) => (value || 'default-dc').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'default-dc';

  router.post('/upload', authRequired, upload.single('file'), async (req, res) => {
    try {
      const { scope, period, dataCenterId, dataCenterName: providedName } = req.body;
      if (!req.file) return res.status(400).json({ error: 'File required' });
      const scopeNum = Number(scope);
      const filter = dataCenterFilter(req.user);
      let dataCenterName = providedName || 'default-dc';
      let chosenDataCenterId = null;

      if (dataCenterId) {
        const dc = await DataCenter.findOne({ _id: dataCenterId, ...filter });
        if (!dc) return res.status(403).json({ error: 'Not assigned to datacenter' });
        chosenDataCenterId = dc._id;
        dataCenterName = dc.name;
      } else {
        const fallbackDc = await DataCenter.findOne(filter);
        if (!fallbackDc && req.user.role !== 'operator') {
          return res.status(400).json({ error: 'Choose a datacenter first' });
        }
        if (fallbackDc) {
          chosenDataCenterId = fallbackDc._id;
          dataCenterName = fallbackDc.name;
        }
      }

      const baseDir = `${process.cwd()}/server/_emissionData/${toSlug(dataCenterName)}`;
      const monthFolder = `${period || 'unknown'}-${Date.now()}`;
      const section = `section${scopeNum}`;
      const fullDir = `${baseDir}/${monthFolder}/${section}`;
      await fs.promises.mkdir(fullDir, { recursive: true });
      const newPath = `${fullDir}/${req.file.filename}`;
      await fs.promises.rename(req.file.path, newPath);
      const folderRef = `${dataCenterName}/${monthFolder}`;
      const sectionRef = section;
      const result = await extractEmissions({
        filePath: newPath,
        mimeType: req.file.mimetype,
        scope: scopeNum,
        period,
        ownerId: req.user.id,
        dataCenterId: chosenDataCenterId,
        dataCenterName,
        folderRef,
        sectionRef,
      });
      await LedgerEvent.create({ type: 'UPLOAD', reportId: null, detail: `Scope ${scope} upload by ${req.user.email}` });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/by-period', authRequired, async (req, res) => {
    const { period } = req.query;
    const filter = { ownerId: req.user.id };
    if (period) filter.period = period;
    const records = await EmissionRecord.find(filter).sort({ createdAt: -1 });
    res.json(records);
  });

  return router;
};

export default buildRouter;
