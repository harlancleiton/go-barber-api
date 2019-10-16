import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists)
      return res.status(400).json({ error: 'User already exists' });
    const user = await User.create(req.body);
    const { id, name, email, provider } = user;

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    const { email, oldPassword, password } = req.body;
    const { user } = req;
    if (email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists)
        return res.status(400).json({ error: 'User already exists' });
    }

    if (password && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    await user.update(req.body);

    return res.status(204).send();
  }
}

export default new UserController();
