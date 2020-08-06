const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('./config/multer');
const Post = require('./models/Post');

routes.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find({});
    if (posts) {
      res.json(posts);
    } else {
      res.status(404).send({ msg: 'Nenhuma Imagem Encontrada' });
    }
  } catch (err) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

routes.post('/posts', multer(multerConfig).single('file'), async (req, res) => {
  const { originalname: name, size, key, location: url = '' } = req.file;

  //console.log(req.body.commentary);
  try {
    const post = await Post.create({
      name,
      size,
      key,
      url,
      commentary: req.body.commentary,
    });
    return res.json(post);
  } catch (error) {
    //console.log(error);
    return res.status(500).send(error);
  }
});

routes.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //console.log(post);
    if (post) {
      await post.remove();
      res.send({ msg: 'Post Removido com sucesso' });
    } else {
      res.status(404).send({ msg: 'Post Não Encontrado' });
    }
  } catch (err) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

module.exports = routes;
