import * as contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  updateFavoriteSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await contactsService.listContacts(req.user.id, req.query);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const contact = await contactsService.getContactById(req.params.id, req.user.id);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await contactsService.removeContact(req.params.id, req.user.id);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { error } = createContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const contact = await contactsService.addContact({ ...req.body, owner: req.user.id });
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw HttpError(400, "Body must have at least one field");
    }
    const { error } = updateContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const contact = await contactsService.updateContact(req.params.id, req.user.id, req.body);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

export const updateFavorite = async (req, res, next) => {
  try {
    const { error } = updateFavoriteSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const contact = await contactsService.updateStatusContact(
      req.params.contactId,
      req.user.id,
      req.body
    );
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};
