import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import FilesController from './app/controllers/FilesController';
import SessionController from './app/controllers/SessionController';
import AppointmentController from './app/controllers/AppointmentController';
import ServiceController from './app/controllers/ServiceController';

const routes = new Router();

const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('files'), FilesController.store);

routes.post('/appointment', AppointmentController.store);

routes.get('/appointment', AppointmentController.index);

routes.delete('/appointment', AppointmentController.delete);

routes.post('/service', ServiceController.store);

routes.get('/service', ServiceController.index);

export default routes;
