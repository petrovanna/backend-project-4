import path from 'path';
import getFileName from './get_file_name.js';

const getFullFilePath = (adress, directory) => {
  const parseUrl = new URL(adress, adress);
  const { origin } = parseUrl;

  const name = getFileName(adress, origin);
  const fullPath = path.join(directory, name);

  return fullPath;
};
export default getFullFilePath;
