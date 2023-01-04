import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';

const getFileName = (url) => {
  const nameWithoutProtocol = url.split('://')[1];
  const newName = nameWithoutProtocol.replace(/[^a-z0-9]/gm, '-');
  return `${newName}.html`;
};

const pageLoader = (url, dir = process.cwd()) => {
  const nameFile = getFileName(url);
  const fullFilePath = path.join(dir, nameFile);

  return axios.get(url)
    .then((response) => fsp.writeFile(fullFilePath, response.data))
    .then(() => console.log(fullFilePath));
};
export default pageLoader;
