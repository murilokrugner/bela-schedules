import Feed from '../models/Feed';

import sharp from 'sharp';

import path from 'path';

import fs from 'fs';

class FeedControler {
  async index(req, res) {
    const posts = await Feed.findAll().sort('-createdAt');

    return res.json(posts);
  }

  async store(req, res) {
    const { place, description, hashtags, } = req.body;
    const { filename: image } = req.file;

    const [name] = image.split('.');
    const fileName = `${name}.jpg`;

    await sharp(req.file.path).resize(500).jpeg({ quality: 70}).toFile(path.resolve(req.file.destination, 'resized', filename));

    fs.unlinkSync(req.file.path);

    const post = await Feed.create({
      place,
      description,
      hashtags,
      image: fileName,
    });

    return res.json(post);
  }
}

export default new FeedControler();
