import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const { user } = req;

    if (!user.provider) {
      if (!user.provider) {
        return res
          .status(403)
          .json({ error: 'Only provider can load notifications' });
      }
    }

    const notifications = await Notification.find({ user: user.id })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json({ data: notifications });
  }

  async update(req, res) {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, { read: true });

    return res.status(204).json();
  }
}

export default new NotificationController();
