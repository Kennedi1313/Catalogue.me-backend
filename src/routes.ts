import express from 'express'
import ItemsController from './controllers/ItemsController';
import ShopsController from './controllers/ShopsController';
import UsersController from './controllers/UsersController';
import ScheduleController from './controllers/ScheduleController';
import uploads from './multer';

const routes = express.Router();
const shopsController = new ShopsController();
const itemsController = new ItemsController();
const usersController = new UsersController();
const scheduleController = new ScheduleController();

routes.post('/shops', uploads.single('shop_avatar'), shopsController.create);
routes.post('/shops-edit', uploads.single('shop_avatar'), shopsController.edit);
routes.get('/shops', shopsController.index);
routes.get('/shopbyid', shopsController.findById);
routes.get('/shopbytag', shopsController.findByTag);
routes.get('/shops-categories', shopsController.findCategoryByShop);
routes.post('/logo', uploads.single('logo'), shopsController.addLogo);
routes.post('/color', shopsController.addColor);
routes.post('/colorText', shopsController.addColorText);
routes.post('/shops-categories', shopsController.addCategory);
routes.post('/shops-categories-delete', shopsController.deleteCategory);

routes.post('/items', uploads.single('avatar'), itemsController.create);
routes.post('/items-edit', itemsController.edit);
routes.post('/itemsDelete', itemsController.delete);
routes.post('/itemsInative', itemsController.inativar);
routes.post('/itemsAtive', itemsController.ativar)
routes.get('/items', itemsController.findByShop);
routes.get('/all-items', itemsController.index);
routes.get('/itemsIndisponiveis', itemsController.findInativosByShop)
routes.get('/itembyid', itemsController.findById);
routes.get('/itemavatarbyid', itemsController.findAvatarById);
routes.post('/avatar', uploads.single('avatar'), itemsController.addAvatar);
routes.post('/avatar-delete', itemsController.deleteAvatar);
routes.post('/avatar-change', itemsController.changeAvatar);
routes.get('/categories', itemsController.findCategoriesByShop);
routes.get('/getOptionsById', itemsController.findOptionsById);
routes.post('/add-item-option', itemsController.addItemOption);
routes.post('/delete-item-option', itemsController.deleteItemOption);

routes.post('/login', usersController.login);
routes.get('/schedulebyidshop', scheduleController.findByShop)

export default routes;