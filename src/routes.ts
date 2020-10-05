import express from 'express'
import ItemsController from './controllers/ItemsController';
import ShopsController from './controllers/ShopsController';
import UsersController from './controllers/UsersController';
import uploads from './multer';

const routes = express.Router();
const shopsController = new ShopsController();
const itemsController = new ItemsController();
const usersController = new UsersController();

routes.post('/avatar', uploads.single('avatar'), itemsController.create);
routes.post('/shops', uploads.single('shop_avatar'), shopsController.create);
routes.get('/shops', shopsController.index);
routes.get('/shopbyid', shopsController.findById);
routes.post('/items', itemsController.create);
//routes.get('/items', itemsController.index);
routes.get('/items', itemsController.findByShop);
routes.get('/itembyid', itemsController.findById);
routes.post('/login', usersController.login);

export default routes;