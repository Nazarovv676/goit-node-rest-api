import Contact from "../models/Contact.js";

export const listContacts = async () => {
  return Contact.findAll();
};

export const getContactById = async (id) => {
  return Contact.findByPk(id);
};

export const removeContact = async (id) => {
  const contact = await Contact.findByPk(id);
  if (!contact) return null;
  await contact.destroy();
  return contact;
};

export const addContact = async (body) => {
  return Contact.create(body);
};

export const updateContact = async (id, body) => {
  const contact = await Contact.findByPk(id);
  if (!contact) return null;
  return contact.update(body);
};

export const updateStatusContact = async (contactId, body) => {
  const contact = await Contact.findByPk(contactId);
  if (!contact) return null;
  return contact.update(body);
};
