const jimp = require('jimp')
const mongoose = require('mongoose')
const multer = require('multer')
const uuid = require('uuid')

const Store = mongoose.model('Store')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: (req, file, next) => file.mimetype.startsWith('image')
    ? next(null, true)
    : next({ message: 'That filetype isn\'t allowed!' }, false)
}

exports.addStore = (req, res) =>
  res.render('edit', { title: 'Add Store' })

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
  !req.file && next() // skip the next middleware
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)
  next()
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save()
  req.flash('success', `Successfully created ${store.name}. Please leave a review!`)
  res.redirect(`/store/${store.slug}`)
}

exports.getStores = async (req, res) =>
  res.render('stores', { title: 'Stores', stores: await Store.find() })

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id })
  // TODO: confirm they are the owner of the store
  res.render('edit', { title: `Edit ${store.name}`, store })
}

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point' // fix location updates
  const store = await Store.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  ).exec()
  req.flash('success', `Successfully updated <strong>${store.name}</strong>! <a href="/store/${store.slug}">View Store</a>`)
  res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug })
  !store && next()
  res.render('store', { title: store.name, store })
}
