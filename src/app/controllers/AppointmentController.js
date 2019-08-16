import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import Files from '../models/Files';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: Service,
              as: 'description',
              attributes: ['id', 'description', 'value'],
              include: [
                {
                  model: Files,
                  as: 'avatar',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const shema = Yup.object().shape({
      provider_id: Yup.number().required();
      date: Yup.date().required(),
      service_id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date, service_id } = req.body;

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({ error: 'You can only creat with providers' });
    }

    const isService = await Service.findOne({
      where: { id: provider_id, description }
    });

    if(!isService) {
      return res.status(401).json({ error: 'Service is not define' });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Appointment date is not available' });
    }

    const user = await User.findByPk(req.userId);

    if (user === provider_id) {
      return res.status(401).json({ error: 'Você não pode agendar um horario com você mesmo!' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
      service_id,
    });

    const formattedDate = format(
      hourStart,
      "' dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({ error: "You don't have permission to cancel this appointment "});
    }

    const dateWithSub = subHours(appointment.date, 2);
    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({ error: 'You can only cancel appointment 2 hours in advance' });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await queue.add(CancellationMail.key, {
      appointmnet,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
