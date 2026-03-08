import Contact from "../models/Contact.js";

export const listContacts = async (owner, query = {}) => {
  const where = { owner };

  if (query.favorite !== undefined) {
    where.favorite = query.favorite === "true";
  }

  const options = { where };

  if (query.page || query.limit) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    options.limit = limit;
    options.offset = (page - 1) * limit;
  }

  return Contact.findAll(options);
};

export const getContactById = async (id, owner) => {
  return Contact.findOne({ where: { id, owner } });
};

export const removeContact = async (id, owner) => {
  const contact = await Contact.findOne({ where: { id, owner } });
  if (!contact) return null;
  await contact.destroy();
  return contact;
};

export const addContact = async (body) => {
  return Contact.create(body);
};

export const updateContact = async (id, owner, body) => {
  const contact = await Contact.findOne({ where: { id, owner } });
  if (!contact) return null;
  return contact.update(body);
};

export const updateStatusContact = async (contactId, owner, body) => {
  const contact = await Contact.findOne({ where: { id: contactId, owner } });
  if (!contact) return null;
  return contact.update(body);
};
