import * as Yup from 'yup';
import Service from '../models/Service';

class ServiceController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
      value: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { description, value } = req.body;

    const services = await Service.create({
      description,
      value,
    });

    return res.json(services);
  }
}

export default new ServiceController();
