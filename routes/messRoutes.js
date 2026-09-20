const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const messController = require('../controllers/messController');

router.use(isAdmin);

router.get('/', messController.getAdminMess);
router.get('/new', messController.getAdminMessNew);
router.post('/', messController.postAdminMess);
router.get('/:id/edit', messController.getAdminMessEdit);
router.put('/:id', messController.putAdminMess);
router.delete('/:id', messController.deleteAdminMess);
router.post('/:id/delete', messController.deleteAdminMess);

module.exports = router;
