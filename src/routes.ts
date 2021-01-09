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
routes.post('/logo', uploads.single('logo'), shopsController.addLogo);

routes.post('/items', uploads.single('avatar'), itemsController.create);
routes.post('/items-edit', itemsController.edit);
routes.post('/itemsDelete', itemsController.delete);
routes.post('/itemsInative', itemsController.inativar);
routes.post('/itemsAtive', itemsController.ativar)
routes.get('/items', itemsController.findByShop);
routes.get('/itemsIndisponiveis', itemsController.findInativosByShop)
routes.get('/itembyid', itemsController.findById);
routes.get('/itemavatarbyid', itemsController.findAvatarById);
routes.post('/avatar', uploads.single('avatar'), itemsController.addAvatar);
routes.post('/avatar-delete', itemsController.deleteAvatar);
routes.post('/avatar-change', itemsController.changeAvatar);

routes.post('/login', usersController.login);
routes.get('/schedulebyidshop', scheduleController.findByShop)

export default routes;