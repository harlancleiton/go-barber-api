import * as Yup from 'yup';
import { isBefore, startOfHour, parseISO } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async index(req, res) {
    const { user } = req;
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: user.id,
        canceled_at: null,
      },
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
            { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
          ],
        },
      ],
    });

    return res.json({ data: appointments });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(400)
        .json({ erro: 'You can only create appointments with providers' });
    }

    /**
     * Check for past date
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    /**
     * Check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: { provider_id, canceled_at: null, date: hourStart },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not availability' });
    }

    const { id: user_id } = req.user;
    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });
    return res.json({ data: appointment });
  }
}

export default new AppointmentController();
