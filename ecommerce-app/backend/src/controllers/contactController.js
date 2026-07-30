const contactService = require('../services/contactService');
const { success } = require('../utils/apiResponse');

async function submitContactHandler(req, res, next) {
  try {
    const { name, email, message } = req.body;
    const contactEntry = await contactService.createContactMessage({ name, email, message });
    return success(res, {
      id: contactEntry._id,
      name: contactEntry.name,
      email: contactEntry.email,
      message: contactEntry.message,
    });
  } catch (err) {
    return next(err);
  }
}

async function subscribeHandler(req, res, next) {
  try {
    const { email } = req.body;
    await contactService.addSubscriber(email);
    return success(res, { message: 'Subscribed successfully' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { submitContactHandler, subscribeHandler };
