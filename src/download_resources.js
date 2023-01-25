import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import getFileName from './get_file_name.js';

const mapping = [
  { tag: 'img', attribute: 'src' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
];

const downloadResources = (html, dirPath, dirN, fullPath, originUrl) => {
  const $ = cheerio.load(html);
  const promises = [];

  mapping.forEach(({ tag, attribute }) => $(tag).each((_index, el) => {
    const elem = $(el).attr(attribute);

    const url = new URL(elem, originUrl);
    const { href, origin } = url;

    if (origin === originUrl && elem !== undefined) {
      const newName = getFileName(elem, originUrl);
      console.log('elem:', elem); //
      console.log('originUrl:', originUrl); //
      console.log('newName:', newName); //
      // console.log('writefile1:', path.join(dirPath, newName)); //
      // console.log('attribute:', path.join(dirN, newName)); //
      // console.log('writefile2:', fullPath); //

      const promise = axios.get(href, { responseType: 'arraybuffer' })
        .then((response) => fsp.writeFile(path.join(dirPath, newName), response.data))
        .then(() => {
          $(el).attr(attribute, path.join(dirN, newName));
          const newFile = $.html();
          return fsp.writeFile(fullPath, newFile);
        });
      promises.push(promise);
    }

    return null;
  }));

  return Promise.all(promises);
};

export default downloadResources;
