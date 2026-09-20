const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const roomController = require('../controllers/roomController');
const {
  roomValidation,
  handleValidationErrors,
} = require('../middleware/validation');

router.use(isAdmin);

router.get('/', roomController.getRooms);
router.get('/new', roomController.getRoomNew);
router.post(
  '/',
  roomValidation,
  handleValidationErrors('/admin/rooms/new'),
  roomController.postRoom
);
router.get('/:id/edit', roomController.getRoomEdit);
router.put(
  '/:id',
  roomValidation,
  handleValidationErrors(),
  roomController.putRoom
);
router.delete('/:id', roomController.deleteRoom);
router.post('/:id/delete', roomController.deleteRoom);

module.exports = router;
