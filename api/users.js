import connect from '../mongo-adapter/connection.js';
import Model from '../mongo-adapter/user.model.js';

export default async function handler(req, res) {
  await connect();
  const { method } = req;
  try {
    if (method === 'GET') {
      const items = await Model.find({});
      return res.status(200).json(items);
    } else if (method === 'POST') {
      const doc = new Model(req.body);
      await doc.save();
      return res.status(201).json(doc);
    } else if (method === 'PUT') {
      const id = req.query.id;
      const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(updated);
    } else if (method === 'DELETE') {
      const id = req.query.id;
      await Model.findByIdAndDelete(id);
      return res.status(204).end();
    } else {
      res.setHeader('Allow', ['GET','POST','PUT','DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
