const { ContactMessage, Subscriber } = require('../models');

async function createContactMessage({ name, email, message }) {
  return ContactMessage.create({ name, email, message });
}

async function addSubscriber(email) {
  const existing = await Subscriber.findOne({ email });
  if (existing) {
    return existing;
  }

  return Subscriber.create({ email });
}

module.exports = { createContactMessage, addSubscriber };
