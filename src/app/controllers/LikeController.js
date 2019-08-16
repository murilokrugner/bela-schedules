import Feed from '../models/Feed';

class LikeController {
  async store(req, res) {
    const posts = await Feed.findByPk(req.params.id);

    posts.likes += 1;

    await posts.save();

    return res.json(posts);
  }
}

export default new LikeController();
