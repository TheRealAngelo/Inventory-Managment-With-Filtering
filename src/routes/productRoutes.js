const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const inventoryController = require('../controllers/inventoryController');

router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.get('/', productController.getAllProducts);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/stock', inventoryController.createStock);

module.exports = router;
