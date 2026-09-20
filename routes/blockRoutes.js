const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const blockController = require('../controllers/blockController');
const {
  blockValidation,
  handleValidationErrors,
} = require('../middleware/validation');

router.use(isAdmin);

router.get('/', blockController.getBlocks);
router.get('/new', blockController.getBlockNew);
router.post(
  '/',
  blockValidation,
  handleValidationErrors('/admin/blocks/new'),
  blockController.postBlock
);
router.get('/:id/edit', blockController.getBlockEdit);
router.put(
  '/:id',
  blockValidation,
  handleValidationErrors(),
  blockController.putBlock
);
router.delete('/:id', blockController.deleteBlock);
router.post('/:id/delete', blockController.deleteBlock);

module.exports = router;
