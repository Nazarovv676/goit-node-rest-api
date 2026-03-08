import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contactsPath = path.join(__dirname, "../db/contacts.json");

const readContacts = async () => {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
};

const writeContacts = async (contacts) => {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
};

export const listContacts = async () => {
  return readContacts();
};

export const getContactById = async (id) => {
  const contacts = await readContacts();
  return contacts.find((contact) => contact.id === id) ?? null;
};

export const removeContact = async (id) => {
  const contacts = await readContacts();
  const index = contacts.findIndex((contact) => contact.id === id);
  if (index === -1) return null;
  const [removed] = contacts.splice(index, 1);
  await writeContacts(contacts);
  return removed;
};

export const addContact = async (body) => {
  const contacts = await readContacts();
  const newContact = { id: crypto.randomUUID(), ...body };
  contacts.push(newContact);
  await writeContacts(contacts);
  return newContact;
};

export const updateContact = async (id, body) => {
  const contacts = await readContacts();
  const index = contacts.findIndex((contact) => contact.id === id);
  if (index === -1) return null;
  contacts[index] = { ...contacts[index], ...body };
  await writeContacts(contacts);
  return contacts[index];
};
